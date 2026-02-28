import React, { useEffect, useState } from "react";
import { getProfileEditRequests, approveProfileEdit, rejectProfileEdit } from "../../services/api";
import { Container, Table, Button, Spinner, Card, Badge } from "react-bootstrap";
import { FaUserEdit, FaCheck, FaTimes, FaIdCard } from "react-icons/fa";
import AdvancedPopup from "../../components/AdvancedPopup";

const AdminProfileEditRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const loadRequests = async () => {
    try {
      const res = await getProfileEditRequests();
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const approve = async (id) => {
    try {
      await approveProfileEdit(id);
      setPopup({
        show: true,
        type: "success",
        title: "Approved",
        message: "Profile updated successfully.",
        confirmText: "OK",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
      loadRequests();
    } catch {
      setPopup({
        show: true,
        type: "error",
        title: "Approve Failed",
        message: "Unable to approve request.",
        confirmText: "Close",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
    }
  };

  const reject = async (id) => {
    try {
      await rejectProfileEdit(id);
      setPopup({
        show: true,
        type: "success",
        title: "Rejected",
        message: "Request rejected.",
        confirmText: "OK",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
      loadRequests();
    } catch {
      setPopup({
        show: true,
        type: "error",
        title: "Reject Failed",
        message: "Unable to reject request.",
        confirmText: "Close",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
    }
  };

  const closePopup = () => {
    setPopup((prev) => (prev.loading ? prev : { ...prev, show: false }));
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <Spinner animation="grow" variant="primary" />
    </div>
  );

  return (
    <Container className="py-5">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-primary text-white p-3 rounded-3 shadow-sm">
          <FaUserEdit size={24} />
        </div>
        <div>
          <h3 className="fw-bold mb-0">Profile Edit Requests</h3>
          <p className="text-muted mb-0">Review and verify student profile updates</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Student ID</th>
                <th className="py-3">Current Name</th>
                <th className="py-3 text-primary">Proposed New Name</th>
                <th className="py-3">New Email</th>
                <th className="py-3">New Class</th>
                <th className="py-3 text-center px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">No pending requests found.</td>
                </tr>
              ) : (
                requests.map(r => (
                  <tr key={r.RequestId}>
                    <td className="px-4"><Badge bg="secondary" className="bg-opacity-10 text-dark border"><FaIdCard className="me-1"/> {r.StudentId}</Badge></td>
                    <td>{r.CurrentName}</td>
                    <td className="fw-bold text-primary">{r.NewName}</td>
                    <td>{r.NewEmail}</td>
                    <td><Badge bg="info">{r.NewClass}</Badge></td>
                    <td className="text-center px-4">
                      <div className="d-flex gap-2 justify-content-center">
                        <Button
                          variant="success"
                          size="sm"
                          className="rounded-pill px-3 shadow-sm"
                          onClick={() =>
                            setPopup({
                              show: true,
                              type: "confirm",
                              title: "Approve Changes",
                              message: "Approve these profile changes?",
                              confirmText: "Approve",
                              cancelText: "Cancel",
                              showCancel: true,
                              loading: false,
                              onConfirm: () => approve(r.RequestId)
                            })
                          }
                        >
                          <FaCheck className="me-1" /> Approve
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="rounded-pill px-3"
                          onClick={() =>
                            setPopup({
                              show: true,
                              type: "confirm",
                              title: "Reject Request",
                              message: "Reject this request?",
                              confirmText: "Reject",
                              cancelText: "Cancel",
                              showCancel: true,
                              loading: false,
                              onConfirm: () => reject(r.RequestId)
                            })
                          }
                        >
                          <FaTimes className="me-1" /> Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>

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

export default AdminProfileEditRequests;
