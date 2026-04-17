import React, { useState, useEffect } from 'react';
import api from './services/api';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import RegisterPatient from './pages/RegisterPatient';
import RegisterDoctor from './pages/RegisterDoctor';
import Doctors from './components/Doctors';
import BookAppointment from './components/BookAppointment';
import Appointments from './components/Appointments';
import Notifications from './components/Notifications';
import VideoConsultation from './pages/VideoConsultation';
import Payment from './pages/Payment';
import DoctorAppointments from './components/DoctorAppointments';
import UserManagement from './components/UserManagement';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import CompleteProfile from './pages/CompleteProfile';
import Profile from './pages/Profile';
import AdminOverview from './pages/AdminOverview';
import DoctorManagement from './pages/DoctorManagement';
import SystemLogs from './pages/SystemLogs';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PrescriptionsPage from './pages/PrescriptionsPage';
import AdminDashboard from './pages/AdminDashboard';
import TransactionsPage from './pages/TransactionsPage';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './components/DashboardLayout';
import { Outlet } from 'react-router-dom';

const StandardLayout = () => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Header />
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Outlet />
    </main>
    <Footer />
  </div>
);

// ─── Route Guards ────────────────────────────────────────────────────────

/** Redirects logged-in users to their role-specific dashboard */
const GuestRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const stored = localStorage.getItem('user');
  const user = stored && stored !== 'undefined' ? JSON.parse(stored) : null;

  if (token && user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  }
  return children;
};

/** Blocks admins from patient/doctor pages */
const NonAdminRoute = ({ children }) => {
  const stored = localStorage.getItem('user');
  const user = stored && stored !== 'undefined' ? JSON.parse(stored) : null;
  if (user && user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

/** Requires a specific role, otherwise redirects */
const RoleRoute = ({ role, children }) => {
  const token = localStorage.getItem('token');
  const stored = localStorage.getItem('user');
  const user = stored && stored !== 'undefined' ? JSON.parse(stored) : null;

  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    // Redirect to their own dashboard
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  }
  return children;
};

/** Generic auth guard — any logged-in user */
const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// ─── Post-login redirect helper ──────────────────────────────────────────
const DashboardRedirect = () => {
  const stored = localStorage.getItem('user');
  const user = stored && stored !== 'undefined' ? JSON.parse(stored) : null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  return <Navigate to="/patient/dashboard" replace />;
};

function App() {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "PASTE_YOUR_GOOGLE_CLIENT_ID_HERE";
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setVerifying(true);
        try {
          const res = await api.get('/auth/me');
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
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
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: 8 }}>Clinexa</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Verifying your secure session...</p>
        </div>
      </div>
    );
  }
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: {
          background: '#FFFFFF',
          color: 'var(--admin-muted)',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          fontWeight: 400,
          borderRadius: '10px',
          padding: '14px 16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
        success: { 
          style: { borderLeft: '4px solid #1D9E75' },
          iconTheme: { primary: '#E1F5EE', secondary: '#0F6E56' }
        },
        error: { 
          style: { borderLeft: '4px solid #E24B4A' },
          duration: 5000,
          iconTheme: { primary: '#FCEBEB', secondary: '#A32D2D' }
        },
      }} />
      <Router>
        <ScrollToTop />
      <div className="app-container">
        <Routes>
          {/* ─── PUBLIC / STANDARD LAYOUT ROUTES ─── */}
          <Route element={<StandardLayout />}>
            <Route path="/" element={<GuestRoute><Home /></GuestRoute>} />
            <Route path="/about" element={<NonAdminRoute><About /></NonAdminRoute>} />
            <Route path="/services" element={<NonAdminRoute><Services /></NonAdminRoute>} />
            <Route path="/contact" element={<NonAdminRoute><Contact /></NonAdminRoute>} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Navigate to="/register/patient" replace /></GuestRoute>} />
            <Route path="/register/patient" element={<GuestRoute><RegisterPatient /></GuestRoute>} />
            <Route path="/register/doctor" element={<GuestRoute><RegisterDoctor /></GuestRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/profile" element={<AuthRoute><Profile /></AuthRoute>} />

            {/* Catch-all for non-dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          {/* ─── DASHBOARD ROUTES (No Header/Footer, Sidebar instead) ─── */}
          <Route element={<DashboardLayout />}>
            {/* PATIENT ROUTES */}
            <Route path="/patient/dashboard" element={<RoleRoute role="PATIENT"><Dashboard /></RoleRoute>}>
              <Route index element={<PatientDashboard />} />
              <Route path="consult/:appointmentId" element={<VideoConsultation />} />
              <Route path="pay/:appointmentId" element={<Payment />} />
            </Route>

            {/* DOCTOR ROUTES */}
            <Route path="/doctor/dashboard/*" element={<RoleRoute role="DOCTOR"><DoctorDashboard /></RoleRoute>} />

            {/* ADMIN ROUTES */}
            <Route path="/admin/dashboard" element={<RoleRoute role="ADMIN"><AdminDashboard /></RoleRoute>}>
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
          <Route path="/doctor-dashboard/*" element={<Navigate to="/doctor/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
