// frontend/src/pages/generate/components/EditTimetable.jsx (UPDATED CONTENT - EDITING DISABLED)
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
// import { fetchWithAuth } from "../../../utils/fetchWithAuth"; // Authentication is commented out
// import { useAuth, useUser } from "@clerk/clerk-react"; // Authentication is commented out
import toast from "react-hot-toast";
import "./EditTimetable.css";

const EditTimetable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Destructure new state variables from location.state
  const { 
    classTimetable, 
    teacherTimetable, // Now Faculty Timetable
    labTimetable, // NEW
    classroomTimetable, // NEW
    id,
    classes,
    classrooms,
    labs,
    workingDays,
    periods: periodsPerDay,
    teacherData, // Faculty Data
    title
  } = location.state;
  
  // Hardcoded ID for non-authenticated user
  const userId = "placeholder_user_id";

  // State initialization (Using only Class Timetable for UI demonstration)
  const [selectedItem, setSelectedItem] = useState("");
  const [currentClassTimeTable, setCurrentClassTimeTable] =
    useState(classTimetable);
  
  // NOTE: Swapping logic is disabled/removed.
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [showPositiveMessage, setShowPositiveMessage] = useState(false);
  const [showNegativeMessage, setShowNegativeMessage] = useState(false);


  useEffect(() => {
    if (classTimetable) {
      setCurrentClassTimeTable(classTimetable);
    }
  }, [classTimetable]);


  // Derive names from workingDays and periodsPerDay (defaulting to 5 days/8 periods if missing)
  const days = Array.from({length: workingDays || 5}, (_, i) => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i] || `Day ${i+1}`);
  const periods = Array.from({length: periodsPerDay || 8}, (_, i) => `Period ${i+1}`);


  const currentData = currentClassTimeTable;
  const items = currentData ? Object.keys(currentData) : [];

  // Auto-select first item when data is available
  React.useEffect(() => {
    if (items.length > 0 && !selectedItem) {
      setSelectedItem(items[0]);
    }
  }, [items, selectedItem]);

  if (!currentClassTimeTable) {
    return (
      <div className="dark-gradient-bg-ett">
        <div className="container-ett">
          <div className="no-data-alert-ett">
            <div className="no-data-message-ett">
              No timetable data available
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // --- DISABLED SWAPPING LOGIC ---
  const handlePeriodSwap = (dayIndex, periodIndex) => {
    // This function is disabled due to the complex resource changes.
    // If enabled, it would need to check conflicts across Classrooms, Labs, and Faculty simultaneously.
    console.warn("Manual swap feature is temporarily disabled.");
    setSelectedPeriods([]);
    setShowNegativeMessage(true);
    setTimeout(() => setShowNegativeMessage(false), 1000);
  };

  const handleReset = () => {
    setCurrentClassTimeTable(classTimetable);
    setSelectedPeriods([]);
    toast.success("Timetable reset to last saved version.");
  };
  
  // --- SAVE LOGIC (Simplified for non-auth/mock data) ---
  const handleSave = async () => {
    try {
      const timetableData = {
        // Pass all 4 timetables back for update
        class_timetable: currentClassTimeTable,
        teacher_timetable: teacherTimetable,
        lab_timetable: labTimetable,
        classroom_timetable: classroomTimetable,
        
        // Pass all metadata back
        teacherData: teacherData,
        classes: classes,
        classrooms: classrooms,
        labs: labs,
        workingDays: workingDays,
        periods: periodsPerDay,
        title: title,
        userId : userId,
      };
      
      const endpoint = `${import.meta.env.VITE_API_BASE_URL}/${id ? `update-timetable/${id}` : 'add'}`;
      const method = id ? "PUT" : "POST";
      
      const response = await fetch(endpoint, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(timetableData),
      });

      const result = await response.json();
      toast.success("Timetable saved successfully");
      
      navigate(`/display/${result._id || id}`, {
          state: {
            // Ensure all four tables are passed back
            timetableId: result._id || id,
            classTimetable: timetableData.class_timetable,
            teacherTimetable: timetableData.teacher_timetable,
            labTimetable: timetableData.lab_timetable,
            classroomTimetable: timetableData.classroom_timetable,
            
            // Pass Metadata
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

    } catch (error) {
      console.log(error);
      toast.error("Error saving timetable. Check backend server.");
    }
  };

  // Helper to format the complex PeriodDetail object for display
  const formatPeriodContent = (period) => {
      if (typeof period === 'object' && period !== null) {
          const { faculty, subject, batch, room } = period;
          const resource = period.is_lab ? `Lab: ${room} (${batch})` : `Room: ${room}`;
          return `${subject} (${faculty}) - ${resource}`;
      }
      // Simple string or number (like "Free")
      return String(period);
  };
  
  const renderTimetable = (data) => {
    if (!data || data.length === 0) {
      return (
        <div className="no-data-alert-ett">
          <div className="no-data-message-ett">No data available</div>
        </div>
      );
    }

    return (
      <div className="table-container-ett">
        <table className="timetable-table-ett">
          <thead className="table-header-ett">
            <tr>
              <th className="header-cell-ett">Day/Period</th>
              {periods.map((period, index) => (
                <th key={index} className="header-cell-ett period-header-ett">
                  {period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body-ett">
            {data.map((dayData, dayIndex) => (
              <tr key={dayIndex} className="table-row-ett">
                <td className="day-cell-ett">{days[dayIndex]}</td>
                {dayData.map((period, periodIndex) => (
                  <td
                    key={periodIndex}
                    className={`period-cell-ett ${
                      selectedPeriods.some(
                        (sel) =>
                          sel.dayIndex === dayIndex &&
                          sel.periodIndex === periodIndex
                      )
                        ? "selected-ett"
                        : ""
                    }`}
                    onClick={() => handlePeriodSwap(dayIndex, periodIndex)} // Call disabled swap logic
                  >
                    {period === "Free" || period === "" ? (
                      <span className="free-period-ett">Free</span>
                    ) : (
                      <span className="subject-badge-ett">{formatPeriodContent(period)}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="dark-gradient-bg-ge">
      <div className="container" style={{ padding: "5rem", paddingTop: 0 }}>
        {/* Instruction Message */}
        <div className="instruction-message-ett">
          <div className="instruction-title-ett">Manual Editing</div>
          <div className="instruction-text-ett">
            **NOTE: Manual swapping is DISABLED** due to the project's complex resource (Faculty, Lab, Classroom) constraints. All changes must be made via the Faculty Load assignment screen or by regenerating the timetable.
          </div>
        </div>

        {/* Controls Section */}
        <div className="controls-section-ett">
          <div className="action-controls-ett" style={{ paddingLeft: "1rem" }}>
            <div className="button-group-ett">
              <button
                type="button"
                className="action-button-ett save-button-ett"
                onClick={handleSave}
              >
                <span>💾</span>
                Save Final Timetables
              </button>
              <button
                type="button"
                className="action-button-ett reset-button-ett"
                onClick={handleReset}
              >
                <span>🔄</span>
                Reset
              </button>
            </div>
            <div
              className={`status-message-ett ${
                showNegativeMessage
                  ? "status-negative-ett"
                  : ""
              }`}
            >
              {showNegativeMessage
                ? "❌ Manual swap disabled."
                : "View only mode."}
            </div>
          </div>
          <div className="selector-controls-ett">
            <select
              className="item-selector-ett"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              <option value="">Select Class</option>
              {items.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timetable Card */}
        {selectedItem && (
          <div className="timetable-card-ett">
            <div className="card-header-ett" style={{ paddingLeft: "1rem" }}>
              <h4 className="card-title-ett">Class: {selectedItem} (View Only)</h4>
            </div>
            <div className="card-body-ett">
              {renderTimetable(currentData[selectedItem])}
            </div>
          </div>
        )}

        {/* No Selection Alert */}
        {!selectedItem && (
          <div className="info-alert-ett">
            Please select a class to view the Class Timetable
          </div>
        )}
      </div>
    </div>
  );
};

export default EditTimetable;