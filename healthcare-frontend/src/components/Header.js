import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { DEFAULT_AVATAR } from "../utils/constants";
import { resolveProfileImageUrl } from "../utils/profileImage";

const readUser = () => {
  const stored = localStorage.getItem("user");
  return stored && stored !== "undefined" ? JSON.parse(stored) : null;
};

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(readUser);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Re-read user from localStorage whenever profile is updated or storage changes
  const refreshUser = useCallback(() => setUser(readUser()), []);

  useEffect(() => {
    window.addEventListener("userUpdated", refreshUser);
    window.addEventListener("storage", refreshUser);
    return () => {
      window.removeEventListener("userUpdated", refreshUser);
      window.removeEventListener("storage", refreshUser);
    };
  }, [refreshUser]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    // Clear ALL session keys per assignment requirement
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("profilePicUrl");
    window.dispatchEvent(new Event("userUpdated"));
    navigate("/login");
  };

  const profileImageSource = user ? user.profilePicUrl || "" : "";

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.logoArea}>
          <Link to="/">
            <img src={logo} alt="Clinexa" className="brand-logo" />
          </Link>
        </div>
        <nav style={styles.nav}>
          {!user && (
            <>
              <Link to="/" className="nav-link">
                Home
              </Link>
              <Link to="/services" className="nav-link">
                Services
              </Link>
              <Link to="/about" className="nav-link">
                About Us
              </Link>
              <Link to="/contact" className="nav-link">
                Contact
              </Link>
            </>
          )}

          {user && user.role === "ADMIN" && (
            <>
              <Link to="/admin/dashboard" className="admin-nav-link">
                Dashboard
              </Link>
              <Link
                to="/admin/dashboard/manage-users"
                className="admin-nav-link"
              >
                Users
              </Link>
              <Link
                to="/admin/dashboard/manage-doctors"
                className="admin-nav-link"
              >
                Doctors
              </Link>
              <Link
                to="/admin/dashboard/transactions"
                className="admin-nav-link"
              >
                Transactions
              </Link>
              <Link
                to="/admin/dashboard/system-logs"
                className="admin-nav-link"
              >
                System Logs
              </Link>
            </>
          )}

          {user && user.role === "DOCTOR" && (
            <>
              <Link to="/doctor/dashboard#overview" className="nav-link">
                Dashboard
              </Link>
              <Link to="/doctor/dashboard#schedule" className="nav-link">
                Schedule
              </Link>
              <Link to="/doctor/dashboard#notifications" className="nav-link">
                Notifications
              </Link>
            </>
          )}

          {user && user.role === "PATIENT" && (
            <>
              <Link to="/patient/dashboard#overview" className="nav-link">
                Dashboard
              </Link>
              <Link to="/patient/dashboard#book" className="nav-link">
                Book Now
              </Link>
              <Link to="/patient/dashboard#appointments" className="nav-link">
                My Appts
              </Link>
              <Link to="/patient/dashboard#prescriptions" className="nav-link">
                My Prescriptions
              </Link>
              <Link to="/patient/dashboard#reports" className="nav-link">
                Reports
              </Link>
            </>
          )}

          {user ? (
            <div style={styles.authGroup}>
              <div
                ref={dropdownRef}
                style={{
                  ...styles.profileToggle,
                  marginLeft: user.role === "ADMIN" ? 0 : 16,
                }}
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <Link to="/profile" style={styles.avatarLink}>
                  <img
                    src={resolveProfileImageUrl(profileImageSource)}
                    alt="Profile"
                    style={styles.avatarImg}
                    title="My Profile"
                    onError={(event) => {
                      if (event.currentTarget.src !== DEFAULT_AVATAR) {
                        event.currentTarget.src = DEFAULT_AVATAR;
                      }
                    }}
                  />
                </Link>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--text-main)",
                    maxWidth: "120px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.name || user.email?.split("@")[0] || "User"}
                </span>
                {showDropdown && (
                  <div style={styles.dropdown}>
                    <div style={styles.dropdownHeader}>
                      <div style={styles.dropdownName}>
                        {user.name || "User"}
                      </div>
                      <div style={styles.dropdownRole}>
                        {user.role || "Guest"}
                      </div>
                    </div>
                    <div style={styles.dropdownDivider} />
                    <Link
                      to="/profile"
                      style={styles.dropdownItem}
                      onClick={() => setShowDropdown(false)}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ marginRight: 10 }}
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Profile
                    </Link>
                    <div style={styles.dropdownDivider} />
                    <div style={{ padding: "12px" }}>
                      <button
                        className="flat-btn-outline"
                        onClick={handleLogout}
                        style={styles.dropdownLogoutBtn}
                      >
                        Logout Securely
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={styles.authGroup}>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="flat-btn">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: "var(--bg-white)",
    borderBottom: "1px solid var(--border-light)",
    height: "64px",
    padding: "0",
    boxShadow: "var(--shadow-sm)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
  },
  logoArea: {
    position: "relative",
    height: "64px",
    width: "200px",
    display: "flex",
    alignItems: "center",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  authGroup: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginLeft: "12px",
    borderLeft: "1px solid var(--border-light)",
    paddingLeft: "24px",
  },
  profileToggle: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    height: "64px",
    cursor: "pointer",
    userSelect: "none",
  },
  logoutBtn: {
    padding: "8px 16px",
    fontSize: "13px",
  },
  avatarLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid var(--primary-light)",
    backgroundColor: "#f1f5f9",
    transition: "border 0.2s",
  },
  dropdown: {
    position: "absolute",
    top: "56px",
    right: "0",
    background: "#fff",
    border: "1px solid var(--border-light)",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-md)",
    minWidth: "220px",
    zIndex: 1001,
    padding: "0",
    animation: "fadeIn 0.2s ease-out",
    overflow: "hidden",
  },

  dropdownHeader: {
    padding: "16px 20px",
    background: "#f8fafc",
  },
  dropdownName: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "var(--navy)",
    marginBottom: 2,
  },
  dropdownRole: {
    fontSize: "0.7rem",
    fontWeight: 600,
    color: "var(--primary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  dropdownDivider: {
    height: "1px",
    background: "var(--border-light)",
    margin: "0",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    fontSize: "0.85rem",
    color: "var(--text-main)",
    textDecoration: "none",
    transition: "background 0.2s",
    fontWeight: 500,
  },
  dropdownLogoutBtn: {
    width: "100%",
    padding: "8px 0",
    fontSize: "0.8rem",
    fontWeight: 600,
  },
};
