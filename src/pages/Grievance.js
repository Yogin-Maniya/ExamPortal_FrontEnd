import React, { useState } from "react";
import { submitGrievance } from "../services/api";

const Grievance = () => {
  const [grievance, setGrievance] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitGrievance({ grievance });
      alert("Grievance submitted successfully!");
    } catch (error) {
      alert("Failed to submit grievance.");
    }
  };

  return (
    <div>
      <h2>Grievance</h2>
      <form onSubmit={handleSubmit}>
        <textarea value={grievance} onChange={(e) => setGrievance(e.target.value)} required />
        <button type="submit">Submit Grievance</button>
      </form>
    </div>
  );
};

export default Grievance;
