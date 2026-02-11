import os
import random
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
from passlib.context import CryptContext

# ---------------- LOAD ENV ---------------- #
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "campusIQ")

if not MONGO_URI:
    raise Exception("ERROR: MONGO_URI missing in .env file")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

students_collection = db["students"]
companies_collection = db["companies"]
benchmarks_collection = db["benchmarks"]
training_collection = db["training_recommendations"]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------- DATA ---------------- #
branches = ["CSE", "IT", "ECS"]
years = ["FY", "SY", "TY", "FINAL"]

first_names = [
    "Vedant", "Rohit", "Sahil", "Aditya", "Om", "Aman", "Kunal", "Siddhesh",
    "Tanmay", "Nikhil", "Prathamesh", "Harsh", "Tejas", "Yash", "Atharva",
    "Neha", "Riya", "Pooja", "Sneha", "Isha", "Aditi", "Anjali"
]

last_names = [
    "Patil", "Sharma", "Jadhav", "Pawar", "Singh", "Gupta", "More", "Kale",
    "Chavan", "Deshmukh", "Naik", "Bhosale", "Kulkarni", "Joshi"
]

skills_pool = [
    "Python", "Java", "C++", "C", "JavaScript", "TypeScript", "HTML", "CSS",
    "MongoDB", "MySQL", "React", "Next.js", "Node.js", "FastAPI",
    "Firebase", "Git", "DSA", "Machine Learning", "Arduino", "ESP32", "SQL"
]

project_types = [
    "Web Development Project",
    "IoT / Embedded Project",
    "Machine Learning Project",
    "Java + Database Project",
    "Python Project",
    "General Project"
]

company_templates = [
    {
        "company_name": "TCS",
        "tier": "Tier-2",
        "role": "Software Developer",
        "allowed_branches": ["CSE", "IT", "ECS"],
        "min_cgpa": 6.5,
        "required_skills": ["DSA", "Java", "SQL"],
        "preferred_skills": ["Git", "OOP"]
    },
    {
        "company_name": "Accenture",
        "tier": "Tier-2",
        "role": "Associate Software Engineer",
        "allowed_branches": ["CSE", "IT"],
        "min_cgpa": 7.0,
        "required_skills": ["Java", "SQL", "Communication"],
        "preferred_skills": ["Git", "React"]
    },
    {
        "company_name": "Capgemini",
        "tier": "Tier-2",
        "role": "Analyst",
        "allowed_branches": ["CSE", "IT", "ECS"],
        "min_cgpa": 6.0,
        "required_skills": ["Python", "SQL"],
        "preferred_skills": ["Machine Learning", "Git"]
    },
    {
        "company_name": "JP Morgan",
        "tier": "Tier-1",
        "role": "SDE Intern",
        "allowed_branches": ["CSE", "IT"],
        "min_cgpa": 8.0,
        "required_skills": ["DSA", "Java", "System Design"],
        "preferred_skills": ["Python", "Git", "Projects"]
    },
    {
        "company_name": "LTI Mindtree",
        "tier": "Tier-2",
        "role": "Software Engineer",
        "allowed_branches": ["CSE", "IT", "ECS"],
        "min_cgpa": 7.0,
        "required_skills": ["Java", "DSA"],
        "preferred_skills": ["SQL", "Git", "React"]
    }
]

# ---------------- HELPERS ---------------- #
def generate_email(fname, lname, idx):
    return f"{fname.lower()}.{lname.lower()}{idx}@campusiq.com"


def generate_random_skills(branch):
    base_count = random.randint(4, 10)
    chosen = random.sample(skills_pool, base_count)

    if branch == "ECS":
        chosen += random.sample(["Arduino", "ESP32", "C++"], 2)
    elif branch == "CSE":
        chosen += random.sample(["DSA", "Java", "Python"], 2)
    elif branch == "IT":
        chosen += random.sample(["React", "Node.js", "MongoDB"], 2)

    return list(set(chosen))


def generate_github_analysis(skills):
    langs = []
    if "Python" in skills:
        langs.append("Python")
    if "Java" in skills:
        langs.append("Java")
    if "C++" in skills:
        langs.append("C++")
    if "JavaScript" in skills or "React" in skills or "Node.js" in skills:
        langs.append("JavaScript")
    if "TypeScript" in skills or "Next.js" in skills:
        langs.append("TypeScript")
    if "HTML" in skills:
        langs.append("HTML")
    if "CSS" in skills:
        langs.append("CSS")

    langs = list(set(langs))
    random.shuffle(langs)

    repo_count = random.randint(3, 18)
    commits_90 = random.randint(0, 120)
    active_repos = random.randint(0, min(10, repo_count))

    dist = {}
    for _ in range(random.randint(2, 4)):
        pt = random.choice(project_types)
        dist[pt] = dist.get(pt, 0) + 1

    github_score = min(100, int(repo_count * 3 + commits_90 * 0.5 + len(langs) * 8))

    return {
        "username": f"user{random.randint(1000,9999)}",
        "followers": random.randint(0, 50),
        "following": random.randint(0, 80),
        "public_repos": repo_count,
        "top_languages": langs[:6],
        "activity_summary": {
            "active_repos_last_90_days": active_repos,
            "commits_last_90_days_estimated": commits_90
        },
        "project_type_distribution": dist,
        "github_score": github_score,
        "repo_analysis": []
    }


def calculate_prs(cgpa, skills, github_analysis):
    github_score_raw = github_analysis.get("github_score", 0)
    github_score = int((github_score_raw / 100) * 25)

    skills_count = len(skills)
    if skills_count >= 12:
        skills_score = 15
    elif skills_count >= 8:
        skills_score = 12
    elif skills_count >= 5:
        skills_score = 9
    elif skills_count >= 3:
        skills_score = 6
    elif skills_count >= 1:
        skills_score = 3
    else:
        skills_score = 0

    if cgpa >= 9.0:
        cgpa_score = 10
    elif cgpa >= 8.0:
        cgpa_score = 8
    elif cgpa >= 7.0:
        cgpa_score = 6
    elif cgpa >= 6.0:
        cgpa_score = 4
    else:
        cgpa_score = 2

    commits_90 = github_analysis.get("activity_summary", {}).get("commits_last_90_days_estimated", 0)
    if commits_90 >= 80:
        activity_score = 10
    elif commits_90 >= 50:
        activity_score = 8
    elif commits_90 >= 25:
        activity_score = 6
    elif commits_90 >= 10:
        activity_score = 4
    elif commits_90 >= 1:
        activity_score = 2
    else:
        activity_score = 0

    diversity_count = len(github_analysis.get("project_type_distribution", {}).keys())
    if diversity_count >= 6:
        diversity_score = 10
    elif diversity_count >= 4:
        diversity_score = 8
    elif diversity_count >= 3:
        diversity_score = 6
    elif diversity_count >= 2:
        diversity_score = 4
    elif diversity_count >= 1:
        diversity_score = 2
    else:
        diversity_score = 0

    lang_count = len(github_analysis.get("top_languages", []))
    if lang_count >= 6:
        language_score = 10
    elif lang_count >= 4:
        language_score = 8
    elif lang_count >= 3:
        language_score = 6
    elif lang_count >= 2:
        language_score = 4
    elif lang_count >= 1:
        language_score = 2
    else:
        language_score = 0

    prs_total = github_score + skills_score + cgpa_score + activity_score + diversity_score + language_score
    prs_scaled = int((prs_total / 80) * 100)

    if prs_scaled >= 80:
        prs_level = "Excellent"
    elif prs_scaled >= 60:
        prs_level = "Good"
    elif prs_scaled >= 40:
        prs_level = "Average"
    else:
        prs_level = "Poor"

    breakdown = {
        "github_score_25": github_score,
        "skills_score_15": skills_score,
        "cgpa_score_10": cgpa_score,
        "activity_score_10": activity_score,
        "project_diversity_score_10": diversity_score,
        "language_diversity_score_10": language_score
    }

    return prs_scaled, prs_level, breakdown


# ---------------- SEEDERS ---------------- #
def seed_students():
    print("Deleting old students...")
    students_collection.delete_many({})

    students = []
    idx = 1

    for branch in branches:
        for year in years:
            for _ in range(10):  # 10 per branch-year = 120
                fname = random.choice(first_names)
                lname = random.choice(last_names)

                name = f"{fname} {lname}"
                email = generate_email(fname, lname, idx)
                password = pwd_context.hash("12345")

                cgpa = round(random.uniform(5.5, 9.8), 2)
                skills = generate_random_skills(branch)

                github_url = f"https://github.com/{fname.lower()}{lname.lower()}{random.randint(1,99)}"
                linkedin_url = f"https://linkedin.com/in/{fname.lower()}{lname.lower()}{random.randint(100,999)}"

                github_analysis = generate_github_analysis(skills)
                prs_score, prs_level, prs_breakdown = calculate_prs(cgpa, skills, github_analysis)

                student_doc = {
                    "name": name,
                    "email": email,
                    "password": password,
                    "year": year,
                    "branch": branch,
                    "cgpa": cgpa,
                    "skills": skills,
                    "linkedin_url": linkedin_url,
                    "github_url": github_url,
                    "github_analysis": github_analysis,
                    "prs_score": prs_score,
                    "prs_level": prs_level,
                    "prs_breakdown": prs_breakdown,
                    "created_at": datetime.utcnow()
                }

                students.append(student_doc)
                idx += 1

    students_collection.insert_many(students)
    print(f"Inserted {len(students)} students successfully.")


def seed_companies():
    print("Deleting old companies...")
    companies_collection.delete_many({})

    for company in company_templates:
        company["created_at"] = datetime.utcnow()

    companies_collection.insert_many(company_templates)
    print(f"Inserted {len(company_templates)} companies successfully.")


def seed_benchmarks():
    print("Deleting old benchmarks...")
    benchmarks_collection.delete_many({})

    benchmark_docs = []

    for branch in branches:
        for year in years:
            base_prs = 30
            if year == "SY":
                base_prs = 45
            elif year == "TY":
                base_prs = 60
            elif year == "FINAL":
                base_prs = 70

            if branch == "CSE":
                base_prs += 5
            elif branch == "ECS":
                base_prs -= 3

            benchmark_docs.append({
                "branch": branch,
                "year": year,
                "expected_prs": base_prs,
                "expected_skills": random.sample(skills_pool, 6),
                "min_projects": random.randint(2, 6),
                "min_github_score": random.randint(40, 70),
                "created_at": datetime.utcnow()
            })

    benchmarks_collection.insert_many(benchmark_docs)
    print(f"Inserted {len(benchmark_docs)} benchmarks successfully.")


def seed_training_recommendations():
    print("Deleting old training recommendations...")
    training_collection.delete_many({})

    weak_areas = [
        "GitHub Activity",
        "Resume Quality",
        "LinkedIn Profile",
        "Coding Assessment",
        "Aptitude Performance",
        "Project Diversity"
    ]

    training_titles = [
        "GitHub + Project Bootcamp",
        "Resume ATS Optimization Workshop",
        "LinkedIn Branding Workshop",
        "DSA + Coding Contest Training",
        "Aptitude Speed Test Bootcamp",
        "Full Stack Mini Project Hackathon"
    ]

    docs = []

    for branch in branches:
        for year in years:
            weak_area = random.choice(weak_areas)
            suggestion = random.choice(training_titles)

            docs.append({
                "branch": branch,
                "year": year,
                "weak_area": weak_area,
                "suggested_training": suggestion,
                "priority": random.choice(["Low", "Medium", "High"]),
                "created_at": datetime.utcnow()
            })

    training_collection.insert_many(docs)
    print(f"Inserted {len(docs)} training recommendations successfully.")


# ---------------- MAIN ---------------- #
if __name__ == "__main__":
    seed_students()
    seed_companies()
    seed_benchmarks()
    seed_training_recommendations()

    print("\nALL COLLECTIONS SEEDED SUCCESSFULLY.")
    print("Collections created:")
    print("- students")
    print("- companies")
    print("- benchmarks")
    print("- training_recommendations")
