import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Footer from "../components/Footer";

const AdminDashboard = () => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/login" replace />;

  return (
    <div className="admin-dashboard-root" style={styles.root}>
      <div style={styles.content}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;

const styles = {
  root: {
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: 1,
  },
};
