import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; 
import { getUserProfile } from "../services/api"; 
import {
  Container,
  Card,
  Row,
  Col,
  Spinner,
  Alert,
  ListGroup,
  Button,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaUserCircle,
  FaEnvelope,
  FaGraduationCap,
  FaIdBadge,
  FaCalendarAlt,
} from "react-icons/fa";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error("Invalid token:", err);
      navigate("/login");
      return;
    }

    const studentId = decoded.studentId;

    if (!studentId) {
      setError("Student ID not found in token.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await getUserProfile(studentId);
        let data = response.data;

        // Provide fallback values
        data.CreatedAt = data.CreatedAt || new Date().toISOString();

        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
        setError("Failed to load profile. Please check your network.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const ProfileItem = ({ icon: Icon, label, value }) => (
    <ListGroup.Item className="d-flex justify-content-between align-items-center bg-white border-light border-bottom py-3">
      <div className="d-flex align-items-center text-muted">
        <Icon size={20} className="me-3 text-primary" />
        <strong>{label}</strong>
      </div>
      <span className="fw-bold text-dark">{value}</span>
    </ListGroup.Item>
  );

  return (
    <div className="bg-light min-vh-100">
      {/* Header */}
      <div className="bg-primary text-white text-center py-5 shadow-sm">
        <Container>
          <FaUserCircle size={90} className="mb-3" />
          <h2 className="fw-light mb-1">{profile?.Name || "Student Profile"}</h2>
          <p className="mb-0 text-white-50">{profile?.Email}</p>
        </Container>
      </div>

      <Container className="py-5">
        {loading && (
          <div className="text-center p-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Loading profile data...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="text-center shadow-sm">
            {error}
          </Alert>
        )}

        {!loading && !error && profile && (
          <Row className="g-4">
            {/* Personal Info */}
            <Col md={6}>
              <Card className="shadow-lg border-0 h-100">
                <Card.Header className="bg-white fw-bold text-primary fs-5">
                  Personal Information
                </Card.Header>
                <ListGroup variant="flush">
                  <ProfileItem
                    icon={FaUserCircle}
                    label="Full Name"
                    value={profile.Name || "N/A"}
                  />
                  <ProfileItem
                    icon={FaEnvelope}
                    label="Email Address"
                    value={profile.Email || "N/A"}
                  />
                  <ProfileItem
                    icon={FaIdBadge}
                    label="Student ID"
                    value={profile.StudentId || "N/A"}
                  />
                  <ProfileItem
                    icon={FaCalendarAlt}
                    label="Member Since"
                    value={
                      new Date(profile.CreatedAt).toLocaleDateString() || "N/A"
                    }
                  />
                </ListGroup>
              </Card>
            </Col>

            {/* Academic Info */}
            {profile.Class && (
              <Col md={6}>
                <Card className="shadow-lg border-0 h-100">
                  <Card.Header className="bg-white fw-bold text-primary fs-5">
                    Academic Information
                  </Card.Header>
                  <ListGroup variant="flush">
                    <ProfileItem
                      icon={FaGraduationCap}
                      label="Current Class"
                      value={profile.Class || "N/A"}
                    />
                  </ListGroup>
                </Card>
              </Col>
            )}

            {/* Back Button */}
            <Col xs={12} className="text-center mt-4">
              <Button
                variant="outline-primary"
                size="lg"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </Button>
            </Col>
          </Row>
        )}

        {!loading && !error && !profile && (
          <p className="text-center text-muted p-4">
            No profile data available.
          </p>
        )}
      </Container>
    </div>
  );
};

export default Profile;
