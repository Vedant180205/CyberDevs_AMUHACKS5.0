
import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

def analyze_resume(image_bytes: bytes, mime_type: str = "image/jpeg"):
    """
    Analyzes a resume image using Gemini 2.0 Flash via google-genai SDK.
    Returns a dictionary with ATS score and extracted data.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not found in environment variables")
        return {
            "ats_score": 0,
            "skills": [],
            "experience_summary": "API Key Missing",
            "education_summary": "",
            "suggestions": "Please configure GEMINI_API_KEY."
        }

    client = genai.Client(api_key=api_key)

    prompt = """
    You are an expert ATS (Applicant Tracking System) analyzer. 
    Analyze the provided resume image and extract the following information in strict JSON format:
    {
        "ats_score": <integer between 0 and 100 representing how well formatted and content-rich the resume is>,
        "skills": [<list of technical and soft skills found>],
        "experience_summary": "<brief summary of work experience>",
        "education_summary": "<brief summary of education>",
        "suggestions": "<brief suggestions for improvement>"
    }
    
    Focus on identifying key technical skills, project experience, and overall clarity.
    Do not include markdown formatting (like ```json), just return the raw JSON string.
    """

    try:
        response = client.models.generate_content(
            model="gemini-flash-latest", 
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=prompt),
                        types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
                    ]
                )
            ],
            config=types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(include_thoughts=True),
                tools=[types.Tool(google_search=types.GoogleSearch())],
                response_mime_type="application/json"
            )
        )
        
        if response.text:
            # Clean up potentially leftover markdown if the model ignores the instruction slightly
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            return json.loads(text.strip())
        else:
             return {
                "ats_score": 0,
                "skills": [],
                "experience_summary": "Empty response from AI",
                "education_summary": "",
                "suggestions": "Model returned no content."
            }

    except Exception as e:
        print(f"Error analyzing resume with google-genai: {e}")
        return {
            "ats_score": 0,
            "skills": [],
            "experience_summary": "Failed to analyze resume",
            "education_summary": "",
            "suggestions": f"Error: {str(e)}"
        }
