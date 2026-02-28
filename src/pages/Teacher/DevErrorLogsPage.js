import React, { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Container, Card, Table, Spinner, Alert, Button, Form } from "react-bootstrap";
import { getDeveloperErrorLogs } from "../../services/api";

const DevErrorLogsPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const key = query.get("key") || "";
  const [limit, setLimit] = useState(100);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(true);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token || !key) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (!decoded.adminId) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
    } catch {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    const loadLogs = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getDeveloperErrorLogs(key, limit);
        setLogs(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.error || "Unable to load developer logs.");
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [key, limit, reloadTick]);

  if (!authorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <strong>Developer Error Logs (Internal)</strong>
          <div className="d-flex align-items-center gap-2">
            <Form.Select
              size="sm"
              style={{ width: "120px" }}
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
            </Form.Select>
            <Button size="sm" variant="outline-secondary" onClick={() => setReloadTick((v) => v + 1)}>
              Refresh
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {loading && (
            <div className="text-center py-4">
              <Spinner />
            </div>
          )}
          {!loading && error && <Alert variant="danger">{error}</Alert>}
          {!loading && !error && (
            <Table bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Route</th>
                  <th>User</th>
                  <th>Message</th>
                  <th>Created</th>
                  <th>Stack Trace</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={`${idx}-${log.Route || "route"}`}>
                    <td>{log.StatusCode || "-"}</td>
                    <td>{log.Method || "-"}</td>
                    <td>{log.Route || "-"}</td>
                    <td>{log.UserType || "-"} #{log.UserId ?? "-"}</td>
                    <td style={{ minWidth: "260px" }}>{log.Message || "-"}</td>
                    <td>{log.CreatedAt ? new Date(log.CreatedAt).toLocaleString() : "-"}</td>
                    <td style={{ minWidth: "420px", whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "12px" }}>
                      {log.StackTrace || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DevErrorLogsPage;
