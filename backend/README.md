# Timetable Generator Backend

## How to Run

1. Install dependencies:
pip install -r requirements.txt


2. Run the API server:
python -m uvicorn api.server:app --reload


3. Endpoints:
- `GET /` → Welcome message
- `GET /generate` → Returns class and teacher timetables as JSON

## Folder Structure

- `generator.py` → Timetable logic using Google OR-Tools
- `teachers.py` → Hardcoded teacher assignments
- `config.py` → Settings like classes and period counts
- `models.py` → Data models (Teacher, Timetable)
- `server.py` → FastAPI app