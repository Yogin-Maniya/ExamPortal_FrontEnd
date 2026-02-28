import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { jwtDecode } from "jwt-decode";

import {
  getUserProfile,
  requestProfileEdit
} from "../services/api";

import {
  Container,
  Card,
  Spinner,
  Button,
  Modal,
  Form
} from "react-bootstrap";

import { FaUserCircle } from "react-icons/fa";
import AdvancedPopup from "../components/AdvancedPopup";


const Profile = () => {

  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentClass: ""
  });
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

  //--------------------------------

  useEffect(() => {

    const token = localStorage.getItem("authToken");

    if (!token)
    {
      navigate("/login");
      return;
    }

    const decoded = jwtDecode(token);

    loadProfile(decoded.studentId);

  }, [navigate]);



  //--------------------------------

  const loadProfile = async (studentId) => {

    try
    {
      const res = await getUserProfile(studentId);

      setProfile(res.data);

      setFormData({
        name: res.data.Name,
        email: res.data.Email,
        studentClass: res.data.Class
      });

    }
    catch
    {
      setPopup({
        show: true,
        type: "error",
        title: "Load Failed",
        message: "Error loading profile.",
        confirmText: "Close",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
    }
    finally
    {
      setLoading(false);
    }

  };


  //--------------------------------

  const submitRequest = async () => {
    try {
      await requestProfileEdit(formData);
      setPopup({
        show: true,
        type: "success",
        title: "Request Sent",
        message: "Profile edit request sent to admin.",
        confirmText: "OK",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
      setShowModal(false);
    } catch {
      setPopup({
        show: true,
        type: "error",
        title: "Request Failed",
        message: "Unable to send profile edit request.",
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


  //--------------------------------

  if (loading)
    return <Spinner className="m-5" />;


  //--------------------------------

  return (

    <Container className="mt-4">

      <Card className="text-center p-4">

        <FaUserCircle size={80} />

        <h3>{profile.Name}</h3>

        <p>{profile.Email}</p>

        <p>Class: {profile.Class}</p>

        <Button
          onClick={() => setShowModal(true)}
        >
          Edit Profile
        </Button>

      </Card>


      {/* MODAL */}

      <Modal show={showModal} onHide={() => setShowModal(false)}>

        <Modal.Header closeButton>

          <Modal.Title>Edit Profile</Modal.Title>

        </Modal.Header>

        <Modal.Body>

          <Form>

            <Form.Group>

              <Form.Label>Name</Form.Label>

              <Form.Control
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value
                  })
                }
              />

            </Form.Group>

            <Form.Group>

              <Form.Label>Email</Form.Label>

              <Form.Control
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value
                  })
                }
              />

            </Form.Group>

            <Form.Group>

              <Form.Label>Class</Form.Label>

              <Form.Control
                value={formData.studentClass}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    studentClass: e.target.value
                  })
                }
              />

            </Form.Group>

          </Form>

        </Modal.Body>

        <Modal.Footer>

          <Button onClick={submitRequest}>
            Submit
          </Button>

        </Modal.Footer>

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

export default Profile;
