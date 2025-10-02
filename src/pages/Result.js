import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserResults } from "../services/api";
import { jwtDecode } from "jwt-decode";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Card,
  Button,
  Badge,
  ButtonGroup,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Result = () => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all | passed | failed

  // -----------------------
  // Force history clear
  // -----------------------
  useEffect(() => {
    // Replace current page in history to remove previous pages
    window.location.replace(window.location.href);
  }, []);

  // -----------------------
  // Exit Fullscreen on load
  // -----------------------
  useEffect(() => {
    const exitFullscreen = async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if (document.webkitFullscreenElement) await document.webkitExitFullscreen();
        else if (document.mozFullScreenElement) await document.mozCancelFullScreen();
        else if (document.msFullscreenElement) await document.msExitFullscreen();
      } catch (err) {
        console.warn("Could not exit fullscreen automatically:", err);
      }
    };
    setTimeout(() => exitFullscreen(), 500);
  }, []);

  // -----------------------
  // Get studentId from token
  // -----------------------
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    try {
      const decoded = jwtDecode(token);
      if (!decoded.studentId) throw new Error("No studentId in token");
      setStudentId(decoded.studentId);
    } catch (err) {
      console.error("Invalid Token", err);
      setError("Invalid token. Please log in again.");
      setLoading(false);
    }
  }, [navigate]);

  // -----------------------
  // Fetch Results
  // -----------------------
  useEffect(() => {
    if (!studentId) return;

    const fetchResults = async () => {
      try {
        const response = await getUserResults(studentId);
        const sortedResults = Array.isArray(response.data)
          ? response.data.sort(
              (a, b) => new Date(b.SubmittedAt) - new Date(a.SubmittedAt)
            )
          : [];
        setResults(sortedResults);
      } catch (err) {
        console.error(err);
        setError("Failed to load results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [studentId]);

  // -----------------------
  // Result Card Component
  // -----------------------
  const ResultCard = ({ result }) => {
    const PASS_PERCENTAGE = 0.4;
    const requiredMarks = Math.ceil(result.TotalMarks * PASS_PERCENTAGE);
    const isPassed = result.Score >= requiredMarks;
    const percentage = ((result.Score / result.TotalMarks) * 100).toFixed(1);
    const statusVariant = isPassed ? "success" : "danger";
    const statusIcon = isPassed ? "✅" : "❌";

    return (
      <Card className={`mb-4 shadow-lg border-${statusVariant} border-3 h-100 w-100`}>
        <Card.Header
          className={`bg-${statusVariant} text-white d-flex justify-content-between align-items-center`}
        >
          <h5 className="mb-0 fw-bold">{result.ExamName}</h5>
          <Badge pill bg="light" className={`text-${statusVariant} p-2`}>
            {statusIcon} {isPassed ? "PASSED" : "FAILED"}
          </Badge>
        </Card.Header>
        <Card.Body>
          <Row className="g-2 text-center">
            <Col xs={6} md={3}>
              <Card className="bg-light h-100 p-2">
                <small className="text-muted">YOUR SCORE</small>
                <h4 className={`text-${statusVariant}`}>{result.Score}</h4>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="bg-light h-100 p-2">
                <small className="text-muted">TOTAL MARKS</small>
                <h4 className="text-secondary">{result.TotalMarks}</h4>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="bg-light h-100 p-2">
                <small className="text-muted">PASS REQUIREMENT</small>
                <h4 className="text-warning">{requiredMarks}</h4>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="bg-light h-100 p-2">
                <small className="text-muted">PERCENTAGE</small>
                <h4 className="text-info">{percentage}%</h4>
              </Card>
            </Col>
          </Row>
        </Card.Body>
        <Card.Footer className="text-end text-muted small bg-white">
          Submitted on: {new Date(result.SubmittedAt).toLocaleString()}
        </Card.Footer>
      </Card>
    );
  };

  // -----------------------
  // Filtered Results
  // -----------------------
  const filteredResults = results.filter((result) => {
    const requiredMarks = Math.ceil(result.TotalMarks * 0.4);
    const isPassed = result.Score >= requiredMarks;
    if (filter === "all") return true;
    if (filter === "passed") return isPassed;
    if (filter === "failed") return !isPassed;
    return true;
  });

  // -----------------------
  // Render
  // -----------------------
  return (
    <div className="bg-light min-vh-100">
      <div className="bg-primary text-white p-5 mb-4 shadow-sm rounded-bottom">
        <Container>
          <h1 className="display-5 fw-light">Exam Results Dashboard</h1>
          <p className="lead">
            Review your performance for all completed exams.
          </p>
        </Container>
      </div>

      <Container className="py-4">
        {loading && (
          <div className="text-center p-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Loading exam results...</p>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && results.length === 0 && (
          <Alert variant="warning">
            ⚠️ <strong>No results found.</strong> It looks like you haven't
            completed any exams yet.
          </Alert>
        )}

        {!loading && results.length > 0 && (
          <>
            <Alert variant="info" className="text-center mb-4 shadow-sm">
              <strong>Pass Criteria:</strong> A score of 40% or higher is
              required to pass.
            </Alert>

            <div className="text-center mb-4">
              <ButtonGroup>
                <Button
                  variant={filter === "all" ? "primary" : "outline-primary"}
                  onClick={() => setFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={filter === "passed" ? "success" : "outline-success"}
                  onClick={() => setFilter("passed")}
                >
                  Passed
                </Button>
                <Button
                  variant={filter === "failed" ? "danger" : "outline-danger"}
                  onClick={() => setFilter("failed")}
                >
                  Failed
                </Button>
              </ButtonGroup>
            </div>

            <Row>
              {filteredResults.map((result) => (
                <Col lg={6} key={result.ResultId} className="mb-4 d-flex">
                  <ResultCard result={result} />
                </Col>
              ))}
            </Row>

            <div className="text-center mt-4">
              <Button
                variant="outline-primary"
                onClick={() => navigate("/dashboard", { replace: true })}
              >
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
      </Container>
    </div>
  );
};

export default Result;
