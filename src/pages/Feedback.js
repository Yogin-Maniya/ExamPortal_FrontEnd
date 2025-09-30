import React, { useState, useEffect } from "react";
import { submitFeedback, getAllFeedback } from "../services/api";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { 
    Spinner, 
    Alert, 
    Container, 
    Card, 
    Button, 
    ListGroup, 
    Form, 
    Row, 
    Col 
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaPaperPlane, FaHistory, FaCommentDots } from "react-icons/fa"; 

const Feedback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [fetchingFeedback, setFetchingFeedback] = useState(true);

  // ------------------------
  // Get Student ID from token
  // ------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      navigate("/login");
      return;
    }

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setStudentId(decoded.studentId);
      } catch (error) {
        console.error("Invalid Token", error);
      }
    }
  }, [navigate]);

  // ------------------------
  // Fetch previous feedback
  // ------------------------
  const fetchFeedbackData = async (id) => {
    setFetchingFeedback(true);
    try {
      const response = await getAllFeedback(id);
      const sortedFeedback = (response.data || []).sort(
        (a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt)
      );
      setFeedbackList(sortedFeedback);
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
    } finally {
      setFetchingFeedback(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchFeedbackData(studentId);
  }, [studentId]);

  // ------------------------
  // Submit new feedback
  // ------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });

    if (!studentId) {
      setAlert({ type: "danger", message: "Student ID is missing. Please log in again." });
      return;
    }

    if (!message.trim()) {
      setAlert({ type: "warning", message: "Feedback cannot be empty." });
      return;
    }

    setLoading(true);
    try {
      await submitFeedback({ studentId, message });
      setAlert({ type: "success", message: "🎉 Feedback submitted successfully!" });
      setMessage("");
      await fetchFeedbackData(studentId);
    } catch (error) {
      setAlert({ type: "danger", message: "Failed to submit feedback. Please check your network." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-primary mb-2">
            <FaCommentDots className="me-2" /> Share Your Voice
          </h1>
          <p className="lead text-secondary">
            Your feedback helps us improve our services.
          </p>
        </div>

        <Row className="justify-content-center g-4">
          {/* Submit Feedback Card */}
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0 h-100">
              <Card.Header className="bg-success text-white">
                <h4 className="mb-0 fw-normal">New Submission</h4>
              </Card.Header>
              <Card.Body className="d-flex flex-column justify-content-between">
                {alert.message && (
                  <Alert variant={alert.type} className="text-center mb-3">
                    {alert.message}
                  </Alert>
                )}
                <Form onSubmit={handleSubmit} className="flex-grow-1">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-muted">Your Message:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what you think, suggest an improvement, or report an issue..."
                      required
                    />
                  </Form.Group>
                  <Button 
                    type="submit" 
                    variant="success" 
                    className="w-100 fw-bold" 
                    disabled={loading || !studentId}
                  >
                    {loading ? (
                      <Spinner size="sm" animation="border" className="me-2" />
                    ) : (
                      <><FaPaperPlane className="me-2" /> Submit Feedback</>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Previous Feedback Card */}
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0 h-100">
              <Card.Header className="bg-secondary text-white">
                <h4 className="mb-0 fw-normal">
                  <FaHistory className="me-2" /> Submission History
                </h4>
              </Card.Header>
              <Card.Body className="p-0">
                {fetchingFeedback ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="secondary" className="mb-2" />
                    <p className="text-muted small">Loading history...</p>
                  </div>
                ) : feedbackList.length === 0 ? (
                  <Alert variant="light" className="m-3 text-center border-0">
                    You haven't submitted any feedback yet.
                  </Alert>
                ) : (
                  <ListGroup variant="flush">
                    {feedbackList.map((fb) => (
                      <ListGroup.Item 
                        key={fb.FeedbackId} 
                        action 
                        className="d-flex flex-column"
                      >
                        <p className="mb-1 text-dark fw-bold">
                          {fb.Message.length > 100 ? fb.Message.substring(0, 97) + '...' : fb.Message}
                        </p>
                        <small className="text-muted text-end">
                          Submitted: {new Date(fb.CreatedAt).toLocaleString()}
                        </small>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Footer Button */}
        <div className="text-center mt-5">
          <Button variant="outline-primary" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default Feedback;
