import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ExamInstructions from "./pages/ExamInstructions";
import TakeExam from "./pages/TakeExam";
import Result from "./pages/Result";
import Feedback from "./pages/Feedback";
import Grievance from "./pages/Grievance";
import Profile from "./pages/Profile";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import CreateExamQuestions from "./pages/Teacher/CreateExamQuestions";
import EditExam from "./pages/Teacher/EditExam";
import EditExamQuestion from "./pages/Teacher/EditExamQuestion";
import TeacherAllFedback from "./pages/Teacher/Feedback";
import TeacherProfile from "./pages/Teacher/TeacherProfile";

const App = () => {
  return (
    <Router>
      <MainContent />
    </Router>
  );
};

const MainContent = () => {
  const location = useLocation();

  // Hide Navbar on Login and Register pages
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/teacher/TeacherDashboard" element={<TeacherDashboard />} />
        <Route path="/create-exam/:examId" element={<CreateExamQuestions />} />
        <Route path="/edit-exam/:examId" element={<EditExam />} />
        <Route path="/edit-exam/:examId/questions/:questionId" element={<EditExamQuestion />} />
        <Route path="/exam/:examId" element={<ExamInstructions />} />
        <Route path="/take-exam/:examId" element={<TakeExam />} />
        <Route path="/result" element={<Result />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/grievance" element={<Grievance />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/teacher/feedback" element={<TeacherAllFedback />} />
        <Route path="/teacher/profile/:adminId" element={<TeacherProfile />} />

        {/* Redirect all unknown routes to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
