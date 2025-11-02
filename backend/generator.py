# backend/generator.py (FINAL WORKING CONTENT - Fixes Unhashable Error)
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

class InternalTeacherModel:
    """Internal model mimicking the original teacher structure, adapted for new Faculty input."""
    def __init__(self, name, load_assignments):
        self.name = name
        self.subjects_by_class = defaultdict(lambda: defaultdict(int))
        self.lab_subjects = set()
        
        for assignment in load_assignments:
            # Note: assignment is a Pydantic object, access attributes directly
            # Lectures
            if assignment.lecture_load > 0:
                self.subjects_by_class[assignment.class_name][assignment.subject] += assignment.lecture_load
            # Labs (must be even, handled by validation)
            if assignment.lab_load > 0:
                self.subjects_by_class[assignment.class_name][assignment.subject] += assignment.lab_load
                self.lab_subjects.add(assignment.subject)
    
def validate_input_constraints(teacher_list: dict, classes: List[str], working_days: int, periods_per_day: int) -> List[Dict]:
    """Validate input constraints (Re-used original core validation)."""
    errors = []
    total_periods_per_class = working_days * periods_per_day
    
    # Check 1: Total periods per class constraint
    for cls in classes:
        total_required = 0
        for teacher in teacher_list.values():
            if cls in teacher.subjects_by_class:
                total_required += sum(teacher.subjects_by_class[cls].values())
        
        if total_required > total_periods_per_class:
            errors.append({
                "type": "PERIODS_OVERFLOW",
                "message": f"Class {cls} requires {total_required} periods but only {total_periods_per_class} periods are available.",
                "class": cls,
            })
    
    # Check 2: Daily subject limit (max 2 periods per subject per day)
    for cls in classes:
        for teacher_name, teacher in teacher_list.items():
            if cls in teacher.subjects_by_class:
                for subject, total_periods in teacher.subjects_by_class[cls].items():
                    max_possible_periods = working_days * 2
                    
                    if total_periods > max_possible_periods:
                        errors.append({
                            "type": "DAILY_SUBJECT_LIMIT",
                            "message": f"Subject '{subject}' for class {cls} requires {total_periods} periods, exceeding max possible {max_possible_periods}.",
                            "teacher": teacher_name,
                            "class": cls,
                        })
    
    # Check 3: Teacher availability (max 1 class per period)
    for teacher_name, teacher in teacher_list.items():
        total_teacher_periods = sum(sum(subjects.values()) for subjects in teacher.subjects_by_class.values())
        max_teacher_periods = working_days * periods_per_day
        
        if total_teacher_periods > max_teacher_periods:
            errors.append({
                "type": "FACULTY_OVERLOAD",
                "message": f"Faculty {teacher_name} is assigned {total_teacher_periods} periods, exceeding max possible {max_teacher_periods}.",
                "teacher": teacher_name,
            })
    
    # Check 4: Lab subject constraints (must be even number of periods)
    for teacher_name, teacher in teacher_list.items():
        for subject in teacher.lab_subjects:
            for cls, subjects in teacher.subjects_by_class.items():
                if subject in subjects:
                    periods = subjects[subject]
                    if periods % 2 != 0:
                        errors.append({
                            "type": "LAB_PERIOD_ODD",
                            "message": f"Lab subject '{subject}' for class {cls} has {periods} periods, which must be even for double blocks.",
                        })
    
    return errors

def generate_from_input(request: TimetableRequest):
    
    # FIX APPLIED HERE: Use f.name (string) as the key, not the InputFaculty object (f).
    teacher_list = {f.name: InternalTeacherModel(f.name, f.load_assignments) for f in request.faculty}
    
    classes = request.classes
    working_days = request.workingDays
    periods_per_day = request.periods
    
    # Run validation checks
    constraint_errors = validate_input_constraints(teacher_list, classes, working_days, periods_per_day)
    
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
        
        raise TimetableError(
            message=error_message.strip(),
            error_type="INPUT_VALIDATION_FAILED",
            details={"constraint_errors": constraint_errors}
        )
    
    # --- OR-Tools Solver Implementation (Fully Implemented Logic) ---
    model = cp_model.CpModel()
    
    # Generate unique integer IDs for every possible (Faculty, Subject, Class) triplet
    pair_to_id = {}
    id_to_pair = {}
    current_id = 1

    for teacher in teacher_list.values():
        for cls, subjects in teacher.subjects_by_class.items():
            for subject in subjects:
                pair = (teacher.name, subject, cls)
                if pair not in pair_to_id:
                    pair_to_id[pair] = current_id
                    id_to_pair[current_id] = pair
                    current_id += 1

    # Timetable variables: The core variables to be solved
    timetable_vars = {
        cls: [[model.NewIntVar(0, current_id, f"{cls}_d{d}_p{p}")
              for p in range(periods_per_day)] for d in range(working_days)]
        for cls in classes
    }

    # Constraint 1: Faculty Conflict (A faculty member is only in one slot)
    for teacher in teacher_list.values():
        for d in range(working_days):
            for p in range(periods_per_day):
                teacher_pairs = [(pid, cls) for pid, (tname, _, cls) in id_to_pair.items() if tname == teacher.name]
                class_assignments = []
                for pid, cls in teacher_pairs:
                    is_assigned = model.NewBoolVar(f"{teacher.name}_{cls}_d{d}_p{p}_{pid}")
                    model.Add(timetable_vars[cls][d][p] == pid).OnlyEnforceIf(is_assigned)
                    model.Add(timetable_vars[cls][d][p] != pid).OnlyEnforceIf(is_assigned.Not())
                    class_assignments.append(is_assigned)
                if class_assignments:
                    model.Add(sum(class_assignments) <= 1)

    # Constraint 2: Subject Count Matching (Total periods must equal load)
    for pid, (tname, subject, cls) in id_to_pair.items():
        count = teacher_list[tname].subjects_by_class[cls][subject]
        occurrences = []
        for d in range(working_days):
            for p in range(periods_per_day):
                var = timetable_vars[cls][d][p]
                b = model.NewBoolVar(f"occ_{cls}_{d}_{p}_{pid}")
                model.Add(var == pid).OnlyEnforceIf(b)
                model.Add(var != pid).OnlyEnforceIf(b.Not())
                occurrences.append(b)
        model.Add(sum(occurrences) == count)

    # Constraint 3: Daily Subject Limit (max 2 periods per subject per day)
    for cls in classes:
        for d in range(working_days):
            all_subjects = {
                subject
                for teacher in teacher_list.values()
                for subcls, subs in teacher.subjects_by_class.items()
                if subcls == cls for subject in subs
            }
            for subject in all_subjects:
                subject_ids = [pid for pid, (_, subj, c) in id_to_pair.items() if subj == subject and c == cls]
                count_vars = []
                for p in range(periods_per_day):
                    var = timetable_vars[cls][d][p]
                    for pid in subject_ids:
                        b = model.NewBoolVar(f"{cls}_{d}_{p}_{subject}_{pid}")
                        model.Add(var == pid).OnlyEnforceIf(b)
                        model.Add(var != pid).OnlyEnforceIf(b.Not())
                        count_vars.append(b)
                model.Add(sum(count_vars) <= 2)

    # Constraint 4: Lab Subject Consecutive Scheduling (Double Period Rule)
    for pid, (tname, subject, cls) in id_to_pair.items():
        if subject in teacher_list[tname].lab_subjects:
            total = teacher_list[tname].subjects_by_class[cls][subject]
            # Assumed valid lab loads are always even (checked in validation)
            if total % 2 != 0: continue
            
            num_blocks = total // 2
            block_vars = []
            for d in range(working_days):
                for p in range(periods_per_day - 1):
                    first = timetable_vars[cls][d][p]
                    second = timetable_vars[cls][d][p + 1]
                    is_block = model.NewBoolVar(f"lab_block_{cls}_{d}_{p}_{pid}")
                    model.Add(first == pid).OnlyEnforceIf(is_block)
                    model.Add(second == pid).OnlyEnforceIf(is_block)
                    block_vars.append(is_block)
            model.Add(sum(block_vars) == num_blocks)

    # Solve the model
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 60
    status = solver.Solve(model)

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        
        # --- Solution Mapping (Adapted for new PeriodDetail object) ---
        
        # Mock resource assignment for display purposes (Real solver would assign resources here)
        room_map = {cls: request.classrooms[i % len(request.classrooms)] for i, cls in enumerate(request.classes)}
        
        # The new requirements mandate a complex PeriodDetail object as output
        def map_period(pid, d, p):
            if pid in id_to_pair:
                tname, subject, cls = id_to_pair[pid]
                is_lab_sub = subject in teacher_list[tname].lab_subjects
                
                # Simplified Batch/Room Assignment for demonstration:
                batch = "Full Class" 
                room = room_map[cls] # Default to Class's assigned classroom
                
                if is_lab_sub:
                     # For lab, alternate batches and assign a lab room
                     batch = request.batches[d % len(request.batches)]
                     room = request.labs[d % len(request.labs)] 

                return {
                    "faculty": tname, 
                    "subject": subject, 
                    "class_name": cls, 
                    "batch": batch,
                    "room": room, 
                    "is_lab": is_lab_sub
                }
            return "Free"

        # 1. Generate Class Timetable
        class_tt = {}
        for cls in classes:
            class_tt[cls] = []
            for d in range(working_days):
                row = []
                for p in range(periods_per_day):
                    val = solver.Value(timetable_vars[cls][d][p])
                    row.append(map_period(val, d, p))
                class_tt[cls].append(row)

        # 2. Generate Faculty, Lab, and Classroom Timetables
        faculties = [f.name for f in request.faculty]
        
        faculty_tt = {fac: [["Free"] * periods_per_day for _ in range(working_days)] for fac in faculties}
        lab_tt = {lab: [["Free"] * periods_per_day for _ in range(working_days)] for lab in request.labs}
        classroom_tt = {room: [["Free"] * periods_per_day for _ in range(working_days)] for room in request.classrooms}

        for cls in classes:
            for d in range(working_days):
                for p in range(periods_per_day):
                    period = class_tt[cls][d][p]
                    if period != "Free":
                        # Faculty TT update
                        faculty_tt[period["faculty"]][d][p] = period
                        
                        # Lab TT update (only for lab periods)
                        if period["is_lab"] and period["room"] in lab_tt:
                             lab_tt[period["room"]][d][p] = period
                        
                        # Classroom TT update (only for lecture/classroom periods)
                        if not period["is_lab"] and period["room"] in classroom_tt:
                            classroom_tt[period["room"]][d][p] = period


        return {
            "class_timetable": class_tt,
            "faculty_timetable": faculty_tt, 
            "lab_timetable": lab_tt,
            "classroom_timetable": classroom_tt,
        }
    
    elif status == cp_model.INFEASIBLE:
        raise TimetableError(
            message="❌ No feasible timetable solution exists with the given constraints. Try reducing loads or increasing resources.",
            error_type="INFEASIBLE_SOLUTION"
        )
    else:
        raise TimetableError(
            message=f"❌ Timetable generation failed with solver status: {cp_model.CpSolver().StatusName(status)}. Try adjusting constraints.",
            error_type="SOLVER_ERROR",
            details={"solver_status": cp_model.CpSolver().StatusName(status)}
        )