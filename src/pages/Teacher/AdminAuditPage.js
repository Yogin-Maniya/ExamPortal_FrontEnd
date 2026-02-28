// AdminAuditPage.js
import React, { useState, useCallback, useEffect } from "react";
import { getAllStudents, getAllExams, getAuditSummary, getAuditDetail, deleteAuditLog, bulkDeleteAuditLogs } from "../../services/api";
import { Container, Button, Modal, Spinner, Badge, Row, Col, Form, Card } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaHistory, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaLaptop, FaNetworkWired, FaTrashAlt } from "react-icons/fa";
import AdvancedPopup from "../../components/AdvancedPopup";

const AdminAuditPage = () => {
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [summary, setSummary] = useState([]);
  const [examDetail, setExamDetail] = useState(null);
  const [questionDetail, setQuestionDetail] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedResultIds, setSelectedResultIds] = useState([]);
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

  const loadFilterData = async () => {
    try {
      const studentRes = await getAllStudents();
      setStudents(studentRes.data);
      const examRes = await getAllExams();
      setExams(examRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadFilterData(); }, []);

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAuditSummary(selectedStudent, selectedExam);
      setSummary(res.data.data || []);
    } catch (err) {
      setPopup({
        show: true,
        type: "error",
        title: "Unable to Load Audit Logs",
        message: err?.response?.data?.error || "Failed to load audit summary.",
        confirmText: "Close",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
    } finally {
      setLoading(false);
    }
  }, [selectedStudent, selectedExam]);

  const loadDetail = async (studentId, examId) => {
    try {
      setShowModal(true);
      setDetailLoading(true);
      const res = await getAuditDetail(studentId, examId);
      setExamDetail(res.data.examDetail[0]);
      setQuestionDetail(res.data.questionDetail || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    setSelectedResultIds((prev) => prev.filter((id) => summary.some((row) => row.ResultId === id)));
  }, [summary]);

  const closePopup = () => {
    setPopup((prev) => (prev.loading ? prev : { ...prev, show: false }));
  };

  const showConfirmPopup = (title, message, onConfirm, confirmText = "Delete") => {
    setPopup({
      show: true,
      type: "confirm",
      title,
      message,
      confirmText,
      cancelText: "Cancel",
      showCancel: true,
      loading: false,
      onConfirm
    });
  };

  const runAuditDelete = async (ids) => {
    if (!ids.length) return;

    setPopup((prev) => ({ ...prev, loading: true }));

    try {
      if (ids.length === 1) {
        await deleteAuditLog(ids[0]);
      } else {
        await bulkDeleteAuditLogs(ids);
      }

      const deletedSet = new Set(ids);
      setSummary((prev) => prev.filter((row) => !deletedSet.has(row.ResultId)));
      setSelectedResultIds((prev) => prev.filter((id) => !deletedSet.has(id)));

      setPopup({
        show: true,
        type: "success",
        title: "Deleted Successfully",
        message: `${ids.length} audit log${ids.length > 1 ? "s" : ""} deleted.`,
        confirmText: "Great",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
    } catch (error) {
      setPopup({
        show: true,
        type: "error",
        title: "Delete Failed",
        message: error?.response?.data?.error || "Could not delete selected audit logs.",
        confirmText: "Close",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
    }
  };

  const toggleSelectResult = (resultId) => {
    setSelectedResultIds((prev) =>
      prev.includes(resultId)
        ? prev.filter((id) => id !== resultId)
        : [...prev, resultId]
    );
  };

  return (
    <Container className="py-5">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="fw-bold mb-4 d-flex align-items-center gap-2 text-dark">
          <FaHistory className="text-primary" /> Exam Audit Intelligence
        </h3>

        {/* Search Section */}
        <Card className="border-0 shadow-sm p-4 mb-5 bg-white" style={{ borderRadius: "15px" }}>
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label className="small fw-bold text-muted">Filter by Student</Form.Label>
              <Form.Select className="py-2 border-0 bg-light shadow-none" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                <option value="">All Students</option>
                {students.map(s => <option key={s.StudentId} value={s.StudentId}>{s.Name} (ID: {s.StudentId})</option>)}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="small fw-bold text-muted">Filter by Exam</Form.Label>
              <Form.Select className="py-2 border-0 bg-light shadow-none" value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
                <option value="">All Exams</option>
                {exams.map(e => <option key={e.ExamId} value={e.ExamId}>{e.ExamName}</option>)}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Button onClick={loadSummary} className="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-sm">
                <FaSearch size={14} /> Fetch Records
              </Button>
            </Col>
            <Col md={3}>
              <Button
                variant="danger"
                className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-sm"
                disabled={!selectedResultIds.length}
                onClick={() =>
                  showConfirmPopup(
                    "Delete Selected Audit Logs",
                    `This will permanently delete ${selectedResultIds.length} selected audit log(s). Continue?`,
                    () => runAuditDelete(selectedResultIds),
                    "Delete Selected"
                  )
                }
              >
                <FaTrashAlt size={14} /> Delete Selected ({selectedResultIds.length})
              </Button>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Loading & Results Grid */}
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <Row className="g-4">
          <AnimatePresence>
            {summary.map((row) => (
              <Col md={6} lg={4} key={row.ResultId}>
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} whileHover={{ y: -5 }}>
                  <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <Form.Check
                            type="checkbox"
                            aria-label={`Select audit ${row.ResultId}`}
                            checked={selectedResultIds.includes(row.ResultId)}
                            onChange={() => toggleSelectResult(row.ResultId)}
                          />
                          <Badge bg="primary" className="p-2 px-3 rounded-pill bg-opacity-10 text-primary">ID #{row.ResultId}</Badge>
                        </div>
                        <Badge bg={row.WarningCount > 2 ? "danger" : row.WarningCount > 0 ? "warning" : "success"} className="p-2 px-3 rounded-pill">
                          {row.WarningCount} Warnings
                        </Badge>
                      </div>
                      <h5 className="fw-bold mb-1">{row.StudentName}</h5>
                      <p className="text-muted small mb-3">{row.ExamName}</p>
                      
                      <div className="bg-light p-3 rounded-3 mb-3 d-flex justify-content-between">
                         <div className="text-center">
                            <small className="d-block text-muted fw-bold">SCORE</small>
                            <span className="fw-bold text-primary">{row.Score}/{row.TotalMarks}</span>
                         </div>
                         <div className="text-center">
                            <small className="d-block text-muted fw-bold">TYPE</small>
                            <Badge bg={row.SubmissionType === "Auto" ? "danger" : "success"}>{row.SubmissionType}</Badge>
                         </div>
                      </div>

                      <div className="d-flex flex-column gap-2 small text-muted mb-4">
                        <div className="d-flex align-items-center gap-2"><FaLaptop className="text-primary" /> {row.DeviceInfo}</div>
                        <div className="d-flex align-items-center gap-2"><FaNetworkWired className="text-primary" /> {row.IPAddress}</div>
                      </div>

                      <div className="d-flex gap-2">
                        <Button variant="outline-dark" className="w-100 fw-bold border-1 rounded-pill" onClick={() => loadDetail(row.StudentId, row.ExamId)}>
                          Explore Deep Audit
                        </Button>
                        <Button
                          variant="outline-danger"
                          className="fw-bold border-1 rounded-pill"
                          onClick={() =>
                            showConfirmPopup(
                              "Delete Audit Log",
                              "This audit log will be permanently deleted. Continue?",
                              () => runAuditDelete([row.ResultId])
                            )
                          }
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </AnimatePresence>
        </Row>
      )}

      {/* Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
        <Modal.Header closeButton className="bg-white border-0 px-4 pt-4">
          <Modal.Title className="fw-bold">Audit Intelligence Insights</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          {detailLoading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : examDetail && (
            <>
              <Row className="mb-4 g-3">
                <Col md={12}>
                  <div className="p-3 bg-light rounded-3 d-flex flex-wrap gap-4 align-items-center justify-content-between">
                    <div><small className="text-muted d-block fw-bold">STUDENT</small> {examDetail.StudentName}</div>
                    <div><small className="text-muted d-block fw-bold">EXAM</small> {examDetail.ExamName}</div>
                    <div><small className="text-muted d-block fw-bold">FINAL SCORE</small> <span className="fw-bold text-primary h4 mb-0">{examDetail.Score}</span></div>
                    <div><small className="text-muted d-block fw-bold">STATUS</small> <Badge bg="success">Verified Submission</Badge></div>
                  </div>
                </Col>
              </Row>

              {examDetail.WarningReasons && (
                <div className="p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3 mb-4">
                  <h6 className="text-danger fw-bold mb-2"><FaExclamationTriangle className="me-2" /> Integrity Warnings</h6>
                  {examDetail.WarningReasons.split("|").map((w, i) => (
                    <Badge key={i} bg="danger" className="me-2 mb-1 p-2">{w}</Badge>
                  ))}
                </div>
              )}

              <div className="table-responsive bg-white">
                <table className="table table-hover align-middle border">
                  <thead className="table-light">
                    <tr>
                      <th className="py-3 px-4">Question Description</th>
                      <th className="py-3">Attempted</th>
                      <th className="py-3">Correct Key</th>
                      <th className="py-3 text-center">Status</th>
                      <th className="py-3 text-center">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questionDetail.map(q => (
                      <tr key={q.QuestionId}>
                        <td className="px-4 fw-medium text-dark">{q.QuestionText}</td>
                        <td>{q.SelectedOption || <span className="text-muted italic">Skipped</span>}</td>
                        <td>{q.CorrectOption}</td>
                        <td className="text-center">
                          {q.IsCorrect ? 
                            <FaCheckCircle className="text-success fs-4" /> : 
                            <FaTimesCircle className="text-danger fs-4" />
                          }
                        </td>
                        <td className="text-center fw-bold">{q.MarksAwarded}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Modal.Body>
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
    </Container>
  );
};

export default AdminAuditPage;
