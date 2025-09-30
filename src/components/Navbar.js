import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "bootstrap/dist/css/bootstrap.min.css";
// Make sure you have the react-icons installed: npm install react-icons
import { FaSignOutAlt } from "react-icons/fa"; // Logout Icon
import { FaBars, FaTimes } from "react-icons/fa"; // Toggle Icons for better UX

// Custom CSS for better styling and hover effect
const customStyles = `
  .navbar-custom {
    background-color: #ffffff; /* White background */
    border-bottom: 3px solid #007bff; /* Primary color border for distinction */
    transition: all 0.3s ease;
  }
  .nav-link.hover-effect {
    position: relative;
    padding-bottom: 5px;
    color: #343a40 !important; /* Dark text */
    font-weight: 500;
  }
  .nav-link.hover-effect::after {
    content: '';
    position: absolute;
    width: 0%;
    height: 3px;
    display: block;
    margin-top: 5px;
    right: 0;
    background: #007bff; /* Primary color line */
    transition: width 0.3s ease;
  }
  .nav-link.hover-effect:hover::after,
  .nav-link.active::after {
    width: 100%;
    left: 0;
    background: #007bff;
  }
  .logout-icon:hover {
    color: #dc3545 !important; /* Red hover for danger */
    transform: scale(1.1);
    transition: transform 0.2s ease;
  }
  /* Style for the active link using react-router's location */
  .nav-link.active {
      color: #007bff !important; /* Highlight active link with primary color */
      font-weight: bold !important;
  }
  @media (max-width: 991.98px) {
    .nav-item {
      margin: 5px 0;
    }
  }
`;

const Navbar = () => {
  const [user, setUser] = useState({ type: "student", id: null }); // type: 'student' | 'admin'
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu toggle
  const navigate = useNavigate();
  const location = useLocation();
  const isExamRoute = location.pathname.includes('/take-exam/');

  useEffect(() => {
    // Inject custom styles into the document head
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);
    return () => {
        document.head.removeChild(styleElement); // Cleanup on unmount
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.adminId) {
          setUser({ type: "admin", id: decoded.adminId });
        } else if (decoded.studentId) {
          setUser({ type: "student", id: decoded.studentId });
        }
      } catch (error) {
        console.error("Invalid token", error);
        setUser({ type: "student", id: null });
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Function to determine if a link is active
  const getNavLinkClass = (path) => {
    return `nav-link text-dark hover-effect ${location.pathname === path ? 'active' : ''}`;
  };

  // Close the menu after clicking a link (mobile-only)
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  if (isExamRoute) return null; // Don't render navbar on exam pages

  // Define paths based on user type
  const homePath = user.type === "admin" ? "/teacher/TeacherDashboard" : "/";
  const feedbackPath = user.type === "admin" ? "/teacher/feedback" : "/feedback";
  const profilePath = user.type === "admin" ? `/teacher/profile/${user.id}` : "/profile";

  return (
    <nav className="navbar navbar-expand-lg navbar-custom shadow-sm sticky-top">
      <div className="container-fluid container-lg">
        {/* Dynamic Logo/Brand */}
        <Link
          to={homePath}
          className="navbar-brand fs-4 fw-bold text-primary"
          onClick={handleLinkClick}
        >
          {user.type === "admin" ? "Teacher Panel" : "Exam Portal"}
        </Link>

        {/* Toggler button for mobile */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          {/* Change icon based on menu state for better UX */}
          {isMenuOpen ? (
            <FaTimes className="text-primary fs-5" />
          ) : (
            <FaBars className="text-primary fs-5" />
          )}
        </button>

        {/* Collapsible content (the navigation links) */}
        <div
          className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
            {/* Home Link */}
            <li className="nav-item mx-lg-3">
              <Link
                to={homePath}
                className={getNavLinkClass(homePath)}
                onClick={handleLinkClick}
              >
                Home
              </Link>
            </li>

            {/* Student specific links */}
            {user.type === "student" && user.id && (
              <li className="nav-item mx-lg-3">
                <Link
                  to={"/result"}
                  className={getNavLinkClass("/result")}
                  onClick={handleLinkClick}
                >
                  Result
                </Link>
              </li>
            )}

            {/* Feedback Link */}
            <li className="nav-item mx-lg-3">
              <Link
                to={feedbackPath}
                className={getNavLinkClass("/feedback") || getNavLinkClass("/teacher/feedback")}
                onClick={handleLinkClick}
              >
                Feedback
              </Link>
            </li>

            {/* Profile Link */}
            <li className="nav-item mx-lg-3">
              <Link
                to={profilePath}
                className={getNavLinkClass("/profile") || getNavLinkClass(`/teacher/profile/${user.id}`)}
                onClick={handleLinkClick}
              >
                Profile
              </Link>
            </li>
            
            {/* Logout Icon (Visible on all views) */}
            <li className="nav-item d-flex align-items-center mx-lg-3 my-2 my-lg-0">
                <FaSignOutAlt
                    onClick={handleLogout}
                    className="text-danger fs-4 logout-icon"
                    title="Logout"
                    style={{ cursor: "pointer" }}
                />
                {/* For mobile view, add a text label next to the icon */}
                <span className="d-lg-none ms-2 text-danger fw-bold" onClick={handleLogout} style={{ cursor: "pointer" }}>
                    Logout
                </span>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;