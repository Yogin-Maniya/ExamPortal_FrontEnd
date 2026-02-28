import React from "react";
import { Container, Card, Button, Badge } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

const ErrorPage = () => {

  const navigate = useNavigate();
  const location = useLocation();

  //-----------------------------------------
  // READ QUERY PARAM
  //-----------------------------------------

  const queryParams = new URLSearchParams(location.search);
  const queryMessage = queryParams.get("msg");

  //-----------------------------------------
  // READ SESSION STORAGE (API INTERCEPTOR)
  //-----------------------------------------

  const storedError = sessionStorage.getItem("app_error");
  const parsedError = storedError
    ? JSON.parse(storedError)
    : null;

  //-----------------------------------------
  // FINAL ERROR PRIORITY
  //-----------------------------------------

  const errorData =
    location.state?.error ||
    parsedError ||
    queryMessage;

  const message =
    errorData?.message ||
    errorData?.error ||
    errorData ||
    "Something went wrong.";

  const statusCode =
    errorData?.status ||
    errorData?.statusCode ||
    null;

  //-----------------------------------------
  // UI
  //-----------------------------------------

  return (

    <Container className="mt-5">

      <Card className="shadow text-center p-4">

        <h2 className="text-danger mb-3">
          Application Error
        </h2>

        {statusCode && (
          <Badge bg="danger" className="mb-3">
            Error Code: {statusCode}
          </Badge>
        )}

        <p>{message}</p>

        <div className="mt-3">

          <Button
            className="me-2"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate("/")}
          >
            Home
          </Button>

        </div>

      </Card>

    </Container>

  );

};

export default ErrorPage;