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
import AdminAuditPage from "./pages/Teacher/AdminAuditPage";
import ExamDetailsPage from "./pages/Teacher/ExamDetailsPage";
import ExamResultsPage from "./pages/Teacher/ExamResultsPage";
import AdminProfileEditRequests from "./pages/Teacher/AdminProfileEditRequests";
import DevErrorLogsPage from "./pages/Teacher/DevErrorLogsPage";
import ErrorPage from "./pages/ErrorPage";
import TeacherStudentsPage from "./pages/Teacher/TeacherStudentsPage";
import TeacherProctoringDashboard from "./pages/Teacher/TeacherProctoringDashboard";
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
        <Route path="/teacher/exam/:examId/details"element={<ExamDetailsPage />} />
        <Route path="/teacher/exam/:examId/results"element={<ExamResultsPage />} />
        <Route path="/teacher/exam-details/:examId" element={<ExamDetailsPage />} />
        <Route path="/teacher/exam-results/:examId" element={<ExamResultsPage />} />
        <Route path="/teacher/create-exam/:examId" element={<CreateExamQuestions />} />
        <Route path="/teacher/exam/:examId/edit" element={<EditExam />} />
        <Route path="/teacher/exam/:examId/questions/:questionId"element={<EditExamQuestion />} />
        <Route path="/exam/:examId" element={<ExamInstructions />} />
        <Route path="/take-exam/:examId" element={<TakeExam />} />
        <Route path="/result" element={<Result />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/grievance" element={<Grievance />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/teacher/feedback" element={<TeacherAllFedback />} />
        <Route path="/teacher/profile/:adminId" element={<TeacherProfile />} />
        <Route path="/teacher/audit" element={<AdminAuditPage />} />
        <Route path="/teacher/profile-edit-requests" element={<AdminProfileEditRequests />} />
        <Route path="/__internal/dev/error-logs" element={<DevErrorLogsPage />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/teacher/students" element={<TeacherStudentsPage />} />
        <Route path="/teacher/proctoring-dashboard" element={<TeacherProctoringDashboard />} />
        {/* Redirect all unknown routes to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
