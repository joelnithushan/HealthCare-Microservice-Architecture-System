import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../services/api";
import logo from "../assets/logo.png";
import toast from "react-hot-toast";
import {
  validateNIC,
  validateLankanMobile,
  validateEmail,
  validateSLMC,
  validateDOB,
} from "../utils/validations";

const SRI_LANKAN_DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Moneragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

const validateDoctor = (data) => {
  const errors = {};
  if (!data.name.trim()) errors.name = "Full name is required.";
  else if (!/^[a-zA-Z\s.]+$/.test(data.name))
    errors.name = "Name can only contain letters, spaces, and periods.";

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;

  if (!data.password) errors.password = "Password is required.";
  else if (data.password.length < 8)
    errors.password = "Password must be at least 8 characters.";
  else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(data.password))
    errors.password = "Password needs at least 1 uppercase and 1 number.";

  const nicErr = validateNIC(data.nic);
  if (nicErr) errors.nic = nicErr;

  const mobErr = validateLankanMobile(data.mobileNumber);
  if (mobErr) errors.mobileNumber = mobErr;

  const slmcErr = validateSLMC(data.slmcNumber);
  if (slmcErr) errors.slmcNumber = slmcErr;

  const dobErr = validateDOB(data.dob);
  if (dobErr) errors.dob = dobErr;

  if (!data.gender) errors.gender = "Gender is required.";
  if (!data.district) errors.district = "District is required.";

  if (!data.specialization.trim())
    errors.specialization = "Please select a specialization.";
  if (!data.hospitalAttached.trim())
    errors.hospitalAttached = "Please specify primary hospital.";
  return errors;
};

const OTP_LENGTH = 6;

const RegisterDoctor = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "DOCTOR",
    nic: "",
    mobileNumber: "+94",
    dob: "",
    gender: "",
    slmcNumber: "",
    specialization: "",
    hospitalAttached: "",
    district: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef([]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  // Step 1: Validate form and send OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = validateDoctor(formData);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await api.post("/auth/send-otp", { email: formData.email });
      setShowOtpModal(true);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setOtpError("");
      setResendCooldown(60);
      toast.success(`Verification code sent to ${formData.email}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to send verification code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setOtpError("");
    if (value && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpInputRefs.current[focusIdx]?.focus();
  };

  // Step 2: Verify OTP then register
  const handleVerifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== OTP_LENGTH) {
      setOtpError("Please enter all 6 digits.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    try {
      await api.post("/auth/verify-otp", { email: formData.email, otp });
      toast.success("Email verified! Creating your account…");

      try {
        await api.post("/auth/register", formData);
        
        // Sync to Doctor Service
        try {
          await api.post("/doctors", {
            name: formData.name,
            email: formData.email,
            specialization: formData.specialization,
            phone: formData.mobileNumber,
            availability: "Schedule pending verification"
          });
        } catch (docErr) {
          console.error("Doctor profile sync failed:", docErr);
        }

        toast.success(
          "Doctor Application submitted successfully! Redirecting to login…",
        );
        setShowOtpModal(false);
        setTimeout(() => navigate("/login"), 2000);
      } catch (regErr) {
        toast.error(
          regErr.response?.data?.message ||
            "Registration failed. SLMC or Email might be registered.",
        );
        setShowOtpModal(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed.";
      setOtpError(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtpLoading(true);
    try {
      await api.post("/auth/send-otp", { email: formData.email });
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setOtpError("");
      setResendCooldown(60);
      toast.success("New verification code sent!");
    } catch (err) {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/google", {
        token: credentialResponse.credential,
        role: "DOCTOR",
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      window.dispatchEvent(new Event("userUpdated"));
      
      if (response.data.user?.profileComplete === false) {
        navigate("/complete-profile");
      } else {
        navigate("/doctor/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Google Sign-up failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Sign-up was unsuccessful. Try again later.");
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.cardContainer}>
        <div style={styles.brandPanel}>
          <img src={logo} alt="Clinexa" style={styles.brandLogo} />
          <h2 style={styles.brandTitle}>Doctor Portal</h2>
          <p style={styles.brandSub}>
            Join Sri Lanka's fastest growing digital hospital network. Register
            with your SLMC number to start accepting patient appointments.
          </p>
        </div>

        <div style={styles.formPanel}>
          <h2 style={styles.formTitle}>Physician Registration</h2>
          <p style={styles.formSub}>
            Looking for Patient Registration?{" "}
            <Link to="/register/patient" style={styles.switchLink}>
              Click Here
            </Link>
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
              theme="outline"
              size="large"
              width="100%"
            />
          </div>

          <div style={styles.divider}>
            <span style={styles.dividerText}>or register manually</span>
          </div>

          <form onSubmit={handleRegister} noValidate style={styles.formGrid}>
            <div style={{ ...styles.formGroup, gridColumn: "span 2" }}>
              <label style={styles.label}>Full Name (With Title)</label>
              <input
                type="text"
                name="name"
                className="flat-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Dr. Sanjeewa Fernando"
                style={styles.input}
              />
              {fieldErrors.name && (
                <span style={styles.fieldError}>{fieldErrors.name}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                className="flat-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="sanjeewa.f@gmail.com"
                style={styles.input}
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
                  name="password"
                  className="flat-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{ ...styles.input, paddingRight: "40px" }}
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
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>SLMC Registration No.</label>
              <input
                type="text"
                name="slmcNumber"
                className="flat-input"
                value={formData.slmcNumber}
                onChange={handleChange}
                placeholder="e.g. 23456"
                style={styles.input}
              />
              {fieldErrors.slmcNumber && (
                <span style={styles.fieldError}>{fieldErrors.slmcNumber}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Primary Hospital / Clinic</label>
              <input
                type="text"
                name="hospitalAttached"
                className="flat-input"
                value={formData.hospitalAttached}
                onChange={handleChange}
                placeholder="e.g. Nawaloka Hospital"
                style={styles.input}
              />
              {fieldErrors.hospitalAttached && (
                <span style={styles.fieldError}>
                  {fieldErrors.hospitalAttached}
                </span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Specialization</label>
              <select
                name="specialization"
                className="flat-input"
                value={formData.specialization}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select Specialization</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="General Physician">General Physician</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Neurologist">Neurologist</option>
              </select>
              {fieldErrors.specialization && (
                <span style={styles.fieldError}>
                  {fieldErrors.specialization}
                </span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Mobile Number</label>
              <input
                type="text"
                name="mobileNumber"
                className="flat-input"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="e.g. +94712345678"
                style={styles.input}
              />
              {fieldErrors.mobileNumber && (
                <span style={styles.fieldError}>
                  {fieldErrors.mobileNumber}
                </span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>National Identity Card (NIC)</label>
              <input
                type="text"
                name="nic"
                className="flat-input"
                value={formData.nic}
                onChange={handleChange}
                placeholder="e.g. 198512345678"
                style={styles.input}
              />
              {fieldErrors.nic && (
                <span style={styles.fieldError}>{fieldErrors.nic}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Gender</label>
              <select
                name="gender"
                className="flat-input"
                value={formData.gender}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {fieldErrors.gender && (
                <span style={styles.fieldError}>{fieldErrors.gender}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Date of Birth</label>
              <input
                type="date"
                name="dob"
                className="flat-input"
                value={formData.dob}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
                style={styles.input}
              />
              {fieldErrors.dob && (
                <span style={styles.fieldError}>{fieldErrors.dob}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>District</label>
              <select
                name="district"
                className="flat-input"
                value={formData.district}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select your district</option>
                {SRI_LANKAN_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {fieldErrors.district && (
                <span style={styles.fieldError}>{fieldErrors.district}</span>
              )}
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <button
                type="submit"
                className="flat-btn"
                style={styles.submitBtn}
                disabled={loading}
              >
                {loading ? "Sending Verification Code…" : "Register as Doctor"}
              </button>
            </div>
          </form>

          <p style={styles.switchText}>
            Already have a doctor account?{" "}
            <Link to="/login" style={styles.switchLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button
              onClick={() => setShowOtpModal(false)}
              style={styles.modalClose}
            >
              &times;
            </button>

            <div style={styles.modalIcon}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>

            <h3 style={styles.modalTitle}>Verify Your Email</h3>
            <p style={styles.modalSub}>
              We've sent a 6-digit code to
              <br />
              <strong style={{ color: "#0ea5e9" }}>{formData.email}</strong>
            </p>

            <div style={styles.otpContainer} onPaste={handleOtpPaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  style={{
                    ...styles.otpInput,
                    borderColor: otpError
                      ? "#ef4444"
                      : digit
                        ? "#0ea5e9"
                        : "#e2e8f0",
                    background: digit ? "#f0f9ff" : "#fff",
                  }}
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            {otpError && (
              <div style={styles.otpErrorBox}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>{otpError}</span>
              </div>
            )}

            <button
              onClick={handleVerifyOtp}
              className="flat-btn"
              style={styles.verifyBtn}
              disabled={otpLoading || otpDigits.join("").length !== OTP_LENGTH}
            >
              {otpLoading ? "Verifying…" : "Verify & Register"}
            </button>

            <p style={styles.resendText}>
              Didn't receive the code?{" "}
              {resendCooldown > 0 ? (
                <span style={{ color: "#94a3b8" }}>
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  onClick={handleResendOtp}
                  style={styles.resendBtn}
                  disabled={otpLoading}
                >
                  Resend Code
                </button>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  pageWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    minHeight: "calc(100vh - 80px)",
    animation: "fadeIn 0.5s ease",
  },
  cardContainer: {
    display: "flex",
    maxWidth: 1000,
    width: "100%",
    boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
    borderRadius: "24px",
    overflow: "hidden",
  },
  brandPanel: {
    flex: "0 0 32%",
    background: "var(--navy)",
    color: "#fff",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  brandLogo: {
    height: 100,
    objectFit: "contain",
    marginBottom: 16,
    alignSelf: "center",
    filter: "brightness(0) invert(1)",
  },
  brandTitle: {
    fontSize: "1.8rem",
    fontWeight: 700,
    marginBottom: 8,
    color: "#fff",
  },
  brandSub: {
    fontSize: "0.95rem",
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
    marginBottom: 4,
  },
  formSub: {
    color: "var(--text-muted)",
    fontSize: "0.9rem",
    marginBottom: 16,
  },
  divider: {
    textAlign: "center",
    margin: "12px 0",
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
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: 500,
    color: "var(--text-muted)",
    marginBottom: 6,
  },
  input: {
    borderRadius: "8px",
    border: "1px solid var(--border-light)",
    padding: "10px 14px",
    backgroundColor: "var(--bg-main)",
  },
  fieldError: {
    color: "#ef4444",
    fontSize: "0.75rem",
    marginTop: 4,
    fontWeight: 500,
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    fontSize: "1rem",
    borderRadius: "8px",
    marginTop: 4,
    background: "var(--navy)",
  },
  switchText: {
    textAlign: "center",
    marginTop: 16,
    color: "var(--text-muted)",
    fontSize: "0.9rem",
  },
  switchLink: {
    color: "var(--navy)",
    fontWeight: 600,
    textDecoration: "none",
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
  // OTP Modal
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    animation: "fadeIn 0.3s ease",
  },
  modalContent: {
    background: "#fff",
    borderRadius: "20px",
    padding: "40px",
    width: "100%",
    maxWidth: "440px",
    textAlign: "center",
    position: "relative",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    animation: "fadeIn 0.3s ease",
  },
  modalClose: {
    position: "absolute",
    top: "16px",
    right: "20px",
    background: "none",
    border: "none",
    fontSize: "24px",
    color: "#94a3b8",
    cursor: "pointer",
    padding: "4px 8px",
    lineHeight: 1,
  },
  modalIcon: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#f0f9ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  modalTitle: {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: 8,
  },
  modalSub: {
    color: "#64748b",
    fontSize: "0.9rem",
    lineHeight: 1.5,
    marginBottom: 28,
  },
  otpContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: 20,
  },
  otpInput: {
    width: "48px",
    height: "56px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: 700,
    fontFamily: "monospace",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    outline: "none",
    transition: "all 0.2s ease",
    color: "#1e293b",
  },
  otpErrorBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#fef2f2",
    color: "#ef4444",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "0.85rem",
    fontWeight: 500,
    marginBottom: 16,
    border: "1px solid #fecaca",
  },
  verifyBtn: {
    width: "100%",
    padding: "14px",
    fontSize: "1rem",
    borderRadius: "12px",
    marginBottom: 16,
  },
  resendText: {
    color: "#64748b",
    fontSize: "0.85rem",
  },
  resendBtn: {
    background: "none",
    border: "none",
    color: "#0ea5e9",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.85rem",
    textDecoration: "underline",
    padding: 0,
  },
};

export default RegisterDoctor;
