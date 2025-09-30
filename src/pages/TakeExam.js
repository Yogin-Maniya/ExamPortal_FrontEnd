import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExamDetailsById, getExamDetails, submitExam } from "../services/api";
import { jwtDecode } from "jwt-decode";
import { Container, Card, Button, Spinner, Form, Modal, ProgressBar, Row, Col, Alert } from "react-bootstrap";
import './CSS/TakeExam.css';

// ======================
// 🚀 Custom Hook: Exam Timer
// ======================
const useExamTimer = (initialTime, examStarted, handleSubmit) => {
  const { examId } = useParams();
  const [timeLeft, setTimeLeft] = useState(initialTime);

  // load from localStorage if exists
  useEffect(() => {
    const storedTime = localStorage.getItem(`timeLeft-${examId}`);
    if (storedTime) setTimeLeft(parseInt(storedTime, 10));
    else setTimeLeft(initialTime);
  }, [examId, initialTime]);

  useEffect(() => {
    if (!examStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        localStorage.setItem(`timeLeft-${examId}`, newTime.toString());
        if (newTime <= 0) {
          clearInterval(timer);
          handleSubmit(true); // Auto-submit
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, handleSubmit, examId, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${minutes < 10 ? '0' : ''}${minutes}m : ${seconds < 10 ? '0' : ''}${seconds}s`;

  return { timeLeft, timeDisplay };
};

// ======================
// ⚙️ Submitting Overlay
// ======================
const SubmittingOverlay = () => (
  <div className="submission-overlay">
    <div className="submission-content">
      <Spinner animation="border" variant="light" className="submission-spinner" />
      <h2 className="text-white mt-3">Submitting Exam...</h2>
      <p className="text-light">Please do not close or refresh your browser.</p>
    </div>
  </div>
);

// ======================
// 📝 Main Component
// ======================
const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentId, setStudentId] = useState(null);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [totalMarks, setTotalMarks] = useState(0);
  const [marksPerQuestion, setMarksPerQuestion] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [blurCount, setBlurCount] = useState(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [warning, setWarning] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const [examStarted, setExamStarted] = useState(false);

  const [examDurationSeconds, setExamDurationSeconds] = useState(0); // dynamic duration

  const MIN_WIDTH = 1024;
  const MIN_HEIGHT = 600;

  // ---------------------
  // Fullscreen Helpers
  // ---------------------
  const isFullScreen = () =>
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;

  const enterFullScreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
    setShowRecoveryModal(false);
  }, []);

  // ---------------------
  // Handle Option Change
  // ---------------------
  const handleOptionChange = useCallback((questionId, option) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [questionId]: option };
      localStorage.setItem(`answers-${examId}`, JSON.stringify(newAnswers));
      return newAnswers;
    });
  }, [examId]);

  // ---------------------
  // Submit Exam
  // ---------------------
  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (!studentId || questions.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setShowRecoveryModal(false);

    const score = questions.reduce((total, q) => {
      const selected = answers[q.QuestionId];
      if (selected && selected === q[`Option${q.CorrectOption}`]) return total + marksPerQuestion;
      return total;
    }, 0);

    try {
      await submitExam({ studentId, examId, score, answers, isAutoSubmit });
      localStorage.removeItem(`timeLeft-${examId}`);
      localStorage.removeItem(`answers-${examId}`);
      navigate(`/result`);
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Error submitting the exam. Please check your network.");
      setIsSubmitting(false);
    }
  }, [answers, examId, marksPerQuestion, navigate, questions, studentId, isSubmitting]);

  // ---------------------
  // Timer Hook (dynamic)
  // ---------------------
  const { timeLeft, timeDisplay } = useExamTimer(examDurationSeconds, examStarted, handleSubmit);

  // ---------------------
  // Auth + Fetch Data
  // ---------------------
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return navigate("/login");

    try {
      const decoded = jwtDecode(token);
      if (!decoded.studentId) throw new Error("Invalid token");
      setStudentId(decoded.studentId);

      const storedAnswers = localStorage.getItem(`answers-${examId}`);
      if (storedAnswers) setAnswers(JSON.parse(storedAnswers));
    } catch {
      localStorage.removeItem("authToken");
      navigate("/login");
    }
  }, [navigate, examId]);

  useEffect(() => {
    if (!studentId) return;
    const fetchExamData = async () => {
      try {
        const examResponse = await getExamDetailsById(examId);
        const questionResponse = await getExamDetails(examId);

        if (!examResponse.data || !questionResponse.data?.length) {
          setError("No questions available for this exam.");
          return;
        }

        const totalQ = questionResponse.data.length;
        const marksEach = totalQ > 0 ? examResponse.data.TotalMarks / totalQ : 0;

        setTotalMarks(examResponse.data.TotalMarks);
        setMarksPerQuestion(marksEach);
        setQuestions(questionResponse.data);

        // 🔹 Set dynamic duration in seconds from backend field DurationMinutes
        const durationSeconds = examResponse.data.DurationMinutes * 60;
        setExamDurationSeconds(durationSeconds);

      } catch {
        setError("Failed to fetch exam data.");
      } finally {
        setLoading(false);
      }
    };
    fetchExamData();
  }, [examId, studentId]);

  // ---------------------
  // Anti-Cheating
  // ---------------------
  // Online/offline
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Blur/tab switching
  useEffect(() => {
    const handleBlur = () => { if (examStarted) setBlurCount(prev => prev + 1); };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [examStarted]);

  useEffect(() => {
    if (blurCount === 1) setWarning("⚠️ Warning: Do not switch tabs!");
    else if (blurCount === 2) setWarning("🚨 Second Warning: Last chance!");
    else if (blurCount >= 3) {
      setWarning("⛔ Auto-Submission triggered: Too many tab switches!");
      handleSubmit(true);
    }
  }, [blurCount, handleSubmit]);

  // Fullscreen / Connectivity Check
  useEffect(() => {
    const checkState = () => {
      if (!examStarted) return;
      const currentlyFullscreen = isFullScreen();
      if ((online && !currentlyFullscreen) || !online) setShowRecoveryModal(true);
      else setShowRecoveryModal(false);

      if (!currentlyFullscreen && examStarted && !showRecoveryModal) {
        setFullscreenExitCount(prev => prev + 1);
        if (fullscreenExitCount === 0) setWarning("You exited fullscreen!");
        else handleSubmit(true);
      }
    };
    document.addEventListener("fullscreenchange", checkState);
    window.addEventListener("online", checkState);
    window.addEventListener("offline", checkState);

    return () => {
      document.removeEventListener("fullscreenchange", checkState);
      window.removeEventListener("online", checkState);
      window.removeEventListener("offline", checkState);
    };
  }, [examStarted, fullscreenExitCount, handleSubmit, online, showRecoveryModal]);

  // Resize
  useEffect(() => {
    const handleResize = () => {
      if (!examStarted) return;
      if (window.innerWidth < MIN_WIDTH || window.innerHeight < MIN_HEIGHT) {
        setWarning("⛔ Auto-Submission: Screen size too small!");
        handleSubmit(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [examStarted, handleSubmit]);

  // Prevent cheating keys
  useEffect(() => {
    const preventKeys = e => {
      if (["F12", "ContextMenu"].includes(e.key) ||
        (e.ctrlKey && ["u","s","i"].includes(e.key)) ||
        (e.metaKey && ["u","s","i"].includes(e.key))) e.preventDefault();
    };
    window.addEventListener("keydown", preventKeys);
    window.addEventListener("contextmenu", e => e.preventDefault());
    return () => {
      window.removeEventListener("keydown", preventKeys);
      window.removeEventListener("contextmenu", e => e.preventDefault());
    };
  }, []);

  // ---------------------
  // Exam Navigation
  // ---------------------
  const startExam = () => { enterFullScreen(); setExamStarted(true); setWarning(""); };
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  const currentQuestionNumber = currentQuestionIndex + 1;

  const getQuestionStatusVariant = index => {
    const questionId = questions[index]?.QuestionId;
    if (index === currentQuestionIndex) return "primary";
    if (answers[questionId]) return "success";
    return "secondary";
  };

  // ---------------------
  // Render
  // ---------------------
  if (isSubmitting) return <SubmittingOverlay />;

  if (loading) return (
    <Container className="text-center mt-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2">Loading exam data...</p>
    </Container>
  );

  if (error) return (
    <Container className="text-center mt-5">
      <Alert variant="danger">{error}</Alert>
      <Button variant="secondary" onClick={() => navigate("/")}>Go Home</Button>
    </Container>
  );

  if (!examStarted) return (
    <Container className="text-center mt-5 p-4 bg-light rounded shadow-sm">
      <h2 className="text-primary mb-4">Exam Rules & Instructions</h2>
      <ul className="text-start mx-auto" style={{ maxWidth: '400px' }}>
        <li>🔒 Fullscreen mode required.</li>
        <li>❌ Do not switch tabs or minimize browser.</li>
        <li>💻 Minimum screen: {MIN_WIDTH}x{MIN_HEIGHT}</li>
        <li>⏱️ Duration: {Math.floor(examDurationSeconds / 60)} minutes</li>
        <li>⚠️ Multiple violations = auto-submit.</li>
      </ul>
      <Button variant="primary" size="lg" onClick={startExam}>Start Exam</Button>
    </Container>
  );

  return (
    <Container fluid className="take-exam-container py-4" style={{ minHeight: '100vh' }}>
      <Row className="gx-4">

        {/* Left Panel */}
        <Col md={3} className="mb-4">
          <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Header className="bg-primary text-white h5">Exam Overview ⏱️</Card.Header>
            <Card.Body>
              <h6 className={`text-${timeLeft < 300 ? 'danger' : 'success'} fw-bold`}>
                Time Remaining: {timeDisplay}
              </h6>
              <p>Total Marks: {totalMarks}</p>
              <p>Answered: {answeredQuestions}/{totalQuestions}</p>
              <ProgressBar now={progress} variant="info" style={{ height: '10px', marginBottom: '5px' }} />
              <small>{Math.round(progress)}% Completed</small>
              <hr />
              <h6>Question Navigation</h6>
              <div className="d-flex flex-wrap gap-2 question-navigation-panel" style={{ maxHeight: '300px', overflowY: 'auto', padding: '5px' }}>
                {questions.map((q, index) => (
                  <Button key={q.QuestionId} size="sm" variant={getQuestionStatusVariant(index)}
                    onClick={() => setCurrentQuestionIndex(index)} style={{ width: '40px', height: '40px' }}>{index+1}</Button>
                ))}
              </div>
              <Button variant="success" className="mt-4" onClick={() => setShowSubmitModal(true)}>End & Submit Exam</Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Panel */}
        <Col md={9}>
          {!online && <Alert variant="danger" className="sticky-top">🔴 Offline! Check your connection.</Alert>}
          {warning && <Alert variant="warning" className="sticky-top">{warning}</Alert>}

          <Card className="shadow-lg p-4 mb-4 question-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>Question {currentQuestionNumber} of {totalQuestions}</div>
              <span className="badge bg-secondary">Marks: {marksPerQuestion.toFixed(2)}</span>
            </Card.Header>
            <Card.Body>
              {currentQuestion ? (
                <>
                  <Card.Title>{currentQuestion.QuestionText}</Card.Title>
                  <Form>
                    {["A","B","C","D","E"].map(opt => {
                      const optionValue = currentQuestion[`Option${opt}`];
                      return optionValue && (
                        <Form.Check
                          key={opt}
                          type="radio"
                          id={`q-${currentQuestion.QuestionId}-opt-${opt}`}
                          label={<span className="option-label">{opt}. {optionValue}</span>}
                          name={`question-${currentQuestion.QuestionId}`}
                          value={optionValue}
                          onChange={() => handleOptionChange(currentQuestion.QuestionId, optionValue)}
                          checked={answers[currentQuestion.QuestionId] === optionValue}
                          className="py-2 px-3 mb-2 rounded option-item"
                        />
                      );
                    })}
                  </Form>
                </>
              ) : <Alert variant="info">No question available.</Alert>}
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between">
              <Button variant="outline-secondary" onClick={() => setCurrentQuestionIndex(prev => prev-1)} disabled={currentQuestionIndex===0}>Previous</Button>
              <Button variant="primary" onClick={() => setCurrentQuestionIndex(prev => prev+1)} disabled={currentQuestionIndex===totalQuestions-1}>Next</Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Submit Modal */}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white"><Modal.Title>Confirm Submission</Modal.Title></Modal.Header>
        <Modal.Body>
          <p>You answered {answeredQuestions} of {totalQuestions} questions.</p>
          <p className="fw-bold text-danger">Are you sure to submit now?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
          <Button variant="success" onClick={() => { setShowSubmitModal(false); handleSubmit(false); }}>Submit</Button>
        </Modal.Footer>
      </Modal>

      {/* Recovery Modal */}
      <Modal show={showRecoveryModal} backdrop="static" keyboard={false} centered>
        <Modal.Header className="bg-danger text-white"><Modal.Title>🚨 Warning: Recovery Required</Modal.Title></Modal.Header>
        <Modal.Body>
          <p className="fw-bold text-danger">Connection lost or exited fullscreen.</p>
          <p>Choose an action:</p>
          <ul>
            <li>Go Fullscreen to resume.</li>
            <li>Submit Exam now.</li>
          </ul>
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Button variant="outline-secondary" onClick={() => handleSubmit(true)}>Auto-Submit</Button>
                    <Button variant="danger" onClick={enterFullScreen}>Go Fullscreen</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TakeExam;

