# CampusIQ - Intelligent Placement Readiness System

CampusIQ is an AI-powered platform designed to enhance student placement readiness through data-driven insights, automated resume analysis, and personalized learning paths.

## 🚀 Features

- **AI-Powered Resume Analysis**: parses resumes (PDF) to extract skills, project details, and provide ATS compatibility scores.
- **Placement Readiness Score (PRS)**: A comprehensive metric combining CGPA, Skills, GitHub activity, and Resume quality to gauge student preparedness.
- **Strategic AI Insights**: analyzing batch performance to suggest targeted interventions (workshops, bootcamps) for specific branches/years.
- **GitHub Profile Analysis**: Intelligent evaluation of code quality, project diversity, and activity to guide student portfolio improvement.
- **Company Eligibility Funnel**: Visualizing the recruitment pipeline to identify where students are dropping off (CGPA, Skills, etc.).
- **Role-Based Access**: Specialized dashboards for Students and Admins.

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (Motor async driver)
- **AI/LLM**: Groq (Llama-3 models)
- **PDF Processing**: PDFMiner.six, PyMuPDF, Tabula-py
- **Authentication**: JWT (JSON Web Tokens)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Component**: Shadcn/UI + Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## 📦 Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Instance (Local or Atlas)
- Groq API Key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure Environment Variables:
   Create a `.env` file in `backend/` with:
   ```env
   MONGODB_URL=mongodb://localhost:27017
   DB_NAME=campus_iq
   SECRET_KEY=your_secret_key_here
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   Server will start at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   App will open at `http://localhost:3000`

## 🧪 Usage with Java (for Tabula-py)
Ensure Java is installed and added to your system PATH for table extraction to work correctly.

## 🤝 Contribution
1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open a Pull Request
