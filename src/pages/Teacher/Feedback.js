import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { Table, Spinner, Alert, Container, Card, Button, Badge } from "react-bootstrap";
import { FaComments, FaTrash, FaUserCircle, FaClock } from "react-icons/fa";
import AdvancedPopup from "../../components/AdvancedPopup";

const AdminFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [popup, setPopup] = useState({
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

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/admin/feedback");
      setFeedbacks(response.data || []);
    } catch (err) {
      setError("Failed to fetch feedback logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

  const handleDelete = async (feedbackId) => {
    setDeletingId(feedbackId);
    try {
      await api.delete(`/admin/feedback/${feedbackId}`);
      setFeedbacks(prev => prev.filter(fb => fb.FeedbackId !== feedbackId));
      setPopup({
        show: true,
        type: "success",
        title: "Deleted",
        message: "Feedback deleted successfully.",
        confirmText: "OK",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
    } catch (err) {
      setPopup({
        show: true,
        type: "error",
        title: "Delete Failed",
        message: "Delete failed.",
        confirmText: "Close",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
    } finally {
      setDeletingId(null);
    }
  };

  const closePopup = () => {
    setPopup((prev) => (prev.loading ? prev : { ...prev, show: false }));
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="bg-primary text-white p-3 rounded-3"><FaComments size={24}/></div>
          <h3 className="fw-bold mb-0">Student Feedback Hub</h3>
        </div>

        {error && <Alert variant="danger" className="rounded-4 text-center shadow-sm">{error}</Alert>}

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="bg-white border-bottom">
                <tr>
                  <th className="px-4 py-3 text-muted">USER ID</th>
                  <th className="py-3 text-muted">MESSAGE</th>
                  <th className="py-3 text-muted">POSTED ON</th>
                  <th className="py-3 text-center text-muted px-4">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan="4" className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
                ) : feedbacks.length === 0 ? (
                   <tr><td colSpan="4" className="text-center py-5 text-muted">No student feedback available.</td></tr>
                ) : (
                  feedbacks.map((fb) => (
                    <tr key={fb.FeedbackId}>
                      <td className="px-4"><Badge bg="light" className="text-dark border p-2"><FaUserCircle className="me-1"/> Student #{fb.StudentId}</Badge></td>
                      <td className="py-3" style={{ maxWidth: "400px" }}>
                        <div className="p-3 bg-light rounded-3 text-dark">{fb.Message}</div>
                      </td>
                      <td className="text-muted small"><FaClock className="me-1"/> {new Date(fb.CreatedAt).toLocaleString()}</td>
                      <td className="text-center px-4">
                        <Button
                          variant="link"
                          className="text-danger p-0"
                          onClick={() =>
                            setPopup({
                              show: true,
                              type: "confirm",
                              title: "Delete Feedback",
                              message: "Permanently delete this feedback?",
                              confirmText: "Delete",
                              cancelText: "Cancel",
                              showCancel: true,
                              loading: false,
                              onConfirm: () => handleDelete(fb.FeedbackId)
                            })
                          }
                          disabled={deletingId === fb.FeedbackId}
                        >
                          {deletingId === fb.FeedbackId ? <Spinner size="sm" /> : <FaTrash size={18} />}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card>

        <AdvancedPopup
          show={popup.show}
          type={popup.type}
          title={popup.title}
          message={popup.message}
          onClose={closePopup}
          onConfirm={popup.onConfirm || closePopup}
          confirmText={popup.confirmText}
          cancelText={popup.cancelText}
          showCancel={popup.showCancel}
          loading={popup.loading}
        />
      </Container>
    </div>
  );
};

export default AdminFeedbackPage;
