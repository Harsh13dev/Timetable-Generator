# 🗓️ School Timetable Generator

A powerful, constraint-aware **School Timetable Generator** built with a modern full-stack architecture. It automates academic scheduling using real-world rules, ensuring accuracy, scalability, and usability across schools of all sizes.

## 🚀 Live Demo

🌐 Try it out: 

## 🧠 Problem Statement

Creating school timetables manually is:
- Time-consuming
- Prone to conflicts
- Hard to update with constraints

We built this web app to **automate the process** with an intelligent scheduling engine that respects real academic rules — all in **seconds**, not hours.

## 🎯 Features

✅ Class-wise timetable generation  
✅ Intelligent constraint-based logic  
✅ Real-time editing and re-generation  
✅ Print-ready **PDF exports** (single/all classes)  
✅ Cross-device responsive UI  
✅ Secure login with Clerk  
✅ Fast and reliable backend engine  

## 📌 Supported Constraints

- **One Teacher per Slot:** A teacher cannot be in two places at once  
- **Subject Period Limits:** Each subject gets its allotted number of periods per week  
- **Daily Subject Cap:** A subject doesn’t appear more than twice per day  
- **Lab Blocks:** Subjects like IT are automatically grouped into double periods  
- **Class Teacher Priority:** First period of the day is allotted to the class teacher  
- **Valid Assignments:** Only valid teacher-subject-class combinations are used  

## ⚙️ Tech Stack

| Layer        | Technology          |
|--------------|---------------------|
| Frontend     | React.js            |
| Backend      | FastAPI (Python)    |
| Auth         | Clerk.dev           |
| Database     | MongoDB             |
| Scheduling   | Google OR-Tools     |
| Deployment   | Render              |


## 🛠️ Getting Started

# Clone the project
git clone https://github.com/your-username/timetable-generator.git
cd timetable-generator

# Set up and run the backend (FastAPI)
cd backend
python3 -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload

# Open a new terminal for the frontend
cd frontend
npm install
npm run dev

