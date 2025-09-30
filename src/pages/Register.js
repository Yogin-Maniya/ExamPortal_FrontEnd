import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { FaUser, FaEnvelope, FaLock, FaGraduationCap, FaSpinner } from "react-icons/fa";

const Register = () => {
  const [user, setUser] = useState({ name: "", email: "", studentClass: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user.name || !user.email || !user.studentClass || !user.password) {
      setError("All fields are required!");
      return;
    }

    setLoading(true); // Show loading indicator

    try {
      await registerUser(user);
      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center text-primary mb-3">Create an Account</h2>

        {error && <p className="text-danger text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-3">
          <div className="mb-3 input-group">
            <span className="input-group-text"><FaUser /></span>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={user.name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="mb-3 input-group">
            <span className="input-group-text"><FaEnvelope /></span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={user.email}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="mb-3 input-group">
            <span className="input-group-text"><FaGraduationCap /></span>
            <input
              type="text"
              name="studentClass"
              placeholder="Class (e.g., 10th, 12th)"
              value={user.studentClass}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="mb-3 input-group">
            <span className="input-group-text"><FaLock /></span>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={user.password}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? (
              <>
                <FaSpinner className="spinner-border spinner-border-sm me-2" /> Registering...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="text-center mt-3">
          Already have an account? <a href="/login" className="text-primary">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
