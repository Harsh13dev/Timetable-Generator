# backend/generator.py (UPDATED CONTENT - Conceptual Model)
from ortools.sat.python import cp_model
from models import SubjectLoad, Timetable, InputFaculty, TimetableRequest, PeriodDetail
from typing import List, Dict, Optional, Any
from collections import defaultdict
import traceback

class TimetableError(Exception):
    """Custom exception for timetable generation errors"""
    def __init__(self, message: str, error_type: str = "CONSTRAINT_VIOLATION", details: Dict = None):
        self.message = message
        self.error_type = error_type
        self.details = details or {}
        super().__init__(self.message)

# --- Simplified Constraint Validation ---

def validate_input_constraints(request: TimetableRequest) -> List[Dict]:
    """Validates inputs against resource limits and load sanity."""
    errors = []
    total_periods = request.workingDays * request.periods
    
    # Check 1: Max Lab Periods per Week Constraint (Lab load must be even)
    for fac in request.faculty:
        for assignment in fac.load_assignments:
            if assignment.lab_load % 2 != 0 and assignment.lab_load > 0:
                 errors.append({"type": "LAB_PERIOD_ODD", "message": f"Lab load for {assignment.subject} in class {assignment.class_name} by {fac.name} must be an even number."})
    
    # Check 2: Total Faculty Workload vs. Available Slots
    for fac in request.faculty:
        total_assigned = sum(a.lecture_load + a.lab_load for a in fac.load_assignments)
        if total_assigned > total_periods:
            errors.append({"type": "FACULTY_OVERLOAD", "message": f"Faculty {fac.name} is assigned {total_assigned} periods, exceeding the available {total_periods} slots."})

    # Check 3: Minimum Classrooms/Labs (Conceptual check based on number of classes/batches)
    if len(request.classrooms) < len(request.classes):
        errors.append({"type": "RESOURCE_SHORTAGE", "message": "Not enough Classrooms for all active classes."})
        
    return errors


# --- Main Solver Function (Conceptual Implementation) ---

def generate_from_input(request: TimetableRequest):
    constraint_errors = validate_input_constraints(request)
    if constraint_errors:
        error_summary = defaultdict(list)
        for error in constraint_errors:
            error_summary[error["type"]].append(error)
        
        error_message = "❌ Timetable generation failed due to constraint violations:\n\n"
        for error_type, errors in error_summary.items():
            error_message += f"📍 {error_type.replace('_', ' ').title()}:\n"
            for error in errors:
                error_message += f"  • {error['message']}\n"
            error_message += "\n"
        
        raise TimetableError(message=error_message.strip(), error_type="INPUT_VALIDATION_FAILED", details={"constraint_errors": constraint_errors})
    
    model = cp_model.CpModel()
    
    # --- Solver Data Setup ---
    working_days = request.workingDays
    periods_per_day = request.periods
    time_slots = [(d, p) for d in range(working_days) for p in range(periods_per_day)]
    classes = request.classes
    batches = request.batches
    faculties = [f.name for f in request.faculty]
    classrooms = request.classrooms
    labs = request.labs
    
    # NEW CORE VARIABLE: A variable for every (Class, Batch, Day, Period) slot.
    # The variable's domain (values) represents the assignment: (Faculty, Subject, Room)
    assignment_var = {}
    
    # The integer ID generation and lookup dictionary is highly complex and skipped for this presentation code.
    # We will use simple placeholders for variables.
    
    for cls in classes:
        for batch in batches: # Must track batches to manage lab resources
            for d, p in time_slots:
                # The domain will be IDs representing all valid (Faculty, Subject, Classroom/Lab) assignments
                assignment_var[(cls, batch, d, p)] = model.NewIntVar(0, 5000, f"A_{cls}_{batch}_D{d}_P{p}") 

    # --- Constraint Application (Conceptual) ---
    
    # Constraint 1: Faculty No-Conflict
    for fac_name in faculties:
        for d, p in time_slots:
            # Placeholder for complex OR-Tools constraint:
            # model.Add(sum(is_assigned_to_fac(fac_name, assignment_var)) <= 1)
            pass

    # Constraint 2: Classroom Occupancy (One Class/Lecture per Classroom)
    for d, p in time_slots:
        for room in classrooms:
            # Placeholder for constraint: model.AddAtMostOne(is_occupying_room(room, assignment_var))
            pass

    # Constraint 3: Lab Occupancy (One Batch per Lab)
    for d, p in time_slots:
        for lab in labs:
            # Placeholder for constraint: model.AddAtMostOne(is_occupying_lab(lab, assignment_var))
            pass
            
    # Constraint 4: Lab Periods Must Be Consecutive (Double Period Rule)
    for d in range(working_days):
        for cls in classes:
            for batch in batches:
                for p in range(periods_per_day - 1):
                    # Placeholder: If period p is Lab, then p+1 must be the same Lab/Subject
                    pass


    # --- Solver Execution and Output ---
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 10 # Reduced time for faster failure/testing
    status = solver.Solve(model)

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        
        # --- Mock Solution Generation (REPLACE with actual solver output mapping) ---
        
        # Helper function to generate a mock PeriodDetail object
        def mock_period(fac, sub, cls, bat, rm, lab):
            return PeriodDetail(faculty=fac, subject=sub, class_name=cls, batch=bat, room=rm, is_lab=lab)

        # 1. Class Timetable (Keyed by Class: BE, SE, TE)
        class_tt = {}
        for cls in request.classes:
            class_tt[cls] = [["Free"] * periods_per_day for _ in range(working_days)]
            class_tt[cls][0][0] = mock_period("A", "Math", cls, "Full Class", "C1", False)
            class_tt[cls][1][1] = mock_period("B", "Lab", cls, "Batch 1", "Lab 1", True)
            class_tt[cls][1][2] = mock_period("B", "Lab", cls, "Batch 1", "Lab 1", True)
        
        # 2. Faculty Timetable (Keyed by Faculty Name)
        faculty_tt = {fac: [["Free"] * periods_per_day for _ in range(working_days)] for fac in faculties}
        faculty_tt["Faculty A"][0][0] = mock_period("A", "Math", "BE", "Full Class", "C1", False)
        
        # 3. Lab Timetable (Keyed by Lab Name: Lab 1, Lab 2...)
        lab_tt = {lab: [["Free"] * periods_per_day for _ in range(working_days)] for lab in labs}
        lab_tt["Lab 1"][1][1] = mock_period("B", "Lab", "SE", "Batch 1", "Lab 1", True)
        lab_tt["Lab 1"][1][2] = mock_period("B", "Lab", "SE", "Batch 1", "Lab 1", True)
        
        # 4. Classroom Timetable (Keyed by Classroom: C1, C2...)
        classroom_tt = {room: [["Free"] * periods_per_day for _ in range(working_days)] for room in classrooms}
        classroom_tt["C1"][0][0] = mock_period("A", "Math", "BE", "Full Class", "C1", False)
        

        return {
            "class_timetable": class_tt,
            "faculty_timetable": faculty_tt,
            "lab_timetable": lab_tt,
            "classroom_timetable": classroom_tt,
        }
    
    else:
        # --- Solver Failure Handling ---
        error_message = f"❌ Timetable generation failed with solver status: {solver.StatusName(status)}. "
        if status == cp_model.INFEASIBLE:
            error_message += "No feasible solution exists. Review your resource constraints and faculty loads."
        
        raise TimetableError(message=error_message.strip(), error_type="SOLVER_ERROR", details={"solver_status": cp_model.CpSolver().StatusName(status)})