import React, { useState } from "react";
import api from "../../services/api";

const CreateExamModal = ({ onClose, onExamCreated }) => {
  const [examName, setExamName] = useState("");
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // show spinner

    try {
      const token = localStorage.getItem("authToken");

      // create exam
      await api.post(
        "/exam/create",
        { ExamName: examName, Class: className },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // fetch all exams to get the last one
      const response = await api.get("/exam/AllExams", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const exams = response.data;
      if (!exams || exams.length === 0) throw new Error("No exams found");

      const newExamId = exams[exams.length - 1].ExamId; // last exam

      // pass examId to dashboard for navigation
      onExamCreated(newExamId);
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || err.message || "Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog">
        <div className="modal-content p-4">
          <h5>Create Exam</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Exam Name</label>
              <input
                type="text"
                className="form-control"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label>Class</label>
              <input
                type="text"
                className="form-control"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
              />
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating...
                  </>
                ) : (
                  "Create Exam"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateExamModal;
