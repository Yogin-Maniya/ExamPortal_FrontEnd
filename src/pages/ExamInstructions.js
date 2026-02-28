import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button, ListGroup, Alert, Spinner } from "react-bootstrap";
import * as faceapi from "face-api.js";

const ExamInstructions = () => {

  const { examId } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef();

  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //--------------------------------------
  // LOAD AI MODELS
  //--------------------------------------
  useEffect(() => {

    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        startCamera();
      } catch {
        setError("Failed to load AI models.");
      }
    };

    loadModels();

    const currentVideoRef = videoRef.current;
    return () => {
      if (currentVideoRef?.srcObject) {
        currentVideoRef.srcObject.getTracks().forEach(track => track.stop());
      }
    };

  }, []);

  //--------------------------------------
  // START CAMERA
  //--------------------------------------
  const startCamera = async () => {

    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          setLoading(false);
        };
      } else {
        setLoading(false);
      }

    } catch {

      setError("Camera access required to start exam.");
      setLoading(false);

    }

  };

  //--------------------------------------
  // FACE DETECTION LOOP
  //--------------------------------------
  useEffect(() => {

    if (!cameraReady) return;

    const interval = setInterval(async () => {

      if (!videoRef.current) return;

      try {
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );

        setFaceDetected(detections.length === 1);
      } catch {
        setFaceDetected(false);
      }

    }, 2000);

    return () => clearInterval(interval);

  }, [cameraReady]);

  //--------------------------------------
  // START EXAM
  //--------------------------------------
  const handleStart = () => {

    if (!faceDetected) return;

    navigate(`/take-exam/${examId}`);

  };

  //--------------------------------------
  // UI
  //--------------------------------------

  return (
    <Container className="mt-5">

      <Card className="shadow">

        <Card.Header className="bg-warning text-dark h4">
          Exam Instructions
        </Card.Header>

        <Card.Body>

          <p className="lead">Please read carefully:</p>

          <ListGroup variant="flush" className="mb-4">
            <ListGroup.Item>⏱️ Duration: 60 minutes</ListGroup.Item>
            <ListGroup.Item>🚫 Do not refresh page</ListGroup.Item>
            <ListGroup.Item>🎯 1 mark per question</ListGroup.Item>
            <ListGroup.Item>📷 Camera must remain ON</ListGroup.Item>
          </ListGroup>

          {/* CAMERA PREVIEW */}
          <div className="mb-3 text-center">

            {loading && <Spinner />}

            <video
              ref={videoRef}
              autoPlay
              muted
              width="320"
              height="240"
              style={{ borderRadius: "10px", border: "2px solid #ccc" }}
            />

          </div>

          {/* STATUS */}
          {error && <Alert variant="danger">{error}</Alert>}

          {!error && cameraReady && !faceDetected && (
            <Alert variant="warning">
              ⚠️ Face not detected. Please sit properly in front of camera.
            </Alert>
          )}

          {!error && faceDetected && (
            <Alert variant="success">
              ✅ Face detected. You may start exam.
            </Alert>
          )}

          <div className="d-flex gap-3">

            <Button variant="secondary" onClick={() => navigate(-1)}>
              Go Back
            </Button>

            <Button
              variant="success"
              disabled={!faceDetected}
              onClick={handleStart}
            >
              Start Exam
            </Button>

          </div>

        </Card.Body>

      </Card>

    </Container>
  );
};

export default ExamInstructions;
