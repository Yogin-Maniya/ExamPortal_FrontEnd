import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Container, Spinner, Alert, Card, Button, Badge } from "react-bootstrap";
import { FaArrowLeft, FaPoll, FaCalendarAlt, FaUserGraduate } from "react-icons/fa";

const ExamResultsPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResults = async () => {
      try {
        const res = await api.get(`/admin/admins/exam-results/${examId}`);
        setResults(res.data.examResults);
      } catch (err) {
        setError("Technical error while fetching results.");
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [examId]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-success text-white p-3 rounded-3"><FaPoll size={24}/></div>
          <h3 className="fw-bold mb-0">Student Scoreboard</h3>
        </div>
        <Button variant="outline-dark" className="rounded-pill px-4" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2"/> Back
        </Button>
      </div>

      {error ? <Alert variant="danger" className="rounded-3">{error}</Alert> : (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="py-3">Score Achieved</th>
                  <th className="py-3">Submission Timestamp</th>
                  <th className="py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-5 text-muted">No submissions found for this exam yet.</td></tr>
                ) : (
                  results.map((r, i) => (
                    <tr key={i}>
                      <td className="px-4 fw-bold text-dark"><FaUserGraduate className="me-2 text-primary" /> {r.StudentName}</td>
                      <td><Badge bg="primary" className="p-2 px-3 fs-6">{(r.Score).toFixed(1)} Marks</Badge></td>
                      <td className="text-muted small"><FaCalendarAlt className="me-1" /> {new Date(r.SubmittedAt).toLocaleString()}</td>
                      <td className="text-center"><Badge bg="success" pill>Submitted</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      )}
    </Container>
  );
};

export default ExamResultsPage;