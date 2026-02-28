import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Spinner,Container, Card, Button, Table, Modal, Badge, Form, Row, Col } from "react-bootstrap";
import { FaPlus, FaChalkboardTeacher, FaRegListAlt, FaEdit, FaEye, FaInfoCircle, FaTrash } from "react-icons/fa";
import AdvancedPopup from "../../components/AdvancedPopup";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  // Form State
  const [examName, setExamName] = useState("");
  const [className, setClassName] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [startTime, setStartTime] = useState("");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/admins/dashboard");
      setExams(res.data.exams || []);
    } catch {
      setError("Failed to sync dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get("/exam/classes");
      setClasses(res.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchDashboardData();
    fetchClasses();
  }, [fetchDashboardData]);

  const createExam = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const decoded = jwtDecode(token);
      const start = new Date(startTime);
      const end = new Date(start.getTime() + Number(durationMinutes) * 60000);

      const res = await api.post("/admin/exams/create", {
        examName, className,
        totalMarks: Number(totalMarks),
        durationMinutes: Number(durationMinutes),
        startTime: start,
        endTime: end,
        adminId: decoded.adminId
      });

      setShowCreateModal(false);
      navigate(`/teacher/create-exam/${res.data.ExamId}`);
    } catch (err) {
      setPopup({
        show: true,
        type: "error",
        title: "Create Failed",
        message: err.response?.data?.error || "Error creating exam session.",
        confirmText: "Close",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
    }
  };

  const closePopup = () => {
    setPopup((prev) => (prev.loading ? prev : { ...prev, show: false }));
  };

  const deleteExam = async (examId) => {
    try {
      setPopup((prev) => ({ ...prev, loading: true }));
      await api.delete(`/admin/exams/${examId}`);
      await fetchDashboardData();
      setPopup({
        show: true,
        type: "success",
        title: "Deleted",
        message: "Exam deleted successfully.",
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
        message: err.response?.data?.error || "Unable to delete exam.",
        confirmText: "Close",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <div className="bg-white border-bottom py-4 shadow-sm mb-4">
        <Container className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary text-white p-3 rounded-circle shadow-sm">
              <FaChalkboardTeacher size={24} />
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-dark">Teacher Dashboard</h3>
              <p className="text-muted small mb-0">Management Center for Academic Exams</p>
            </div>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2 py-2">
            <FaPlus /> <span>New Exam Session</span>
          </Button>
        </Container>
      </div>

      <Container>
        {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div> : (
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white border-0 pt-4 px-4 d-flex justify-content-between">
               <h5 className="fw-bold"><FaRegListAlt className="me-2 text-primary" /> Active Exams</h5>
               <Badge bg="primary" pill className="p-2 px-3">{exams.length} Total</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="align-middle mb-0 mt-2">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3">Exam Module Name</th>
                    <th className="py-3">Grade/Class</th>
                    <th className="py-3 text-center px-4">Management Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map(exam => (
                    <tr key={exam.ExamId}>
                      <td className="px-4 fw-bold text-dark">{exam.ExamName}</td>
                      <td><Badge bg="info" pill className="px-3 text-white">Class {exam.Class}</Badge></td>
                      <td className="text-center px-4">
                        <div className="d-flex gap-2 justify-content-center">
                          <Button variant="light" size="sm" title="Edit Questions" className="text-primary border shadow-sm" onClick={() => navigate(`/teacher/exam/${exam.ExamId}/edit`)}>
                            <FaEdit />
                          </Button>
                          <Button variant="light" size="sm" title="Specifications" className="text-info border shadow-sm" onClick={() => navigate(`/teacher/exam/${exam.ExamId}/details`)}>
                            <FaInfoCircle />
                          </Button>
                          <Button variant="light" size="sm" title="Results" className="text-success border shadow-sm" onClick={() => navigate(`/teacher/exam/${exam.ExamId}/results`)}>
                            <FaEye />
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            title="Delete"
                            className="text-danger border shadow-sm"
                            onClick={() =>
                              setPopup({
                                show: true,
                                type: "confirm",
                                title: "Delete Exam",
                                message: "This will delete exam and student results. Continue?",
                                confirmText: "Delete",
                                cancelText: "Cancel",
                                showCancel: true,
                                loading: false,
                                onConfirm: () => deleteExam(exam.ExamId)
                              })
                            }
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </Container>

      {/* CREATE MODAL */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered contentClassName="border-0 rounded-4 shadow-lg overflow-hidden">
        <Modal.Header closeButton className="bg-primary text-white py-3 border-0">
          <Modal.Title className="fw-bold"><FaPlus className="me-2"/> Initialize New Exam</Modal.Title>
        </Modal.Header>
        <Form onSubmit={createExam}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Exam Name</Form.Label>
              <Form.Control required placeholder="e.g. Midterm 2024" value={examName} onChange={e => setExamName(e.target.value)} className="bg-light border-0 py-2 shadow-none" />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Select Class</Form.Label>
              <Form.Select required value={className} onChange={e => setClassName(e.target.value)} className="bg-light border-0 py-2 shadow-none">
                <option value="">Choose...</option>
                {classes.map((c,i)=>(<option key={i} value={c}>{c}</option>))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Total Marks</Form.Label>
                  <Form.Control type="number" required value={totalMarks} onChange={e => setTotalMarks(e.target.value)} className="bg-light border-0 py-2 shadow-none" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Duration (Mins)</Form.Label>
                  <Form.Control type="number" required value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} className="bg-light border-0 py-2 shadow-none" />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-bold">Schedule Start Time</Form.Label>
              <Form.Control type="datetime-local" required value={startTime} onChange={e => setStartTime(e.target.value)} className="bg-light border-0 py-2 shadow-none" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-light border-0 px-4 py-3">
            <Button variant="secondary" className="rounded-pill px-4" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="rounded-pill px-4 fw-bold">Launch Session</Button>
          </Modal.Footer>
        </Form>
      </Modal>

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
    </div>
  );
};

export default TeacherDashboard;
