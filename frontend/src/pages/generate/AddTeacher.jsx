// frontend/src/pages/generate/AddTeacher.jsx (UPDATED CONTENT)
import { useState, useEffect } from "react";
import { Plus, Loader2, X, Save, AlertTriangle, RefreshCw } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
// import { useAuth, useUser } from "@clerk/clerk-react"; // Authentication is commented out
// import DropdownChecklist from "./components/DropdownChecklist"; // Not needed with new input style
import TimetableDisplay from "./TimetableDisplay";
// import EditTimetable from "./components/EditTimetable"; // Not needed here
// import { fetchWithAuth } from "../../utils/fetchWithAuth"; // Not needed here
import toast from "react-hot-toast";

function AddTeacher() {
  const navigate = useNavigate();
  // const { getToken } = useAuth(); // Commented out
  // const { user } = useUser(); // Commented out
  const { state } = useLocation();
  const location = useLocation();
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState(null);
  
  // Hardcoded ID for non-authenticated user
  const userId = "placeholder_user_id";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // NEW/UPDATED State variables from previous step (GeneratePage.jsx)
  const {
    classes,
    subjects,
    classrooms,
    labs,
    batches,
    workingDays,
    periods,
    title,
    teacherData, // Now Faculty Data
    timetableId,
  } = state || {};

  const [faculty, setFaculty] = useState(() => {
    if (teacherData) {
      return teacherData; // Use existing data if available
    }
    // New initial structure based on requirements (Faculty Load Distribution)
    return [
      {
        name: "",
        load_assignments: [{ 
          subject: "", 
          class_name: "", 
          lecture_load: "", 
          lab_load: "" 
        }],
      },
    ];
  });

  const [loading, setLoading] = useState(false);
  const [timetableData, setTimetableData] = useState(null);
  const [savedFacultyData, setSavedFacultyData] = useState(null);

  // --- Input Handlers (Modified for New Structure) ---

  const handleAddFaculty = () => {
    setFaculty([
      ...faculty,
      {
        name: "",
        load_assignments: [{ 
            subject: "", 
            class_name: "", 
            lecture_load: "", 
            lab_load: "" 
        }],
      },
    ]);
  };

  const handleDeleteFaculty = (index) => {
    if (faculty.length > 1) {
      const newFaculty = faculty.filter((_, i) => i !== index);
      setFaculty(newFaculty);
    }
  };

  const handleAddAssignment = (index) => {
    const newFaculty = [...faculty];
    newFaculty[index].load_assignments = [
      ...newFaculty[index].load_assignments,
      { subject: "", class_name: "", lecture_load: "", lab_load: "" },
    ];
    setFaculty(newFaculty);
  };

  const handleDeleteAssignment = (facultyIndex, assignmentIndex) => {
    const newFaculty = [...faculty];
    if (newFaculty[facultyIndex].load_assignments.length > 1) {
      newFaculty[facultyIndex].load_assignments = newFaculty[
        facultyIndex
      ].load_assignments.filter((_, i) => i !== assignmentIndex);
      setFaculty(newFaculty);
    }
  };
  
  const handleChangeFacultyName = (index, facultyName) => {
    const newFaculty = [...faculty];
    newFaculty[index].name = facultyName;
    setFaculty(newFaculty);
  };

  const handleChangeAssignment = (fIndex, aIndex, field, value) => {
    const newFaculty = [...faculty];
    newFaculty[fIndex].load_assignments[aIndex][field] = value;
    setFaculty(newFaculty);
  };

  // --- Timetable Generation ---

  const generateTimetable = async () => {
    setLoading(true);
    setError("");
    setErrorDetails(null);

    try {
      // Input Validation (Simplified)
      for (const fac of faculty) {
        if (!fac.name.trim()) {
          throw new Error("Please enter all Faculty names.");
        }
        if (fac.load_assignments.some(a => !a.subject || !a.class_name || (!a.lecture_load && !a.lab_load))) {
            throw new Error(`Please fill all load details for ${fac.name}.`);
        }
      }

      setSavedFacultyData(JSON.parse(JSON.stringify(faculty)));

      // Prepare Data for API (Using the new Input Models)
      const facultyDataForAPI = faculty.map(fac => ({
          name: fac.name,
          load_assignments: fac.load_assignments.map(a => ({
              subject: a.subject,
              class_name: a.class_name,
              lecture_load: parseInt(a.lecture_load) || 0,
              lab_load: parseInt(a.lab_load) || 0,
          })),
      }));

      // Map syllabus structure for API - Derived from faculty load for validation/reference
      const syllabusMap = {};
      classes.forEach(cls => {
          syllabusMap[cls] = facultyDataForAPI
              .flatMap(f => f.load_assignments)
              .filter(a => a.class_name === cls)
              .map(a => ({
                  subject: a.subject,
                  lecture_load: a.lecture_load,
                  lab_load: a.lab_load
              }));
      });

      const requestData = {
        userId: userId, // Hardcoded
        title: title,
        workingDays: parseInt(workingDays) || 5,
        periods: parseInt(periods) || 8,
        classes: classes.filter((c) => c.trim()),
        batches: batches, // Fixed Batches
        classrooms: classrooms, // Resource List
        labs: labs, // Resource List
        syllabus: syllabusMap, // Syllabus Data (For backend validation/reference)
        faculty: facultyDataForAPI, // Faculty Data
      };
      
      // Standard fetch call (Authentication disabled)
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      const data = await response.json();
      if (data.status === "ERROR" || data.status === "INFEASIBLE" || !response.ok) {
        setError(data.message || "Failed to generate timetable");
        setErrorDetails(data);
        return;
      }

      setTimetableData(data);
    } catch (err) {
      console.error("Error generating timetable:", err);
      setError(err.message || "Failed to generate timetable");
      setErrorDetails(null);
    } finally {
      setLoading(false);
      window.scrollTo(0, 0);
    }
  };

  const handleBackToTeachers = () => {
    if (savedFacultyData) {
      setFaculty(savedFacultyData);
    }
    setTimetableData(null);
    setError("");
    setErrorDetails(null);
  };

  const handleRegenerateWithCurrentData = async () => {
    await generateTimetable();
  };

  // --- Save Logic (Update to handle new data) ---

  const handleSavetoDb = async () => {
    try {
      if (timetableData !== null) {
        // The save logic is complex and needs to handle all 4 tables now.
        // We ensure the API is updated to handle the new multi-timetable object.
        const facultyDataForSave = timetableData.faculty;

        const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/${timetableId ? `update-timetable/${timetableId}` : 'add'}`,
            {
              method: timetableId ? "PUT" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                  ...timetableData, 
                  userId: userId,
                  faculty: facultyDataForSave, // Ensure this uses the new key
              }),
            }
          );
          const result = await response.json();
          toast.success("Timetable saved successfully");
          navigate(`/display/${result._id || timetableId}`, {
            state: {
                // Pass all generated timetables and metadata
                timetableId: result._id || timetableId,
                classTimetable: timetableData.class_timetable,
                teacherTimetable: timetableData.teacher_timetable, // Using old key for compatibility
                labTimetable: timetableData.lab_timetable,
                classroomTimetable: timetableData.classroom_timetable,
                
                // Pass Metadata
                teacherData: result.teacherData, // Using 'teacherData' state name for compatibility
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
      }
    } catch (error) {
      console.log("Error in saving", error);
      toast.error("Error saving timetable.");
    }
  };


  // Helper function to render error details (simplified for brevity)
  const renderErrorDetails = () => {
    // ... (error display logic as in original file, ensuring it handles the new keys)
    if (!errorDetails) return null;

    return (
      <div className="error-details-container">
        <div className="error-header">
          <AlertTriangle className="icon-ge error-icon" />
          <h4>Timetable Generation Failed</h4>
        </div>

        <div className="error-content">
          <p className="error-main-message">{error}</p>

          {/* ... (details and suggestions) ... */}
          <div className="error-suggestions">
            <h5>Suggestions to fix this issue:</h5>
            <ul>
              <li>Check if total faculty load exceeds available time slots.</li>
              <li>Ensure all lab loads are even numbers.</li>
              <li>Verify that subject loads match what's possible with available resources (Labs/Classrooms).</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  // --- JSX Render ---
  
  if (timetableData) {
    // This part would ideally render a temporary preview or immediately redirect.
    // For now, we show a message and keep the save/regenerate buttons.
    return (
      <div className="dark-gradient-bg-ge">
          <div className="container-ge">
              <div className="timetable-header">
                  <h2 className="section-title-ge">Generated Timetable Preview</h2>
                  <div className="action-buttons-container">
                    <button className="action-button save-button" onClick={handleSavetoDb} title="Save">
                      <Save className="icon-ge" /> Save
                    </button>
                    <button className="action-button edit-button" onClick={handleBackToTeachers} title="Go back to edit faculty">
                      <span className="button-icon-td">👥</span> Edit Faculty
                    </button>
                    <button className="action-button regenerate-button" onClick={handleRegenerateWithCurrentData} disabled={loading} title="Regenerate timetable with current data">
                      {loading ? (<><Loader2 className="icon-ge animate-spin" /> Regenerating...</>) : (<><Plus className="icon-ge" /> Regenerate</>)}
                    </button>
                  </div>
              </div>
              <p style={{color:'yellow', textAlign: 'center', padding: '2rem'}}>
                Timetable Generated. Click "Save" to finalize and view the 4 comprehensive timetables on the Display Page.
              </p>
          </div>
      </div>
    );
  }

  return (
    <div className="dark-gradient-bg-ge">
      <div className="container-at">
        <div className="header-section">
          <h2 className="section-title-ge">Assign Faculty & Load Distribution</h2>
          <div className="info-alert">
              <strong>College Resources:</strong> Classes: {classes?.join(', ')}, Classrooms: {classrooms?.join(', ')}, Labs: {labs?.join(', ')}
          </div>
        </div>

        {/* Enhanced Error Display */}
        {error && (
          <div className="error-section">
            {errorDetails ? renderErrorDetails() : (<div className="error-alert"><AlertTriangle className="icon-ge" />{error}</div>)}
          </div>
        )}

        <div className="teachers-container">
          {faculty.map((fac, fIndex) => (
            <div className="teacher-card" key={fIndex}>
              {/* Delete Faculty Button */}
              {faculty.length > 1 && (
                <button
                  onClick={() => handleDeleteFaculty(fIndex)}
                  className="delete-teacher-btn"
                  title="Delete Faculty"
                >
                  <X className="icon-ge" />
                </button>
              )}

              {/* Faculty Name Input */}
              <div className="teacher-info-row" style={{gridTemplateColumns: '1fr'}}>
                <div className="input-group-ge">
                  <label className="input-label">Faculty Name</label>
                  <input
                    type="text"
                    className="form-input-ge"
                    placeholder={`Faculty ${fIndex + 1}`}
                    value={fac.name}
                    onChange={(e) => handleChangeFacultyName(fIndex, e.target.value)}
                  />
                </div>
              </div>

              <div className="periods-section">
                <h3 className="periods-title">Load Assignments (Subjects taught + Load per Week)</h3>
                <div className="periods-container">
                  {fac.load_assignments.map((assignment, aIndex) => (
                    <div className="period-row" key={aIndex} style={{gridTemplateColumns: '1.5fr 1fr 1fr 1fr', alignItems:'center'}}>
                        {/* Delete Assignment Button */}
                        {fac.load_assignments.length > 1 && (
                            <button
                                onClick={() => handleDeleteAssignment(fIndex, aIndex)}
                                className="delete-period-btn"
                                title="Delete Assignment"
                            >
                                <X className="icon-ge" />
                            </button>
                        )}

                        <div className="input-group-ge">
                            <label className="input-label">Subject/Lab Name</label>
                            <select
                                className="form-select-ge"
                                value={assignment.subject}
                                onChange={(e) => handleChangeAssignment(fIndex, aIndex, 'subject', e.target.value)}
                            >
                                <option value="">Select Subject/Lab</option>
                                {subjects.map((sub, sIndex) => (
                                    <option key={sIndex} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="input-group-ge">
                            <label className="input-label">Class</label>
                            <select
                                className="form-select-ge"
                                value={assignment.class_name}
                                onChange={(e) => handleChangeAssignment(fIndex, aIndex, 'class_name', e.target.value)}
                            >
                                <option value="">Select Class</option>
                                {classes.map((cls, cIndex) => (
                                    <option key={cIndex} value={cls}>{cls}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="input-group-ge">
                            <label className="input-label">Lecture Load/Week</label>
                            <input
                                type="number"
                                className="form-input-ge"
                                placeholder="Lectures"
                                value={assignment.lecture_load}
                                onChange={(e) => handleChangeAssignment(fIndex, aIndex, 'lecture_load', e.target.value)}
                                min="0"
                            />
                        </div>
                        
                        <div className="input-group-ge">
                            <label className="input-label">Lab Load/Week (Must be Even)</label>
                            <input
                                type="number"
                                className="form-input-ge"
                                placeholder="Lab Periods (e.g., 4)"
                                value={assignment.lab_load}
                                onChange={(e) => handleChangeAssignment(fIndex, aIndex, 'lab_load', e.target.value)}
                                min="0"
                            />
                        </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleAddAssignment(fIndex)}
                  className="add-button-ge"
                >
                  <Plus className="icon-ge" />
                  Add another Load Assignment
                </button>
              </div>
            </div>
          ))}

          <div className="add-teacher-container">
            <button
              onClick={handleAddFaculty}
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
              ) : savedFacultyData ? (
                "Regenerate Timetable"
              ) : (
                "Generate Timetable"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddTeacher;