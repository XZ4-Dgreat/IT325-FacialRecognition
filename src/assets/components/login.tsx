import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../images/header-design.png";
import Logo from "../images/home-logo.png";
import Username from "../images/username.png";
import Password from "../images/password.png";
import FaceRecog from "./facerecog";
import "../css/login.css";

const Login = () => {
  const navigate = useNavigate();
  const [showFaceRecog, setShowFaceRecog] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTraditionalLogin = async () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost/IT_325/biometrics-authentication/src/assets/api/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Login successful!");
        navigate("/landingpage"); // CHANGED FROM /dashboard
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLogin = async (faceData: any) => {
    setLoading(true);
    setError("");

    try {
      console.log("=== FACE LOGIN DEBUG ===");
      console.log("Username:", username);
      console.log("Face descriptor keys:", Object.keys(faceData.descriptor));
      console.log(
        "Full face descriptor:",
        JSON.stringify(faceData.descriptor, null, 2),
      );
      console.log("Face image present:", !!faceData.image);

      const response = await fetch(
        "http://localhost/IT_325/biometrics-authentication/src/assets/api/face-login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            face_descriptor: faceData.descriptor,
          }),
        },
      );

      console.log("Face login response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.message);
        } catch {
          setError(`HTTP error! status: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      console.log("Face login response data:", data);

      if (data.success) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert(`Face login successful! (${Math.round(data.similarity)}% match)`);
        navigate("/landingpage"); // CHANGED FROM /dashboard
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Face login error:", err);
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="home-container-ls">
        <div className="header-container-ls">
          <img src={Header} alt="Header" className="header-image" />
        </div>

        <div className="login-container">
          {showFaceRecog && (
            <FaceRecog
              onClose={() => setShowFaceRecog(false)}
              onFaceDetected={handleFaceLogin}
              mode="login"
              username={username}
            />
          )}

          <div className="lil">
            <div className="logo-container-ls">
              <img src={Logo} alt="Logo" className="logo-image-ls" />
              <button
                className="home-button-ls"
                onClick={() => navigate("/signup")}
              >
                Create Account
              </button>
            </div>
          </div>

          <div className="lir">
            <div className="header-ls">
              <div className="wb">Welcome Back</div>
              <div className="wb">Back!</div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="lir-inputfields">
              <div className="username">
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Username"
                    className="input-field"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <div className="input-image-section">
                    <img src={Username} alt="icon" className="input-image" />
                  </div>
                </div>
              </div>
              <div className="password">
                <div className="input-wrapper">
                  <input
                    type="password"
                    placeholder="Password"
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="input-image-section">
                    <img src={Password} alt="icon" className="input-image" />
                  </div>
                </div>
              </div>
              <div className="lir-buttons">
                <div className="lir-l">
                  <button
                    className="home-button-lir lir-ls"
                    onClick={handleTraditionalLogin}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Log In"}
                  </button>
                </div>
                <div className="lir-r">
                  <button
                    className="home-button-lir lir-fr"
                    onClick={() => {
                      if (!username) {
                        setError("Please enter username first");
                        return;
                      }
                      setShowFaceRecog(true);
                    }}
                    disabled={loading}
                  >
                    Facial Recognition
                  </button>
                </div>
              </div>
              <div className="lir-bottom">
                <h3>Forgot Password?</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
