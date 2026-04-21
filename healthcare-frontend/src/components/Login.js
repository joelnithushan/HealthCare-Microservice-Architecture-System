import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../services/api";
import logo from "../assets/logo.png";
import toast from "react-hot-toast";

const validate = (email, password) => {
  const errors = {};
  if (!email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Please enter a valid email address.";
  if (!password) errors.password = "Password is required.";
  else if (password.length < 8)
    errors.password = "Password must be at least 8 characters.";
  return errors;
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const extractErrorMessage = (err) => {
    const data = err?.response?.data;
    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    return err?.message || "";
  };

  // Removed auto-fill logic to ensure a clean login state on every refresh

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = validate(email, password);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        // Removed 'rememberedEmail' storage logic

        window.dispatchEvent(new Event("userUpdated"));
        // Role-based redirect
        const role = response.data.user?.role;
        if (role === "ADMIN") navigate("/admin/dashboard");
        else if (role === "DOCTOR") navigate("/doctor/dashboard");
        else navigate("/patient/dashboard");
      } else {
        toast.error("Login failed. No token received.");
      }
    } catch (err) {
      const errorMsg = extractErrorMessage(err);
      const normalized = errorMsg.toLowerCase();

      if (normalized.includes("pending administrator approval")) {
        toast.error(
          "Your doctor account is pending administrator approval. Please wait for approval.",
        );
      } else if (normalized.includes("account has been suspended")) {
        toast.error(
          "Your account has been suspended. Please contact administration.",
        );
      } else {
        toast.error("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/google", {
        token: credentialResponse.credential,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      window.dispatchEvent(new Event("userUpdated"));
      const user = response.data.user;
      const role = user?.role;
      if (user?.profileComplete === false) {
        navigate("/complete-profile");
      } else if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "DOCTOR") navigate("/doctor/dashboard");
      else navigate("/patient/dashboard");
    } catch (err) {
      const errorMsg = extractErrorMessage(err);
      const normalized = errorMsg.toLowerCase();

      if (normalized.includes("pending administrator approval")) {
        toast.error(
          "Your doctor account is pending administrator approval. Please wait for approval.",
        );
      } else if (normalized.includes("account has been suspended")) {
        toast.error(
          "Your account has been suspended. Please contact administration.",
        );
      } else {
        toast.error(errorMsg || "Google Sign-In failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Sign-In was unsuccessful. Try again later.");
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.cardContainer}>
        {/* Left blue branding panel */}
        <div style={styles.brandPanel}>
          <img src={logo} alt="Clinexa" style={styles.brandLogo} />
          <h2 style={styles.brandTitle}>Welcome to Clinexa</h2>
          <p style={styles.brandSub}>
            Book appointments and access telemedicine services from Sri Lanka's
            leading healthcare professionals.
          </p>
        </div>

        {/* Right white form panel */}
        <div style={styles.formPanel}>
          <h2 style={styles.formTitle}>Sign in</h2>
          <p style={styles.formSub}>
            Please enter your email and password to login
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              size="large"
              width="100%"
            />
          </div>

          <div style={styles.divider}>
            <span style={styles.dividerText}>or sign in manually</span>
          </div>

          <form onSubmit={handleLogin} noValidate>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                className="flat-input"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((p) => ({ ...p, email: "" }));
                }}
                placeholder="nimal.p@gmail.com"
                style={{
                  ...styles.input,
                  ...(fieldErrors.email ? { borderColor: "red" } : {}),
                }}
              />
              {fieldErrors.email && (
                <span style={styles.fieldError}>{fieldErrors.email}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="flat-input"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((p) => ({ ...p, password: "" }));
                  }}
                  placeholder="Enter your password"
                  style={{
                    ...styles.input,
                    paddingRight: "40px",
                    ...(fieldErrors.password ? { borderColor: "red" } : {}),
                  }}
                />
                <div
                  onClick={togglePasswordVisibility}
                  style={styles.eyeIconContainer}
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </div>
              </div>
              {fieldErrors.password && (
                <span style={styles.fieldError}>{fieldErrors.password}</span>
              )}

              <div style={styles.optionsRow}>
                <div /> {/* Spacer to keep Forgot password aligned to right */}
                <Link to="/forgot-password" style={styles.forgotPassword}>
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="flat-btn"
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: "24px" }}></div>

          <p style={styles.switchText}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.switchLink}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    minHeight: "calc(100vh - 80px)", // Account for header height if exists
  },
  cardContainer: {
    display: "flex",
    maxWidth: 900,
    width: "100%",
    boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
    borderRadius: "24px",
    overflow: "hidden", // Added this to properly curve edges and prevent inner panels from making it uncurved
  },
  brandPanel: {
    flex: "0 0 40%",
    background: "var(--primary)",
    color: "#fff",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  brandLogo: {
    height: 110,
    objectFit: "contain",
    marginBottom: 16,
    alignSelf: "center",
    filter: "brightness(0) invert(1)",
  },
  brandTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    marginBottom: 12,
    color: "#fff",
  },
  brandSub: {
    fontSize: "0.9rem",
    lineHeight: 1.6,
    opacity: 0.9,
    color: "#fff",
  },
  formPanel: {
    flex: 1,
    background: "#fff",
    padding: "25px 35px",
  },
  formTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "var(--text-main)",
    marginBottom: 8,
  },
  formSub: {
    color: "var(--text-muted)",
    fontSize: "0.875rem",
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "var(--text-muted)",
    marginBottom: 6,
  },
  input: {
    borderRadius: "8px",
  },
  fieldError: {
    display: "block",
    color: "#ef4444",
    fontSize: "0.75rem",
    marginTop: 4,
    fontWeight: 500,
  },
  submitBtn: {
    width: "100%",
    marginTop: 4,
    padding: "12px",
    fontSize: "1rem",
    borderRadius: "8px",
  },
  divider: {
    textAlign: "center",
    margin: "16px 0",
    position: "relative",
    borderTop: "1px solid var(--border-light)",
  },
  dividerText: {
    position: "relative",
    top: -10,
    background: "#fff",
    padding: "0 12px",
    color: "var(--text-muted)",
    fontSize: "0.8rem",
  },
  switchText: {
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "0.875rem",
  },
  switchLink: {
    color: "var(--primary)",
    fontWeight: 600,
    textDecoration: "underline",
  },
  forgotPassword: {
    color: "var(--primary)", // Professional blue matching primary theme
    fontSize: "0.9rem",
    fontWeight: "500",
    textDecoration: "none",
  },
  optionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "16px",
    marginBottom: "8px",
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: "12px",
    background: "#fff",
    border: "1px solid var(--border-light)",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text-main)",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    transition: "background 0.2s ease",
  },
  googleIcon: {
    width: "20px",
    height: "20px",
  },
  eyeIconContainer: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default Login;
