import NavBar from "../components/NavBar";
import "./style.css";
import { CalendarDays, BookOpen, Calculator, Microscope, Palette, Music, Globe, Users, Settings } from "lucide-react";
import FeaturesSection from "./components/FeaturesSection";
import { useNavigate } from 'react-router-dom';
// import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

function FloatingInstruments() {
  const instruments = [
    { icon: BookOpen, size: 24, delay: 0 },
    { icon: Calculator, size: 28, delay: 2 },
    { icon: Microscope, size: 26, delay: 4 },
    { icon: Palette, size: 22, delay: 6 },
    { icon: Music, size: 25, delay: 8 },
    { icon: Globe, size: 30, delay: 10 },
    { icon: Users, size: 27, delay: 12 },
    { icon: Settings, size: 23, delay: 14 },
  ];

  return (
    <div className="floating-instruments">
      {instruments.map((instrument, index) => {
        const Icon = instrument.icon;
        return (
          <div
            key={index}
            className="floating-instrument"
            style={{
              '--delay': `${instrument.delay}s`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <Icon size={instrument.size} />
          </div>
        );
      })}
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  // const { isSignedIn } = useUser();

  const [activeModal, setActiveModal] = useState(null);

  const closeModal = () => setActiveModal(null);

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  return (
    <div className="dark-gradient-bg">
      <FloatingInstruments />
      <div className="container">
        <div className="row pt-5">
          <div className="col">
            <h1 className="hero-title">
              Generate School
              <span className="gradient-text"> Timetables</span>
              <br />
              Effortlessly
            </h1>
            <h3 className="hero-subtitle">
              Create optimized class schedules with our intelligent algorithm.
              Save hours of manual work and eliminate scheduling conflicts with
              our professional-grade timetable generator. This is a free tool
              made to simplify your scheduling process.
            </h3>
            <div
              className="btn btn-black mt-3 w-100 fs-5"
              // onClick={() => navigate(`${isSignedIn ? "/dashboard" : "/login"}`)}
              // Change this onClick handler to always navigate to /dashboard
              onClick={() => navigate("/dashboard")}
            >
              <span>Get Started Now</span>
              <div className="button-glow"></div>
            </div>
            <div
              className="btn btn-black mt-3 w-100 fs-5"
              onClick={() => navigate("/guide")}
            >
              <span>Learn How It Works</span>
              <div className="button-glow"></div>
            </div>
          </div>
          <div className="col">
            <div className="center-div">
              <div className="icon-circle">
                <div className="calendar-glow"></div>
                <CalendarDays size={120} className="bounce" />
                <div className="floating-dots">
                  <div className="dot dot-1"></div>
                  <div className="dot dot-2"></div>
                  <div className="dot dot-3"></div>
                  <div className="dot dot-4"></div>
                  <div className="dot dot-5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FeaturesSection />

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-left">
              <h4 className="footer-title">Timetable Generator</h4>
              <div className="footer-links">
                <a className="footer-link" onClick={() => setActiveModal("about")}>About</a>
                <a className="footer-link" onClick={() => setActiveModal("terms")}>Terms</a>
                <a className="footer-link" onClick={() => setActiveModal("contact")}>Contact</a>
              </div>
            </div>
            <div className="footer-right">
              <div className="footer-social">
                <div className="social-icon" onClick={() => setActiveModal("language")}>
                  <Globe size={20} />
                </div>
                <div className="social-icon" onClick={() => setActiveModal("credits")}>
                  <Users size={20} />
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copyright">
              © 2025 Timetable Generator. All rights reserved.
            </div>
          </div>
        </footer>

        {/* MODALS */}
        {activeModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="close-button" onClick={closeModal}>×</button>
              {activeModal === "about" && (
                <>
                  <h2>About</h2>
                  <p>
                    Timetable Generator is a free tool designed to help schools and colleges
                    create optimized class schedules quickly and efficiently.
                    It eliminates hours of manual work and prevents scheduling conflicts.
                  </p>
                </>
              )}
              {activeModal === "terms" && (
                <>
                  <h2>Terms</h2>
                  <p>
                    By using Timetable Generator, you agree that:
                    <br />- You are responsible for the input data.
                    <br />- The app does not store or share any data with third parties.
                    <br />- Generated timetables are for reference and should be reviewed by humans.
                  </p>
                </>
              )}
              {activeModal === "contact" && (
                <>
                  <h2>Contact</h2>
                  <p>abhinandh2670@gmail.com – Abhinandh A</p>
                  <p>jasonbobbym@gmail.com – Jason Bobby</p>
                </>
              )}
              {activeModal === "language" && (
                <>
                  <h2>Select Language</h2>
                  <p>Currently available: English</p>
                </>
              )}
              {activeModal === "credits" && (
                <>
                  <h2>Credits & Help</h2>
                  <p>Abhinandh A</p>
                  <p>Jason Bobby</p>
                  <p><a href="/guide" className="footer-link">Need Help? Click here to visit the guide page.</a></p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
