import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../images/header-design.png";
import Logo from "../images/home-logo.png";
import Username from "../images/username.png";
import Password from "../images/password.png";
import FullName from "../images/fullname.png";
import FaceRecog from "./facerecog";
import "../css/signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [showFaceRecog, setShowFaceRecog] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [faceData, setFaceData] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    password: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Password validation function
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("At least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("At least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("At least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("At least one number");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("At least one special character (!@#$%^&* etc.)");
    }

    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate password in real-time
    if (name === "password") {
      setPasswordErrors(validatePassword(value));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFaceDetected = (data: any) => {
    console.log("Face detected in signup:", data);
    setFaceData(data);
    setFaceRegistered(true);
    setShowFaceRecog(false);
  };

  const handleSignup = async () => {
    // Validate all fields
    if (!formData.fullname || !formData.username || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    // Validate password
    const errors = validatePassword(formData.password);
    if (errors.length > 0) {
      setError("Please meet all password requirements: " + errors.join(", "));
      return;
    }

    if (!faceRegistered) {
      setError("Please complete facial recognition first");
      return;
    }

    setLoading(true);
    setError("");

    // DEBUG LOGGING
    console.log("=== SIGNUP DEBUG ===");
    console.log("Username:", formData.username);
    console.log("Fullname:", formData.fullname);
    console.log("Face descriptor type:", typeof faceData?.descriptor);
    console.log(
      "Face descriptor keys:",
      faceData?.descriptor ? Object.keys(faceData.descriptor) : "No face data",
    );
    console.log(
      "Full face descriptor:",
      JSON.stringify(faceData?.descriptor, null, 2),
    );
    console.log("Face image present:", !!faceData?.image);

    const requestData = {
      fullname: formData.fullname,
      username: formData.username,
      password: formData.password,
      face_descriptor: faceData?.descriptor || [],
      face_image: faceData?.image || "",
    };

    console.log("Sending data:", requestData);

    try {
      const response = await fetch(
        "http://localhost/IT_325/biometrics-authentication/src/assets/api/register.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        },
      );

      console.log("Response status:", response.status);

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
      console.log("Response data:", data);

      if (data.success) {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
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
              onFaceDetected={handleFaceDetected}
              mode="signup"
              username={formData.username}
            />
          )}

          <div className="lil">
            <div className="logo-container-ls">
              <img src={Logo} alt="Logo" className="logo-image-ls" />
              <button
                className="home-button-li"
                onClick={() => navigate("/login")}
              >
                Log In
              </button>
            </div>
          </div>

          <div className="lir">
            <div className="header-ls">
              <div className="ca">Create</div>
              <div className="ca">Account</div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="lir-inputfields">
              <div className="fullname">
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="fullname"
                    placeholder="Fullname"
                    className="input-field"
                    value={formData.fullname}
                    onChange={handleInputChange}
                  />
                  <div className="input-image-section">
                    <img src={FullName} alt="icon" className="input-image" />
                  </div>
                </div>
              </div>

              <div className="username">
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="input-field"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                  <div className="input-image-section">
                    <img src={Username} alt="icon" className="input-image" />
                  </div>
                </div>
              </div>

              <div className="password-field">
                <div className="input-wrapper password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className="input-field password-input"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    tabIndex={-1}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                  <div className="input-image-section">
                    <img src={Password} alt="icon" className="input-image" />
                  </div>
                </div>

                {/* Password requirements */}
                {formData.password && (
                  <div className="password-requirements">
                    <p className="requirements-title">Password must contain:</p>
                    <ul>
                      <li
                        className={
                          formData.password.length >= 8 ? "valid" : "invalid"
                        }
                      >
                        ✓ At least 8 characters
                      </li>
                      <li
                        className={
                          /[A-Z]/.test(formData.password) ? "valid" : "invalid"
                        }
                      >
                        ✓ At least one uppercase letter
                      </li>
                      <li
                        className={
                          /[a-z]/.test(formData.password) ? "valid" : "invalid"
                        }
                      >
                        ✓ At least one lowercase letter
                      </li>
                      <li
                        className={
                          /[0-9]/.test(formData.password) ? "valid" : "invalid"
                        }
                      >
                        ✓ At least one number
                      </li>
                      <li
                        className={
                          /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                            formData.password,
                          )
                            ? "valid"
                            : "invalid"
                        }
                      >
                        ✓ At least one special character (!@#$%^&*)
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="lir-buttons">
                <div className="lir-w">
                  <button
                    className={`home-button-lir lir-fr ${faceRegistered ? "completed" : ""}`}
                    onClick={() => {
                      if (!formData.username) {
                        setError("Please enter username first");
                        return;
                      }
                      setShowFaceRecog(true);
                    }}
                    disabled={faceRegistered}
                  >
                    {faceRegistered
                      ? "Face Registered ✓"
                      : "Facial Recognition"}
                  </button>
                  <h3 style={{ color: faceRegistered ? "green" : "red" }}>
                    {faceRegistered ? "Completed" : "Required"}
                  </h3>
                </div>
              </div>

              <div className="lir-bottom">
                <div className="lir-l">
                  <button
                    className="home-button-lir lir-ls"
                    onClick={handleSignup}
                    disabled={loading || !faceRegistered}
                  >
                    {loading ? "Processing..." : "Sign Up"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
