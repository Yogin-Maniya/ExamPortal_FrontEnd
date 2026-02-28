import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BASE_URL;
// ======================================
// AXIOS INSTANCE
// ======================================

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ======================================
// AUTO JWT TOKEN (GLOBAL)
// ======================================

api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("authToken");
    const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFormData) {
      // Let browser/axios set multipart boundary automatically.
      if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    } else if (config.headers && !config.headers["Content-Type"] && !config.headers["content-type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(

  (res) => res,

  (error) => {
    if (error.config?.skipGlobalErrorHandler) {
      return Promise.reject(error);
    }

    const errObj = {
      message:
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message,
      status: error.response?.status
    };

    window.location.href = "/error";
    sessionStorage.setItem("app_error", JSON.stringify(errObj));

    return Promise.reject(error);
  }
);
// ======================================
// AUTH
// ======================================

export const registerUser = (data) =>
  api.post("/students/register", data, { skipGlobalErrorHandler: true });

export const loginUser = async (credentials) => {
  const { role, email, password } = credentials;

  let endpoint = "/students/login";

  if (role === "Teacher")
    endpoint = "/admin/admins/login";
  else if (role === "Admin")
    endpoint = "/admin/login";

  const res = await api.post(endpoint, { email, password }, { skipGlobalErrorHandler: true });

  if (res.data.token)
    localStorage.setItem("authToken", res.data.token);

  return res.data;
};

// ======================================
// STUDENT
// ======================================

export const getProctoringSummary = () =>
  api.get("/admin/proctoring/summary", { skipGlobalErrorHandler: true });

export const getProctoringCounts = () =>
  api.get("/admin/proctoring/counts", { skipGlobalErrorHandler: true });

export const deleteProctoringLog = (logId) =>
  api.delete(`/admin/proctoring/logs/${logId}`, { skipGlobalErrorHandler: true });

export const bulkDeleteProctoringLogs = (logIds) =>
  api.delete("/admin/proctoring/logs", { data: { logIds }, skipGlobalErrorHandler: true });

export const getUserProfile = (id) =>
  api.get(`/students/${id}`);

export const requestProfileEdit = (data) =>
  api.post("/students/request-profile-edit", data);

export const fetchStudentExams = () =>
  api.get("/students/my-exams");

export const getUserResults = (id) =>
  api.get(`/results/${id}`);

// ======================================
// EXAMS
// ======================================

export const fetchClasses = () =>
  api.get("/exam/classes");

export const fetchExams = () =>
  api.get("/exam/AllExams");

export const getExamDetailsById = (id) =>
  api.get(`/exam/${id}`);

export const getExamDetails = (examId) =>
  api.get(`/questions/${examId}`);

export const submitExam = (data) =>
  api.post("/results/submit-full", data);

// ======================================
// FEEDBACK
// ======================================

export const submitFeedback = (data) =>
  api.post("/feedback/submit", data);

export const getStudentFeedback = (studentId) =>
  api.get(`/feedback/AllFeedback/${studentId}`, { skipGlobalErrorHandler: true });

export const getAllFeedback = () =>
  api.get("/admin/feedback", { skipGlobalErrorHandler: true });

// ======================================
// PROFILE EDIT REQUESTS
// ======================================

export const getProfileEditRequests = () =>
  api.get("/admin/student/profile-edit-requests");

export const approveProfileEdit = (id) =>
  api.post(`/admin/student/approve-profile-edit/${id}`);

export const rejectProfileEdit = (id) =>
  api.post(`/admin/student/reject-profile-edit/${id}`);

// ======================================
// AUDIT
// ======================================

export const getAllStudents = () =>
  api.get("/admin/student/allstudent", { skipGlobalErrorHandler: true });

export const getAllExams = () =>
  api.get("/admin/exams", { skipGlobalErrorHandler: true });

export const getAuditSummary = (studentId, examId) => {

  let url = "/admin/exam-audit/audit-summary";
  const params = [];

  if (studentId) params.push(`studentId=${studentId}`);
  if (examId) params.push(`examId=${examId}`);

  if (params.length)
    url += "?" + params.join("&");

  return api.get(url, { skipGlobalErrorHandler: true });
};

export const getAuditDetail = (studentId, examId) =>
  api.get(`/admin/exam-audit/audit-detail?studentId=${studentId}&examId=${examId}`, { skipGlobalErrorHandler: true });

export const deleteAuditLog = (resultId) =>
  api.delete(`/admin/exam-audit/logs/${resultId}`, { skipGlobalErrorHandler: true });

export const bulkDeleteAuditLogs = (resultIds) =>
  api.delete("/admin/exam-audit/logs", { data: { resultIds }, skipGlobalErrorHandler: true });
// ======================================
// GRIEVANCE
// ======================================

export const getDeveloperErrorLogs = (devKey, limit = 100) =>
  api.get(`/admin/debug/error-logs?limit=${limit}`, {
    skipGlobalErrorHandler: true,
    headers: { "x-dev-key": devKey }
  });

export const submitGrievance = (data) =>
  api.post("/grievances/submit", data);
export default api;
