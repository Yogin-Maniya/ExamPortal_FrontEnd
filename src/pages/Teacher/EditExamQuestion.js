import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";

const EditExamQuestion = () => {
  const { examId, questionId } = useParams();
  const navigate = useNavigate();

  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch question details on mount
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await api.get(
          `/admin/exams/${examId}/questions/${questionId}`
        );
        const q = response.data;
        setQuestionText(q.QuestionText);
        setOptions([q.OptionA, q.OptionB, q.OptionC, q.OptionD, q.OptionE || ""]);
        // Convert letter (A–E) to a 0-based numeric index
        const mapping = { A: 0, B: 1, C: 2, D: 3, E: 4 };
        setCorrectOption(mapping[q.CorrectOption] ?? 0);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch question details.");
      }
    };
    fetchQuestion();
  }, [examId, questionId]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Validate that question text and options A-D are provided
    if (
      !questionText.trim() ||
      !options[0].trim() ||
      !options[1].trim() ||
      !options[2].trim() ||
      !options[3].trim()
    ) {
      setError("Question text and options A-D are required.");
      return;
    }
    try {
      // Convert numeric correctOption (0-based) to a letter (A–E)
      const letters = ["A", "B", "C", "D", "E"];
      const correctLetter = letters[correctOption] || "A";

      await api.put(
        `/admin/question/${examId}/question/${questionId}`,
        {
          questionText,
          optionA: options[0],
          optionB: options[1],
          optionC: options[2],
          optionD: options[3],
          optionE: options[4],
          correctOption: correctLetter,
        }
      );
      setSuccess("Question updated successfully.");
      // Navigate back to the exam questions page (or wherever you prefer)
      navigate(`/create-exam/${examId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update question.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Edit Exam Question (ID: {questionId})</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Question Text</label>
          <input
            type="text"
            className="form-control"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
        </div>
        {["A", "B", "C", "D", "E"].map((label, index) => (
          <div className="mb-3" key={index}>
            <label className="form-label">
              Option {label} {index === 4 ? "(Optional)" : ""}
            </label>
            <input
              type="text"
              className="form-control"
              value={options[index]}
              onChange={(e) => handleOptionChange(index, e.target.value)}
            />
          </div>
        ))}
        <div className="mb-3">
          <label className="form-label">Correct Option (1-5)</label>
          <input
            type="number"
            className="form-control"
            min="1"
            max="5"
            value={correctOption + 1}
            onChange={(e) => setCorrectOption(e.target.value - 1)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Update Question
        </button>
      </form>
    </div>
  );
};

export default EditExamQuestion;
