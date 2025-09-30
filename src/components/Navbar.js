import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSignOutAlt } from "react-icons/fa"; // Logout Icon

const Navbar = () => {
  const [user, setUser] = useState({ type: "student", id: null }); // type: 'student' | 'admin'
  const navigate = useNavigate();
  const location = useLocation(); 
  const isExamRoute = location.pathname.includes('/take-exam/');

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

  if (isExamRoute) return null; // Don't render navbar on exam pages

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container-fluid">
        {/* Dynamic Logo */}
        <Link
  to={user.type === "admin" ? "/teacher/TeacherDashboard" : "/"}
  className="navbar-brand fs-3 fw-bold text-primary"
>
  {user.type === "admin" ? "Teacher Panel" : "Exam Portal"}
</Link>

        {/* Navigation Links */}
        <div className="d-flex align-items-center">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item mx-3">
    <Link
      to={user.type === "admin" ? "/teacher/TeacherDashboard" : "/"}
      className="nav-link text-dark fw-medium hover-effect"
    >
      Home
    </Link>
  </li>

            {/* Student specific links */}
            {user.type === "student" && user.id && (
              <>
                <li className="nav-item mx-3">
                  <Link
                    to={"/result"}
                    className="nav-link text-dark fw-medium hover-effect"
                  >
                    Result
                  </Link>
                </li>
              </>
            )}

            {/* Feedback link (admin passes adminId) */}
            <li className="nav-item mx-3">
              <Link
                to={user.type === "admin" ? "teacher/feedback" : "/feedback"}
                className="nav-link text-dark fw-medium hover-effect"
              >
                Feedback
              </Link>
            </li>

            {/* Profile */}
            <li className="nav-item mx-3">
              <Link
                to={user.type === "admin" ? `teacher/profile/${user.id}` : "/profile"}
                className="nav-link text-dark fw-medium hover-effect"
              >
                Profile
              </Link>
            </li>
          </ul>

          {/* Logout */}
          <FaSignOutAlt
            onClick={handleLogout}
            className="text-danger fs-4 mx-3 logout-icon"
            title="Logout"
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
