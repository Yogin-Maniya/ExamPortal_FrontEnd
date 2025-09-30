import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const ExamInstructions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const handleStartExam = () => {
    navigate(`/exam/${examId}/take`);
  };

  return (
    <div>
      <h2>Exam Instructions</h2>
      <p>Please read the following instructions carefully before starting the exam:</p>
      <ul>
        <li>Total duration: 60 minutes</li>
        <li>Do not refresh or leave the page during the exam</li>
        <li>Each question carries 1 mark, no negative marking</li>
      </ul>
      <button onClick={handleStartExam}>Start Exam</button>
    </div>
  );
};

export default ExamInstructions;
