from groq import Groq
from ..core.config import settings
import time
import google.generativeai as genai
import json

# Groq Client (Existing)
client = Groq(api_key=settings.GROQ_API_KEY)

# Gemini Configuration (New)
genai.configure(api_key=settings.GEMINI_API_KEY)

# Rate Limiting: strict 12 RPM Sliding Window
REQUEST_TIMESTAMPS = []

async def analyze_company_fit(student_profile: dict, company_requirements: dict) -> dict:
    """
    Analyzes fit between student and company using Gemini 1.5 Flash.
    Enforces a strict 12 RPM rate limit using a sliding window.
    """
    global REQUEST_TIMESTAMPS
    
    # 1. Rate Limiting Logic
    now = time.time()
    
    # Filter timestamps to keep only those within the last 60 seconds
    REQUEST_TIMESTAMPS = [t for t in REQUEST_TIMESTAMPS if t > now - 60]
    
    # Check Threshold
    if len(REQUEST_TIMESTAMPS) >= 12:
        return {
            "match_score": "N/A",
            "analysis": "System busy (Safety Limit). Please wait 60 seconds."
        }
        
    # If Safe, record timestamp and proceed
    REQUEST_TIMESTAMPS.append(now)
    
    # 2. Call AI
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
        Analyze the fit between this student and company.
        
        Student Profile: {student_profile}
        Company Requirements: {company_requirements}
        
        Provide a 3-bullet point analysis of the fit. Focus on skills and experience match.
        """
        
        response = await model.generate_content_async(prompt)
        analysis_text = response.text
        
        return {
            "match_score": "AI Calculated", # Placeholder as per instruction focus on analysis
            "analysis": analysis_text
        }
    except Exception as e:
        return {
            "match_score": "Error",
            "analysis": f"AI analysis failed: {str(e)}"
        }

async def generate_micro_tasks(student_data: dict) -> list:
    """
    Generates 5 actionable micro-tasks for the student based on their profile.
    Uses Groq (Llama 3) for high-speed generation.
    Returns: List of strings.
    """
    try:
        completion = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {
                    "role": "system",
                    "content": "You are a strict career coach. Return ONLY a valid JSON object with a single key 'tasks' containing a list of 5 short, actionable strings. Do not include markdown formatting or extra text."
                },
                {
                    "role": "user",
                    "content": f"Generate 5 micro-tasks for this student based on their missing skills: {student_data}"
                }
            ],
            temperature=0.7,
            max_tokens=500,
            top_p=1,
            stream=False,
            response_format={"type": "json_object"}
        )

        response_content = completion.choices[0].message.content
        data = json.loads(response_content)
        return data.get("tasks", [])
    
    except Exception as e:
        print(f"Error generating micro-tasks: {e}")
        return ["Update your resume with recent projects.", "Complete a coding challenge on LeetCode.", "Optimize your LinkedIn profile headline."]

async def analyze_resume_deep(resume_text: str) -> dict:
    """
    Deeply analyzes resume using Gemini 1.5 Flash (ATS Auditor).
    Enforces strict 12 RPM rate limit.
    """
    global REQUEST_TIMESTAMPS
    
    # 1. Rate Limiting Logic
    now = time.time()
    REQUEST_TIMESTAMPS = [t for t in REQUEST_TIMESTAMPS if t > now - 60]
    
    if len(REQUEST_TIMESTAMPS) >= 12:
        return {
            "ats_score": 0,
            "missing_sections": [],
            "action_verb_rating": "N/A",
            "critical_feedback": ["System busy (Safety Limit). Please wait 60 seconds."],
            "extracted_skills": []
        }
    
    REQUEST_TIMESTAMPS.append(now)

    # 2. Call AI
    try:
        # Using gemini-1.5-flash as gemini-3-flash is not yet available/stable
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
        You are an advanced AI Recruiter and ATS Auditor. Analyze the resume text below and return a strictly valid JSON object. 
        Do not include markdown formatting like ```json ... ```.
        
        Resume Text:
        {resume_text}
        
        Output Structure (JSON):
        {{
            "ats_score": (integer 0-100),
            "missing_sections": (list of strings),
            "action_verb_rating": (string: 'Low', 'Medium', 'High'),
            "critical_feedback": (list of 3 specific, actionable improvement strings),
            "extracted_skills": (list of technical skills found)
        }}
        """
        
        response = await model.generate_content_async(prompt)
        # Clean potential markdown
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_text)
        return data

    except Exception as e:
        return {
            "ats_score": 0,
            "missing_sections": [],
            "action_verb_rating": "Error",
            "critical_feedback": [f"Analysis failed: {str(e)}"],
            "extracted_skills": []
        }

async def generate_heatmap_summary(heatmap_data: list) -> str:
    """
    Generates a 2-sentence summary of placement data using Groq (Llama 3).
    High speed, low latency.
    """
    try:
        if not heatmap_data:
            return "No data available."

        completion = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {
                    "role": "system",
                    "content": "Summarize this campus placement data in 2 sentences. Highlight the best and worst performing branches."
                },
                {
                    "role": "user",
                    "content": f"Data: {json.dumps(heatmap_data)}"
                }
            ],
            temperature=0.5,
            max_tokens=100
        )
        return completion.choices[0].message.content
    except Exception as e:
        return "Unable to generate summary at this time."

async def generate_training_plan(heatmap_data: list) -> dict:
    """
    Generates training interventions using Gemini 1.5 Flash.
    Strict 12 RPM rate limit.
    """
    global REQUEST_TIMESTAMPS
    
    # Rate Limit Check
    now = time.time()
    REQUEST_TIMESTAMPS = [t for t in REQUEST_TIMESTAMPS if t > now - 60]
    
    if len(REQUEST_TIMESTAMPS) >= 12:
        return {"recommendations": ["System busy (Safety Limit). Please wait 60 seconds."]}
    
    REQUEST_TIMESTAMPS.append(now)

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
        Act as a Dean. Analyze this data and recommend 3 specific, high-impact training interventions (e.g., 'Python Bootcamp for TE ECS'). 
        Return a strict JSON object with a key 'recommendations' containing the list.
        Do not include markdown formatting.

        Data:
        {json.dumps(heatmap_data)}
        """
        
        response = await model.generate_content_async(prompt)
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_text)
        
    except Exception as e:
        return {"recommendations": [f"Error generating plan: {str(e)}"]}
