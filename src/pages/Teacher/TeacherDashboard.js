// TeacherDashboard.js
import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  Spinner,
  Alert,
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Badge,
  ListGroup,
} from "react-bootstrap";
import {
  FaPlus,
  FaChalkboardTeacher,
  FaRegListAlt,
  FaEdit,
  FaEye,
  FaUsers,
  FaInfoCircle,
  FaClock,
  FaHashtag,
  FaCalendarAlt,
  FaTrash,
} from "react-icons/fa";
import CreateExamModal from "../../components/CreateExamModal";

const TeacherDashboard = () => {
  const [exams, setExams] = useState([]);
  const [selectedExamResults, setSelectedExamResults] = useState(null);
  const [selectedExamDetails, setSelectedExamDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();



  const getTokenHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/admin/admins/dashboard`, {
        headers: getTokenHeader(),
      });
      setExams(response.data.exams || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/login");
        return;
      }
      setError(err.response?.data?.error || "Failed to load dashboard data.");
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchDashboardData();
  }, [navigate, fetchDashboardData]);

  // Fetch exam results
  const fetchExamResults = useCallback(async (examId, examName) => {
    setLoading(true);
    setError("");
    setSelectedExamResults(null);
    try {
      const response = await api.get(`/admin/admins/exam-results/${examId}`, {
        headers: getTokenHeader(),
      });
      setSelectedExamResults({
        examName,
        results: response.data.examResults || [],
      });
      setShowResultsModal(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load exam results.");
    }
    setLoading(false);
  }, []);

  // Fetch exam details
  const fetchExamDetails = useCallback(async (examId) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/admin/exams/${examId}`, {
        headers: getTokenHeader(),
      });
      setSelectedExamDetails(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load exam details.");
    }
    setLoading(false);
  }, []);

  // Delete exam
  const deleteExam = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam? This action cannot be undone.")) return;
    try {
      setLoading(true);
      await api.delete(`/admin/exams/${examId}`, { headers: getTokenHeader() });
      setExams(exams.filter((e) => e.ExamId !== examId));
      alert("Exam deleted successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete exam.");
    } finally {
      setLoading(false);
    }
  };

  // Handle exam creation
  const handleExamCreated = (examId) => {
    setShowCreateExamModal(false);
    fetchDashboardData();
    navigate(`/create-exam/${examId}`);
  };

  const StatusDisplay = ({ isLoading, isError }) => {
    if (isLoading)
      return (
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Loading dashboard data...</p>
        </div>
      );
    if (isError) return <Alert variant="danger">{isError}</Alert>;
    return null;
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Header */}
      <div className="bg-primary text-white p-5 mb-5 shadow-sm rounded-bottom">
        <Container>
          <h1 className="display-5 fw-light mb-2">
            <FaChalkboardTeacher className="me-3" /> Teacher Dashboard
          </h1>
          <p className="lead">
            Manage exams, monitor student submissions, and analyze results.
          </p>
          <Button
            variant="light"
            size="lg"
            className="mt-3 fw-bold shadow-sm text-primary"
            onClick={() => setShowCreateExamModal(true)}
          >
            <FaPlus className="me-2" /> Create New Exam
          </Button>
        </Container>
      </div>

      <Container>
        <StatusDisplay isLoading={loading} isError={error} />

        <Row className="g-4">
          <Col lg={12}>
            <Card className="shadow-lg border-0">
              <Card.Header className="bg-primary text-white">
                <h4 className="mb-0">
                  <FaRegListAlt className="me-2" /> All Exams
                </h4>
              </Card.Header>
              <Card.Body className="p-0">
                {exams.length === 0 && !loading ? (
                  <Alert variant="info" className="m-3 text-center">
                    No exams found. Use the button above to create one!
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Exam Name</th>
                          <th className="text-center">Class</th>
                          <th className="text-center">Submissions</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exams.map((exam) => (
                          <tr key={exam.ExamId}>
                            <td>{exam.ExamName}</td>
                            <td className="text-center">
                              <Badge bg="secondary">{exam.Class}</Badge>
                            </td>
                            <td className="text-center">
                              <Badge bg="info" text="dark">
                                {exam.submissionCount || 0}/
                                {exam.totalStudents || "N/A"}
                              </Badge>
                            </td>
                            <td className="text-end">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                title="Edit Exam Questions"
                                onClick={() =>
                                  navigate(`/edit-exam/${exam.ExamId}`)
                                }
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                                title="View Exam Details"
                                onClick={() => fetchExamDetails(exam.ExamId)}
                              >
                                <FaInfoCircle />
                              </Button>
                              <Button
                                variant="success"
                                size="sm"
                                className="me-2"
                                title="View Student Results"
                                onClick={() =>
                                  fetchExamResults(exam.ExamId, exam.ExamName)
                                }
                              >
                                <FaEye /> Results
                              </Button>
                              {/* Delete Button */}
                              <Button
                                variant="outline-danger"
                                size="sm"
                                title="Delete Exam"
                                onClick={() => deleteExam(exam.ExamId)}
                              >
                                <FaTrash />
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
          </Col>
        </Row>
      </Container>

      {/* Create Exam Modal */}
      {showCreateExamModal && (
        <CreateExamModal
          onClose={() => setShowCreateExamModal(false)}
          onExamCreated={handleExamCreated}
        />
      )}

      {/* Results Modal */}
      <Modal
        show={showResultsModal}
        onHide={() => setShowResultsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FaUsers className="me-2" /> Results for:{" "}
            {selectedExamResults?.examName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedExamResults?.results.length === 0 ? (
            <Alert variant="warning" className="text-center m-3">
              No submissions yet for this exam.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Student Name</th>
                    <th className="text-center">Score</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedExamResults?.results.map((result, idx) => (
                    <tr key={idx}>
                      <td>{result.StudentName}</td>
                      <td className="text-center">
                        <Badge
                          pill
                          bg={result.Score > 50 ? "success" : "warning"}
                          text={result.Score > 50 ? "white" : "dark"}
                        >
                          {result.Score}
                        </Badge>
                      </td>
                      <td>
                        {new Date(result.SubmittedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowResultsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Detail Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="md"
        centered
      >
        <Modal.Header closeButton className="bg-secondary text-white">
          <Modal.Title>
            <FaInfoCircle className="me-2" /> Exam Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedExamDetails ? (
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Exam Name:</strong> {selectedExamDetails.ExamName}
              </ListGroup.Item>
              <ListGroup.Item>
                <FaHashtag className="me-2 text-muted" /> <strong>Class:</strong>{" "}
                {selectedExamDetails.Class}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Total Marks:</strong>{" "}
                <Badge bg="primary">{selectedExamDetails.TotalMarks}</Badge>
              </ListGroup.Item>
              <ListGroup.Item>
                <FaClock className="me-2 text-muted" /> <strong>Duration:</strong>{" "}
                {selectedExamDetails.DurationMinutes} mins
              </ListGroup.Item>
              <ListGroup.Item>
                <FaCalendarAlt className="me-2 text-muted" /> <strong>Start Time:</strong>{" "}
                {new Date(selectedExamDetails.StartTime).toLocaleString()}
              </ListGroup.Item>
              <ListGroup.Item>
                <FaCalendarAlt className="me-2 text-muted" /> <strong>End Time:</strong>{" "}
                {new Date(selectedExamDetails.EndTime).toLocaleString()}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Created:</strong>{" "}
                {new Date(selectedExamDetails.CreatedAt).toLocaleDateString()}
              </ListGroup.Item>
            </ListGroup>
          ) : (
            <Alert variant="info" className="text-center">
              No details available.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TeacherDashboard;
