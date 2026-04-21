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
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/DashboardLayout";
import PatientDoctorsPage from "./pages/patient/PatientDoctorsPage";
import PatientAppointmentsPage from "./pages/patient/PatientAppointmentsPage";
import PatientConsultationsPage from "./pages/patient/PatientConsultationsPage";
import PatientReportsPage from "./pages/patient/PatientReportsPage";
import PatientPrescriptionsPage from "./pages/patient/PatientPrescriptionsPage";
import PatientNotificationsPage from "./pages/patient/PatientNotificationsPage";
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
      <div style={loadingStyles.page}>
        <div style={loadingStyles.card}>
          <div style={loadingStyles.logoWrap}>
            <img src={logo} alt="Clinexa" style={loadingStyles.logo} />
          </div>
          <h3 style={loadingStyles.title}>Clinexa</h3>
          <p style={loadingStyles.text}>Verifying your secure session...</p>
          <div style={loadingStyles.progressTrack}>
            <div style={loadingStyles.progressBar} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#FFFFFF",
            color: "var(--admin-muted)",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 400,
            borderRadius: "10px",
            padding: "14px 16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          },
          success: {
            style: { borderLeft: "4px solid #1D9E75" },
            iconTheme: { primary: "#E1F5EE", secondary: "#0F6E56" },
          },
          error: {
            style: { borderLeft: "4px solid #E24B4A" },
            duration: 5000,
            iconTheme: { primary: "#FCEBEB", secondary: "#A32D2D" },
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
              <Route path="/complete-profile" element={<CompleteProfile />} />
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
                <Route
                  path="notifications"
                  element={<DoctorNotificationsPage />}
                />
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
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="system-logs" element={<SystemLogs />} />
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
      "radial-gradient(circle at top, rgba(9, 52, 86, 0.08), transparent 32%), linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%)",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "36px 28px 30px",
    textAlign: "center",
    boxShadow: "0 18px 60px rgba(15, 23, 42, 0.12)",
    border: "1px solid rgba(15, 23, 42, 0.06)",
  },
  logoWrap: {
    width: "96px",
    height: "96px",
    margin: "0 auto 18px",
    borderRadius: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #eef6ff 0%, #ffffff 100%)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 24px rgba(9, 52, 86, 0.08)",
  },
  logo: {
    width: "72px",
    height: "72px",
    objectFit: "contain",
  },
  title: {
    color: "var(--text-main)",
    margin: "0 0 10px",
    fontSize: "1.5rem",
    fontWeight: 800,
    letterSpacing: "0.01em",
  },
  text: {
    color: "var(--text-muted)",
    fontSize: "0.95rem",
    margin: "0 0 18px",
  },
  progressTrack: {
    height: "8px",
    background: "#e8eef6",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressBar: {
    width: "45%",
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #0f6e56 0%, #15b981 100%)",
  },
};
