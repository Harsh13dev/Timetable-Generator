# backend/server.py (UPDATED CONTENT)
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any # Added Any for generic dictionaries
from models import InputFaculty, SubjectLoad # Import new models
from generator import generate_from_input, TimetableError
from dotenv import load_dotenv
from datetime import datetime
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from pytz import timezone
import pymongo
import traceback
import os

load_dotenv()

app = FastAPI()
frontend_url = os.getenv("FRONTEND_URL")

# --- Authentication and User ID Hardcoding (for local setup) ---
PLACEHOLDER_USER_ID = "placeholder_user_id"


# ✅ Enable CORS for correct frontend port (5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Setup ---
client = pymongo.MongoClient(
   os.getenv("MONGO_URI"),
    # tls=True,
    # tlsAllowInvalidCertificates=False
)
db = client["timetableDB"]
collection = db["timetables"]


# --- NEW Request Models (Mirroring frontend/models.py) ---

class TimetableRequest(BaseModel):
    """The main request body for /generate."""
    workingDays: int
    periods: int
    classes: List[str]
    batches: List[str] # NEW
    classrooms: List[str] # NEW
    labs: List[str] # NEW
    syllabus: Dict[str, Any] # Added to pass syllabus context (from AddTeacher.jsx)
    faculty: List[InputFaculty] # Renamed from 'teachers'
    userId : str = PLACEHOLDER_USER_ID # Hardcode for non-auth setup
    title : Optional[str] = None


# --- API Endpoints ---

@app.post("/generate")
async def generate_timetable(request: TimetableRequest):
    # Ensure the user ID is the hardcoded one for local non-auth setup
    request.userId = PLACEHOLDER_USER_ID

    try:
        print(f"Received request: {request.title} by {request.userId}")
        
        # Call the updated generator function
        # This function returns a dictionary containing all four timetables
        # NOTE: generator.py has NOT been fully implemented yet, but this mocks the call.
        result_data = generate_from_input(request)

        # Check if the generator returned a valid set of timetables (status is implicitly FEASIBLE if successful)
        if not result_data.get("class_timetable"):
            return {
                "message": "❌ Timetable generation failed. No feasible solution found.",
                "class_timetable": {},
                "teacher_timetable": {},
                "status": "INFEASIBLE",
                "error_type": "UNKNOWN",
                "error_details": {}
            }

        # Return all generated timetables and metadata
        return {
            "status": "FEASIBLE",
            "message": "✅ Timetable generated successfully",
            
            # --- Timetables ---
            "class_timetable": result_data["class_timetable"],
            "teacher_timetable": result_data["faculty_timetable"], # Renamed for frontend compatibility
            "lab_timetable": result_data["lab_timetable"], # NEW
            "classroom_timetable": result_data["classroom_timetable"], # NEW
            
            # --- Metadata ---
            "userId": request.userId,
            "title": request.title,
            "faculty": request.faculty, # Renamed from 'teacherData'
            "classes": request.classes,
            "batches": request.batches,
            "classrooms": request.classrooms,
            "labs": request.labs,
            "workingDays": request.workingDays,
            "periods": request.periods
        }

    except TimetableError as te:
        print(f"Timetable generation error: {te.message}")
        return {
            "message": te.message,
            "status": "ERROR",
            "error_type": te.error_type,
            "error_details": te.details
        }
    
    except Exception as e:
        error_message = str(e)
        print(f"Unexpected error generating timetable: {error_message}")
        print(traceback.format_exc())
        
        return {
            "message": f"❌ Timetable generation failed due to unexpected error: {error_message}",
            "status": "ERROR",
            "error_type": "UNEXPECTED_ERROR",
            "error_details": {"original_error": error_message}
        }


@app.post("/add")
async def add_timetable(request: Request):
    data = await request.json()
    india = timezone("Asia/Kolkata")
    data["createdAt"] = datetime.now(india).isoformat()
    data["userId"] = PLACEHOLDER_USER_ID # Hardcode the user ID

    # Handle renaming of 'faculty' back to 'teacherData' for old frontend compatibility
    if "faculty" in data:
        data["teacherData"] = data.pop("faculty")

    result = collection.insert_one(data)
    inserted_doc = collection.find_one({"_id":result.inserted_id})
    inserted_doc["_id"] = str(inserted_doc["_id"])  
    return jsonable_encoder(inserted_doc)


@app.get("/get-timetables/{user_id}")
def get_timetables(user_id: str):
    data = []
    # Force the query to use the placeholder ID for non-auth setup
    query = {"userId": PLACEHOLDER_USER_ID}  

    for doc in collection.find(query).sort("createdAt", pymongo.DESCENDING):
        doc["_id"] = str(doc["_id"])
        if isinstance(doc.get("createdAt"), datetime):
            doc["createdAt"] = doc["createdAt"].isoformat()
        
        # Ensure all four timetables are present (even if empty) for consistent frontend state
        doc["classTimetable"] = doc.get("class_timetable")
        doc["teacherTimetable"] = doc.get("teacher_timetable") # Keep old key for now
        doc["labTimetable"] = doc.get("lab_timetable") 
        doc["classroomTimetable"] = doc.get("classroom_timetable") 
        
        # Rename 'faculty' back to 'teacherData' for old frontend compatibility
        if "faculty" in doc:
            doc["teacherData"] = doc.pop("faculty")
            
        data.append(doc)

    return data

@app.put("/update-timetable/{timetable_id}")
async def update_timetable(timetable_id: str, request:Request):
    data = await request.json()
    india = timezone("Asia/Kolkata")
    
    # Handle renaming of 'faculty' back to 'teacherData' for old frontend compatibility
    if "faculty" in data:
        data["teacherData"] = data.pop("faculty")

    update_fields = {
        "class_timetable": data["class_timetable"],
        "teacher_timetable": data.get("teacher_timetable"), # Include all 4 tables
        "lab_timetable": data.get("lab_timetable"),
        "classroom_timetable": data.get("classroom_timetable"),
        "createdAt": datetime.now(india).isoformat(),
        "teacherData": data.get("teacherData"),
        # Also update resources and loads
        "classes": data.get("classes"),
        "batches": data.get("batches"),
        "classrooms": data.get("classrooms"),
        "labs": data.get("labs"),
        "workingDays": data.get("workingDays"),
        "periods": data.get("periods"),
        "title": data.get("title"),
        "userId": PLACEHOLDER_USER_ID # Enforce placeholder ID
    }
    
    updated_doc = collection.find_one_and_update(
        {"_id": ObjectId(timetable_id)},
        {"$set": {k:v for k,v in update_fields.items() if v is not None}}, # Filter out None values
        return_document=pymongo.ReturnDocument.AFTER
    )
    
    if not updated_doc:
         raise HTTPException(status_code=404, detail="Timetable not found")

    updated_doc["_id"] = str(updated_doc["_id"])
    
    # Rename 'teacherData' back to 'faculty' for consistent Python usage after update
    if "teacherData" in updated_doc:
        updated_doc["faculty"] = updated_doc.pop("teacherData")
        
    return jsonable_encoder(updated_doc)

@app.delete("/delete-timetable/{timetable_id}")
async def delete_timetable(timetable_id: str):
    # Enforce user ID filter for safety (even with placeholder)
    result = collection.delete_one({"_id": ObjectId(timetable_id), "userId": PLACEHOLDER_USER_ID})
    if result.deleted_count == 1:
        return {"message": "Deleted"}
    return {"message": "Not Found"}

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {"message": "Timetable Generator API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)