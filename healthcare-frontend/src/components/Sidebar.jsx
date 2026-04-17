import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Search, CalendarDays, Video, FileText, ClipboardList,
  Bell, User, CalendarClock, ClipboardCheck, Users, FilePen, UserCircle,
  Settings, LogOut, BadgeCheck, CreditCard, Settings2
} from 'lucide-react';
import logo from '../assets/logo.png';
import './Sidebar.css';

const PATIENT_NAV = [
  { path: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/patient/dashboard/doctors', label: 'Browse Doctors', icon: Search },
  { path: '/patient/dashboard/appointments', label: 'My Appointments', icon: CalendarDays },
  { path: '/patient/dashboard/consult/pending', label: 'Video Consultation', icon: Video },
  { path: '/patient/dashboard/reports', label: 'Medical Reports', icon: FileText },
  { path: '/patient/dashboard/prescriptions', label: 'Prescriptions', icon: ClipboardList },
  { path: '/patient/dashboard/notifications', label: 'Notifications', icon: Bell, badgeCount: 2 },
  { path: '/profile', label: 'My Profile', icon: User },
];

const DOCTOR_NAV = [
  { path: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/doctor/dashboard/doctor-appointments', label: 'My Schedule', icon: CalendarClock },
  { path: '/doctor/dashboard/requests', label: 'Appointment Requests', icon: ClipboardCheck, badgeCount: 3 },
  { path: '/doctor/dashboard/consultations', label: 'Video Consultations', icon: Video },
  { path: '/doctor/dashboard/patients', label: 'Patient Records', icon: Users },
  { path: '/doctor/dashboard/prescriptions', label: 'Digital Prescriptions', icon: FilePen },
  { path: '/doctor/dashboard/notifications', label: 'Notifications', icon: Bell },
  { path: '/profile', label: 'My Profile', icon: UserCircle },
];

const ADMIN_NAV = [
  { path: '/admin/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
  { path: '/admin/dashboard/manage-users', label: 'User Management', icon: Users },
  { path: '/admin/dashboard/manage-doctors', label: 'Doctor Verification', icon: BadgeCheck },
  { path: '/#appointments', label: 'Appointments', icon: CalendarDays },
  { path: '/admin/dashboard/transactions', label: 'Payments & Revenue', icon: CreditCard },
  { path: '/#video-sessions', label: 'Video Sessions', icon: Video },
  { path: '/admin/dashboard/system-logs', label: 'Reports & Logs', icon: FileText },
  { path: '/#notifications', label: 'Notifications', icon: Bell },
  { path: '/#platform-settings', label: 'Platform Settings', icon: Settings2 },
];

export default function Sidebar({ userRole, userName, initials }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = userRole === 'ADMIN' 
    ? ADMIN_NAV 
    : userRole === 'DOCTOR' 
      ? DOCTOR_NAV 
      : PATIENT_NAV;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    // Exact match for the dashboard root, prefix match otherwise
    if (path.endsWith('/dashboard')) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="premium-sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <img src={logo} alt="Clinexa" className="sidebar-logo" style={{ height: '70px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </div>
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-role">
              {userRole === 'ADMIN' ? 'Administrator' : userRole === 'DOCTOR' ? 'Doctor' : 'Patient'}
            </span>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-link ${active ? 'active' : ''}`}
            >
              <item.icon className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
              {item.badgeCount && (
                <span className="sidebar-badge">{item.badgeCount}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-divider" />
        <NavLink to="/settings" className="sidebar-link">
          <Settings className="sidebar-icon" />
          <span className="sidebar-label">Settings</span>
        </NavLink>
        <button onClick={handleLogout} className="sidebar-link logout-link">
          <LogOut className="sidebar-icon" />
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
