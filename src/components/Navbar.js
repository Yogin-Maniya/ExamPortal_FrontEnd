// Navbar.js
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const [user, setUser] = useState({ type: "student", id: null });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isExamRoute = location.pathname.includes("/take-exam/");

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
      } catch {
        setUser({ type: "student", id: null });
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getNavLinkClass = (path) =>
    `nav-link custom-link ${
      location.pathname === path ? "active-link" : ""
    }`;

  const handleLinkClick = () => setIsMenuOpen(false);

  if (isExamRoute) return null;

  const homePath =
    user.type === "admin" ? "/teacher/TeacherDashboard" : "/";
  const feedbackPath =
    user.type === "admin" ? "/teacher/feedback" : "/feedback";
  const profilePath =
    user.type === "admin"
      ? `/teacher/profile/${user.id}`
      : "/profile";
const auditPath =
  user.type === "admin"
    ? "/teacher/audit"
    : null;
const studentEditRequestsPath =
  user.type === "admin"
    ? "/teacher/profile-edit-requests"
    : null;
const teacherstudent =
  user.type === "admin"
    ? "/teacher/students"
    : null;
const teacherProctoringPath =
  user.type === "admin"
    ? "/teacher/proctoring-dashboard"
    : null;
  
  return (
    <>
      {/* Embedded CSS */}
      <style>{`
        .custom-link {
          color: #343a40 !important;
          font-weight: 500;
          position: relative;
          transition: color 0.3s ease;
        }
        .custom-link:hover {
          color: #007bff !important;
        }
        .custom-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -3px;
          width: 0;
          height: 2px;
          background: #007bff;
          transition: width 0.3s ease;
        }
        .custom-link:hover::after,
        .custom-link.active-link::after {
          width: 100%;
        }
        .logout-icon:hover {
          color: #dc3545 !important;
          transform: scale(1.2);
          transition: transform 0.2s ease;
        }
      `}</style>

      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container-fluid">
          {/* Logo */}
          <Link
            to={homePath}
            className="navbar-brand fw-bold text-primary"
            onClick={handleLinkClick}
          >
            {user.type === "admin" ? "Teacher Panel" : "Exam Portal"}
          </Link>

          {/* Toggler */}
          <button
            className="navbar-toggler border-0"
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? (
              <FaTimes className="text-primary fs-3" />
            ) : (
              <FaBars className="text-primary fs-3" />
            )}
          </button>

          {/* Links */}
          <div
            className={`collapse navbar-collapse ${
              isMenuOpen ? "show" : ""
            }`}
          >
            <ul className="navbar-nav ms-auto align-items-lg-center text-center text-lg-start">
              {/* Home */}
              <li className="nav-item mx-lg-2">
                <Link
                  to={homePath}
                  className={getNavLinkClass(homePath)}
                  onClick={handleLinkClick}
                >
                  Home
                </Link>
              </li>

              {/* Student Result */}
              {user.type === "student" && user.id && (
                <li className="nav-item mx-lg-2">
                  <Link
                    to="/result"
                    className={getNavLinkClass("/result")}
                    onClick={handleLinkClick}
                  >
                    Result
                  </Link>
                </li>
              )}

              {/* Audit (Teacher Only) */}
{user.type === "admin" && (
  <li className="nav-item mx-lg-2">
    <Link
      to={auditPath}
      className={getNavLinkClass(auditPath)}
      onClick={handleLinkClick}
    >
      Audit
    </Link>
  </li>
)}

{user.type === "admin" && (
  <li className="nav-item mx-lg-2">
    <Link
      to={studentEditRequestsPath}
      className={getNavLinkClass(studentEditRequestsPath)}
      onClick={handleLinkClick}
    >
      Student Edit Requests
    </Link>
  </li>
)}


{user.type === "admin" && (
  <li className="nav-item mx-lg-2">
    <Link
      to={teacherstudent}
      className={getNavLinkClass(teacherstudent)}
      onClick={handleLinkClick}
    >
      Students
    </Link>
  </li>
)}
{user.type === "admin" && (
  <li className="nav-item mx-lg-2">
    <Link
      to={teacherProctoringPath}
      className={getNavLinkClass(teacherProctoringPath)}
      onClick={handleLinkClick}
    >
      Proctoring
    </Link>
  </li>
)}
              {/* Feedback */}
              <li className="nav-item mx-lg-2">
                <Link
                  to={feedbackPath}
                  className={getNavLinkClass(feedbackPath)}
                  onClick={handleLinkClick}
                >
                  Feedback
                </Link>
              </li>

              {/* Profile */}
              <li className="nav-item mx-lg-2">
                <Link
                  to={profilePath}
                  className={getNavLinkClass(profilePath)}
                  onClick={handleLinkClick}
                >
                  Profile
                </Link>
              </li>

              {/* Logout */}
              <li className="nav-item mx-lg-2 d-flex align-items-center justify-content-center justify-content-lg-start my-2 my-lg-0">
                <FaSignOutAlt
                  onClick={handleLogout}
                  className="text-danger fs-4 logout-icon"
                  title="Logout"
                  style={{ cursor: "pointer" }}
                />
                <span
                  className="d-lg-none ms-2 text-danger fw-bold"
                  onClick={handleLogout}
                  style={{ cursor: "pointer" }}
                >
                  Logout
                </span>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
