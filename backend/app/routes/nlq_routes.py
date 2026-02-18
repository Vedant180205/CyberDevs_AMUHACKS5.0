"""
nlq_routes.py — FastAPI route for the Natural Language Query (NLQ) feature.

Route:
  POST /admin/ai-query

Request body:
  { "query_text": "string", "limit": 50 }

Response body:
  { "parsed_query": {...}, "results": [...], "result_count": int, "cached": bool }
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.utils.auth_dependency import get_current_user
from app.services.nlq_service import run_nlq_query

router = APIRouter()


class NLQRequest(BaseModel):
    query_text: str = Field(..., min_length=3, max_length=500, description="Natural language query from admin")
    limit: int = Field(default=50, ge=1, le=200, description="Maximum number of results to return")


@router.post("/ai-query")
async def admin_ai_query(
    body: NLQRequest,
    current_user=Depends(get_current_user),
):
    """
    Convert a natural language admin query into a MongoDB query via Groq AI,
    execute it, and return matching student records.

    Example queries:
      - "Show me TY ECS students with github score above 60"
      - "Give me all students with prs score above 75 and coding score above 70"
      - "List final year IT students with linkedin score below 40"
      - "Show CSE students with cgpa above 8"
    """
    try:
        result = await run_nlq_query(
            query_text=body.query_text,
            limit=body.limit,
        )
        return result
    except ValueError as e:
        # Validation or parsing errors — return 400 with a clear message
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Unexpected errors (network, Groq API down, etc.)
        raise HTTPException(
            status_code=500,
            detail=f"AI query failed. Please try again. Details: {str(e)}",
        )
