import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_BASE_URL; // Replace with your actual API URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Register User
export const registerUser = async (userData) => {
  const response = await api.post("/students/register", userData);
  return response.data;
};
export const getAllFeedback = async (studentId) => {
  // This hits your backend endpoint: /api/feedback/AllFeedback/{studentId}
  const token = localStorage.getItem("token");
  return await api.get(`/feedback/AllFeedback/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
// ✅ Login User
export const loginUser = async (credentials) => {
  const { role, email, password } = credentials;

  let endpoint = "/students/login"; // Default for Student
  if (role === "Teacher") {
    endpoint = "/admin/admins/login";
  } else if (role === "Admin") {
    endpoint = "/admin/login";
  }

  const response = await api.post(endpoint, { email, password });
  
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  return response.data;
};

// ✅ Fetch Student Profile
export const getUserProfile = async (studentId) => {
  const token = localStorage.getItem("token");
  return await api.get(`/students/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ✅ Fetch Student's Upcoming & Completed Exams
export const fetchStudentExams = async () => {
  const token = localStorage.getItem("token");
  return await api.get("/students/my-exams", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ✅ Fetch all unique classes
export const fetchClasses = async () => {
  return await api.get("/exam/classes");
};

// ✅ Fetch exams by selected class (for admin or dropdown filtering)
export const fetchExamsByClass = async (className) => {
  return await api.get(`/exam/class/${className}`);
};

// ✅ Get all exams (admin view)
export const fetchExams = async () => {
  return await api.get("/exam/AllExams");
};

// Get Exam Details
export const getExamDetailsById = async (encryptedExamId) => {
  return await api.get(`/exam?examId=${encodeURIComponent(encryptedExamId)}`);
};

export const getExamDetails = async (encryptedExamId) => {
  return await api.get(`/questions?examId=${encodeURIComponent(encryptedExamId)}`);
};


// ✅ Submit Exam
export const submitExam = async (submissionData) => {
  return await api.post("/results/submit", submissionData);
};

// ✅ Get User Results
export const getUserResults = async (studentId) => {
  return await api.get(`/results/${studentId}`);
};

// ✅ Submit Feedback
export const submitFeedback = async (feedbackData) => {
  const token = localStorage.getItem("token");
  return await api.post("/feedback/submit", feedbackData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ✅ Submit Grievance
export const submitGrievance = async (grievanceData) => {
  return await api.post("/grievances/submit", grievanceData);
};

export default api;
