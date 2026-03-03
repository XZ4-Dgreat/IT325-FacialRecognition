import React from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import Header from "../images/header-design.png";
import Logo from "../images/home-logo.png";
import "../css/home.css";

const Home = () => {
  // Capitalize component name (convention)
  const navigate = useNavigate(); // Add this hook

  return (
    <div className="home-container">
      <div className="header-container">
        <img src={Header} alt="Header" className="header-image" />
      </div>
      <div className="logo-container">
        <img src={Logo} alt="Logo" className="logo-image" />
      </div>
      <div className="button-container">
        <div className="bcr">
          <button
            className="home-button"
            onClick={() => navigate("/login")} // Add navigation
          >
            Log In
          </button>
        </div>
        <div className="bcl">
          <button
            className="home-button"
            onClick={() => navigate("/signup")} // Add navigation
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home; // Capitalized export
