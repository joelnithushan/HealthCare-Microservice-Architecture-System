import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const Dashboard = () => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const user = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Gate: if profile is incomplete, redirect to complete-profile page
  if (user.profileComplete === false) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};

export default Dashboard;
