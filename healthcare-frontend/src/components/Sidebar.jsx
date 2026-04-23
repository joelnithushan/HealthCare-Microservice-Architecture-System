import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  CalendarDays,
  FileText,
  User,
  CalendarClock,
  Users,
  FilePen,
  UserCircle,
  LogOut,
  BadgeCheck,
  CreditCard,
  Activity,
} from "lucide-react";
import logo from "../assets/logo.png";
import { resolveProfileImageUrl } from "../utils/profileImage";
import "./Sidebar.css";

const PATIENT_NAV = [
  { path: "/patient/dashboard", label: "Home", icon: LayoutDashboard },
  { path: "/patient/dashboard/doctors", label: "Find Doctors", icon: Search },
  {
    path: "/patient/dashboard/appointments",
    label: "My Appointments",
    icon: CalendarDays,
  },
  {
    path: "/patient/dashboard/consultations",
    label: "Video Consultations",
    icon: Activity,
  },
  {
    path: "/patient/dashboard/reports",
    label: "Medical History",
    icon: FileText,
  },
  {
    path: "/patient/dashboard/symptoms",
    label: "Symptom Checker",
    icon: Search,
  },
  {
    path: "/patient/dashboard/notifications",
    label: "Notifications",
    icon: CalendarClock,
  },
  { path: "/patient/dashboard/profile", label: "Profile", icon: User },
];

const DOCTOR_NAV = [
  { path: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    path: "/doctor/dashboard/requests",
    label: "Appointment Requests",
    icon: CalendarClock,
  },
  {
    path: "/doctor/dashboard/doctor-appointments",
    label: "My Schedule",
    icon: CalendarDays,
  },
  { path: "/doctor/dashboard/patients", label: "Patient Records", icon: Users },
  {
    path: "/doctor/dashboard/prescriptions",
    label: "Prescriptions",
    icon: FilePen,
  },
  {
    path: "/doctor/dashboard/notifications",
    label: "Notifications",
    icon: Activity,
  },
  { path: "/doctor/dashboard/profile", label: "Profile", icon: UserCircle },
];

const ADMIN_NAV = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/admin/dashboard/manage-users",
    label: "Manage Users",
    icon: Users,
  },
  {
    path: "/admin/dashboard/manage-doctors",
    label: "Manage Doctors",
    icon: BadgeCheck,
  },
  {
    path: "/admin/dashboard/appointments",
    label: "All Appointments",
    icon: CalendarDays,
  },
  {
    path: "/admin/dashboard/transactions",
    label: "Reports",
    icon: CreditCard,
  },
];

export default function Sidebar({ userRole, userName, initials, profilePicUrl }) {
  const navigate = useNavigate();
  const location = useLocation();

  const profilePath =
    userRole === "ADMIN"
      ? "/admin/dashboard/profile"
      : userRole === "DOCTOR"
        ? "/doctor/dashboard/profile"
        : "/patient/dashboard/profile";

  const navItems =
    userRole === "ADMIN"
      ? ADMIN_NAV
      : userRole === "DOCTOR"
        ? DOCTOR_NAV
        : PATIENT_NAV;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => {
    // Exact match for the dashboard root, prefix match otherwise
    if (path.endsWith("/dashboard")) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`premium-sidebar role-${(userRole || "PATIENT").toLowerCase()}`}
    >
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <img
            src={logo}
            alt="Clinexa"
            className="sidebar-logo"
            style={{
              height: "70px",
              width: "auto",
              objectFit: "contain",
              filter: "brightness(0) invert(1)",
            }}
          />
        </div>
        <NavLink to={profilePath} className="sidebar-user" title="Open profile">
          <div className="user-avatar">
            {profilePicUrl ? (
              <img 
                src={resolveProfileImageUrl(profilePicUrl)} 
                alt={userName} 
                className="user-avatar-img"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              initials
            )}
          </div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-role">
              {userRole === "ADMIN"
                ? "Administrator"
                : userRole === "DOCTOR"
                  ? "Doctor"
                  : "Patient"}
            </span>
          </div>
        </NavLink>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-link ${active ? "active" : ""}`}
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

        <button onClick={handleLogout} className="sidebar-link logout-link">
          <LogOut className="sidebar-icon" />
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
