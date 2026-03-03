import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../images/header-design.png";
import Logo from "../images/home-logo.png";
import "../css/landingpage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("auth_token");

    if (!userData || !token) {
      // No user found, redirect to login
      navigate("/login");
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");

    // Redirect to home page
    navigate("/");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="landing-container">
      {" "}
      {/* CHANGED */}
      <div className="landing-header-container">
        {" "}
        {/* CHANGED */}
        <img src={Header} alt="Header" className="landing-header-image" />{" "}
        {/* CHANGED */}
      </div>
      <div className="landing-logo-container">
        {" "}
        {/* CHANGED */}
        <img src={Logo} alt="Logo" className="landing-logo-image" />{" "}
        {/* CHANGED */}
      </div>
      <div className="landing-welcome-container">
        {" "}
        {/* CHANGED */}
        <h1 className="landing-welcome-title">Welcome!</h1> {/* CHANGED */}
        <h2 className="landing-welcome-name">{user.fullname}</h2>{" "}
        {/* CHANGED */}
        <p className="landing-welcome-subtitle">
          You have successfully logged in
        </p>{" "}
        {/* CHANGED */}
      </div>
      <div className="landing-button-container">
        {" "}
        {/* CHANGED */}
        <div className="landing-bcr">
          {" "}
          {/* CHANGED */}
          <button
            className="landing-home-button landing-logout-button"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
