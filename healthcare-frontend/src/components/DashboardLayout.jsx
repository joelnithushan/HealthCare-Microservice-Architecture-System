import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  const [userRoles, setUserRoles] = useState({ role: 'PATIENT', name: 'User', initials: 'U' });
  const location = useLocation();

  const updateAuth = () => {
    const stored = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role'); // Fallback for legacy items
    
    if (stored && stored !== 'undefined') {
      try {
        const user = JSON.parse(stored);
        let initials = 'U';
        if (user.name) {
          const parts = user.name.split(' ');
          initials = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
        } else if (user.email) {
          initials = user.email[0];
        }

        setUserRoles({
          role: user.role || storedRole || 'PATIENT',
          name: user.name || 'User',
          initials: initials.toUpperCase(),
        });
      } catch (e) {
        console.error('Auth parse error', e);
      }
    } else if (storedRole) {
      setUserRoles(prev => ({ ...prev, role: storedRole }));
    }
  };

  useEffect(() => {
    updateAuth();
    window.addEventListener('userUpdated', updateAuth);
    window.addEventListener('storage', updateAuth);
    return () => {
      window.removeEventListener('userUpdated', updateAuth);
      window.removeEventListener('storage', updateAuth);
    };
  }, []);

  // Scroll to top on route change or handle hash links
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div style={styles.layout}>
      <Sidebar 
        userRole={userRoles.role} 
        userName={userRoles.name} 
        initials={userRoles.initials} 
      />
      <main style={styles.mainContent}>
        {children || <Outlet />}
      </main>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: 'var(--bg-main)', /* #F8FAFB */
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    isolation: 'isolate', /* Prevent z-index issues */
  }
};
