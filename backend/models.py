# backend/models.py (UPDATED CONTENT)
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from dataclasses import dataclass

# --- Pydantic models for API input ---

class SubjectLoad(BaseModel):
    """Defines the load for a single Subject/Lab for a Class from the syllabus/load document."""
    subject: str
    class_name: str
    lecture_load: int  # e.g., 4 periods/week
    lab_load: int = 0  # e.g., 2 periods/week (must be even for double periods)

class InputFaculty(BaseModel):
    """Defines a faculty member and their total teaching assignments (Load Distribution Document)."""
    name: str
    load_assignments: List[SubjectLoad] # List of all Subject/Lab loads assigned

class TimetableRequest(BaseModel):
    """The main request body sent to the /generate endpoint."""
    workingDays: int
    periods: int
    classes: List[str]  # e.g., BE, SE, TE
    batches: List[str]  # e.g., Batch 1, Batch 2 (Fixed 2)
    classrooms: List[str] # e.g., C1, C2, C3
    labs: List[str]  # e.g., Lab 1, Lab 2, Lab 3, Lab 4
    
    # Syllabus is derived from Faculty load for validation/reference
    syllabus: Dict[str, Any] 
    
    faculty: List[InputFaculty] # List of all faculty members
    userId : str 
    title : Optional[str] = None
    
# --- Dataclass models for internal use in generator.py ---
# Note: These reflect the complex nature of the timetable solution itself

@dataclass
class PeriodDetail:
    """The final content of a single time slot."""
    faculty: str 
    subject: str
    class_name: str
    batch: str           # Full Class (Lecture) or Batch 1/Batch 2 (Lab)
    room: str            # C1, C2, C3 (Lecture) or Lab 1, Lab 2 (Lab)
    is_lab: bool
    
@dataclass
class Timetable:
    """The generic structure for all four output timetables (Class, Faculty, Lab, Classroom)."""
    # data: Dict[str, List[List[Optional[PeriodDetail or str]]]]
    data: Dict[str, List[List[Any]]]