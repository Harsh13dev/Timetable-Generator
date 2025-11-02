// Fixed NavBar.jsx
// import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import { Outlet, useNavigate } from "react-router";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";

function NavBar() {
  const navigate = useNavigate();
  // const { user, isLoaded, isSignedIn } = useUser();
  // const { signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogOut = async () => {
    // await signOut();
    window.location.href = "/";
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    closeMenu(); // Close mobile menu after navigation
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <div className="navbar-brand" onClick={() => handleNavigate("/")}>
              <BookOpen size={28} className="brand-icon" />
              <span className="brand-text">TimeTable Generator</span>
            </div>
            {/* Navbar Center - for potential future nav links */}
          <div className="navbar-center">
            {/* {isSignedIn && ( */}
              <button
                className="nav-link dashboard-link"
                onClick={() => handleNavigate("/dashboard")}
              >
                Dashboard
              </button>
            {/* )} */}
          </div>
          </div>

          

          {/* Desktop Navigation */}
          <div className="navbar-right">
            {/* <SignedOut> */}
              <button
                className="nav-link signup-btn"
                onClick={() => handleNavigate("/sign-up")}
              >
                Sign Up
              </button>
              <button
                className="nav-link login-btn"
                onClick={() => handleNavigate("/login")}
              >
                Login
              </button>
            {/* </SignedOut> */}
            {/* <SignedIn> */}
              {/* {isLoaded && user && ( */}
                <div className="user-section">
                  {/* <span className="user-greeting">Hi, {user.firstName}!</span> */}
                  <span className="user-greeting">Hi, Harsh!</span>
                  <button
                    className="nav-link logout-btn"
                    onClick={handleLogOut}
                  >
                    Log out
                  </button>
                </div>
              {/* )} */}
            {/* </SignedIn> */}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          

          {/* <SignedOut> */}
            <button
              className="mobile-nav-link"
              onClick={() => handleNavigate("/sign-up")}
            >
              Sign Up
            </button>
            <button
              className="mobile-nav-link"
              onClick={() => handleNavigate("/login")}
            >
              Login
            </button>
          {/* </SignedOut> */}

          {/* <SignedIn> */}
            {/* {isLoaded && user && ( */}
              <>
                <div className="mobile-user-greeting">
                  {/* Hi, {user.firstName}! */}
                  Hi, Harsh!
                </div>
                <button
              className="mobile-nav-link"
              onClick={() => handleNavigate("/dashboard")}
            >
              Dashboard
            </button>
                <button className="mobile-nav-link logout-btn" onClick={handleLogOut}>
                  Log out
                </button>
              </>
            {/* )} */}
          {/* </SignedIn> */}
        </div>
      </nav>
      <Outlet />
    </>
  );
}

export default NavBar;