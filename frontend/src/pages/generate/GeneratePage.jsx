// frontend/src/pages/generate/GeneratePage.jsx (UPDATED CONTENT)
import { ArrowBigRight, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GeneratePage.css";
import toast from "react-hot-toast";

function GeneratePage() {
  const [workingDays, setWorkingDays] = useState(5); // Default to 5
  const [periods, setPeriods] = useState(8); // Default to 8
  const [title, setTitle] = useState("");
  const [subjects, setSubjects] = useState([""]); // Subjects from Syllabus
  const [classes, setClasses] = useState(["BE", "SE", "TE"]); // Default Classes
  const [classrooms, setClassrooms] = useState(["C1", "C2", "C3"]); // NEW
  const [labs, setLabs] = useState(["Lab 1", "Lab 2"]); // NEW

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- Utility Functions ---

  const handleAddSubject = () => setSubjects([...subjects, ""]);
  const handleChangeSubject = (index, value) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };
  
  const handleAddClasses = () => setClasses([...classes, ""]);
  const handleChangeClasses = (index, value) => {
    const newClasses = [...classes];
    newClasses[index] = value;
    setClasses(newClasses);
  };
  
  const handleAddClassroom = () => setClassrooms([...classrooms, ""]); // NEW
  const handleChangeClassroom = (index, value) => { // NEW
    const newClassrooms = [...classrooms];
    newClassrooms[index] = value;
    setClassrooms(newClassrooms);
  };
  
  const handleAddLab = () => setLabs([...labs, ""]); // NEW
  const handleChangeLab = (index, value) => { // NEW
    const newLabs = [...labs];
    newLabs[index] = value;
    setLabs(newLabs);
  };

  // --- Navigation and Validation ---

  const handleNext = () => {
    const wDays = parseInt(workingDays);
    const nPeriods = parseInt(periods);

    if (isNaN(wDays) || isNaN(nPeriods) || wDays <= 0 || nPeriods <= 0) {
      toast.error("Please enter valid working days and periods per day");
      return;
    }
    if (wDays > 6) {
      toast.error("Number of working days cannot exceed 6");
      window.scrollTo(0, 0);
      return;
    }
    
    const validClasses = classes.filter(c => c.trim() !== "");
    const validSubjects = subjects.filter(s => s.trim() !== "");
    const validClassrooms = classrooms.filter(c => c.trim() !== ""); // NEW
    const validLabs = labs.filter(l => l.trim() !== ""); // NEW
    
    if (validClasses.length === 0 || validSubjects.length === 0 || validClassrooms.length === 0 || validLabs.length === 0) {
      toast.error("Please add at least one class, subject, classroom, and lab.");
      return;
    }
    if (validLabs.length > 4) {
        toast.error("Number of Labs cannot exceed 4.");
        return;
    }
    if (validClassrooms.length < 3) {
        // Assuming 3 classrooms C1, C2, C3 are mandatory for BE, SE, TE
        toast.error("It is recommended to have at least 3 classrooms (C1, C2, C3).");
    }


    navigate("/generate/add-teachers", {
      state: { 
        classes: validClasses, 
        subjects: validSubjects,
        classrooms: validClassrooms, // NEW: Resource List
        labs: validLabs, // NEW: Resource List
        workingDays: wDays,
        periods: nPeriods,
        title,
        teacherData:null,
        timetableId:null,
        batches: ["Batch 1", "Batch 2"] // NEW: Fixed Batches
      },
    });
  };

  // --- JSX Render ---

  return (
    <div className="dark-gradient-bg-ge">
      <div className="container-ge">
        
        {/* General Settings */}
        <div className="input-section-ge">
          <h3 className="section-title-ge">Timetable Title & Scope</h3>
          <input
            type="text"
            className="form-input-ge"
            placeholder="Enter timetable title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="input-section-ge" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
          <div>
            <h3 className="section-title-ge">No of working days</h3>
            <input
              type="number"
              className="form-input-ge"
              placeholder="e.g., 5"
              value={workingDays}
              onChange={(e) => setWorkingDays(e.target.value)}
              min="1" max="6"
            />
          </div>
          <div>
            <h3 className="section-title-ge">No of periods per day</h3>
            <input
              type="number"
              className="form-input-ge"
              placeholder="e.g., 8"
              value={periods}
              onChange={(e) => setPeriods(e.target.value)}
              min="1"
            />
          </div>
        </div>

        {/* Classes (BE, SE, TE) */}
        <div className="section-ge">
          <h3 className="section-title-ge">Define Classes (e.g., BE, SE, TE)</h3>
          <div className="input-group-ge">
            {classes.map((clas, index) => (
              <input
                key={index}
                type="text"
                className="form-input-ge input-item-ge"
                placeholder={`Class ${index + 1}`}
                value={clas}
                onChange={(e) => handleChangeClasses(index, e.target.value)}
              />
            ))}
            <button
              onClick={handleAddClasses}
              className="add-button-ge"
            >
              <Plus className="icon-ge" />
              <span>Add one more Class</span>
            </button>
          </div>
        </div>
        
        {/* Classrooms (C1, C2, C3) - NEW */}
        <div className="section-ge">
          <h3 className="section-title-ge">Define Classrooms (e.g., C1, C2, C3)</h3>
          <div className="input-group-ge">
            {classrooms.map((room, index) => (
              <input
                key={index}
                type="text"
                className="form-input-ge input-item-ge"
                placeholder={`Classroom ${index + 1}`}
                value={room}
                onChange={(e) => handleChangeClassroom(index, e.target.value)}
              />
            ))}
            <button
              onClick={handleAddClassroom}
              className="add-button-ge"
            >
              <Plus className="icon-ge" />
              <span>Add one more Classroom</span>
            </button>
          </div>
        </div>

        {/* Labs (Lab 1 - Lab 4) - NEW */}
        <div className="section-ge">
          <h3 className="section-title-ge">Define Labs (Max 4)</h3>
          <div className="input-group-ge">
            {labs.map((lab, index) => (
              <input
                key={index}
                type="text"
                className="form-input-ge input-item-ge"
                placeholder={`Lab ${index + 1}`}
                value={lab}
                onChange={(e) => handleChangeLab(index, e.target.value)}
                disabled={index >= 4} // Max 4 Labs
              />
            ))}
            <button
              onClick={handleAddLab}
              className="add-button-ge"
              disabled={labs.length >= 4} // Max 4 Labs
            >
              <Plus className="icon-ge" />
              <span>Add one more Lab</span>
            </button>
          </div>
        </div>

        {/* Subjects (from syllabus) */}
        <div className="section-ge">
          <h3 className="section-title-ge">Define Subjects (from syllabus)</h3>
          <div className="input-group-ge">
            {subjects.map((subject, index) => (
              <input
                key={index}
                type="text"
                className="form-input-ge input-item-ge"
                placeholder={`Subject ${index + 1}`}
                value={subject}
                onChange={(e) => handleChangeSubject(index, e.target.value)}
              />
            ))}
            <button
              onClick={handleAddSubject}
              className="add-button-ge"
            >
              <Plus className="icon-ge" />
              <span>Add one more Subject</span>
            </button>
          </div>
        </div>
        

        <div className="next-button-container-ge">
          <button
            className="next-button-ge"
            onClick={handleNext}
          >
            <span>Assign Faculty & Load</span>
            <ArrowBigRight className="arrow-icon-ge" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default GeneratePage;