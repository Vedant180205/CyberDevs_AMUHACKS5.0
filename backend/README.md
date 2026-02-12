# CampusIQ Backend

Backend service for the CampusIQ platform, built with FastAPI and MongoDB.

## Features

- **Student Authentication**: Secure login and registration system
- **Dashboard**: Comprehensive student dashboard with GitHub integration
- **GitHub Analysis**: 
  - Automated analysis of GitHub profiles
  - repo statistics, language distribution, and activity metrics
  - **AI-Powered Insights**: Detailed strengths, weaknesses, and recommendations using Groq AI
- **Company Matching**: 
  - Intelligent matching algorithm matching students to companies
  - Eligibility checking based on CGPA, branch, and skills
  - **AI Match Analysis**: Detailed explanation of why a student matches/doesn't match a company
- **Placement Readiness Score (PRS)**: Calculated score to gauge placement preparedness

## Tech Stack

- **Framework**: FastAPI
- **Database**: MongoDB (via Motor/PyMongo)
- **AI Engine**: Groq (Llama 3 70B)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Pydantic

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create Virtual Environment**
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=mongodb://localhost:27017
   DB_NAME=campusIQ
   SECRET_KEY=your_secret_key_here
   ALGORITHM=HS256
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

5. **Run the Server**
   ```bash
   uvicorn app.main:app --reload
   ```

## API Endpoints

### Student
- `POST /api/student/login` - Student login
- `GET /api/student/me` - Get student profile
- `POST /api/student/analyze/github` - Basic GitHub analysis
- `GET /api/student/company-match` - Get company matches with **AI analysis**

### AI Features
I've integrated Groq AI to provide:
1. **Profile Analysis**: Deep dive into coding style, project complexity, and skills
2. **Match Reasoning**: Explains *why* a student matches a company
3. **Gap Analysis**: Identifies exactly what is missing for non-eligible companies
4. **Actionable Recommendations**: Personalized steps to improve placement chances

## Configuration

### Groq Model
- Default: `llama-3.3-70b-versatile`
- Configurable via `GROQ_MODEL` environment variable
- If you encounter "decommissioned model" errors, update the model name in `.env`

## Contributors
- CyberDevs Team
