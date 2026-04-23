import React, { useState, useEffect } from "react";
import api from "./services/api";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop";
import Header from "./components/Header";
import Footer from "./components/Footer";
import logo from "./assets/logo.png";
import Home from "./components/Home";
import Login from "./components/Login";
import RegisterPatient from "./pages/RegisterPatient";
import RegisterDoctor from "./pages/RegisterDoctor";
import VideoConsultation from "./pages/VideoConsultation";
import Payment from "./pages/Payment";
import UserManagement from "./components/UserManagement";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import CompleteProfile from "./pages/CompleteProfile";
import Profile from "./pages/Profile";
import AdminOverview from "./pages/AdminOverview";
import DoctorManagement from "./pages/DoctorManagement";
import SystemLogs from "./pages/SystemLogs";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TransactionsPage from "./pages/TransactionsPage";
import AdminAppointmentsPage from "./pages/AdminAppointmentsPage";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/DashboardLayout";
import PatientDoctorsPage from "./pages/patient/PatientDoctorsPage";
import PatientAppointmentsPage from "./pages/patient/PatientAppointmentsPage";
import PatientConsultationsPage from "./pages/patient/PatientConsultationsPage";
import PatientReportsPage from "./pages/patient/PatientReportsPage";
import PatientPrescriptionsPage from "./pages/patient/PatientPrescriptionsPage";
import PatientNotificationsPage from "./pages/patient/PatientNotificationsPage";
import SymptomCheckerPage from "./pages/patient/SymptomCheckerPage";
import DoctorOverview from "./pages/doctor/DoctorOverview";
import DoctorAppointmentsPage from "./pages/doctor/DoctorAppointmentsPage";
import DoctorRequestsPage from "./pages/doctor/DoctorRequestsPage";
import DoctorPatientsPage from "./pages/doctor/DoctorPatientsPage";
import DoctorPrescriptionsPage from "./pages/doctor/DoctorPrescriptionsPage";
import DoctorNotificationsPage from "./pages/doctor/DoctorNotificationsPage";
import { Outlet } from "react-router-dom";

const StandardLayout = () => (
  <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
    <Header />
    <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Outlet />
    </main>
    <Footer />
  </div>
);

// ─── Route Guards ────────────────────────────────────────────────────────

/** Redirects logged-in users to their role-specific dashboard */
const GuestRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const stored = localStorage.getItem("user");
  const user = stored && stored !== "undefined" ? JSON.parse(stored) : null;

  if (token && user) {
    if (user.role === "ADMIN")
      return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "DOCTOR")
      return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  }
  return children;
};

/** Blocks admins from patient/doctor pages */
const NonAdminRoute = ({ children }) => {
  const stored = localStorage.getItem("user");
  const user = stored && stored !== "undefined" ? JSON.parse(stored) : null;
  if (user && user.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

/** Requires a specific role, otherwise redirects */
const RoleRoute = ({ role, children }) => {
  const token = localStorage.getItem("token");
  const stored = localStorage.getItem("user");
  const user = stored && stored !== "undefined" ? JSON.parse(stored) : null;

  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    // Redirect to their own dashboard
    if (user.role === "ADMIN")
      return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "DOCTOR")
      return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  }
  return children;
};

/** Generic auth guard — any logged-in user */
const AuthRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// ─── Post-login redirect helper ──────────────────────────────────────────
const DashboardRedirect = () => {
  const stored = localStorage.getItem("user");
  const user = stored && stored !== "undefined" ? JSON.parse(stored) : null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "DOCTOR")
    return <Navigate to="/doctor/dashboard" replace />;
  return <Navigate to="/patient/dashboard" replace />;
};

function App() {
  const clientId =
    process.env.REACT_APP_GOOGLE_CLIENT_ID ||
    "97532193168-o1kt921m7a8gpgu3b5uk7db3v3r8eubo.apps.googleusercontent.com";
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setVerifying(true);
        try {
          const res = await api.get("/auth/me");
          localStorage.setItem("user", JSON.stringify(res.data));
        } catch (err) {
          if (err.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } finally {
          setVerifying(false);
        }
      }
    };
    verifySession();
  }, []);

  if (verifying) {
    return (
      <>
        <style>{`
          @keyframes loadingPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.06); opacity: 0.85; }
          }
          @keyframes loadingShimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          @keyframes loadingFadeIn {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes loadingGlow {
            0%, 100% { box-shadow: 0 0 30px rgba(15, 110, 86, 0.15), 0 0 60px rgba(15, 110, 86, 0.05); }
            50% { box-shadow: 0 0 40px rgba(15, 110, 86, 0.25), 0 0 80px rgba(15, 110, 86, 0.1); }
          }
        `}</style>
        <div style={loadingStyles.page}>
          <div style={loadingStyles.content}>
            <div style={loadingStyles.logoWrap}>
              <img src={logo} alt="MediConnect" style={loadingStyles.logo} />
            </div>
            <p style={loadingStyles.text}>Verifying your secure session</p>
            <div style={loadingStyles.progressTrack}>
              <div style={loadingStyles.progressBar}>
                <div style={loadingStyles.progressShimmer} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            color: "#1e293b",
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            borderRadius: "14px",
            padding: "16px 20px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#fff" },
            style: {
              borderLeft: "6px solid #10b981",
              background: "rgba(240, 253, 244, 0.95)",
            },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
            style: {
              borderLeft: "6px solid #ef4444",
              background: "rgba(254, 242, 242, 0.95)",
            },
            duration: 5000,
          },
          loading: {
            style: {
              background: "rgba(255, 255, 255, 0.95)",
            },
          },
        }}
      />
      <Router>
        <ScrollToTop />
        <div className="app-container">
          <Routes>
            {/* ─── PUBLIC / STANDARD LAYOUT ROUTES ─── */}
            <Route element={<StandardLayout />}>
              <Route
                path="/"
                element={
                  <GuestRoute>
                    <Home />
                  </GuestRoute>
                }
              />
              <Route
                path="/about"
                element={
                  <NonAdminRoute>
                    <About />
                  </NonAdminRoute>
                }
              />
              <Route
                path="/services"
                element={
                  <NonAdminRoute>
                    <Services />
                  </NonAdminRoute>
                }
              />
              <Route
                path="/contact"
                element={
                  <NonAdminRoute>
                    <Contact />
                  </NonAdminRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <Navigate to="/register/patient" replace />
                  </GuestRoute>
                }
              />
              <Route
                path="/register/patient"
                element={
                  <GuestRoute>
                    <RegisterPatient />
                  </GuestRoute>
                }
              />
              <Route
                path="/register/doctor"
                element={
                  <GuestRoute>
                    <RegisterDoctor />
                  </GuestRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/profile"
                element={
                  <AuthRoute>
                    <Profile />
                  </AuthRoute>
                }
              />

              {/* Catch-all for non-dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            <Route path="/complete-profile" element={<CompleteProfile />} />

            {/* ─── DASHBOARD ROUTES (No Header/Footer, Sidebar instead) ─── */}
            <Route element={<DashboardLayout />}>
              {/* PATIENT ROUTES */}
              <Route
                path="/patient/dashboard"
                element={
                  <RoleRoute role="PATIENT">
                    <Dashboard />
                  </RoleRoute>
                }
              >
                <Route index element={<PatientDashboard />} />
                <Route path="doctors" element={<PatientDoctorsPage />} />
                <Route
                  path="appointments"
                  element={<PatientAppointmentsPage />}
                />
                <Route
                  path="consultations"
                  element={<PatientConsultationsPage />}
                />
                <Route path="reports" element={<PatientReportsPage />} />
                <Route
                  path="prescriptions"
                  element={<PatientPrescriptionsPage />}
                />
                <Route
                  path="notifications"
                  element={<PatientNotificationsPage />}
                />
                <Route path="symptoms" element={<SymptomCheckerPage />} />
                <Route path="profile" element={<Profile />} />
                <Route
                  path="consult/:appointmentId"
                  element={<VideoConsultation />}
                />
                <Route path="pay/:appointmentId" element={<Payment />} />
              </Route>

              {/* DOCTOR ROUTES */}
              <Route
                path="/doctor/dashboard"
                element={
                  <RoleRoute role="DOCTOR">
                    <DoctorDashboard />
                  </RoleRoute>
                }
              >
                <Route index element={<DoctorOverview />} />
                <Route
                  path="doctor-appointments"
                  element={<DoctorAppointmentsPage />}
                />
                <Route path="requests" element={<DoctorRequestsPage />} />
                <Route path="patients" element={<DoctorPatientsPage />} />
                <Route
                  path="prescriptions"
                  element={<DoctorPrescriptionsPage />}
                />
                <Route path="notifications"
                  element={<DoctorNotificationsPage />}
                />
                <Route path="reports/:patientId" element={<PatientReportsPage />} />
                <Route path="profile" element={<Profile />} />
                <Route
                  path="consult/:appointmentId"
                  element={<VideoConsultation />}
                />
              </Route>

              {/* ADMIN ROUTES */}
              <Route
                path="/admin/dashboard"
                element={
                  <RoleRoute role="ADMIN">
                    <AdminDashboard />
                  </RoleRoute>
                }
              >
                <Route index element={<AdminOverview />} />
                <Route path="manage-users" element={<UserManagement />} />
                <Route path="manage-doctors" element={<DoctorManagement />} />
                <Route path="appointments" element={<AdminAppointmentsPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="system-logs" element={<SystemLogs />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            {/* ─── Legacy /dashboard redirects ─── */}
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/dashboard/*" element={<DashboardRedirect />} />
            <Route
              path="/doctor-dashboard/*"
              element={<Navigate to="/doctor/dashboard" replace />}
            />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

const loadingStyles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background:
      "radial-gradient(ellipse at 30% 20%, rgba(15, 110, 86, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(9, 52, 86, 0.05) 0%, transparent 50%), linear-gradient(180deg, #f8fbff 0%, #f0f5fa 50%, #e8f0f8 100%)",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    animation: "loadingFadeIn 0.6s ease-out",
  },
  logoWrap: {
    width: "140px",
    height: "140px",
    borderRadius: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(145deg, #ffffff 0%, #f0f7ff 100%)",
    boxShadow:
      "0 20px 50px rgba(15, 23, 42, 0.1), 0 0 30px rgba(15, 110, 86, 0.08), inset 0 1px 0 rgba(255,255,255,1)",
    marginBottom: "32px",
    animation: "loadingPulse 2.4s ease-in-out infinite, loadingGlow 2.4s ease-in-out infinite",
    border: "1px solid rgba(15, 110, 86, 0.08)",
  },
  logo: {
    width: "100px",
    height: "100px",
    objectFit: "contain",
  },
  text: {
    color: "#64748b",
    fontSize: "0.9rem",
    fontWeight: 500,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "28px",
    fontFamily: "'Inter', sans-serif",
  },
  progressTrack: {
    width: "220px",
    height: "4px",
    background: "rgba(15, 23, 42, 0.06)",
    borderRadius: "999px",
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    width: "40%",
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #0f6e56 0%, #10b981 50%, #34d399 100%)",
    position: "relative",
    overflow: "hidden",
    animation: "loadingShimmer 1.8s ease-in-out infinite",
  },
  progressShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
    animation: "loadingShimmer 1.8s ease-in-out infinite",
  },
};
