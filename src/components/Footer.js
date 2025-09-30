import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-10">
      <div className="container mx-auto text-center">
        {/* Links */}
        <div className="mb-3">
          <Link to="/privacy-policy" className="text-gray-400 hover:text-white mx-2">Privacy Policy</Link>
          <Link to="/terms" className="text-gray-400 hover:text-white mx-2">Terms of Service</Link>
          <Link to="/contact" className="text-gray-400 hover:text-white mx-2">Contact Us</Link>
        </div>

        {/* Social Icons */}
        <div className="mb-3">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white mx-2">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white mx-2">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white mx-2">
            <i className="fab fa-linkedin"></i>
          </a>
        </div>

        {/* Copyright */}
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} ExamPortal. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
