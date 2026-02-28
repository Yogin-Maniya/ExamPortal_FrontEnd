import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Container, Spinner, Button, Row, Col } from "react-bootstrap";
import { FaArrowLeft, FaClock, FaTrophy, FaLayerGroup, FaClipboardCheck } from "react-icons/fa";

const ExamDetailsPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);

  useEffect(() => {
    api.get(`/admin/exams/${examId}`).then(res => setExam(res.data));
  }, [examId]);

  if (!exam) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container className="py-5">
      <Button variant="link" className="text-decoration-none text-muted mb-3 p-0" onClick={() => navigate(-1)}>
        <FaArrowLeft className="me-2" /> Back to Dashboard
      </Button>
      
      <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
        <Card.Header className="bg-primary text-white py-4 px-4 border-0">
          <div className="d-flex align-items-center gap-3">
            <FaClipboardCheck size={30} />
            <h4 className="mb-0 fw-bold">Exam Specification</h4>
          </div>
        </Card.Header>
        <Card.Body className="p-4 p-md-5">
          <Row className="g-4">
            <Col md={6}>
              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                <div className="bg-white p-2 rounded shadow-sm text-primary"><FaLayerGroup /></div>
                <div>
                  <small className="text-muted d-block fw-bold">EXAM NAME</small>
                  <span className="h5 mb-0 fw-bold text-dark">{exam.ExamName}</span>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                <div className="bg-white p-2 rounded shadow-sm text-primary"><FaTrophy /></div>
                <div>
                  <small className="text-muted d-block fw-bold">TOTAL MARKS</small>
                  <span className="h5 mb-0 fw-bold text-dark">{exam.TotalMarks} Points</span>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                <div className="bg-white p-2 rounded shadow-sm text-primary"><FaClock /></div>
                <div>
                  <small className="text-muted d-block fw-bold">DURATION</small>
                  <span className="h5 mb-0 fw-bold text-dark">{exam.DurationMinutes} Minutes</span>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                <div className="bg-white p-2 rounded shadow-sm text-primary"><FaLayerGroup /></div>
                <div>
                  <small className="text-muted d-block fw-bold">ASSIGNED CLASS</small>
                  <span className="h5 mb-0 fw-bold text-dark">Class {exam.Class}</span>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ExamDetailsPage;