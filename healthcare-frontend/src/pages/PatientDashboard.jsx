import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Calendar, CheckCircle, FileText, Bell, Video, 
  Search, FilePlus, CalendarPlus
} from 'lucide-react';

const PatientDashboard = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const user = React.useMemo(() => {
    const stored = localStorage.getItem('user');
    return stored && stored !== 'undefined' ? JSON.parse(stored) : null;
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [apptsRes, profRes, reportsRes, presRes, notifRes] = await Promise.allSettled([
        api.get(`/appointments/user/${user.id}`),
        api.get(`/users/${user.id}`),
        api.get(`/users/${user.id}/reports`),
        api.get(`/prescriptions/patient/${user.id}`),
        api.get(`/notifications/user/${user.id}`)
      ]);

      setProfile(profRes.status === 'fulfilled' ? profRes.value.data : user);
      
      let fetchedAppts = apptsRes.status === 'fulfilled' ? apptsRes.value.data : [];
      fetchedAppts.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
      setAppointments(fetchedAppts);

      setReports(reportsRes.status === 'fulfilled' ? reportsRes.value.data : []);
      setPrescriptions(presRes.status === 'fulfilled' ? presRes.value.data : []);
      setNotifications(notifRes.status === 'fulfilled' ? notifRes.value.data : []);
      
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [fetchData, user?.id]);

  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role && user.role !== 'PATIENT') return <Navigate to="/login" replace />;

  const today = new Date().toISOString().split('T')[0];
  
  // Logical categorizations
  const upcomingAppts = appointments.filter(a => a.appointmentDate >= today && (a.status === 'PENDING' || a.status === 'ACCEPTED'));
  const completedAppts = appointments.filter(a => a.status === 'COMPLETED');
  const nextAppt = upcomingAppts.length > 0 ? upcomingAppts[0] : null;
  const unreadNotifs = notifications.filter(n => !n.read);
  
  const latestPrescription = prescriptions.length > 0 ? prescriptions[prescriptions.length - 1] : null;
  const recentNotifications = notifications.slice(0, 3);

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{greeting}, {profile?.name || user?.name || 'Patient'}</h1>
        <p>Welcome to your health dashboard.</p>
      </div>

      {error && (
        <div className="dash-card" style={{borderColor: 'var(--danger)', backgroundColor: 'var(--danger-bg)', marginBottom: '24px'}}>
          <p style={{color: 'var(--danger)', margin: 0}}>{error}</p>
        </div>
      )}

      {/* SUMMARY STATS */}
      <div className="dash-grid-stats">
        <div className="dash-card stat-card">
          <div className="stat-icon-wrapper"><Calendar size={24} /></div>
          <div className="stat-content">
            <h3>{upcomingAppts.length}</h3>
            <p>Upcoming Appointments</p>
          </div>
        </div>
        <div className="dash-card stat-card">
          <div className="stat-icon-wrapper"><CheckCircle size={24} /></div>
          <div className="stat-content">
            <h3>{completedAppts.length}</h3>
            <p>Completed Consults</p>
          </div>
        </div>
        <div className="dash-card stat-card">
          <div className="stat-icon-wrapper"><FileText size={24} /></div>
          <div className="stat-content">
            <h3>{reports.length}</h3>
            <p>Uploaded Reports</p>
          </div>
        </div>
        <div className="dash-card stat-card">
          <div className="stat-icon-wrapper">
             <Bell size={24} color={unreadNotifs.length > 0 ? 'var(--warning)' : 'inherit'} />
          </div>
          <div className="stat-content">
            <h3 style={{color: unreadNotifs.length > 0 ? 'var(--warning)' : 'inherit'}}>{unreadNotifs.length}</h3>
            <p>Unread Notifications</p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="dash-grid-main">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* NEXT APPOINTMENT */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title"><Calendar size={20} /> Next Appointment</h2>
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: '80px' }}></div>
            ) : nextAppt ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', color: 'var(--text-main)' }}>
                    Dr. {nextAppt.doctorName}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                    {new Date(nextAppt.appointmentDate).toLocaleDateString()} at {nextAppt.appointmentTime}
                  </p>
                  <span className={`badge ${nextAppt.status === 'ACCEPTED' ? 'badge-success' : 'badge-pending'}`} style={{ marginTop: '8px' }}>
                    {nextAppt.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-outline" onClick={() => navigate('/patient/dashboard/appointments')}>
                    View Details
                  </button>
                  {nextAppt.status === 'ACCEPTED' && (
                    <button className="btn btn-primary" onClick={() => navigate(`/patient/dashboard/consult/${nextAppt.id}`)}>
                      <Video size={16} /> Join Call
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '20px' }}>
                <Calendar size={32} />
                <p>No upcoming appointments found.</p>
              </div>
            )}
          </div>

          {/* LATEST PRESCRIPTION */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title"><FileText size={20} /> Latest Prescription</h2>
              <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => navigate('/patient/dashboard/prescriptions')}>View All</button>
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: '80px' }}></div>
            ) : latestPrescription ? (
              <div>
                <p style={{ margin: '0 0 8px', fontWeight: '500' }}>Issued by Dr. {latestPrescription.doctorName}</p>
                <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Date: {new Date(latestPrescription.date).toLocaleDateString()}</p>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '20px' }}>
                <p>No prescriptions available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* QUICK ACTIONS */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title">Quick Actions</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => navigate('/patient/dashboard/doctors')}>
                <Search size={18} /> Search Doctors
              </button>
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => navigate('/patient/dashboard/appointments')}>
                <CalendarPlus size={18} /> Book Appointment
              </button>
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => navigate('/patient/dashboard/reports')}>
                <FilePlus size={18} /> Upload Report
              </button>
            </div>
          </div>

          {/* RECENT NOTIFICATIONS */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title"><Bell size={20} /> Recent Alerts</h2>
              <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => navigate('/patient/dashboard/notifications')}>All</button>
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: '100px' }}></div>
            ) : recentNotifications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentNotifications.map((notif, idx) => (
                  <div key={idx} style={{ paddingBottom: '12px', borderBottom: idx !== recentNotifications.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '0.9rem', color: notif.read ? 'var(--text-main)' : 'var(--text-main)', fontWeight: notif.read ? '400' : '600' }}>
                      {notif.message}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(notif.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '20px' }}>
                <p>No new notifications.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
