import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { jwtDecode } from "jwt-decode";

const TeacherProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        // Get token
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("No token found. Please log in again.");
          setLoading(false);
          return;
        }

        // Decode token to get adminId
        const decoded = jwtDecode(token);
        const adminId = decoded.adminId; // Because you signed token with { adminId }

        // Call API
        const response = await api.get(
          `/admin/admins/${adminId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setAdmin(response.data);
      } catch (err) {
        console.error("Error fetching admin profile:", err);
        setError("Failed to fetch admin profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading profile...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-primary">Teacher Profile</h2>
      <div className="card shadow-sm p-4">
        <p>
          <strong>Admin ID:</strong> {admin?.AdminId}
        </p>
        <p>
          <strong>Username:</strong> {admin?.Username}
        </p>
        <p>
          <strong>Email:</strong> {admin?.Email}
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {admin?.CreatedAt
            ? new Date(admin.CreatedAt).toLocaleString()
            : ""}
        </p>
      </div>
    </div>
  );
};

export default TeacherProfile;
