import React, { useState, useEffect } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    role: "Student", // Default role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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

    try {
      const response = await loginUser(credentials);
      if (response.token) {
        const expiryTime = new Date().getTime() + 3 * 60 * 60 * 1000; // 3 hours
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("authTokenExpiry", expiryTime.toString());

        // Redirect based on selected role:
        if (credentials.role === "Student") {
          navigate("/User/Studentroute/login");
        } else if (credentials.role === "Teacher" || credentials.role === "Admin") {
          navigate("/teacher/TeacherDashboard");
        }
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      setError(error.response?.data?.error || "Login failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
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

          {/* Role Selection using Radio Buttons */}
          <div className="mb-3">
            <label className="form-label fw-bold">Role</label>
            <div className="d-flex gap-3">
              <div className="form-check">
                <input
                  type="radio"
                  id="student"
                  name="role"
                  value="Student"
                  className="form-check-input"
                  checked={credentials.role === "Student"}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="student">
                  Student
                </label>
              </div>
              <div className="form-check">
                <input
                  type="radio"
                  id="teacher"
                  name="role"
                  value="Teacher"
                  className="form-check-input"
                  checked={credentials.role === "Teacher"}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="teacher">
                  Teacher
                </label>
              </div>
              <div className="form-check">
                <input
                  type="radio"
                  id="admin"
                  name="role"
                  value="Admin"
                  className="form-check-input"
                  checked={credentials.role === "Admin"}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="admin">
                  Admin
                </label>
              </div>
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
