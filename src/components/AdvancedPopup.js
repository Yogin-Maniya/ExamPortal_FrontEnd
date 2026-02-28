import React from "react";
import { Modal, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from "react-icons/fa";
import "./AdvancedPopup.css";

const popupTheme = {
  success: {
    icon: <FaCheckCircle />,
    iconBg: "rgba(22, 163, 74, 0.15)",
    iconColor: "#15803d",
    banner: "linear-gradient(90deg, #16a34a, #22c55e)"
  },
  error: {
    icon: <FaTimesCircle />,
    iconBg: "rgba(220, 38, 38, 0.15)",
    iconColor: "#b91c1c",
    banner: "linear-gradient(90deg, #dc2626, #ef4444)"
  },
  confirm: {
    icon: <FaExclamationTriangle />,
    iconBg: "rgba(217, 119, 6, 0.15)",
    iconColor: "#b45309",
    banner: "linear-gradient(90deg, #f59e0b, #fb923c)"
  },
  info: {
    icon: <FaInfoCircle />,
    iconBg: "rgba(37, 99, 235, 0.15)",
    iconColor: "#1d4ed8",
    banner: "linear-gradient(90deg, #2563eb, #3b82f6)"
  }
};

const AdvancedPopup = ({
  show,
  type = "info",
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = true,
  loading = false
}) => {
  const theme = popupTheme[type] || popupTheme.info;

  return (
    <Modal
      show={show}
      onHide={loading ? undefined : onClose}
      centered
      backdropClassName="advanced-popup-backdrop"
      dialogClassName="advanced-popup-modal"
    >
      <Modal.Header closeButton={!loading}>
        <div className="w-100">
          <div className="advanced-popup-banner" style={{ background: theme.banner }} />
        </div>
      </Modal.Header>
      <Modal.Body>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div
            className="advanced-popup-icon"
            style={{ background: theme.iconBg, color: theme.iconColor }}
          >
            {theme.icon}
          </div>
          <h5 className="fw-bold mb-2">{title}</h5>
          <p className="advanced-popup-message">{message}</p>
          <div className="d-flex justify-content-end gap-2 mt-4">
            {showCancel && (
              <Button variant="outline-secondary" onClick={onClose} disabled={loading}>
                {cancelText}
              </Button>
            )}
            <Button
              variant={type === "error" ? "danger" : "primary"}
              onClick={onConfirm || onClose}
              disabled={loading}
            >
              {loading ? "Please wait..." : confirmText}
            </Button>
          </div>
        </motion.div>
      </Modal.Body>
    </Modal>
  );
};

export default AdvancedPopup;
