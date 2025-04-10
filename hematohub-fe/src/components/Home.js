import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";
import "./Login.css";

const Introduction = () => {
  const navigate = useNavigate();

  const [userType, setUserType] = useState("donor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Logging in as:", userType);

      const endpoint =
        userType === "admin"
          ? `${API_BASE_URL}/api/admin/login`
          : `${API_BASE_URL}/api/${userType}s/login`;

      const res = await axios.post(endpoint, { email, password });
      const { token } = res.data;

      localStorage.setItem("adminToken", token);
      localStorage.setItem("token", token);
      localStorage.setItem("userType", userType);
      localStorage.setItem("donorId", res.data.userId || "");

      alert("Login successful!");

      navigate(userType === "admin" ? "/admin-dashboard" : `/${userType}-dashboard`);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="introduction-container">
      <div className="overlay"></div>

      <div className="intro-content">
        <h1 className="fade-in">HematoHub : Where Every Drop Fuels a Life</h1>
        <h3>Welcome to <span className="highlight">HematoHub</span></h3>

        <p className="intro-text">
          A smart, efficient, and life-saving <b>Blood Bank Management System </b> 
          designed to seamlessly connect <b>generous donors</b> with <b>hospitals in need</b>.
        </p>

        <div className="animated-list">
          <p>🚑 <b>Urgent need for blood?</b> We’ve got you covered.</p>
          <p>❤ <b>Ready to donate and save lives?</b> Join us today!</p>
          <p>🌍 <b>Together, we build a healthier community.</b></p>
        </div>

        <div className="intro-buttons">
          <div className="login-wrapper">
            <div className="login-container">
              <h2>Login</h2>

              {error && <p className="error">{error}</p>}

              <div className="user-type-select">
                {["donor", "hospital", "admin"].map((type) => (
                  <label key={type} className={userType === type ? "selected" : ""}>
                    <input
                      type="radio"
                      name="userType"
                      value={type}
                      checked={userType === type}
                      onChange={() => {
                        setUserType(type);
                        setEmail("");
                        setPassword("");
                        setIsForgotMode(false);
                        setStep(1);
                      }}
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>

              {!isForgotMode || userType === "admin" ? (
                <>
                  <form onSubmit={handleLogin} className="login-form">
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button type="submit" disabled={loading}>
                      {loading ? "Logging in..." : "Login"}
                    </button>
                  </form>

                  {userType !== "admin" && (
                    <p className="forgot-password">
                      <span
                        onClick={() => {
                          setIsForgotMode(true);
                          setEmail("");
                          setPassword("");
                          setStep(1);
                        }}
                      >
                        Forgot Password?
                      </span>
                    </p>
                  )}
                </>
              ) : (
                <>
                  {step === 1 ? (
                    <>
                      <input
                        type="email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <button
                        onClick={async () => {
                          try {
                            await axios.post(`${API_BASE_URL}/api/${userType}s/forgot-password`, { email });
                            alert("Code sent to your email.");
                            setStep(2);
                          } catch (err) {
                            alert(err.response?.data?.message || "Failed to send reset code.");
                          }
                        }}
                      >
                        Send Reset Code
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Enter the code"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        required
                      />
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        disabled={!resetCode || !newPassword}
                        onClick={async () => {
                          try {
                            await axios.post(`${API_BASE_URL}/api/${userType}s/reset-password`, {
                              email,
                              code: resetCode,
                              newPassword,
                            });
                            alert("Password reset successful!");
                            setIsForgotMode(false);
                            setEmail("");
                            setResetCode("");
                            setNewPassword("");
                            setStep(1);
                          } catch (err) {
                            alert(err.response?.data?.message || "Password reset failed.");
                          }
                        }}
                      >
                        Reset Password
                      </button>
                    </>
                  )}

                  <p className="back-to-login">
                    <span
                      onClick={() => {
                        setIsForgotMode(false);
                        setStep(1);
                        setEmail("");
                        setResetCode("");
                        setNewPassword("");
                      }}
                    >
                      Back to Login
                    </span>
                  </p>
                </>
              )}

              <p className="account">
                Don't have an account? <br />
                <span className="register-link" onClick={() => navigate("/register")}>
                  Register as Donor
                </span>{" "}
                |{" "}
                <span
                  className="register-link"
                  onClick={() => navigate("/register?type=hospital")}
                >
                  Register as Hospital
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Introduction;
