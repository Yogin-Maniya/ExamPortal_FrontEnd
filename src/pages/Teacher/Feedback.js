// AdminFeedbackPage.js
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Table, Spinner, Alert, Container, Card, Button } from "react-bootstrap";
import { FaComments, FaTrash } from "react-icons/fa";

const AdminFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null); // Track which feedback is deleting



  const getTokenHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  // Fetch all feedback
// top of your component
const fetchFeedbacks = React.useCallback(async () => {
  setLoading(true);
  setError("");
  try {
    const response = await api.get("/admin/feedback", {
      headers: getTokenHeader(),
    });
    setFeedbacks(response.data || []);
  } catch (err) {
    setError(err.response?.data?.error || "Failed to fetch feedback. Please try again.");
  }
  setLoading(false);
}, []); // no deps

useEffect(() => {
  fetchFeedbacks();
}, [fetchFeedbacks]);


  // Delete feedback
  const handleDelete = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;

    setDeletingId(feedbackId);
    try {
      await api.delete(`/admin/feedback/${feedbackId}`, {
        headers: getTokenHeader(),
      });

      // Remove from UI
      setFeedbacks((prev) =>
        prev.filter((fb) => fb.FeedbackId !== feedbackId)
      );
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Failed to delete feedback. Please try again."
      );
    }
    setDeletingId(null);
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>
        <Card className="shadow-lg border-0">
          <Card.Header className="bg-primary text-white">
            <h4 className="mb-0">
              <FaComments className="me-2" /> All Feedback from Students
            </h4>
          </Card.Header>
          <Card.Body className="p-0">
            {loading && (
              <div className="text-center p-4">
                <Spinner animation="border" variant="primary" />
              </div>
            )}

            {error && (
              <Alert variant="danger" className="m-3 text-center">
                {error}
              </Alert>
            )}

            {!loading && !error && feedbacks.length === 0 && (
              <Alert variant="info" className="m-3 text-center">
                No feedback available yet.
              </Alert>
            )}

            {!loading && feedbacks.length > 0 && (
              <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Feedback ID</th>
                      <th>Student ID</th>
                      <th>Message</th>
                      <th>Created At</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((fb) => (
                      <tr key={fb.FeedbackId}>
                        <td>{fb.FeedbackId}</td>
                        <td>{fb.StudentId}</td>
                        <td>{fb.Message}</td>
                        <td>{new Date(fb.CreatedAt).toLocaleString()}</td>
                        <td className="text-center">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(fb.FeedbackId)}
                            disabled={deletingId === fb.FeedbackId}
                          >
                            {deletingId === fb.FeedbackId ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <FaTrash />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default AdminFeedbackPage;
