import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../../services/api";
import { 
  Users, CalendarClock, ClipboardCheck, Bell, 
  Video, CheckCircle
} from "lucide-react";
import "../../components/DashboardShared.css";

export default function DoctorOverview() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [apptsRes, notifRes] = await Promise.allSettled([
          api.get(`/appointments/doctor/${user.id}`),
          api.get(`/notifications/user/${user.id}`)
        ]);

        const appts = apptsRes.status === 'fulfilled' ? apptsRes.value.data : [];
        setAppointments(appts);
        
        const notifs = notifRes.status === 'fulfilled' ? notifRes.value.data : [];
        setNotifications(notifs);

      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchDashboardData();
  }, [user?.id]);

  if (!user || user.role !== 'DOCTOR') return <Navigate to="/login" replace />;

  const todayAppointments = appointments.filter(a => a.appointmentDate === today && (a.status === 'ACCEPTED' || a.status === 'COMPLETED'));
  const pendingRequests = appointments.filter(a => a.status === 'PENDING');
  const pastAppointments = appointments.filter(a => a.status === 'COMPLETED');
  
  // Get unique patients
  const uniquePatients = new Set(appointments.map(a => a.patientId)).size;
  const unreadNotifs = notifications.filter(n => !n.read);

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{greeting}, Dr. {user.name?.split(' ')[0] || 'Doctor'}</h1>
        <p>Here is your schedule and patient overview for today.</p>
      </div>

      {error && (
        <div className="dash-card" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-bg)', marginBottom: '24px' }}>
          <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* STATS */}
      <div className="dash-grid-stats">
        <div className="dash-card stat-card">
          <div className="stat-icon-wrapper"><CalendarClock size={24} /></div>
          <div className="stat-content">
            <h3>{todayAppointments.length}</h3>
            <p>Today's Appointments</p>
          </div>
        </div>
        <div className="dash-card stat-card">
          <div className="stat-icon-wrapper"><ClipboardCheck size={24} color="var(--warning)" /></div>
          <div className="stat-content">
            <h3>{pendingRequests.length}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
        <div className="dash-card stat-card">
          <div className="stat-icon-wrapper"><Users size={24} /></div>
          <div className="stat-content">
            <h3>{uniquePatients}</h3>
            <p>Total Patients</p>
          </div>
        </div>
        <div className="dash-card stat-card">
          <div className="stat-icon-wrapper"><Bell size={24} color={unreadNotifs.length > 0 ? "var(--danger)" : "inherit"} /></div>
          <div className="stat-content">
            <h3 style={{ color: unreadNotifs.length > 0 ? "var(--danger)" : "inherit" }}>{unreadNotifs.length}</h3>
            <p>Unread Alerts</p>
          </div>
        </div>
      </div>

      <div className="dash-grid-main">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title"><CalendarClock size={20} /> Today's Schedule</h2>
              <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => navigate('/doctor/dashboard/doctor-appointments')}>Manage Schedule</button>
            </div>
            
            {loading ? (
              <div className="skeleton" style={{ height: '150px' }}></div>
            ) : todayAppointments.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px', margin: 0 }}>
                <CheckCircle size={32} color="var(--success)" style={{ opacity: 0.8 }} />
                <p>No appointments booked for today yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {todayAppointments.sort((a,b) => a.appointmentTime.localeCompare(b.appointmentTime)).map(appt => (
                  <div key={appt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px', color: 'var(--text-main)', fontSize: '1rem' }}>{appt.appointmentTime.substring(0, 5)} - Patient {appt.patientId}</h4>
                      <span className={`badge ${appt.status === 'COMPLETED' ? 'badge-success' : 'badge-pending'}`}>{appt.status}</span>
                    </div>
                    {appt.status === 'ACCEPTED' && appt.appointmentType === 'VIDEO' && (
                      <button className="btn btn-primary" onClick={() => navigate(`/doctor/dashboard/consult/${appt.id}`)}>
                        <Video size={16} /> Join Call
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title"><Users size={20} /> Recent Patients</h2>
              <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => navigate('/doctor/dashboard/patients')}>View All</button>
            </div>
            {loading ? (
               <div className="skeleton" style={{ height: '100px' }}></div>
            ) : pastAppointments.length === 0 ? (
               <div className="empty-state" style={{ padding: '20px' }}><p>No patients consulted yet.</p></div>
            ) : (
               <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                 {Array.from(new Set(pastAppointments.map(a => a.patientId))).slice(0, 4).map((pid, idx) => (
                   <div key={idx} style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', minWidth: '150px', textAlign: 'center' }}>
                     <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E2E8F0', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)' }}>
                       P{pid}
                     </div>
                     <p style={{ margin: 0, fontWeight: '500', fontSize: '0.9rem' }}>Patient {pid}</p>
                   </div>
                 ))}
               </div>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title">Quick Actions</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => navigate('/doctor/dashboard/requests')}>
                <ClipboardCheck size={18} /> Review Pending Requests
              </button>
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => navigate('/doctor/dashboard/prescriptions')}>
                <CheckCircle size={18} /> Issue Prescription
              </button>
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => navigate('/doctor/dashboard/profile')}>
                <CalendarClock size={18} /> Update Availability
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
