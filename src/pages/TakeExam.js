import * as faceapi from "face-api.js";
import api from "../services/api";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExamDetailsById, getExamDetails, submitExam } from "../services/api";
import { jwtDecode } from "jwt-decode";
import { Container, Card, Button, Spinner, Form, Modal, ProgressBar, Row, Col, Alert } from "react-bootstrap";
import './CSS/TakeExam.css';
import AdvancedPopup from "../components/AdvancedPopup";

// ======================
// 🚀 Custom Hook: Exam Timer (only timer logic)
// ======================
const useExamTimer = (initialTime, examStarted, timerRunning, handleSubmit) => {
  const { examId } = useParams();
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    const storedTime = localStorage.getItem(`timeLeft-${examId}`);
    if (storedTime) setTimeLeft(parseInt(storedTime, 10));
    else setTimeLeft(initialTime);
  }, [examId, initialTime]);

  useEffect(() => {
    if (!examStarted || !timerRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        localStorage.setItem(`timeLeft-${examId}`, newTime.toString());
        if (newTime <= 0) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, timerRunning, handleSubmit, examId, timeLeft]);

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
  const videoRef = useRef(null);
const streamRef = useRef(null);
const lastSuspiciousRef = useRef(0);
const lastCameraOffRef = useRef(0);
const initialEvidenceSentRef = useRef(false);
  const [isRecording, setIsRecording] = useState(false);
  const [proctoringActive, setProctoringActive] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [proctoringError, setProctoringError] = useState("");
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceWarning, setFaceWarning] = useState("");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentId, setStudentId] = useState(null);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const [totalMarks, setTotalMarks] = useState(0);
  const [marksPerQuestion, setMarksPerQuestion] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [blurCount, setBlurCount] = useState(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [warning, setWarning] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const [examStarted, setExamStarted] = useState(false);

  const [examDurationSeconds, setExamDurationSeconds] = useState(0);

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
  // Capture evidence (screenshot + 10s video for suspicious activity)
  // ---------------------
const captureEvidence = useCallback(async (eventType, withVideo = false) => {

  const video = videoRef.current;
  const stream = streamRef.current || video?.srcObject;

  if (!studentId || !examId) return false;
  if (!video || !stream) return false;
  if (video.videoWidth === 0) return false;

  try {

    // ===== IMAGE CAPTURE =====
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

const blobImage = await new Promise(resolve =>
  canvas.toBlob(resolve, "image/jpeg", 0.8)
);

if (!blobImage) return false;

    const formData = new FormData();
    formData.append("studentId", String(studentId));
    formData.append("examId", String(examId));
    formData.append("eventType", eventType);
    formData.append("image", blobImage, "capture.jpg");

    // ===== VIDEO ONLY IF SUSPICIOUS =====
    if (withVideo) {

      if (isRecording) return false;

      setIsRecording(true);

      const chunks = [];

      let recorder;
      try {
        recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp8,opus" });
      } catch {
        try {
          recorder = new MediaRecorder(stream);
        } catch {
          setIsRecording(false);
          return false;
        }
      }

      recorder.ondataavailable = e => chunks.push(e.data);

      await new Promise((resolve, reject) => {
        recorder.start();

        setTimeout(() => {
          if (recorder.state === "recording")
            recorder.stop();
        }, 10000);

        recorder.onerror = () => reject(new Error("Video recording failed"));

        recorder.onstop = async () => {
          try {
            const videoBlob = new Blob(chunks, { type: "video/webm" });

            if (videoBlob.size > 0) {
              formData.append("video", videoBlob, "clip.webm");
            }

            await api.post("/proctoring/upload", formData, {
              skipGlobalErrorHandler: true
            });
            chunks.length = 0;
            resolve();
          } catch (postErr) {
            reject(postErr);
          } finally {
            setIsRecording(false);
          }
        };
      });

    } else {

      // IMAGE ONLY
      await api.post("/proctoring/upload", formData, {
        skipGlobalErrorHandler: true
      });

    }

    return true;

  } catch (err) {
    console.error("Evidence capture failed", err);
    setIsRecording(false);
    return false;
  }

}, [studentId, examId, isRecording]);

  // ---------------------
  // Handle Option Change
  // ---------------------
  const handleOptionChange = useCallback((questionId, option) => {
    if (!(examStarted && proctoringActive && faceDetected)) return;

    setAnswers(prev => {
      const newAnswers = { ...prev, [questionId]: option };
      localStorage.setItem(`answers-${examId}`, JSON.stringify(newAnswers));
      return newAnswers;
    });
  }, [examId, examStarted, proctoringActive, faceDetected]);

  // ---------------------
  // Submit Exam
  // ---------------------
  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (!studentId || questions.length === 0 || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formattedAnswers = questions.map(q => ({
        questionId: q.QuestionId,
        selectedOption: answers[q.QuestionId] || null
      }));

      const submissionData = {
        studentId,
        examId: parseInt(examId),
        answers: formattedAnswers,
        warningCount: blurCount + fullscreenExitCount,
        warningReasons: warning,
        submissionType: isAutoSubmit ? "Auto" : "Manual",
        submissionSource: isAutoSubmit ? "System" : "User",
        isAutoSubmitted: isAutoSubmit,
        ipAddress: "",
        deviceInfo: navigator.platform,
        browserInfo: navigator.userAgent,
        examStartTime: localStorage.getItem("examStartTime"),
        examEndTime: new Date().toISOString()
      };

      await submitExam(submissionData);
      localStorage.removeItem(`timeLeft-${examId}`);
      localStorage.removeItem(`answers-${examId}`);
      window.location.replace("/result");
    } catch (error) {
      setPopup({
        show: true,
        type: "error",
        title: "Submission Failed",
        message: "Error submitting exam. Please try again.",
        confirmText: "Close",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
      setIsSubmitting(false);
    }
  }, [studentId, questions, answers, examId, isSubmitting, blurCount, fullscreenExitCount, warning]);

  const closePopup = () => {
    setPopup((prev) => (prev.loading ? prev : { ...prev, show: false }));
  };

  // ---------------------
  // Timer Hook
  // ---------------------
  const timerRunning = examStarted && proctoringActive && faceDetected;
  const { timeLeft, timeDisplay } = useExamTimer(examDurationSeconds, examStarted, timerRunning, handleSubmit);

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
  // Load face-api models
  // ---------------------
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Make sure models are placed in public/models/
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        setModelsLoaded(true);
        console.log("Face-api models loaded");
      } catch (err) {
        console.error("Failed to load face-api models:", err);
        setProctoringError("Proctoring models failed to load");
      }
    };
    loadModels();
  }, []);

  // ---------------------
  // Camera initialization for preview + proctoring stream
  // ---------------------
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
        console.log("Camera ready");
      } catch (err) {
        console.error("Camera error:", err);
        setProctoringError("Camera access denied or not available");
        setWarning("Camera access failed. Proctoring disabled.");
      }
    };

    startCamera();

    // Cleanup: stop all tracks
    return () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Re-attach stream when UI swaps pre-exam/exam video elements.
  useEffect(() => {
    if (videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [examStarted, loading]);

  // Combine proctoring readiness
  useEffect(() => {
    if (cameraActive && modelsLoaded) {
      setProctoringActive(true);
      setProctoringError("");
      console.log("Proctoring active");
    } else {
      setProctoringActive(false);
      setFaceDetected(false);
    }
  }, [cameraActive, modelsLoaded]);

  useEffect(() => {
    if (!examStarted || !proctoringActive || initialEvidenceSentRef.current) return;

    const sendInitialEvidence = async () => {
      const sent = await captureEvidence("ExamStart", true);
      if (sent) {
        initialEvidenceSentRef.current = true;
      }
    };

    sendInitialEvidence();
  }, [examStarted, proctoringActive, captureEvidence]);

  // ---------------------
  // Periodic face detection (only when proctoring is active)
  // ---------------------
  useEffect(() => {
    if (!examStarted || !proctoringActive) return;

    const interval = setInterval(async () => {
      const video = videoRef.current;
      if (!video || !video.srcObject || video.videoWidth === 0) return;

      try {
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions()
        );

if (detections.length !== 1) {
  setFaceDetected(false);
  setFaceWarning(
    detections.length === 0
      ? "Face not detected. Exam is paused. Keep your face visible to continue."
      : "Multiple faces detected. Exam is paused until only your face is visible."
  );

  if (Date.now() - lastSuspiciousRef.current > 10000) {
    captureEvidence(
      detections.length === 0 ? "NoFace" : "MultiFace",
      true
    );

    lastSuspiciousRef.current = Date.now();
  }
} else {
  setFaceDetected(true);
  setFaceWarning("");
}
      } catch (err) {
        console.error("Face detection error:", err);
        setFaceDetected(false);
        setFaceWarning("Face detection error. Exam is paused until camera detection is restored.");
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [examStarted, proctoringActive, captureEvidence]);

  useEffect(() => {

  if (!examStarted) return;

  const checkCamera = setInterval(() => {

const stream = streamRef.current;

if (!stream || stream.getVideoTracks().length === 0 || stream.getVideoTracks().every(t => t.readyState !== "live")) {
  setFaceDetected(false);
  setFaceWarning("Camera disconnected. Exam is paused. Reconnect camera to continue.");

  if (Date.now() - lastCameraOffRef.current > 10000) {
    captureEvidence("CameraOff", false);
    lastCameraOffRef.current = Date.now();
  }
}

  }, 3000);

  return () => clearInterval(checkCamera);

}, [examStarted, captureEvidence]);
  // ---------------------
  // Anti-Cheating (same as before)
  // ---------------------
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

  useEffect(() => {
    const preventKeys = e => {
      if (["F12", "ContextMenu"].includes(e.key) ||
        (e.ctrlKey && ["u","s","i"].includes(e.key)) ||
        (e.metaKey && ["u","s","i"].includes(e.key))) e.preventDefault();
    };
    const preventContextMenu = e => e.preventDefault();
    window.addEventListener("keydown", preventKeys);
    window.addEventListener("contextmenu", preventContextMenu);
    return () => {
      window.removeEventListener("keydown", preventKeys);
      window.removeEventListener("contextmenu", preventContextMenu);
    };
  }, []);

  // ---------------------
  // Exam Navigation
  // ---------------------
  const startExam = () => {
    if (window.innerWidth < MIN_WIDTH || window.innerHeight < MIN_HEIGHT) {
      setShowSizeModal(true);
      return;
    }
    enterFullScreen();
    setExamStarted(true);
    setWarning("");
  };

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
        {proctoringError && <li className="text-danger">⚠️ Proctoring: {proctoringError}</li>}
      </ul>
      <Button variant="primary" size="lg" onClick={startExam}>Start Exam</Button>
      <div className="mt-3 d-flex justify-content-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width="320"
          height="240"
          style={{ borderRadius: "10px", border: "2px solid #ccc", background: "#111" }}
        />
      </div>

      {/* Small Screen Modal */}
      <Modal show={showSizeModal} onHide={() => setShowSizeModal(false)} centered>
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>⚠️ Screen Too Small</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Your screen size is too small to start the exam.</p>
          <p>💻 Minimum required: {MIN_WIDTH}x{MIN_HEIGHT}</p>
          <p>Please use a larger screen or maximize your current window.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSizeModal(false)}>OK</Button>
        </Modal.Footer>
      </Modal>
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
                    onClick={() => setCurrentQuestionIndex(index)} disabled={!timerRunning} style={{ width: '40px', height: '40px' }}>{index+1}</Button>
                ))}
              </div>
              <Button variant="success" className="mt-4" onClick={() => setShowSubmitModal(true)}>End & Submit Exam</Button>
              <hr />
              <h6>Camera Preview</h6>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                width="100%"
                style={{ borderRadius: "10px", border: "2px solid #ccc", background: "#111" }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Right Panel */}
        <Col md={9}>
          {!online && <Alert variant="danger" className="sticky-top">🔴 Offline! Check your connection.</Alert>}
          {warning && <Alert variant="warning" className="sticky-top">{warning}</Alert>}
          {faceWarning && <Alert variant="danger" className="sticky-top">{faceWarning}</Alert>}
          {proctoringError && <Alert variant="danger" className="sticky-top">Proctoring Error: {proctoringError}</Alert>}
          {!proctoringActive && examStarted && (
            <Alert variant="warning" className="sticky-top">
              ⏳ Initializing proctoring... {!cameraActive && "Waiting for camera"} {!modelsLoaded && "Loading models"}
            </Alert>
          )}
          {examStarted && proctoringActive && !faceDetected && (
            <Alert variant="warning" className="sticky-top">
              Exam paused. Timer and answering are stopped until your face is detected.
            </Alert>
          )}

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
                          onChange={() => handleOptionChange(currentQuestion.QuestionId, opt)}
                          checked={answers[currentQuestion.QuestionId] === opt}
                          disabled={!timerRunning}
                          className="py-2 px-3 mb-2 rounded option-item"
                        />
                      );
                    })}
                  </Form>
                </>
              ) : <Alert variant="info">No question available.</Alert>}
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between">
              <Button variant="outline-secondary" onClick={() => setCurrentQuestionIndex(prev => prev-1)} disabled={currentQuestionIndex===0 || !timerRunning}>Previous</Button>
              <Button variant="primary" onClick={() => setCurrentQuestionIndex(prev => prev+1)} disabled={currentQuestionIndex===totalQuestions-1 || !timerRunning}>Next</Button>
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

export default TakeExam;




