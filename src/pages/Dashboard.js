import React, { useEffect, useState } from "react";
import { fetchStudentExams } from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  Spinner,
  Modal,
  Button,
  Container,
  Row,
  Col,
  Card,
  Alert,
  Badge,
} from "react-bootstrap";
import { jwtDecode } from "jwt-decode"; // fixed import
import "bootstrap/dist/css/bootstrap.min.css";
import { encryptId } from "../utils/encryption";  // 🔑 Import encryption

const Dashboard = () => {
  const navigate = useNavigate();
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [completedExams, setCompletedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      jwtDecode(token);
    } catch (err) {
      console.error("Error decoding token:", err);
      navigate("/login");
      return;
    }

    const loadExams = async () => {
      try {
        const response = await fetchStudentExams();
        setUpcomingExams(response.data?.upcomingExams || []);
        setCompletedExams(response.data?.completedExams || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exams:", error);
        setError("Failed to fetch exams.");
        setLoading(false);
      }
    };

    loadExams();
  }, [navigate]);

  const showDetails = (exam) => setSelectedExam(exam);
  const closePopup = () => setSelectedExam(null);

  // --- Render Logic ---
  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );

  if (error)
    return (
      <Container className="mt-5 text-center">
        <Alert variant="danger" className="shadow-sm">
          {error}
        </Alert>
      </Container>
    );

  return (
    <div className="bg-light min-vh-100">
      {/* Header */}
      <div className="bg-primary text-white p-5 mb-5 shadow-sm rounded-bottom">
        <Container>
          <h1 className="display-5 fw-light">👋 Welcome to Your Exam Hub</h1>
          <p className="lead">Check your schedule and track your completed exams.</p>
        </Container>
      </div>

      <Container className="py-4">
        <Row className="g-4">
          {/* Upcoming Exams */}
          <Col lg={6}>
            <h3 className="text-primary mb-4 border-bottom border-3 border-primary pb-2">
              🗓️ Upcoming Exams ({upcomingExams.length})
            </h3>
            {upcomingExams.length > 0 ? (
              upcomingExams.map((exam) => (
                <Card
                  className="mb-3 shadow-sm border-start border-5 border-primary"
                  key={exam.ExamId}
                >
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div>
                      <Card.Title className="h5 fw-bold text-dark">
                        {exam.ExamName}
                      </Card.Title>
                      <Card.Text className="text-muted small mb-0">
                        Starts: {new Date(exam.StartTime).toLocaleString()}
                      </Card.Text>
                    </div>

                    <div className="d-flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => showDetails(exam)}
                      >
                        Details
                      </Button>
                    <Button
  variant="primary"
  onClick={() => {
    const encryptedId = encryptId(exam.ExamId); // 🔒 Encrypt examId
    navigate(`/take-exam?examId=${encodeURIComponent(encryptedId)}`);
  }}
>
  Start
</Button>
                    </div>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <Alert variant="info" className="shadow-sm">
                🎉 No exams scheduled! You're all caught up.
              </Alert>
            )}
          </Col>

          {/* Completed Exams */}
          <Col lg={6}>
            <h3 className="text-secondary mb-4 border-bottom border-3 border-secondary pb-2">
              📚 Completed Exams ({completedExams.length})
            </h3>
            {completedExams.length > 0 ? (
              completedExams.map((exam) => (
                <Card
                  className="mb-3 shadow-sm bg-light border-start border-5 border-success"
                  key={exam.ExamId}
                >
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div>
                      <Card.Title className="h5 fw-normal text-dark">
                        {exam.ExamName}
                      </Card.Title>
                      <Card.Text className="text-muted small mb-0">
                        Completed: {new Date(exam.StartTime).toLocaleDateString()}
                      </Card.Text>
                    </div>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() =>
                        navigate(`/result`, { state: { examId: exam.ExamId } })
                      }
                    >
                      View Result
                    </Button>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <Alert variant="warning" className="shadow-sm">
                No completed exams to show.
              </Alert>
            )}
          </Col>
        </Row>
      </Container>

      {/* Exam Details Modal */}
      <Modal show={selectedExam !== null} onHide={closePopup} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>{selectedExam?.ExamName} Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedExam && (
            <div className="p-3 border rounded bg-light">
              <p className="d-flex justify-content-between mb-2">
                <strong>Total Marks:</strong>
                <Badge bg="info" className="text-dark">
                  {selectedExam.TotalMarks}
                </Badge>
              </p>
              <p className="d-flex justify-content-between mb-2">
                <strong>Duration:</strong>
                <Badge bg="warning" className="text-dark">
                  {selectedExam.DurationMinutes} minutes
                </Badge>
              </p>
              <p className="d-flex justify-content-between mb-2">
                <strong>Class/Subject:</strong>
                <span>{selectedExam.Class}</span>
              </p>
              <p className="d-flex justify-content-between mb-2">
                <strong>Start Time:</strong>
                <span>{new Date(selectedExam.StartTime).toLocaleString()}</span>
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closePopup}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
