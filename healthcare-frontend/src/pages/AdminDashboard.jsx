import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminDashboard = () => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const user = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;

  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/login" replace />;

  return (
    <div className="admin-dashboard-root">
      <Outlet />
    </div>
  );
};

export default AdminDashboard;
