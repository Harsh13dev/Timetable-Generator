// frontend/src/pages/dashboard/DashbordPage.jsx (UPDATED CONTENT)
import { DeleteIcon, Loader, Trash } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import Orb from "../../../styles/orb/Orb";
import { useEffect, useState } from "react";
// import { fetchWithAuth } from "../../utils/fetchWithAuth"; // Authentication is commented out
// import { useAuth, useUser } from "@clerk/clerk-react"; // Authentication is commented out
import "./DashboardPage.css";

function DashbordPage() {
  const navigate = useNavigate();
  const {state} = useLocation()
  // const { user, isSignedIn } = useUser(); // Commented out
  const [timetables, setTimetables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  // const { getToken } = useAuth(); // Commented out
  
  // Hardcoded ID for non-authenticated user
  const userId = "placeholder_user_id";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Removed Clerk user update logic

  useEffect(() => {
    const fetchTimetables = async () => {
      setIsLoading(true);
      try {
        // if (isSignedIn) { // Commented out
          // const token = await getToken(); // Commented out
          // Use standard fetch and hardcoded userId
          const res = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/get-timetables/${userId}`
          );
          const data = await res.json();
          setTimetables(data);
        // } // Commented out
      } catch (error) {
        console.log("Error fetching timetables:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetables();
  }, []); // Empty dependency array after removing auth hooks

  const handleDelete = async (timetableId) => {
    try {
      setDeletingId(timetableId);
      // Use standard fetch and hardcoded userId
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/delete-timetable/${timetableId}`,
        { method: "DELETE" }
      );
      setTimetables((prev) =>
        prev.filter((timetable) => timetable._id !== timetableId)
      );
    } catch (error) {
      console.log(error);
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="dark-gradient-bg">
      <div className="dashboard-containerd">
        <div className="spacer-topd" />
        <div
          className="create-timetable-cardd"
          
        >
          <div className="create-contentd">
            <div className="orb-containerd">
              <Orb
                hoverIntensity={0.5}
                rotateOnHover={true}
                hue={0}
                forceHoverState={false}
                
              >
                <p onClick={() => navigate("/generate")} style={{cursor:"pointer"}} className="create-textd">Create new timetable</p>
              </Orb>
            </div>
          </div>
        </div>
        
        <div className="recent-sectiond">
          <h3 className="recent-titled">Recent Timetables</h3>

          {(isLoading) && ( // Removed isSignedIn
            <div className="loading-containerd">
              <div className="loading-spinnerd" />
              <p className="loading-textd">Loading</p>
            </div>
          )}

          {!isLoading && timetables.length === 0 && ( // Removed isSignedIn
            <div className="empty-stated">
              <p className="empty-textd">No timetables created</p>
            </div>
          )}

          <div className="timetables-listd">
            {timetables.map((timetable, index) => {
              return (
                <div
                  className="timetable-rowd"
                  key={index}
                >
                  <div
                    className="timetable-cardd"
                    onClick={() =>
                      navigate(`/display/${timetable._id}`, {
                        state: {
                          // Pass all FOUR timetables
                          classTimetable: timetable.classTimetable,
                          teacherTimetable: timetable.teacherTimetable, // Now Faculty TT
                          labTimetable: timetable.labTimetable, // NEW
                          classroomTimetable: timetable.classroomTimetable, // NEW
                          
                          timetableId: timetable._id.toString(),
                          teacherData: timetable.teacherData, // Faculty Data
                          
                          // Pass all resource lists
                          classes: timetable.classes,
                          subjects: timetable.subjects,
                          classrooms: timetable.classrooms, // NEW
                          labs: timetable.labs, // NEW
                          batches: timetable.batches, // NEW
                          
                          workingDays: timetable.workingDays,
                          periods: timetable.periods,
                          title: timetable.title,
                        },
                      })
                    }
                  >
                    <div>
                      <p className="timetable-titled">{timetable.title}</p>
                    </div>
                    <div className="timetable-infod">
                      <p className="timetable-dated">
                        Created on {timetable.createdAt.split("T")[0]} at{" "}
                        {timetable.createdAt.split("T")[1].slice(0, 5)}
                      </p>
                    </div>
                  </div>
                  {deletingId === timetable._id ? (
                    <div className="delete-spinnerd" />
                  ) : (
                    <Trash
                      className="delete-icond"
                      onClick={() => handleDelete(timetable._id)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashbordPage;