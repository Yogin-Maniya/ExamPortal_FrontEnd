// EditExam.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../services/api";
import { useParams } from "react-router-dom";
import {
  Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge, InputGroup, ProgressBar
} from "react-bootstrap";
import {
  FaPencilAlt, FaClock, FaGraduationCap, FaDollarSign, FaCalendarAlt,
  FaSave, FaPlus, FaTrash, FaCheckCircle
} from "react-icons/fa";
import AdvancedPopup from "../../components/AdvancedPopup";

const EditExam = () => {
  const { examId } = useParams();

  const [examName, setExamName] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [className, setClassName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [computedEndTime, setComputedEndTime] = useState("Calculating...");
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
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

  // ----------------- Auto message with progress -----------------
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

  // ----------------- Computed End Time -----------------
  const updateComputedEndTime = useCallback((start, duration) => {
    if(start && duration) {
      const startObj = new Date(start);
      const end = new Date(startObj.getTime() + parseInt(duration, 10) * 60000);
      setComputedEndTime(end.toLocaleString());
    } else setComputedEndTime("Invalid time/duration");
  }, []);

  useEffect(() => { updateComputedEndTime(startTime, durationMinutes); }, [startTime, durationMinutes, updateComputedEndTime]);

  // ----------------- Fetch Exam & Questions -----------------
  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      try {
        const examRes = await api.get(`admin/exams/${examId}`);
        const exam = examRes.data;
        setExamName(exam.ExamName);
        setTotalMarks(exam.TotalMarks.toString());
        setDurationMinutes(exam.DurationMinutes.toString());
        setClassName(exam.Class);
        setStartTime(new Date(exam.StartTime).toISOString().slice(0,16));
        updateComputedEndTime(new Date(exam.StartTime).toISOString().slice(0,16), exam.DurationMinutes);

        const qRes = await api.get(`/admin/question/${examId}`);
        const prevQuestions = qRes.data.map(q => ({
          QuestionId: q.QuestionId,
          questionText: q.QuestionText,
          options: [q.OptionA, q.OptionB, q.OptionC, q.OptionD, q.OptionE || ""].filter(o => o!==null),
          correctOption: ["A","B","C","D","E"].indexOf(q.CorrectOption)
        }));
        setQuestions(prevQuestions.length ? prevQuestions : [{ QuestionId: null, questionText: "", options: ["", "", "", ""], correctOption: 0 }]);
      } catch(err) {
        showMessage("error", err.response?.data?.error || "Failed to fetch exam details.");
      } finally { setLoading(false); }
    };
    fetchExam();
  }, [examId, updateComputedEndTime]);

  // ----------------- Question Handlers -----------------
  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].questionText = value;
    setQuestions(newQuestions);
  };
  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    while(newQuestions[qIndex].options.length <= oIndex) newQuestions[qIndex].options.push("");
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };
  const handleCorrectOptionChange = (qIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctOption = parseInt(value,10)-1;
    setQuestions(newQuestions);
  };
  const addQuestion = () => setQuestions(prev => [...prev, { QuestionId:null, questionText:"", options:["","","",""], correctOption:0 }]);
  const removeQuestion = (qIndex) => {
    const newQ = questions.filter((_,i)=>i!==qIndex);
    setQuestions(newQ.length?newQ:[{ QuestionId:null, questionText:"", options:["","","",""], correctOption:0 }]);
  };

  const requestRemoveQuestion = (qIndex) => {
    const q = questions[qIndex];

    if (!q.QuestionId) {
      removeQuestion(qIndex);
      return;
    }

    setPopup({
      show: true,
      type: "confirm",
      title: "Remove Question",
      message: "Remove existing question permanently?",
      confirmText: "Remove",
      cancelText: "Cancel",
      showCancel: true,
      loading: false,
      onConfirm: () => removeQuestion(qIndex)
    });
  };

  const closePopup = () => {
    setPopup((prev) => (prev.loading ? prev : { ...prev, show: false }));
  };

  // ----------------- Submit -----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!examName || !totalMarks || !durationMinutes || !className || !startTime) { showMessage("error","Please fill in all exam fields."); return; }
    if(!questions.length || questions.every(q=>!q.questionText.trim())) { showMessage("error","Add at least one question."); return; }

    try {
      setSaving(true);
      // Update exam
      const parsedStart = new Date(startTime);
      const durationInt = parseInt(durationMinutes,10);
      const computedEnd = new Date(parsedStart.getTime()+durationInt*60000);
      await api.put(`/admin/exams/${examId}`, {
        examName, totalMarks:parseInt(totalMarks,10), durationMinutes:durationInt, className, startTime:parsedStart, endTime:computedEnd
      });

      // Update/add questions
      for(const q of questions) {
        if(!q.questionText.trim()) continue;
        const validOptions = q.options.filter(o=>o.trim()!=='');
        if(validOptions.length<4) { showMessage("error",`Question "${q.questionText.substring(0,20)}..." requires at least 4 options.`); return; }
        const correctLetter = ["A","B","C","D","E"][q.correctOption];
        if(q.correctOption<0 || q.correctOption>=validOptions.length) { showMessage("error",`Invalid correct option in "${q.questionText.substring(0,20)}..."`); return; }

        const data = { questionText:q.questionText, optionA:validOptions[0], optionB:validOptions[1], optionC:validOptions[2], optionD:validOptions[3], optionE:validOptions[4]||null, correctOption:correctLetter };
        if(q.QuestionId) await api.put(`/admin/question/${examId}/question/${q.QuestionId}`, data);
        else await api.post(`/admin/question/${examId}/questions`, { questions:[{ questionText:q.questionText, options:validOptions, correctOption:correctLetter }] });
      }

      showMessage("success","Exam & questions updated successfully!");
      setSaving(false);
      setTimeout(()=>window.location.reload(),1500);
    } catch(err) { showMessage("error", err.response?.data?.error || "Failed to update exam/questions."); setSaving(false); }
  };

  if(loading || questions===null) return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight:"80vh"}}>
      <Spinner animation="border" variant="primary" style={{width:"4rem",height:"4rem"}}/>
    </div>
  );

  return (
    <Container className="my-5 p-4 rounded shadow-lg bg-light">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="text-primary fw-bold"><FaPencilAlt className="me-2"/> Edit Exam</h1>
          <p className="text-muted">Exam ID: <Badge bg="primary">{examId}</Badge></p>
        </Col>
      </Row>

      {/* Message */}
      {message.text && (
        <div style={{ position:"fixed", top:20, right:20, minWidth:300, zIndex:9999 }}>
          <Alert variant={message.type==="error"?"danger":"success"} className="mb-1 py-2" dismissible onClose={()=>setMessage({type:"",text:""})}>
            {message.text}
            <ProgressBar now={progress} variant={message.type==="error"?"danger":"success"} style={{height:"4px"}}/>
          </Alert>
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        <Row>
          {/* Left: Exam Details */}
          <Col lg={4} className="mb-4">
           <div style={{ position: 'sticky', top: '20px' }}>
            <Card className="shadow-sm border-0 bg-white">
              <Card.Header className="bg-primary text-white fw-bold fs-5">Exam Metadata</Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Exam Name</Form.Label>
                  <Form.Control type="text" value={examName} onChange={e=>setExamName(e.target.value)} required/>
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label><FaDollarSign/> Total Marks</Form.Label>
                      <Form.Control type="number" min="1" value={totalMarks} onChange={e=>setTotalMarks(e.target.value)} required/>
                    </Form.Group>
                  </Col>
<Col md={6}>
  <Form.Group className="mb-3">
    <Form.Label><FaGraduationCap/> Class/Subject</Form.Label>
    <Form.Select 
      value={className} 
      onChange={e => setClassName(e.target.value)} 
      required
    >
      <option value="">Select Class</option>
      <option value="B.Tech CSE">B.Tech CSE</option>
      <option value="B.Tech ECE">B.Tech ECE</option>
      <option value="B.Tech IT">B.Tech IT</option>
      <option value="B.Tech ME">B.Tech ME</option>
      <option value="B.Tech CE">B.Tech CE</option>
      <option value="BCA">BCA</option>
      <option value="BBA">BBA</option>
      <option value="BBA">Demo</option>
    </Form.Select>
  </Form.Group>
</Col>

                </Row>
                <Form.Group className="mb-3">
                  <Form.Label><FaCalendarAlt/> Start Time</Form.Label>
                  <Form.Control type="datetime-local" value={startTime} onChange={e=>setStartTime(e.target.value)} required/>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label><FaClock/> Duration (minutes)</Form.Label>
                  <Form.Control type="number" min="1" value={durationMinutes} onChange={e=>setDurationMinutes(e.target.value)} required/>
                </Form.Group>
                <div className="p-3 bg-light rounded text-center">
                  <small className="text-muted d-block">Computed End Time</small>
                  <span className="fw-bold text-success fs-5">{computedEndTime}</span>
                </div>
              </Card.Body>
            </Card>
            </div>
          </Col>

          {/* Right: Questions Editor */}
          <Col lg={8}>
            <h3 className="mb-3 text-secondary">Questions ({questions.length})</h3>
            {questions.map((q,qIndex)=>(
              <Card key={qIndex} className="mb-4 shadow-sm border-secondary border-opacity-25">
                <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                  <span className="fw-bold">Question {qIndex+1} {q.QuestionId?<Badge bg="info" className="ms-2">Existing</Badge>:<Badge bg="warning" text="dark" className="ms-2">New</Badge>}</span>
                  <Button variant="outline-danger" size="sm" onClick={()=>requestRemoveQuestion(qIndex)}><FaTrash/> Remove</Button>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Question Text</Form.Label>
                    <Form.Control as="textarea" rows={2} placeholder="Enter question text" value={q.questionText} onChange={e=>handleQuestionChange(qIndex,e.target.value)} required/>
                  </Form.Group>
                  <Row className="g-2 mb-3">
                    <Col xs={12}><small className="text-muted">Answer Options (Min.4 required)</small></Col>
                    {['A','B','C','D','E'].map((letter,optIndex)=>{
                      const val = q.options[optIndex]||'';
                      if(optIndex<4 || val || (q.options.filter(o=>o.trim()!=='').length>=4 && optIndex===4)){
                        return <Col md={6} key={optIndex}>
                          <InputGroup>
                            <InputGroup.Text className={q.correctOption===optIndex?"bg-success text-white fw-bold":"bg-light"}>{letter}</InputGroup.Text>
                            <Form.Control type="text" placeholder={`Option ${letter}`} value={val} onChange={e=>handleOptionChange(qIndex,optIndex,e.target.value)} required={optIndex<4} className={q.correctOption===optIndex?"border-success border-2":""}/>
                          </InputGroup>
                        </Col>
                      }
                      return null;
                    })}
                  </Row>
                  <Row className="align-items-center mt-2">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold text-success">Correct Answer</Form.Label>
                        <Form.Control as="select" value={q.correctOption+1} onChange={e=>handleCorrectOptionChange(qIndex,e.target.value)} className="border-success">
                          {q.options.filter(o=>o.trim()!=='').map((_,i)=><option key={i} value={i+1}>{['A','B','C','D','E'][i]}</option>)}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Alert variant="success" className="mb-0 text-center py-2 d-flex justify-content-center align-items-center">
                        <FaCheckCircle className="me-2"/> Selected: <Badge bg="dark" className="ms-1 fs-6">{['A','B','C','D','E'][q.correctOption]}</Badge>
                      </Alert>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
            <div className="d-flex gap-2 mb-4">
              <Button type="button" variant="outline-secondary" onClick={addQuestion}><FaPlus className="me-2"/> Add New Question</Button>
            </div>
            <Button type="submit" variant="success" size="lg" className="w-100 shadow-lg" disabled={saving}>
              {saving ? <Spinner animation="border" size="sm" className="me-2"/> : <FaSave className="me-2"/>} Update Exam & Questions
            </Button>
          </Col>
        </Row>
      </Form>

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

export default EditExam;
