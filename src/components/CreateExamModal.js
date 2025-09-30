import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CreateExamModal = ({ onClose, onExamCreated }) => {
  const [examName, setExamName] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [className, setClassName] = useState("");
  const [startTime, setStartTime] = useState(""); 
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const classes = [
    "B.Tech CSE",
    "B.Tech ECE",
    "B.Tech IT",
    "B.Tech ME",
    "B.Tech CE",
    "BCA",
    "BBA"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!examName || !totalMarks || !durationMinutes || !className || !startTime) {
      setError("All fields are required.");
      return;
    }

    try {
      const adminId = localStorage.getItem("adminId") || 1;
      const parsedStartTime = new Date(startTime);
      const computedEndTime = new Date(parsedStartTime.getTime() + parseInt(durationMinutes) * 60000);

      const response = await api.post("/admin/exams/create", {
        examName,
        totalMarks: parseInt(totalMarks),
        durationMinutes: parseInt(durationMinutes),
        className,
        startTime: parsedStartTime,
        endTime: computedEndTime,
        adminId: parseInt(adminId)
      });

      const createdExamId = response.data.examId;
      onExamCreated();
      onClose();
      navigate(`/create-exam/${createdExamId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create exam.");
    }
  };

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Exam</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formExamName">
            <Form.Label>Subject</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter exam subject"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formTotalMarks">
            <Form.Label>Total Marks</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter total marks"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formDurationMinutes">
            <Form.Label>Total Time (minutes)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter duration in minutes"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formClassName">
            <Form.Label>Class</Form.Label>
            <Form.Select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            >
              <option value="">Select Class</option>
              {classes.map((cls, idx) => (
                <option key={idx} value={cls}>{cls}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formStartTime">
            <Form.Label>Start Time</Form.Label>
            <Form.Control
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Create
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateExamModal;
