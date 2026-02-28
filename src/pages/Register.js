import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import "./CSS/Register.css";
import { FaUser, FaEnvelope, FaLock, FaGraduationCap, FaSpinner } from "react-icons/fa";
import AdvancedPopup from "../components/AdvancedPopup";

const Register = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    studentClass: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [advancedPopup, setAdvancedPopup] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Cancel",
    showCancel: false,
    loading: false,
    onConfirm: null
  });
  const navigate = useNavigate();

  const classes = ["B.Tech CSE", "B.Tech ECE", "B.Tech IT", "B.Tech ME", "B.Tech CE", "BCA", "BBA"];

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

    setLoading(true);
    setShowPopup(false);

    try {
      await registerUser(user);
      setAdvancedPopup({
        show: true,
        type: "success",
        title: "Registration Successful",
        message: "Your account has been created. Continue to login.",
        confirmText: "Go to Login",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: () => navigate("/login")
      });
    } catch (apiError) {
      setError(apiError.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
      setShowPopup(false);
    }
  };

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setShowPopup(true), 3500);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const closeAdvancedPopup = () => {
    setAdvancedPopup((prev) => (prev.loading ? prev : { ...prev, show: false }));
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      {showPopup && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50"
          style={{ zIndex: 1050 }}
        >
          <div className="bg-white rounded shadow p-4 text-center">
            <FaSpinner className="spin mb-3 text-primary" size={40} />
            <h5 className="fw-bold">Server is starting, please wait</h5>
            <p>It may take a few seconds if our server was inactive.</p>
          </div>
        </div>
      )}

      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center text-primary mb-3">Create an Account</h2>

        {error && <p className="text-danger text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-3">
          <div className="mb-3 input-group">
            <span className="input-group-text">
              <FaUser />
            </span>
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
            <span className="input-group-text">
              <FaEnvelope />
            </span>
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
            <span className="input-group-text">
              <FaGraduationCap />
            </span>
            <select
              name="studentClass"
              value={user.studentClass}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Select Class</option>
              {classes.map((cls, idx) => (
                <option key={idx} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3 input-group">
            <span className="input-group-text">
              <FaLock />
            </span>
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center mt-3">
          Already have an account?{" "}
          <a href="/login" className="text-primary">
            Login
          </a>
        </p>
      </div>

      <AdvancedPopup
        show={advancedPopup.show}
        type={advancedPopup.type}
        title={advancedPopup.title}
        message={advancedPopup.message}
        onClose={closeAdvancedPopup}
        onConfirm={advancedPopup.onConfirm || closeAdvancedPopup}
        confirmText={advancedPopup.confirmText}
        cancelText={advancedPopup.cancelText}
        showCancel={advancedPopup.showCancel}
        loading={advancedPopup.loading}
      />
    </div>
  );
};

export default Register;
