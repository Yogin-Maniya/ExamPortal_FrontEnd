import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Spinner,
  Alert,
  Card,
  Badge
} from "react-bootstrap";

import api from "../../services/api";
import AdvancedPopup from "../../components/AdvancedPopup";

const TeacherStudentsPage = () => {

  //-----------------------------------
  // STATE
  //-----------------------------------

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  //-----------------------------------
  // LOAD STUDENTS
  //-----------------------------------

  const loadStudents = async () => {

    try {

      setLoading(true);

      const res = await api.get(
        "/admin/student/allstudent"
      );

      setStudents(res.data);

    }
    catch (err)
    {
      setError("Failed to load students");
    }
    finally
    {
      setLoading(false);
    }

  };

  //-----------------------------------
  // DELETE STUDENT
  //-----------------------------------

  const deleteStudent = async (id) => {
    try {
      setPopup((prev) => ({ ...prev, loading: true }));
      await api.delete(`/admin/student/${id}`);
      await loadStudents();
      setPopup({
        show: true,
        type: "success",
        title: "Deleted",
        message: "Student deleted successfully.",
        confirmText: "OK",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
    } catch {
      setPopup({
        show: true,
        type: "error",
        title: "Delete Failed",
        message: "Unable to delete student.",
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

  //-----------------------------------
  // INITIAL LOAD
  //-----------------------------------

  useEffect(() => {
    loadStudents();
  }, []);

  //-----------------------------------
  // UI
  //-----------------------------------

  return (

    <Container className="mt-4">

      <Card className="shadow">

        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">
            Teacher — Students Management
          </h4>
        </Card.Header>

        <Card.Body>

          {loading && (
            <div className="text-center">
              <Spinner />
            </div>
          )}

          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}

          {!loading && students.length === 0 && (
            <Alert variant="info">
              No students found.
            </Alert>
          )}

          {!loading && students.length > 0 && (

            <Table bordered hover responsive>

              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Class</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {students.map(student => (

                  <tr key={student.StudentId}>

                    <td>
                      <Badge bg="secondary">
                        {student.StudentId}
                      </Badge>
                    </td>

                    <td>{student.Name}</td>

                    <td>{student.Email}</td>

                    <td>
                      <Badge bg="info">
                        {student.Class}
                      </Badge>
                    </td>

                    <td>
                      {new Date(
                        student.CreatedAt
                      ).toLocaleDateString()}
                    </td>

                    <td>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          setPopup({
                            show: true,
                            type: "confirm",
                            title: "Delete Student",
                            message: "This student will be permanently deleted. Continue?",
                            confirmText: "Delete",
                            cancelText: "Cancel",
                            showCancel: true,
                            loading: false,
                            onConfirm: () => deleteStudent(student.StudentId)
                          })
                        }
                      >
                        Delete
                      </Button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </Table>

          )}

        </Card.Body>

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

export default TeacherStudentsPage;
