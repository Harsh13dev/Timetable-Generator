// frontend/src/pages/generate/AddTeacher.jsx (FINAL CRASH-PROOF VERSION)
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { CircleX, Loader2, Plus, X, AlertTriangle } from "lucide-react"; 
import "./AddTeacher.css";

// NOTE: All external CSS imports were removed to resolve the crash.

const AddTeacher = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hardcoded User ID
  const userId = "placeholder_user_id";

  // State from previous steps (Ensure safe defaults)
  const [title] = useState(location.state?.title || "Untitled Timetable");
  const [classes] = useState(location.state?.classes || []);
  const [subjects] = useState(location.state?.subjects || []);
  const [batches] = useState(location.state?.batches || ["Batch 1", "Batch 2"]); 
  const [classrooms] = useState(location.state?.classrooms || []);
  const [labs] = useState(location.state?.labs || []);
  const [workingDays] = useState(location.state?.workingDays || 5);
  const [periods] = useState(location.state?.periods || 8);
  const [timetableId] = useState(location.state?.timetableId || null);

  // Reverted data structure: 'teachers' and 'periods'
  const initialFacultyState = location.state?.teacherData || [
      { name: "", periods: [{ class_name: "", subject: "", noOfPeriods: "" }] },
  ];
  
  const [teachers, setTeachers] = useState(initialFacultyState);

  // UI States
  const [generatedTimetableResult, setGeneratedTimetableResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState(null);

  // Helper to get unique subjects for dropdowns
  const getAllSubjects = () => {
    return subjects.filter(sub => sub.trim() !== "");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  // --- Input Handlers (Standard functions) ---

  const handleAddTeacher = () => {
    setTeachers([
      ...teachers,
      { name: "", periods: [{ class_name: "", subject: "", noOfPeriods: "" }] },
    ]);
  };

  const handleDeleteTeacher = (index) => {
    const updatedTeachers = [...teachers];
    updatedTeachers.splice(index, 1);
    setTeachers(updatedTeachers);
  };
  
  const handleAddPeriod = (index) => {
    const newTeachers = [...teachers];
    newTeachers[index].periods = [
      ...newTeachers[index].periods,
      { class_name: "", subject: "", noOfPeriods: "" },
    ];
    setTeachers(newTeachers);
  };

  const handleDeletePeriod = (teacherIndex, periodIndex) => {
    const newTeachers = [...teachers];
    if (newTeachers[teacherIndex].periods.length > 1) {
      newTeachers[teacherIndex].periods.splice(periodIndex, 1);
      setTeachers(newTeachers);
    }
  };

  const handleChangePeriod = (index, ind, field, value) => {
    const newTeachers = [...teachers];
    const processedValue = (field === 'noOfPeriods') ? parseInt(value) || 0 : value;
    newTeachers[index].periods[ind][field] = processedValue;
    setTeachers(newTeachers);
  };

  const handleChangeTeacherName = (index, teacherName) => {
    const newTeachers = [...teachers];
    newTeachers[index].name = teacherName;
    setTeachers(newTeachers);
  };

  // --- Data Conversion & Generation (CRITICAL MAPPING) ---
  const generateTimetable = async () => {
    setLoading(true);
    setError("");
    setErrorDetails(null);
    setGeneratedTimetableResult(null); 

    try {
      // Validation
      if (!title.trim()) throw new Error("Please provide a title for the timetable.");
      if (classes.length === 0) throw new Error("Please specify at least one class.");
      for (const t of teachers) {
          if (!t.name.trim()) throw new Error("Please enter all Faculty names.");
          if (t.periods.some(p => !p.class_name || !p.subject || !p.noOfPeriods)) {
              throw new Error(`Please fill all period assignments for ${t.name}`);
          }
      }
      
      // --- MAPPING FROM SIMPLE UI TO COMPLEX LOAD STRUCTURE ---
      const facultyDataForAPI = teachers.map(t => {
        const loadMap = {}; 

        t.periods.forEach(p => {
          const key = `${p.class_name}-${p.subject}`;
          const totalLoad = parseInt(p.noOfPeriods) || 0;
          
          if (!loadMap[key]) {
              loadMap[key] = { lecture_load: 0, lab_load: 0 };
          }
          
          const isLabSubject = p.subject.toLowerCase().includes('lab');

          if (isLabSubject) {
              if (totalLoad % 2 !== 0 && totalLoad > 0) {
                   throw new Error(`Lab subject '${p.subject}' load for ${t.name} is ${totalLoad}. Must be an EVEN number for double blocks.`);
              }
              loadMap[key].lab_load += totalLoad;
          } else {
              loadMap[key].lecture_load += totalLoad;
          }
        });

        const load_assignments = Object.keys(loadMap).map(key => {
          const [class_name, subject] = key.split('-');
          return {
            subject: subject,
            class_name: class_name,
            lecture_load: loadMap[key].lecture_load,
            lab_load: loadMap[key].lab_load,
          };
        });

        return { name: t.name, load_assignments: load_assignments };
      });


      const requestData = {
        userId: userId,
        title: title,
        workingDays: parseInt(workingDays),
        periods: parseInt(periods),
        classes: classes.filter(c => c.trim()),
        batches: batches,
        classrooms: classrooms.filter(c => c.trim()),
        labs: labs.filter(l => l.trim()),
        syllabus: {}, 
        faculty: facultyDataForAPI,
      };
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        }
      );

      const data = await response.json();

      if (data.status === "ERROR" || data.status === "INFEASIBLE" || !response.ok) {
        setError(data.message || "Failed to generate timetable");
        setErrorDetails(data);
        return;
      }

      toast.success("Timetable generated successfully!");
      setGeneratedTimetableResult(data); 

    } catch (err) {
      console.error("Error generating timetable:", err);
      setError(err.message || "Failed to generate timetable due to an unexpected error.");
      setErrorDetails(null);
    } finally {
      setLoading(false);
      window.scrollTo(0, 0);
    }
  };


  // --- Save to DB and Navigate ---
  const handleSavetoDb = async () => {
    if (!generatedTimetableResult) {
        toast.error("No timetable to save. Please generate one first.");
        return;
    }
    setLoading(true);

    try {
        const payload = {
            ...generatedTimetableResult, 
            userId: userId,
            title: title, 
            faculty: generatedTimetableResult.faculty, 
        };

        const endpoint = `${import.meta.env.VITE_API_BASE_URL}/${timetableId ? `update-timetable/${timetableId}` : 'add'}`;
        const method = timetableId ? "PUT" : "POST";
        
        const response = await fetch(endpoint, {
              method: method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || "Failed to save timetable to database.");
        }

        toast.success("Timetable saved successfully!");
        
        // Navigate to display page with all necessary state
        navigate(`/display/${result._id || timetableId}`, {
            state: {
                timetableId: result._id || timetableId,
                classTimetable: result.class_timetable,
                teacherTimetable: result.teacher_timetable,
                labTimetable: result.lab_timetable,
                classroomTimetable: result.classroom_timetable,
                
                teacherData: result.teacherData, 
                classes: result.classes,
                subjects: result.subjects, 
                workingDays: result.workingDays,
                periods: result.periods,
                title: result.title,
                classrooms: result.classrooms,
                labs: result.labs,
                batches: result.batches,
            },
        });

    } catch (err) {
      console.error("Error saving timetable:", err);
      toast.error(err.message || "Failed to save timetable. Please check network and server logs.");
    } finally {
      setLoading(false);
    }
  };

  
  const handleEditFaculty = () => {
    setGeneratedTimetableResult(null); 
  }

  const handleRegenerate = () => {
    setGeneratedTimetableResult(null); 
    generateTimetable(); 
  };


  // Helper to render error details (simplified)
  const renderErrorDetails = () => {
    if (!errorDetails && !error) return null;

    return (
      <div className="error-details-container">
        <div className="error-header">
          <CircleX className="icon-ge error-icon" />
          <h3>Timetable Generation Failed</h3>
        </div>
        
        <div className="error-content">
          <p className="error-main-message">
            {error || "An unknown error occurred during generation."}
          </p>
          
          {/* Note: If you want detailed error suggestions, you need to add the logic here */}
        </div>
      </div>
    );
  };


  // --- JSX Render (Reverted UI Structure) ---
  
  return (
    <div className="dark-gradient-bg-ge">
      <div className="container-at">
        <div className="header-section">
          <h2 className="section-title-ge">Assign Faculty & Period Requirements</h2>
          <div className="info-alert">
              Resource Details: Classes: {classes?.join(', ')}, Rooms: {classrooms?.join(', ')}, Labs: {labs?.join(', ')}
              <br/>NOTE: Lab subjects must have an EVEN total load (e.g., 2, 4, 6).
          </div>
        </div>

        {error && (
          <div className="error-section">
            {errorDetails ? renderErrorDetails() : (<div className="error-alert"><AlertTriangle className="icon-ge" />{error}</div>)}
          </div>
        )}

        {/* Conditional rendering: Show faculty input form OR generated timetable actions */}
        {!generatedTimetableResult ? (
          <div className="teachers-container">
            {teachers.map((teacher, index) => {
              return (
                <div className="teacher-card" key={index}>
                  
                  {/* Delete Teacher Button */}
                  {teachers.length > 1 && (
                    <button
                      onClick={() => handleDeleteTeacher(index)}
                      className="delete-teacher-btn"
                      title="Delete Teacher"
                    >
                      <X className="icon-ge" />
                    </button>
                  )}

                  <div className="teacher-info-row" style={{gridTemplateColumns: '1fr'}}>
                    <div className="input-group-ge">
                      <label className="input-label">Faculty Name</label>
                      <input
                        type="text"
                        className="form-input-ge"
                        placeholder={`Faculty ${index + 1}`}
                        value={teacher.name}
                        onChange={(e) =>
                          handleChangeTeacherName(index, e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="periods-section">
                    <h3 className="periods-title">Assign Periods (Total Periods/Week)</h3>
                    <div className="periods-container">
                      {teacher.periods.map((period, ind) => {
                        return (
                          <div className="period-row" key={ind}>
                            {/* Delete Period Button (Show only if multiple assignments exist) */}
                            {teacher.periods.length > 1 && (
                              <button
                                onClick={() => handleDeletePeriod(index, ind)}
                                className="delete-period-btn"
                                title="Delete Period"
                              >
                                <X className="icon-ge" />
                              </button>
                            )}

                            <div className="input-group-ge">
                              <label className="input-label">Class</label>
                              <select
                                className="form-select-ge"
                                value={period.class_name}
                                onChange={(e) => handleChangePeriod(index, ind, 'class_name', e.target.value)}
                              >
                                <option value="">Select Class</option>
                                {classes.map((cls, i) => (
                                  <option key={i} value={cls}>{cls}</option>
                                ))}
                              </select>
                            </div>

                            <div className="input-group-ge">
                              <label className="input-label">Subject</label>
                              <select
                                className="form-select-ge"
                                value={period.subject}
                                onChange={(e) => handleChangePeriod(index, ind, 'subject', e.target.value)}
                              >
                                <option value="">Select Subject</option>
                                {getAllSubjects().map((sub, sIndex) => (
                                  <option key={sIndex} value={sub}>{sub}</option>
                                ))}
                              </select>
                            </div>

                            <div className="input-group-ge">
                              <label className="input-label">Total Periods/Week (Lec/Lab)</label>
                              <input
                                type="number"
                                className="form-input-ge"
                                placeholder="Total periods"
                                value={period.noOfPeriods}
                                onChange={(e) => handleChangePeriod(index, ind, 'noOfPeriods', e.target.value)}
                                min="0"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handleAddPeriod(index)}
                      className="add-button-ge"
                      style={{maxWidth: '300px'}}
                    >
                      <Plus className="icon-ge" />
                      Add another subject assignment
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="add-teacher-container">
              <button
                onClick={handleAddTeacher}
                className="add-button-ge add-teacher-btn"
              >
                <Plus className="icon-ge" />
                Add another Faculty
              </button>
            </div>

            <div className="next-button-container-ge">
              <button
                className="next-button-ge"
                onClick={generateTimetable}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="arrow-icon-ge animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Timetable"
                )}
              </button>
            </div>
          </div>
        ) : (
             // --- Generated Timetable Actions ---
            <div className="generated-actions-section-ge">
                <h2 className="section-title-ge">Timetable Ready!</h2>
                <p style={{color:'yellow', textAlign: 'center', padding: '1rem', fontWeight: 500}}>
                    The timetable has been generated successfully. Click "Save" to finalize it and proceed to the display page.
                </p>
                <div className="action-buttons-container-ge">
                    <button
                        type="button"
                        onClick={handleSavetoDb}
                        className="action-button-ge save-button-ge"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="spinner-ge" /> : "💾"} Save & View
                    </button>
                    <button
                        type="button"
                        onClick={handleEditFaculty}
                        className="action-button-ge edit-button-ge"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="spinner-ge" /> : "✍️"} Re-Edit Inputs
                    </button>
                    <button
                        type="button"
                        onClick={handleRegenerate}
                        className="action-button-ge regenerate-button-ge"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="spinner-ge" /> : "🔄"} Regenerate
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AddTeacher;