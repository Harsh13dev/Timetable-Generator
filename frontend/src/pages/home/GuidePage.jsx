import { BookOpen, Code, Database, Server, Calendar, Download, Users, Settings, Globe } from "lucide-react";
import "./guide-page.css";
import { useEffect } from "react";

function GuidePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="dark-gradient-bgg">
      <div className="containerg">
        <div className="rowg pt-5g">
          <div className="colg">
            <h1 className="hero-titleg">
              How the <span className="gradient-textg">Timetable Generator</span> Works
            </h1>
            <h3 className="hero-subtitleg">
              A detailed breakdown of how our system intelligently creates optimized school timetables using powerful algorithms, dynamic editing, and export capabilities.
            </h3>
            
            <section className="features-sectiong">
              <h2 className="features-titleg">Tech Stack</h2>
              <p className="feature-descriptiong">
                Our platform is built on a modern, scalable, and developer-friendly architecture:
              </p>
              <ul className="feature-descriptiong" style={{ listStyleType: "disc", paddingLeft: "2rem" }}>
                <li><strong>Frontend:</strong> React</li>
                <li><strong>Authentication:</strong> Clerk</li>
                <li><strong>Backend:</strong> FastAPI (Python)</li>
                <li><strong>Database:</strong> MongoDB</li>
                <li><strong>Timetable Engine:</strong> Google OR-Tools (Constraint Programming Solver)</li>
                <li><strong>Deployment:</strong> Render</li>
              </ul>
            </section>

            <section className="features-sectiong">
              <h2 className="features-titleg">What You Input</h2>
              <p className="feature-descriptiong">
                When generating a timetable, the following inputs are provided by the user:
              </p>
              <div className="features-circleg">
                {/* Feature 1 */}
                <div className="feature-cardg" style={{ "--index": 0 }}>
                  <div className="feature-card-innerg">
                    <div className="feature-card-frontg">
                      <div className="feature-icong">
                        <Settings className="icon-maing" size={40} />
                      </div>
                      <h3 className="feature-titleg">General Settings</h3>
                      <p className="feature-descriptiong">
                        Title, number of working days, and periods per day.
                      </p>
                    </div>
                    <div className="feature-card-backg">
                      <h3 className="feature-back-titleg">General Settings</h3>
                      <p className="feature-back-descriptiong">
                        Configure the timetable's title, the number of working days in a week, and the number of periods per day to suit your school's schedule.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Feature 2 */}
                <div className="feature-cardg" style={{ "--index": 1 }}>
                  <div className="feature-card-innerg">
                    <div className="feature-card-frontg">
                      <div className="feature-icong">
                        <Users className="icon-maing" size={40} />
                      </div>
                      <h3 className="feature-titleg">Classes</h3>
                      <p className="feature-descriptiong">
                        List of class names (e.g., XA, XB).
                      </p>
                    </div>
                    <div className="feature-card-backg">
                      <h3 className="feature-back-titleg">Classes</h3>
                      <p className="feature-back-descriptiong">
                        Define the classes for which the timetable will be generated, such as XA, XB, etc.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Feature 3 */}
                <div className="feature-cardg" style={{ "--index": 2 }}>
                  <div className="feature-card-innerg">
                    <div className="feature-card-frontg">
                      <div className="feature-icong">
                        <BookOpen className="icon-maing" size={40} />
                      </div>
                      <h3 className="feature-titleg">Teachers</h3>
                      <p className="feature-descriptiong">
                        Name, subjects taught, base class, and lab subjects.
                      </p>
                    </div>
                    <div className="feature-card-backg">
                      <h3 className="feature-back-titleg">Teachers</h3>
                      <p className="feature-back-descriptiong">
                        Specify teacher details including their name, subjects they teach per class, assigned base class (if any), main subject, and optional lab subjects.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Feature 4 */}
                <div className="feature-cardg" style={{ "--index": 3 }}>
                  <div className="feature-card-innerg">
                    <div className="feature-card-frontg">
                      <div className="feature-icong">
                        <Calendar className="icon-maing" size={40} />
                      </div>
                      <h3 className="feature-titleg">Weekly Requirements</h3>
                      <p className="feature-descriptiong">
                        Periods required for each subject per class.
                      </p>
                    </div>
                    <div className="feature-card-backg">
                      <h3 className="feature-back-titleg">Weekly Requirements</h3>
                      <p className="feature-back-descriptiong">
                        Set the number of periods required for each subject in each class to ensure proper scheduling.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="features-sectiong">
              <h2 className="features-titleg">Workflow Overview</h2>
              <p className="feature-descriptiong">
                The system follows a clean, modular flow:
              </p>
              <div className="workflow-sectiong">
                <ol>
                  <li>Frontend (React) collects inputs and allows real-time editing.</li>
                  <li>Backend (FastAPI) receives the data and processes it.</li>
                  <li>Teacher & Subject Mapping is done to prepare constraint models.</li>
                  <li>OR-Tools CP Solver is invoked to generate a feasible timetable.</li>
                  <li>Outputs are generated: Class-wise and Teacher-wise timetables.</li>
                  <li>Live Preview & Editing available on the frontend.</li>
                  <li>Export as PDF or Excel formats.</li>
                </ol>
              </div>
            </section>

            <section className="features-sectiong">
              <h2 className="features-titleg">Timetable Generation Logic</h2>
              <p className="feature-descriptiong">
                At the core of our backend is a Constraint Programming (CP) model built using Google OR-Tools. The following constraints are applied:
              </p>
              <div className="constraint-sectiong">
                <ul>
                  <li><strong>Single Slot Rule:</strong> Each teacher can only teach in one class at a time.</li>
                  <li><strong>Period Count Matching:</strong> The number of periods per subject is enforced exactly.</li>
                  <li><strong>Daily Subject Cap:</strong> A subject can appear at most twice a day in a class.</li>
                  <li><strong>Lab Scheduling:</strong> Lab subjects are scheduled as double-period blocks.</li>
                  <li><strong>Class Teacher Priority:</strong> The class teacher's main subject is prioritized for the first period of the day.</li>
                  <li><strong>Valid Assignments:</strong> No invalid (undefined) teacher-subject-class combinations are scheduled.</li>
                </ul>
              </div>
              
              <h3 className="feature-titleg">Optimization Goals</h3>
              <div className="constraint-sectiong">
                <ul>
                  <li>Honor all constraints without violation.</li>
                  <li>Fairly distribute workload across teachers.</li>
                  <li>Avoid teacher overlaps and class conflicts.</li>
                </ul>
              </div>
              
              <h3 className="feature-titleg">Deterministic or Randomized?</h3>
              <p className="feature-descriptiong">
                The timetable generation is deterministic. Given the same inputs, the system produces the same output unless manual edits are made.
              </p>
              
              <h3 className="feature-titleg">Auto or Manual?</h3>
              <p className="feature-descriptiong">
                The timetable is fully auto-generated based on all constraints. Manual editing is supported post-generation through a dynamic UI.
              </p>
            </section>

            <section className="features-sectiong">
              <h2 className="features-titleg">Post-Generation Features</h2>
              <div className="features-circleg">
                {/* Feature A */}
                <div className="feature-cardg" style={{ "--index": 0 }}>
                  <div className="feature-card-innerg">
                    <div className="feature-card-frontg">
                      <div className="feature-icong">
                        <Code className="icon-maing" size={40} />
                      </div>
                      <h3 className="feature-titleg">Live Validation & Editing</h3>
                      <p className="feature-descriptiong">
                        Make changes dynamically with instant conflict validation.
                      </p>
                    </div>
                    <div className="feature-card-backg">
                      <h3 className="feature-back-titleg">Live Validation & Editing</h3>
                      <p className="feature-back-descriptiong">
                        Dynamically edit the timetable and instantly validate for conflicts, such as overlapping periods.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Feature B */}
                <div className="feature-cardg" style={{ "--index": 1 }}>
                  <div className="feature-card-innerg">
                    <div className="feature-card-frontg">
                      <div className="feature-icong">
                        <Download className="icon-maing" size={40} />
                      </div>
                      <h3 className="feature-titleg">Export Options</h3>
                      <p className="feature-descriptiong">
                        Download in PDF or Excel format with class-wise and teacher-wise views.
                      </p>
                    </div>
                    <div className="feature-card-backg">
                      <h3 className="feature-back-titleg">Export Options</h3>
                      <p className="feature-back-descriptiong">
                        Export the timetable in PDF or Excel formats, with options for both class-wise and teacher-wise views.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Feature C */}
                <div className="feature-cardg" style={{ "--index": 2 }}>
                  <div className="feature-card-innerg">
                    <div className="feature-card-frontg">
                      <div className="feature-icong">
                        <Database className="icon-maing" size={40} />
                      </div>
                      <h3 className="feature-titleg">Insights & Usability</h3>
                      <p className="feature-descriptiong">
                        Visual display of subject/teacher distribution and imbalance detection.
                      </p>
                    </div>
                    <div className="feature-card-backg">
                      <h3 className="feature-back-titleg">Insights & Usability</h3>
                      <p className="feature-back-descriptiong">
                        Easily spot imbalances or missing periods with a visual display of subject and teacher distribution.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuidePage;
