import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { jwtDecode } from "jwt-decode";
import { Container, Card, Spinner, Alert } from "react-bootstrap";

const TeacherProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("No token found. Please log in again.");
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        const adminId = decoded.adminId;

        const response = await api.get(`/admin/admins/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAdmin(response.data);
      } catch (err) {
        setError("Failed to fetch admin profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-primary">Teacher Profile</h2>
      <Card className="shadow-sm p-4">
        <p><strong>Admin ID:</strong> {admin?.AdminId}</p>
        <p><strong>Username:</strong> {admin?.Username}</p>
        <p><strong>Email:</strong> {admin?.Email}</p>
        <p>
          <strong>Created At:</strong>{" "}
          {admin?.CreatedAt ? new Date(admin.CreatedAt).toLocaleString() : "N/A"}
        </p>
      </Card>
    </Container>
  );
};

export default TeacherProfile;