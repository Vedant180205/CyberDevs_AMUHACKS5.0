import os
import re
import io
import json
import fitz  # PyMuPDF
import pandas as pd
from pdfminer.high_level import extract_text
from PIL import Image
from typing import Dict, List, Any, Optional
import tabula
from groq import Groq

UPLOAD_DIR_IMAGES = "uploads/resume_images/"

async def analyze_resume_with_groq(student_profile: Dict, resume_text: str) -> Dict[str, Any]:
    """
    Sends resume text + student profile to Groq for analysis.
    Returns structured JSON with scores and suggestions.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("GROQ_API_KEY not found")
        return {
            "resume_score": 0,
            "ats_score": 0,
            "missing_sections": [],
            "profile_mismatches": [],
            "suggestions": ["API Key Missing"],
            "short_summary": "Could not analyze."
        }
    
    # Use AsyncGroq to prevent blocking event loop
    from groq import AsyncGroq
    client = AsyncGroq(api_key=api_key)
    
    # Construct Context
    profile_summary = (
        f"Name: {student_profile.get('name')}\n"
        f"Branch: {student_profile.get('branch')}\n"
        f"Year: {student_profile.get('year')}\n"
        f"Skills: {', '.join(student_profile.get('skills', []))}\n"
        f"CGPA: {student_profile.get('cgpa')}\n"
        f"GitHub: {student_profile.get('github_url')}\n"
        f"LinkedIn: {student_profile.get('linkedin_url')}\n"
    )

    prompt = f"""
    You are an expert ATS and Resume Analyzer for Campus Placements.
    
    Student Profile:
    {profile_summary}
    
    Resume Content (Extracted Text):
    {resume_text[:4000]}  # Truncate to avoid context limit if needed
    
    Task:
    1. Compare the Student Profile with the Resume.
    2. Rate the resume quality (0-100).
    3. Rate ATS compatibility (0-100).
    4. Identify missing sections (e.g., Projects, Skills, Education).
    5. Find mismatches between Profile and Resume (e.g., skill listed in profile but not in resume).
    6. Suggest 3-5 concrete improvements.
    
    Return STRICT JSON format ONLY:
    {{
      "resume_score": <int>,
      "ats_score": <int>,
      "missing_sections": ["section1", "section2"],
      "detected_skills": ["skill1", "skill2"],
      "profile_mismatches": ["mismatch1", "mismatch2"],
      "improvement_suggestions": ["tip1", "tip2", "tip3"],
      "short_summary": "<string>"
    }}
    """

    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful AI career coach. Output JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        response_content = completion.choices[0].message.content
        return json.loads(response_content)

    except Exception as e:
        print(f"Groq Analysis Failed: {e}")
        return {
            "resume_score": 0,
            "ats_score": 0,
            "missing_sections": [],
            "profile_mismatches": [],
            "suggestions": [f"Error: {str(e)}"],
            "short_summary": "Analysis failed."
        }


def extract_text_from_pdf(file_path: str) -> str:
    """Extracts raw text from PDF using pdfminer.six."""
    try:
        text = extract_text(file_path)
        return text if text else ""
    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""

def extract_images_from_pdf(file_path: str, student_id: str) -> int:
    """Extracts images using PyMuPDF + Pillow and saves them."""
    try:
        doc = fitz.open(file_path)
        image_count = 0
        
        # specific folder for this student
        student_img_dir = os.path.join(UPLOAD_DIR_IMAGES, student_id)
        os.makedirs(student_img_dir, exist_ok=True)

        for i in range(len(doc)):
            for img in doc.get_page_images(i):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                
                # Use Pillow to save
                image = Image.open(io.BytesIO(image_bytes))
                image_filename = f"page{i+1}_img{xref}.{base_image['ext']}"
                image.save(os.path.join(student_img_dir, image_filename))
                image_count += 1
                
        return image_count
    except Exception as e:
        print(f"Error extracting images: {e}")
        return 0

def extract_tables_from_pdf(file_path: str) -> List[Dict[str, Any]]:
    """Extracts tables using tabula-py. Fallback if Java is missing."""
    try:
        # Returns list of DataFrames
        # multiple_tables=True returns a list of DataFrames
        dfs = tabula.read_pdf(file_path, pages="all", multiple_tables=True)
        tables = []
        for df in dfs:
            # Convert NaN to None/null for valid JSON
            tables.append(df.where(pd.notnull(df), None).to_dict(orient="records"))
        return tables
    except Exception as e:
        print(f"Tabula extraction failed (Java might be missing?): {e}")
        return []

def parse_contact_info(text: str) -> Dict[str, Any]:
    """Basic regex parsing for contact info."""
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    phone_pattern = r'(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})'
    # Simple URL patterns
    github_pattern = r'(github\.com\/[a-zA-Z0-9_-]+)'
    linkedin_pattern = r'(linkedin\.com\/in\/[a-zA-Z0-9_-]+)'

    emails = re.findall(email_pattern, text)
    phones = re.findall(phone_pattern, text)
    githubs = re.findall(github_pattern, text)
    linkedins = re.findall(linkedin_pattern, text)

    return {
        "emails": list(set(emails)),
        "phones": list(set(phones)),
        "github_links": list(set(githubs)),
        "linkedin_links": list(set(linkedins))
    }

import asyncio

async def process_resume_upload(file_path: str, student_id: str) -> Dict[str, Any]:
    """Orchestrates the resume extraction pipeline. Runs blocking I/O in threads."""
    
    # 1. Text Extraction (Blocking)
    raw_text = await asyncio.to_thread(extract_text_from_pdf, file_path)
    
    # 2. Image Extraction (Blocking)
    images_extracted = await asyncio.to_thread(extract_images_from_pdf, file_path, student_id)
    
    # 3. Table Extraction (Blocking - Java process)
    tables = await asyncio.to_thread(extract_tables_from_pdf, file_path)
    
    # 4. Regex parsing (CPU bound but fast, still good to offload if text is huge)
    contact_info = await asyncio.to_thread(parse_contact_info, raw_text)
    
    return {
        "raw_text": raw_text,
        "images_extracted": images_extracted,
        "tables": tables,
        "contact_info": contact_info
    }
