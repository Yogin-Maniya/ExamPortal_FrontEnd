import React from "react";
import PropTypes from "prop-types"; // Add this import

const ErrorMessage = ({ message }) => (
  <div className="text-center text-red-500">
    <p>{message}</p>
  </div>
);

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired, // Now PropTypes is defined
};

export default ErrorMessage;