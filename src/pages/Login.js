import React, { useState, useEffect, useRef } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Modal, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    role: "Student", // Default role
  });
  const [loading, setLoading] = useState(false);
  const [showDelayedModal, setShowDelayedModal] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const modalTimerRef = useRef(null);

  useEffect(() => {
    const checkTokenExpiry = () => {
      const expiry = localStorage.getItem("authTokenExpiry");
      if (expiry && new Date().getTime() > expiry) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authTokenExpiry");
        navigate("/login");
      }
    };
    checkTokenExpiry();
  }, [navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowDelayedModal(false);

    // Set a timer to show modal after 3.5 seconds
    modalTimerRef.current = setTimeout(() => {
      setShowDelayedModal(true);
    }, 3500);

    try {
      const response = await loginUser(credentials);

      // Clear modal timer on success
      clearTimeout(modalTimerRef.current);
      setShowDelayedModal(false);

      if (response.token) {
        const expiryTime = new Date().getTime() + 3 * 60 * 60 * 1000; // 3 hours
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("authTokenExpiry", expiryTime.toString());

        // Redirect based on role
        if (credentials.role === "Student") {
          navigate("/User/Studentroute/login");
        } else if (credentials.role === "Teacher" || credentials.role === "Admin") {
          navigate("/teacher/TeacherDashboard");
        }
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      clearTimeout(modalTimerRef.current);
      setShowDelayedModal(false);
      setError(error.response?.data?.error || "Login failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      {/* Delayed Loading Modal */}
      <Modal show={showDelayedModal} backdrop="static" keyboard={false} centered>
        <Modal.Body className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <h5 className="fw-bold">Server is starting… please wait</h5>
          <p>It may take a few seconds if our server was inactive. Thank you for your patience!</p>
        </Modal.Body>
      </Modal>

      <div className="card p-4 shadow-lg rounded" style={{ width: "380px" }}>
        <h3 className="text-center mb-3 text-primary">Login</h3>
        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="mb-3">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              onChange={handleChange}
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-3 position-relative">
            <label className="form-label fw-bold">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-control"
                placeholder="Enter your password"
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-3">
            <label className="form-label fw-bold">Role</label>
            <div className="d-flex gap-3">
              {["Student", "Teacher", "Admin"].map((role) => (
                <div className="form-check" key={role}>
                  <input
                    type="radio"
                    id={role.toLowerCase()}
                    name="role"
                    value={role}
                    className="form-check-input"
                    checked={credentials.role === role}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor={role.toLowerCase()}>
                    {role}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-3">
          <p className="m-0">
            Don't have an account?{" "}
            <a href="/register" className="text-decoration-none fw-bold">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
