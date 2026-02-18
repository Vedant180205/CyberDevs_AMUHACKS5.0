"""
nlq_service.py — Natural Language Query service for CampusIQ Admin Dashboard.

Responsibilities:
  1. Parse admin's plain-English query via Groq → structured JSON filters
  2. Cache Groq responses in-memory for 5 minutes (same query_text → same result)
  3. Validate the parsed output (whitelist fields + operators)
  4. Build a MongoDB query from validated filters
  5. Execute the query and return safe student records (no sensitive fields)

Example test queries:
  - "Show me TY ECS students with github score above 60"
  - "Give me all students with prs score above 75 and coding score above 70"
  - "List final year IT students with linkedin score below 40"
  - "Show CSE students with cgpa above 8"
  - "Find all students with prs score between 40 and 60"
"""

import json
import time
from typing import Any, Dict, List, Optional, Tuple

from groq import AsyncGroq
from app.config import GROQ_API_KEY, GROQ_MODEL
from app.database import students_collection

# ---------------------------------------------------------------------------
# Groq client
# ---------------------------------------------------------------------------
_groq_client = AsyncGroq(api_key=GROQ_API_KEY)

# ---------------------------------------------------------------------------
# In-memory cache: { query_text_lower: (timestamp, parsed_result) }
# TTL = 5 minutes
# ---------------------------------------------------------------------------
_cache: Dict[str, Tuple[float, Dict]] = {}
CACHE_TTL_SECONDS = 300  # 5 minutes


def _get_cached(query_text: str) -> Optional[Dict]:
    key = query_text.strip().lower()
    if key in _cache:
        ts, result = _cache[key]
        if time.time() - ts < CACHE_TTL_SECONDS:
            return result
        else:
            del _cache[key]
    return None


def _set_cache(query_text: str, result: Dict) -> None:
    key = query_text.strip().lower()
    _cache[key] = (time.time(), result)


# ---------------------------------------------------------------------------
# Allowed fields and operators (whitelist)
# ---------------------------------------------------------------------------
ALLOWED_FIELDS = {
    "branch",
    "year",
    "prs_score",
    "github_score",
    "linkedin_score",
    "resume_score",
    "aptitude_score",
    "coding_score",
    "softskills_score",
    "cgpa",
}

ALLOWED_OPERATORS = {"eq", "gt", "gte", "lt", "lte", "in"}

# Map logical field names → actual MongoDB document paths
FIELD_TO_MONGO_PATH = {
    "branch": "branch",
    "year": "year",
    "prs_score": "prs_score",
    "cgpa": "cgpa",
    # GitHub score is stored inside github_analysis sub-document
    "github_score": "github_analysis.github_score",
    # scores sub-document (populated when students upload profiles)
    "linkedin_score": "scores.linkedin",
    "resume_score": "scores.resume",
    "aptitude_score": "scores.aptitude",
    "coding_score": "scores.coding",
    "softskills_score": "scores.softskills",
}

# Map operator names → MongoDB operators
OP_TO_MONGO = {
    "eq": "$eq",
    "gt": "$gt",
    "gte": "$gte",
    "lt": "$lt",
    "lte": "$lte",
    "in": "$in",
}

# ---------------------------------------------------------------------------
# Year / Branch normalization helpers
# Students may register with many different formats ("TY", "3rd Year",
# "Third Year", "TE", etc.).  We expand an equality filter on year/branch
# into a $regex OR so all variants are matched.
# ---------------------------------------------------------------------------

# All regex patterns that should match each canonical year code
YEAR_REGEX_MAP: Dict[str, str] = {
    "FY":    r"^(FY|FE|1|I|First Year|1st Year|First|FY\.?)$",
    "SY":    r"^(SY|SE|2|II|Second Year|2nd Year|Second|SY\.?)$",
    "TY":    r"^(TY|TE|3|III|Third Year|3rd Year|Third|TY\.?)$",
    "FINAL": r"^(FINAL|BE|4|IV|Final Year|4th Year|Fourth Year|Fourth|FINAL\.?)$",
}

# All regex patterns that should match each canonical branch code
BRANCH_REGEX_MAP: Dict[str, str] = {
    "CSE":   r"^(CSE|CS|Computer Science|COMPUTER SCIENCE)$",
    "IT":    r"^(IT|Information Technology|INFORMATION TECHNOLOGY)$",
    "ECS":   r"^(ECS|EC|ENTC|Electronics|ELECTRONICS|E&CS|E&TC)$",
    "MECH":  r"^(MECH|Mechanical|MECHANICAL)$",
    "CIVIL": r"^(CIVIL|Civil)$",
    "AIDS":  r"^(AIDS|AI&DS|AI\s*&\s*DS|Artificial Intelligence)$",
}


def _year_to_regex(value: str) -> Dict:
    """Return a MongoDB $regex condition matching all year variants."""
    pattern = YEAR_REGEX_MAP.get(value.upper().strip())
    if pattern:
        return {"$regex": pattern, "$options": "i"}
    # Fallback: case-insensitive exact match
    return {"$regex": f"^{value}$", "$options": "i"}


def _branch_to_regex(value: str) -> Dict:
    """Return a MongoDB $regex condition matching all branch variants."""
    pattern = BRANCH_REGEX_MAP.get(value.upper().strip())
    if pattern:
        return {"$regex": pattern, "$options": "i"}
    return {"$regex": f"^{value}$", "$options": "i"}

# ---------------------------------------------------------------------------
# Groq system prompt
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are an assistant that converts admin requests into structured database filters.
Output must be valid JSON ONLY.
Never output MongoDB operators directly.
Never output text outside JSON.
Only use allowed fields and operators.

Allowed fields: branch, year, prs_score, github_score, linkedin_score, resume_score, aptitude_score, coding_score, softskills_score, cgpa

Allowed operators: eq, gt, gte, lt, lte, in

Year values in the database use short codes: FY (First Year), SY (Second Year), TY (Third Year), FINAL (Final Year / Fourth Year).
Branch values: CSE, IT, ECS

Output schema (strict):
{
  "filters": [
    { "field": "<allowed_field>", "op": "<allowed_op>", "value": <string|number|array> }
  ],
  "sort_by": "<allowed_field or null>",
  "sort_order": "asc or desc",
  "limit": <integer 1-200>
}

Examples:
- "TY ECS students with github score above 60"
  → {"filters":[{"field":"year","op":"eq","value":"TY"},{"field":"branch","op":"eq","value":"ECS"},{"field":"github_score","op":"gt","value":60}],"sort_by":"github_score","sort_order":"desc","limit":50}

- "students with prs above 75 and coding score above 70"
  → {"filters":[{"field":"prs_score","op":"gt","value":75},{"field":"coding_score","op":"gt","value":70}],"sort_by":"prs_score","sort_order":"desc","limit":50}

- "final year IT students with linkedin score below 40"
  → {"filters":[{"field":"year","op":"eq","value":"FINAL"},{"field":"branch","op":"eq","value":"IT"},{"field":"linkedin_score","op":"lt","value":40}],"sort_by":"linkedin_score","sort_order":"asc","limit":50}
"""


# ---------------------------------------------------------------------------
# Groq parser
# ---------------------------------------------------------------------------
async def _parse_query_with_groq(query_text: str) -> Dict:
    """Call Groq to convert natural language query to structured JSON."""
    chat_completion = await _groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": query_text},
        ],
        model=GROQ_MODEL,
        temperature=0.1,  # Very low for deterministic, structured output
        max_tokens=500,
    )

    response_text = chat_completion.choices[0].message.content.strip()

    # Try direct JSON parse
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        pass

    # Try extracting from markdown code block
    for marker in ("```json", "```"):
        if marker in response_text:
            try:
                inner = response_text.split(marker)[1].split("```")[0].strip()
                return json.loads(inner)
            except (IndexError, json.JSONDecodeError):
                pass

    raise ValueError(f"Groq returned non-JSON output: {response_text[:200]}")


# ---------------------------------------------------------------------------
# Validator
# ---------------------------------------------------------------------------
def _validate_parsed_query(parsed: Dict) -> Tuple[bool, str]:
    """
    Validate the Groq-parsed query against the whitelist.
    Returns (is_valid, error_message).
    """
    if not isinstance(parsed, dict):
        return False, "Parsed query is not a JSON object."

    filters = parsed.get("filters")
    if not isinstance(filters, list):
        return False, "Missing or invalid 'filters' array."

    for i, f in enumerate(filters):
        if not isinstance(f, dict):
            return False, f"Filter[{i}] is not an object."

        field = f.get("field")
        op = f.get("op")
        value = f.get("value")

        if field not in ALLOWED_FIELDS:
            return False, f"Filter[{i}]: field '{field}' is not allowed."

        if op not in ALLOWED_OPERATORS:
            return False, f"Filter[{i}]: operator '{op}' is not allowed."

        if value is None:
            return False, f"Filter[{i}]: missing value."

        # For 'in' operator, value must be a list
        if op == "in" and not isinstance(value, list):
            return False, f"Filter[{i}]: 'in' operator requires a list value."

    # Validate sort_by if present
    sort_by = parsed.get("sort_by")
    if sort_by and sort_by not in ALLOWED_FIELDS:
        return False, f"sort_by field '{sort_by}' is not allowed."

    # Validate sort_order
    sort_order = parsed.get("sort_order", "desc")
    if sort_order not in ("asc", "desc"):
        return False, f"sort_order must be 'asc' or 'desc'."

    # Validate limit
    limit = parsed.get("limit", 50)
    if not isinstance(limit, int) or limit < 1 or limit > 200:
        return False, "limit must be an integer between 1 and 200."

    return True, ""


# ---------------------------------------------------------------------------
# MongoDB query builder
# ---------------------------------------------------------------------------
def _build_mongo_query(filters: List[Dict]) -> Dict:
    """
    Convert validated filters list into a MongoDB filter document.

    Special handling for 'year' and 'branch' equality filters:
    We use $regex instead of strict equality so that all common
    storage formats are matched (e.g. TY / 3rd Year / Third Year).
    """
    mongo_query: Dict[str, Any] = {}

    for f in filters:
        field = f["field"]
        op = f["op"]
        value = f["value"]

        mongo_path = FIELD_TO_MONGO_PATH[field]
        mongo_op = OP_TO_MONGO[op]

        if op == "eq":
            # --- Special: year / branch → regex to match all variants ---
            if field == "year" and isinstance(value, str):
                mongo_query[mongo_path] = _year_to_regex(value)
            elif field == "branch" and isinstance(value, str):
                mongo_query[mongo_path] = _branch_to_regex(value)
            elif field == "year" and isinstance(value, list):
                # 'in' on year — expand each value to regex
                mongo_query[mongo_path] = {
                    "$in": [_year_to_regex(v) for v in value]
                }
            elif field == "branch" and isinstance(value, list):
                mongo_query[mongo_path] = {
                    "$in": [_branch_to_regex(v) for v in value]
                }
            else:
                # Numeric / other string fields: plain equality
                if mongo_path in mongo_query:
                    if isinstance(mongo_query[mongo_path], dict):
                        mongo_query[mongo_path]["$eq"] = value
                    else:
                        mongo_query[mongo_path] = value
                else:
                    mongo_query[mongo_path] = value

        elif op == "in":
            # 'in' operator
            if field == "year" and isinstance(value, list):
                # Build $or of regex patterns
                mongo_query["$or"] = mongo_query.get("$or", []) + [
                    {mongo_path: _year_to_regex(v)} for v in value
                ]
            elif field == "branch" and isinstance(value, list):
                mongo_query["$or"] = mongo_query.get("$or", []) + [
                    {mongo_path: _branch_to_regex(v)} for v in value
                ]
            else:
                mongo_query[mongo_path] = {"$in": value}

        else:
            # Numeric comparison operators (gt, gte, lt, lte)
            if mongo_path not in mongo_query:
                mongo_query[mongo_path] = {}
            if isinstance(mongo_query[mongo_path], dict):
                mongo_query[mongo_path][mongo_op] = value
            else:
                existing = mongo_query[mongo_path]
                mongo_query[mongo_path] = {"$eq": existing, mongo_op: value}

    return mongo_query


# ---------------------------------------------------------------------------
# Safe projection (exclude sensitive fields)
# ---------------------------------------------------------------------------
SAFE_PROJECTION = {
    "_id": 0,
    "name": 1,
    "branch": 1,
    "year": 1,
    "prs_score": 1,
    "cgpa": 1,
    "github_analysis.github_score": 1,
    # scores sub-document (for linkedin/resume/aptitude/coding/softskills)
    "scores": 1,
    # Explicitly exclude sensitive fields
    "password": 0,
    "email": 0,
    "phone": 0,
    "resume_text": 0,
}

# MongoDB doesn't allow mixing inclusion and exclusion (except _id).
# Use inclusion-only projection:
INCLUSION_PROJECTION = {
    "_id": 0,
    "name": 1,
    "branch": 1,
    "year": 1,
    "prs_score": 1,
    "cgpa": 1,
    "github_analysis.github_score": 1,
    "scores": 1,
}


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------
async def run_nlq_query(query_text: str, limit: int = 50) -> Dict:
    """
    Full pipeline:
      1. Check cache
      2. Call Groq to parse query_text → structured JSON
      3. Validate the parsed JSON
      4. Build MongoDB query
      5. Execute query
      6. Return results

    Returns:
      {
        "parsed_query": { filters, sort_by, sort_order, limit },
        "results": [ ... student records ... ],
        "cached": bool
      }
    """
    # 1. Cache check
    cached = _get_cached(query_text)
    if cached:
        # Re-run the DB query with cached parsed_query (data may have changed)
        parsed = cached
        was_cached = True
    else:
        # 2. Groq parse
        try:
            parsed = await _parse_query_with_groq(query_text)
        except Exception as e:
            raise ValueError(f"Groq parsing failed: {str(e)}")

        # 3. Validate
        is_valid, err_msg = _validate_parsed_query(parsed)
        if not is_valid:
            raise ValueError(f"Invalid query structure from AI: {err_msg}")

        # Cache the validated parsed result
        _set_cache(query_text, parsed)
        was_cached = False

    # 4. Build MongoDB query
    filters = parsed.get("filters", [])
    mongo_query = _build_mongo_query(filters)

    # Sort
    sort_by_field = parsed.get("sort_by")
    sort_order = parsed.get("sort_order", "desc")
    sort_direction = -1 if sort_order == "desc" else 1

    # Respect the limit from parsed query but cap at the request limit
    parsed_limit = parsed.get("limit", 50)
    effective_limit = min(limit, parsed_limit, 200)

    # 5. Execute MongoDB query
    cursor = students_collection.find(mongo_query, INCLUSION_PROJECTION)

    if sort_by_field and sort_by_field in FIELD_TO_MONGO_PATH:
        mongo_sort_path = FIELD_TO_MONGO_PATH[sort_by_field]
        cursor = cursor.sort(mongo_sort_path, sort_direction)

    students = await cursor.to_list(length=effective_limit)

    # 6. Return
    return {
        "parsed_query": parsed,
        "results": students,
        "result_count": len(students),
        "cached": was_cached,
    }
