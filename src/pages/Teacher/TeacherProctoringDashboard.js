import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Spinner,
  Badge,
  Card,
  Row,
  Col,
  Modal,
  Button,
  Form
} from "react-bootstrap";
import { FaTrashAlt } from "react-icons/fa";

import {
  getProctoringSummary,
  getProctoringCounts,
  deleteProctoringLog,
  bulkDeleteProctoringLogs
} from "../../services/api";
import AdvancedPopup from "../../components/AdvancedPopup";

const TeacherProctoringDashboard = () => {
  const backendBaseUrl = (process.env.REACT_APP_BASE_URL || "").replace(/\/api\/?$/, "");

  const [logs, setLogs] = useState([]);
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogIds, setSelectedLogIds] = useState([]);

  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
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

  const riskBadge = (score) => {

  if (score >= 70)
    return <Badge bg="danger">HIGH ({score})</Badge>;

  if (score >= 40)
    return <Badge bg="warning">MEDIUM ({score})</Badge>;

  return <Badge bg="success">LOW ({score})</Badge>;
};
  const loadData = async () => {

    try {

      setLoading(true);

      const logRes = await getProctoringSummary();
      const countRes = await getProctoringCounts();

      setLogs(logRes.data.data || []);
      setCounts(countRes.data || []);

    } catch (error) {
      setPopup({
        show: true,
        type: "error",
        title: "Unable to Load Logs",
        message: error?.response?.data?.error || "Failed to load proctoring data.",
        confirmText: "Close",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
    }

    setLoading(false);

  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setSelectedLogIds((prev) => prev.filter((id) => logs.some((log) => log.LogId === id)));
  }, [logs]);

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

  const runDelete = async (ids) => {
    if (!ids.length) return;

    setPopup((prev) => ({ ...prev, loading: true }));

    try {
      if (ids.length === 1) {
        await deleteProctoringLog(ids[0]);
      } else {
        await bulkDeleteProctoringLogs(ids);
      }

      await loadData();
      setSelectedLogIds([]);

      setPopup({
        show: true,
        type: "success",
        title: "Deleted Successfully",
        message: `${ids.length} proctoring log${ids.length > 1 ? "s" : ""} deleted.`,
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
        message: error?.response?.data?.error || "Could not delete the selected proctoring logs.",
        confirmText: "Close",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
    }
  };

  const toggleSelectAll = () => {
    if (selectedLogIds.length === logs.length) {
      setSelectedLogIds([]);
      return;
    }

    setSelectedLogIds(logs.map((log) => log.LogId));
  };

  const toggleRowSelect = (logId) => {
    setSelectedLogIds((prev) =>
      prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId]
    );
  };

  const badgeColor = (type) => {
    if (type === "NoFace") return "danger";
    if (type === "MultiFace") return "warning";
    return "secondary";
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner />
      </Container>
    );
  }

  return (

    <Container fluid className="mt-4">

      <h3 className="mb-4">
        AI Proctoring Dashboard
      </h3>

      {/* ========= COUNT CARDS ========= */}

      <Row className="mb-4">

        {counts.map(c => (
          <Col md={3} key={c.StudentId}>
            <Card className="shadow-sm">
              <Card.Body>
                <h6>Student ID: {c.StudentId}</h6>
                <h4 className="text-danger">
                  {c.TotalEvents}
                </h4>
                <small>Suspicious Events</small>
              </Card.Body>
            </Card>
          </Col>
        ))}

      </Row>

      {/* ========= TABLE ========= */}

      <Card className="shadow">

        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Detection Logs</span>
          <Button
            variant="danger"
            size="sm"
            disabled={!selectedLogIds.length}
            onClick={() =>
              showConfirmPopup(
                "Delete Selected Proctoring Logs",
                `This will permanently delete ${selectedLogIds.length} selected proctoring log(s). Continue?`,
                () => runDelete(selectedLogIds),
                "Delete Selected"
              )
            }
          >
            <FaTrashAlt className="me-2" />
            Delete Selected ({selectedLogIds.length})
          </Button>
        </Card.Header>

        <Card.Body>

          <Table bordered hover responsive>

            <thead>
              <tr>
                <th style={{ width: "48px" }}>
                  <Form.Check
                    type="checkbox"
                    aria-label="Select all logs"
                    checked={logs.length > 0 && selectedLogIds.length === logs.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Student</th>
                <th>Exam</th>
                <th>Event</th>
                <th>Image</th>
                <th>Video</th>
                <th>Date</th>
                <th>Risk</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {logs.map(log => (

                <tr key={log.LogId}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      aria-label={`Select log ${log.LogId}`}
                      checked={selectedLogIds.includes(log.LogId)}
                      onChange={() => toggleRowSelect(log.LogId)}
                    />
                  </td>

                  <td>
                    {log.StudentName}
                    <br />
                    <small>ID: {log.StudentId}</small>
                  </td>

                  <td>{log.ExamName}</td>

                  <td>
                    <Badge bg={badgeColor(log.EventType)}>
                      {log.EventType}
                    </Badge>
                  </td>

                  <td>

                    {log.ImagePath && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setImageUrl(
                            `${backendBaseUrl}/uploads/proctoring/${log.ImagePath}`
                          );
                          setShowImage(true);
                        }}
                      >
                        View
                      </Button>
                    )}

                  </td>

                  <td>

                    {log.VideoPath && (
                      <video width="180" controls>
                        <source
                          src={`${backendBaseUrl}/uploads/proctoring/${log.VideoPath}`}
                          type="video/webm"
                        />
                      </video>
                    )}

                  </td>

                  <td>
                    {new Date(log.CreatedAt).toLocaleString()}
                  </td>
                  <td>
                    {riskBadge(log.RiskScore || 0)}
                  </td>
                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() =>
                        showConfirmPopup(
                          "Delete Proctoring Log",
                          "This log will be permanently deleted. Continue?",
                          () => runDelete([log.LogId])
                        )
                      }
                    >
                      <FaTrashAlt className="me-1" />
                      Delete
                    </Button>
                  </td>
                </tr>

              ))}

            </tbody>

          </Table>

        </Card.Body>

      </Card>

      {/* IMAGE MODAL */}

      <Modal
        show={showImage}
        onHide={() => setShowImage(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          Evidence Image
        </Modal.Header>
        <Modal.Body>
          <img
            src={imageUrl}
            alt="proctor"
            style={{ width: "100%" }}
          />
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

export default TeacherProctoringDashboard;
