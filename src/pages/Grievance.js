import React, { useState } from "react";
import { submitGrievance } from "../services/api";
import AdvancedPopup from "../components/AdvancedPopup";

const Grievance = () => {
  const [grievance, setGrievance] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitGrievance({ grievance });
      setPopup({
        show: true,
        type: "success",
        title: "Submitted",
        message: "Grievance submitted successfully.",
        confirmText: "OK",
        cancelText: "Cancel",
        showCancel: false,
        loading: false,
        onConfirm: null
      });
      setGrievance("");
    } catch (error) {
      setPopup({
        show: true,
        type: "error",
        title: "Submit Failed",
        message: "Failed to submit grievance.",
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

  return (
    <div>
      <h2>Grievance</h2>
      <form onSubmit={handleSubmit}>
        <textarea value={grievance} onChange={(e) => setGrievance(e.target.value)} required />
        <button type="submit">Submit Grievance</button>
      </form>
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
    </div>
  );
};

export default Grievance;
