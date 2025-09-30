// CreateExamQuestions.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../services/api";

import {
  Spinner,
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  InputGroup,
  ProgressBar
} from "react-bootstrap";
import { FaPlus, FaSave, FaTrash, FaCheckCircle, FaQuestionCircle, FaListOl } from "react-icons/fa";

const CreateExamQuestions = () => {
  const [examId, setExamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState([{ questionText: "", options: ["", "", "", ""], correctOption: 0 }]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  // Fetch Last Exam ID
  const fetchLastExamId = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get("/exam/AllExams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.data || response.data.length === 0) throw new Error("No exams found. Please create an exam first.");
      const lastExam = response.data[response.data.length - 1];
      setExamId(lastExam.ExamId);
    } catch (err) {
      showMessage("error", err.response?.data?.error || err.message || "Failed to fetch exam ID.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLastExamId(); }, [fetchLastExamId]);

  // Show message with auto-close and progress bar
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setProgress(100);
    if (timerRef.current) clearInterval(timerRef.current);
    let time = 10;
    timerRef.current = setInterval(() => {
      time -= 0.1;
      setProgress((time / 10) * 100);
      if (time <= 0) {
        clearInterval(timerRef.current);
        setMessage({ type: "", text: "" });
      }
    }, 100);
  };

  // Handlers
  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].questionText = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    if (optionIndex >= newQuestions[qIndex].options.length) newQuestions[qIndex].options.push(value);
    else newQuestions[qIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectOptionChange = (qIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctOption = parseInt(value) - 1;
    setQuestions(newQuestions);
  };

  const addQuestion = () => setQuestions([...questions, { questionText: "", options: ["", "", "", ""], correctOption: 0 }]);
  const removeQuestion = (qIndex) => setQuestions(questions.filter((_, i) => i !== qIndex));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!examId) { showMessage("error", "Exam ID not available."); return; }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].questionText.trim()) { showMessage("error", `Question ${i + 1} text is required.`); return; }
      for (let j = 0; j < 4; j++) {
        if (!questions[i].options[j] || !questions[i].options[j].trim()) {
          showMessage("error", `Question ${i + 1}, Option ${j + 1} is required.`); return;
        }
      }
      const correctIndex = questions[i].correctOption;
      if (correctIndex < 0 || correctIndex >= questions[i].options.filter(o => o.trim() !== '').length) {
        showMessage("error", `Question ${i + 1}: Correct option invalid.`); return;
      }
    }

    try {
      setSaving(true);
      const payload = questions.map(q => ({
        questionText: q.questionText,
        options: q.options.filter(o => o.trim() !== ''),
        correctOption: q.correctOption
      }));
      const token = localStorage.getItem("authToken");
      await api.post(`/admin/question/${examId}/questions`, { questions: payload }, { headers: { Authorization: `Bearer ${token}` } });
      showMessage("success", `Added ${questions.length} questions to Exam ID: ${examId}!`);
      setQuestions([{ questionText: "", options: ["", "", "", ""], correctOption: 0 }]);
    } catch (err) {
      showMessage("error", err.response?.data?.error || "Failed to create exam questions.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="d-flex flex-column justify-content-center align-items-center bg-light" style={{ height: "100vh" }}>
      <Spinner animation="border" variant="primary" className="mb-3" />
      <span className="text-muted">Loading exam details...</span>
    </div>
  );

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Header */}
      <div className="bg-success text-white p-4 mb-5 shadow-sm rounded-bottom">
        <Container>
          <h1 className="display-6 fw-bold"><FaListOl className="me-3" /> Exam Question Editor</h1>
          <p className="lead mb-0">Adding questions for Exam ID: <Badge bg="light" text="success">{examId || 'N/A'}</Badge></p>
        </Container>
      </div>

      {/* Message */}
      {message.text && (
        <div style={{ position: "fixed", top: "20px", right: "2%", zIndex: 9999, minWidth: "300px" }}>
          <div className={`alert alert-${message.type === "error" ? "danger" : "success"} mb-0 p-2`} role="alert">
            {message.text}
            <ProgressBar now={progress} variant={message.type === "error" ? "danger" : "success"} style={{ height: "4px" }} />
          </div>
        </div>
      )}

      {/* Saving Overlay */}
      {saving && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(255,255,255,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9998 }}>
          <Spinner animation="border" variant="primary" style={{ width: "4rem", height: "4rem" }} />
        </div>
      )}

      <Container>
        <Form onSubmit={handleSubmit}>
          {questions.map((q, qIndex) => (
            <Card key={qIndex} className="mb-4 shadow-lg border-0">
              <Card.Header className="bg-light d-flex justify-content-between align-items-center p-3">
                <h4 className="mb-0 text-primary fw-bold"><FaQuestionCircle className="me-2" /> Question {qIndex + 1}</h4>
                {questions.length > 1 && <Button variant="outline-danger" size="sm" onClick={() => removeQuestion(qIndex)}><FaTrash className="me-1" /> Remove</Button>}
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold fs-5 text-dark">Question Text</Form.Label>
                  <Form.Control as="textarea" rows={2} placeholder="Enter the question..." value={q.questionText} onChange={(e) => handleQuestionChange(qIndex, e.target.value)} required />
                </Form.Group>

                <Row className="g-3 mb-4">
                  <Col xs={12}><h5 className="text-secondary mb-3">Answer Options (Min. 4 required)</h5></Col>
                  {q.options.map((option, optionIndex) => (
                    <Col md={6} key={optionIndex}>
                      <InputGroup>
                        <InputGroup.Text className={q.correctOption === optionIndex ? "bg-success text-white fw-bold" : "bg-light"}>
                          {q.correctOption === optionIndex ? <FaCheckCircle /> : `${optionIndex + 1}.`}
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder={`Option ${optionIndex + 1} ${optionIndex >= 4 ? "(Optional)" : ""}`}
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, optionIndex, e.target.value)}
                          required={optionIndex < 4}
                          className={q.correctOption === optionIndex ? "border-success border-3" : ""}
                        />
                      </InputGroup>
                    </Col>
                  ))}
                  {/* Add new optional option button */}
                  <Col xs={12}><Button variant="outline-secondary" size="sm" onClick={() => handleOptionChange(qIndex, q.options.length, "")}><FaPlus className="me-1" /> Add Option</Button></Col>
                </Row>

                <Row className="align-items-center">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold text-success">Select Correct Option Number</Form.Label>
                      <Form.Control as="select" value={q.correctOption + 1} onChange={(e) => handleCorrectOptionChange(qIndex, e.target.value)} className="border-success">
                        {q.options.map((_, index) => q.options[index].trim() !== '' ? <option key={index} value={index + 1}>{index + 1}</option> : null)}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mt-3 mt-md-0">
                    <div className="alert alert-info mb-0 text-center py-2">Currently Correct: <Badge bg="success">{q.correctOption + 1}</Badge></div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}

          <Row className="g-3 mb-5">
            <Col xs={12} md={6}>
              <Button type="button" variant="secondary" onClick={addQuestion} className="w-100 py-2 shadow-sm"><FaPlus className="me-2" /> Add Another Question ({questions.length})</Button>
            </Col>
            <Col xs={12} md={6}>
              <Button type="submit" variant="success" className="w-100 py-2 shadow-lg" disabled={saving || questions.length === 0}><FaSave className="me-2" /> Save All Questions</Button>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default CreateExamQuestions;
