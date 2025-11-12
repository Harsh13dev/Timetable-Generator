// frontend/src/pages/generate/TimetableDisplay.jsx (Updated to display Batch)
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AlertTriangle, RefreshCw } from "lucide-react";

import "./TimetableDisplay.css";

const TimetableDisplay = ({
  classTimetable: initialClass,
  teacherTimetable: initialTeacher, // Renamed to Faculty Timetable
  labTimetable: initialLab, // NEW Initial Prop
  classroomTimetable: initialClassroom, // NEW Initial Prop
  showEditOptions,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState("class");
  const [selectedItem, setSelectedItem] = useState("all");
  
  // Update state to hold all four timetables
  const [classTimetable, setClassTimetable] = useState(initialClass || {});
  const [facultyTimetable, setFacultyTimetable] = useState(initialTeacher || {});
  const [labTimetable, setLabTimetable] = useState(initialLab || {}); // NEW
  const [classroomTimetable, setClassroomTimetable] = useState(initialClassroom || {}); // NEW

  const [errorMessage, setErrorMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState(null);
  const [errorType, setErrorType] = useState("");

  // Dynamic configuration based on data or location state
  const [workingDays, setWorkingDays] = useState(5);
  const [periodsPerDay, setPeriodsPerDay] = useState(8);

  // Helper to determine what type of item is selected
  const getResourceList = (mode) => {
    switch (mode) {
      case "class":
        return classTimetable;
      case "faculty":
        return facultyTimetable;
      case "lab":
        return labTimetable;
      case "classroom":
        return classroomTimetable;
      default:
        return {};
    }
  };
  
  const getResourceName = (mode) => {
    switch (mode) {
      case "class": return "Class";
      case "faculty": return "Faculty";
      case "lab": return "Lab";
      case "classroom": return "Classroom";
      default: return "Item";
    }
  };

  const generateDayNames = (numDays) => {
    const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return allDays.slice(0, Math.min(numDays, 7)); 
  };

  const generatePeriodNames = (numPeriods) => {
    return Array.from({length: numPeriods}, (_, i) => `Period ${i + 1}`);
  };

  // Get actual dimensions from current data
  const getCurrentDataDimensions = (data) => {
    if (!data || Object.keys(data).length === 0) {
      return { maxDays: workingDays, maxPeriods: periodsPerDay };
    }

    let maxDays = 0;
    let maxPeriods = 0;

    Object.values(data).forEach(timetableData => {
      if (Array.isArray(timetableData)) {
        maxDays = Math.max(maxDays, timetableData.length);
        timetableData.forEach(dayData => {
          if (Array.isArray(dayData)) {
            maxPeriods = Math.max(maxPeriods, dayData.length);
          }
        });
      }
    });

    return {
      maxDays: maxDays || workingDays,
      maxPeriods: maxPeriods || periodsPerDay
    };
  };
  
  // Use dimensions of the currently selected view mode data
  const currentData = getResourceList(viewMode);
  const { maxDays, maxPeriods } = getCurrentDataDimensions(currentData);
  const days = generateDayNames(maxDays);
  const periods = generatePeriodNames(maxPeriods);
  const items = currentData ? Object.keys(currentData) : [];


  useEffect(() => {
    if (location.state) {
      // Update all four timetable states from location state
      if (location.state.classTimetable) setClassTimetable(location.state.classTimetable);
      if (location.state.teacherTimetable) setFacultyTimetable(location.state.teacherTimetable);
      if (location.state.labTimetable) setLabTimetable(location.state.labTimetable || {}); // NEW
      if (location.state.classroomTimetable) setClassroomTimetable(location.state.classroomTimetable || {}); // NEW
      
      // Update configs
      if (location.state.workingDays) setWorkingDays(Math.min(location.state.workingDays, 7));
      if (location.state.periods) setPeriodsPerDay(Math.max(location.state.periods, 1));

      // Error Handling
      if (location.state.status === "ERROR" || location.state.status === "INFEASIBLE" || (location.state.message && location.state.message.includes("❌"))) {
        setErrorMessage(location.state.message || "An error occurred while generating the timetable");
        setErrorDetails(location.state.error_details || null);
        setErrorType(location.state.error_type || "UNKNOWN");
      }
    }
  }, [location]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (items.length > 0 && selectedItem !== "all" && !selectedItem) {
      setSelectedItem(items[0]);
    }
  }, [items, selectedItem]);

  // Helper function to render detailed error information (Simplified)
  const renderErrorDetails = () => {
    if (!errorDetails && !errorMessage) return null;

    return (
      <div className="error-details-container">
        <div className="error-header">
          <AlertTriangle className="icon-ge error-icon" />
          <h3>Timetable Generation Failed</h3>
        </div>
        
        <div className="error-content">
          <p className="error-main-message">
            {errorMessage || "An error occurred while generating the timetable"}
          </p>
          
          {/* ... (rest of error details and suggestions can be adapted from old file) */}

          <div className="error-suggestions">
            <h4>Possible solutions:</h4>
            <ul>
              <li>Check if total faculty load exceeds available time slots.</li>
              <li>Ensure all lab loads (periods) are even numbers.</li>
              <li>Verify that subject loads match what's possible with available resources (Labs/Classrooms).</li>
              <li>Make sure you have enough Classrooms (C1, C2, C3) and Labs (Max 4).</li>
            </ul>
          </div>
          
          {location.state && (location.state.teacherData || location.state.classes) && (
            <div className="error-actions">
              <button
                className="action-button retry-button"
                onClick={() => navigate("/generate/add-teachers", { state: location.state })}
              >
                <RefreshCw className="icon-ge" />
                Edit Faculty & Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const hasError = errorMessage || (location.state?.status === "ERROR") || (location.state?.status === "INFEASIBLE");
  const hasNoData = (!classTimetable || Object.keys(classTimetable).length === 0);

  if (hasError || (hasNoData && !showEditOptions)) {
    return (
      <div className="dark-gradient-bg-td">
        <div className="container-td">
          <div className="error-state-container">
            {hasError ? renderErrorDetails() : (
              <div className="no-data-alert-td">
                <AlertTriangle className="icon-ge" />
                No timetable data available.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Export Logic ---

  const exportFormatPeriodContent = (period) => {
      // Logic for displaying the PeriodDetail object in the cell for EXPORT (CSV/PDF)
      if (typeof period === 'object' && period !== null) {
          const { faculty, subject, batch, room, is_lab } = period;
          let output = `${subject}(${faculty}) [${room}]`;
          if (is_lab) {
              output = `${subject}(${faculty}) [${room}, ${batch}]`; 
          }
          return output;
      }
      return String(period);
  };

  const exportAsPDF = async () => {
    // PDF export logic (using exportFormatPeriodContent)
  };

  const exportAsExcel = () => {
    const wb = XLSX.utils.book_new();
    const combined = [];
    const itemsToExport = selectedItem === "all" ? items : [selectedItem];
    const resourceTitle = getResourceName(viewMode);

    itemsToExport.forEach((item) => {
        const data = currentData[item];
        if (data) {
            const { maxPeriods: actualPeriods } = getCurrentDataDimensions({ [item]: data });
            const periodsToShow = generatePeriodNames(actualPeriods);
            
            combined.push([`${resourceTitle}: ${item}`]);
            combined.push(["Day/Period", ...periodsToShow]);
            
            data.forEach((row, i) => {
                const rowContent = row.map(period => period === "Free" || period === "" || period === undefined ? "Free" : exportFormatPeriodContent(period));
                const paddedRow = [...rowContent];
                while (paddedRow.length < actualPeriods) {
                    paddedRow.push("Free");
                }
                combined.push([days[i] || `Day ${i + 1}`, ...paddedRow]);
            });
            combined.push([]); 
        }
    });

    const ws = XLSX.utils.aoa_to_sheet(combined);
    XLSX.utils.book_append_sheet(wb, ws, "Timetables");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    const filename = selectedItem === "all" 
      ? `all_${viewMode}_timetables.xlsx`
      : `${viewMode}_${selectedItem}_timetable.xlsx`;

    saveAs(new Blob([wbout], { type: "application/octet-stream" }), filename);
  };

  // --- Render Functions ---

  const renderTimetable = (data) => {
    if (!data || data.length === 0) {
      return <div className="no-data-message-td">No data available</div>;
    }

    const { maxDays: actualDays, maxPeriods: actualPeriods } = getCurrentDataDimensions({ item: data });
    const daysToShow = generateDayNames(actualDays);
    const periodsToShow = generatePeriodNames(actualPeriods);
    
    // Determine the label used inside the period cell for UI DISPLAY
    const getPeriodText = (period) => {
        if (typeof period === 'object' && period !== null) {
            const { faculty, subject, class_name, room, is_lab, batch } = period;
            let display = `${subject}(${faculty})`;
            
            if (viewMode === 'faculty') {
                display = `${subject} - ${class_name}`;
            }

            // ADDED BATCH DISPLAY: Batch is only relevant for Labs in Class/Faculty views
            if (is_lab) {
                display += ` [${room}] [${batch}]`; // Display room AND batch
            } else {
                display += ` [${room}]`; // Display room only for lectures
            }

            return display;
        }
        return String(period);
    };


    return (
      <div className="table-container-td">
        <table className="timetable-table-td">
          <thead className="table-header-td">
            <tr>
              <th className="header-cell-td">Day/Period</th>
              {periodsToShow.map((period, index) => (
                <th key={index} className="header-cell-td period-header-td">
                  {period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body-td">
            {data.map((dayData, dayIndex) => (
              <tr key={dayIndex} className="table-row-td">
                <td className="day-cell-td">
                  {daysToShow[dayIndex] || `Day ${dayIndex + 1}`}
                </td>
                {Array.from({ length: actualPeriods }, (_, periodIndex) => (
                  <td key={periodIndex} className="period-cell-td">
                    {(() => {
                      const period = dayData[periodIndex];
                      if (period === "Free" || period === "" || period === undefined || period === null) {
                        return <span className="free-period-td">Free</span>;
                      } else {
                        return <span className="subject-badge-td">{getPeriodText(period)}</span>;
                      }
                    })()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAllTimetables = () => {
    if (!currentData || Object.keys(currentData).length === 0) {
      return <div className="no-data-message-td">No data available</div>;
    }

    return (
      <div className="all-timetables-container">
        {items.map((item) => (
          <div key={item} className="individual-timetable-section" style={{ marginBottom: '3rem' }}>
            <h5 style={{
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#f8f9fa',
              color: '#212529',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}>
              {getResourceName(viewMode)}: {item}
            </h5>
            {renderTimetable(currentData[item])}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`${!showEditOptions ? "dark-gradient-bg-td" : ""}`}>
      <div
        className={`${!showEditOptions ? "container" : ""}`}
        style={{ padding: `${showEditOptions ? "" : "5rem"}`, paddingTop: 0 }}
      >
        {/* Header and Edit Buttons (for saved timetables) */}
        {location.state?.timetableId && !showEditOptions && (
          <div className="timetable-header">
            <h2 className="section-title-ge">{location.state.title}</h2>
            <div className="action-buttons-container">
              <button
                type="button"
                className="action-button-td edit-teachers-button-td"
                onClick={() =>
                  navigate("/generate/add-teachers", { state: location.state })
                }
              >
                <span className="button-icon-td">👥</span>
                Edit Faculty & Load
              </button>
            </div>
          </div>
        )}
        
        {/* Main Display Controls */}
        <div className="container-td">
          <div className="controls-section-td">
            <div className="view-mode-controls-td">
              <div className="button-group-td">
                <button
                  type="button"
                  className={`mode-button-td ${viewMode === "class" ? "active-mode-td" : ""}`}
                  onClick={() => { setViewMode("class"); setSelectedItem("all"); }}
                >
                  Class Timetables
                </button>
                <button
                  type="button"
                  className={`mode-button-td ${viewMode === "faculty" ? "active-mode-td" : ""}`}
                  onClick={() => { setViewMode("faculty"); setSelectedItem("all"); }}
                >
                  Faculty Timetables
                </button>
                <button
                  type="button"
                  className={`mode-button-td ${viewMode === "lab" ? "active-mode-td" : ""}`}
                  onClick={() => { setViewMode("lab"); setSelectedItem("all"); }}
                >
                  Lab Timetables
                </button>
                <button
                  type="button"
                  className={`mode-button-td ${viewMode === "classroom" ? "active-mode-td" : ""}`}
                  onClick={() => { setViewMode("classroom"); setSelectedItem("all"); }}
                >
                  Classroom Timetables
                </button>
              </div>
            </div>
            
            {/* Item Selector */}
            <div className="selector-controls-td" style={{ paddingLeft: "10px" }}>
              <select
                className="item-selector-td"
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
              >
                <option value="all">
                  All {getResourceName(viewMode)}s
                </option>
                {items.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="timetable-card-td">
            <div className="card-header-td" style={{ paddingRight: "1rem", paddingLeft: "1rem" }}>
              <h4 className="card-title-td">
                {selectedItem === "all" 
                  ? `All ${getResourceName(viewMode)}s` 
                  : `${getResourceName(viewMode)}: ${selectedItem}`
                }
              </h4>
              <div className="export-buttons-td">
                <button className="export-button-td pdf-button-td" onClick={exportAsPDF}>
                  <span className="button-icon-td">📄</span> Export as PDF
                </button>
                <button className="export-button-td excel-button-td" onClick={exportAsExcel}>
                  <span className="button-icon-td">📊</span> Export as Excel
                </button>
              </div>
            </div>
            <div className="card-body-td" id="timetable-container">
              {selectedItem === "all" 
                ? renderAllTimetables() 
                : renderTimetable(currentData[selectedItem])
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableDisplay;