import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { 
  Calendar, Clock, Users, FilePen, Video, FileText, CheckCircle, XCircle 
} from 'lucide-react';

import PrescriptionModal from '../components/doctor/PrescriptionModal';
import TelemedicineModal from '../components/doctor/TelemedicineModal';

// Retaining existing components for backwards compatibility/advanced lists if needed
import NotificationsSection from '../components/patient/NotificationsSection';

import './DoctorDashboard.css';
import '../pages/PatientDashboard.css'; // Inheriting base premium classes

const DoctorDashboard = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isPrescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [isTelemedicineModalOpen, setTelemedicineModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const token = localStorage.getItem('token');
  const user = React.useMemo(() => {
    const stored = localStorage.getItem('user');
    return stored && stored !== 'undefined' ? JSON.parse(stored) : null;
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let doctorData = user;
      if (user.email) {
        try {
          const profileRes = await api.get(`/doctors/email/${user.email}`);
          doctorData = profileRes.data;
          setProfile(doctorData);
        } catch (err) {
          console.warn('Could not fetch rich profile, using basic data');
          setProfile(user);
        }
      } else {
        setProfile(user);
      }

      const apptsRes = await api.get(`/appointments/user/${user.id}`);
      let allAppointments = apptsRes.data || [];
      allAppointments.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
      setAppointments(allAppointments);

      // Estimate patients
      const uniquePatientsMap = new Map();
      allAppointments.forEach(a => {
         if (!uniquePatientsMap.has(a.patientId)) {
            uniquePatientsMap.set(a.patientId, {
               id: a.patientId,
               name: a.patientName || `Patient ${a.patientId}`,
               lastVisitDate: a.appointmentDate
            });
         }
      });
      setPatients(Array.from(uniquePatientsMap.values()));

    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, user?.id, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleUpdateStatus = async (apptId, newStatus) => {
    if (profile && !profile.verified) {
      toast.error('You must be verified by an administrator to perform this action.');
      return;
    }
    try {
      await api.put(`/appointments/${apptId}/status`, { status: newStatus });
      toast.success(`Appointment marked as ${newStatus}`);
      setAppointments(prev => prev.map(apt => apt.id === apptId ? { ...apt, status: newStatus } : apt));
    } catch (err) {
      toast.error('Failed to update appointment status');
    }
  };

  const openTelemedicine = (appt) => {
    if (profile && !profile.verified) {
      toast.error('Telemedicine sessions are disabled until your account is approved.');
      return;
    }
    setSelectedAppointment(appt);
    setTelemedicineModalOpen(true);
  };

  const openPrescription = () => {
    if (profile && !profile.verified) {
      toast.error('Prescriptions are disabled until your account is approved.');
      return;
    }
    setPrescriptionModalOpen(true);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.appointmentDate === today && a.status !== 'CANCELLED' && a.status !== 'REJECTED');
  const pendingAppts = appointments.filter(a => a.status === 'PENDING');
  
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.profileComplete === false) return <Navigate to="/complete-profile" replace />;

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="premium-dashboard">
      
      {profile && !profile.verified && (
        <div className="premium-error">
          <span>⚠️ Account Pending Approval: Your medical credentials are currently being verified by the administrator.</span>
        </div>
      )}

      {/* 1. WELCOME BANNER */}
      <div className="premium-banner">
        <div className="premium-banner-content">
          <h1>{greeting}, Dr. {profile?.name || user?.name || 'Doctor'}</h1>
          <p>{currentDateFormatted} • You have {todayAppts.length} appointments today</p>
        </div>
        <div className="banner-pill">
          {patients.length} patients seen this month
        </div>
      </div>

      {error && (
        <div className="premium-error">
          <span>{error}</span>
          <button className="premium-btn-danger" onClick={fetchDashboardData}>Retry</button>
        </div>
      )}

      {/* 2. STATS ROW */}
      <div className="premium-stats-grid">
        <div className="premium-stat-card">
          <div className="stat-stripe"></div>
          <Calendar className="stat-icon" />
          <div className="stat-value">{todayAppts.length}</div>
          <div className="stat-label">Today's Appointments</div>
        </div>
        <div className="premium-stat-card">
          <div className="stat-stripe border-warning"></div>
          <Clock className="stat-icon text-warning" />
          <div className="stat-value text-warning">{pendingAppts.length}</div>
          <div className="stat-label">Pending Requests</div>
        </div>
        <div className="premium-stat-card">
          <div className="stat-stripe" style={{background: '#185FA5'}}></div>
          <Users className="stat-icon" style={{color: '#185FA5'}} />
          <div className="stat-value" style={{color: '#185FA5'}}>{patients.length}</div>
          <div className="stat-label">Patients This Month</div>
        </div>
        <div className="premium-stat-card">
          <div className="stat-stripe"></div>
          <FilePen className="stat-icon" />
          <div className="stat-value">{appointments.filter(a => a.status === 'COMPLETED').length}</div>
          <div className="stat-label">Consultations Completed</div>
        </div>
      </div>

      <div className="premium-main-grid">
        <div className="premium-col-main">
          
          {/* 3. TODAY'S SCHEDULE (Timeline) */}
          <section className="premium-section">
            <h2 className="premium-section-title">Today's Schedule</h2>
            <div className="premium-card">
              {loading ? (
                <div className="skeleton" style={{height: 100}}></div>
              ) : todayAppts.length === 0 ? (
                <div className="empty-state">No appointments scheduled for today.</div>
              ) : (
                <div className="timeline-list">
                  {todayAppts.map(apt => (
                    <div key={apt.id} className="timeline-row">
                      <div className="timeline-time">{apt.appointmentTime || '--:--'}</div>
                      <div className="timeline-content">
                        <h4>{apt.patientName || `Patient #${apt.patientId}`}</h4>
                        <div className="timeline-badges">
                          <span className={`apt-spec ${apt.appointmentType === 'VIDEO'? 'video':'inperson'}`}>{apt.appointmentType}</span>
                          <span className={`status-badge ${apt.status.toLowerCase()}`}>{apt.status}</span>
                        </div>
                      </div>
                      <div className="timeline-actions">
                        {apt.status === 'ACCEPTED' && apt.appointmentType === 'VIDEO' && (
                          <button className="premium-btn-primary" onClick={() => openTelemedicine(apt)}>
                            <Video size={16} /> Start Session
                          </button>
                        )}
                        {apt.status === 'ACCEPTED' && apt.appointmentType === 'IN_PERSON' && (
                          <button className="premium-btn-outline" onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}>
                           Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 4. PENDING APPOINTMENT REQUESTS */}
          <section className="premium-section">
            <h2 className="premium-section-title">Pending Requests</h2>
            <div className="premium-card">
              {loading ? (
                <div className="skeleton" style={{height: 100}}></div>
              ) : pendingAppts.length === 0 ? (
                <div className="empty-state">No pending requests</div>
              ) : (
                <div className="requests-list">
                  {pendingAppts.map(apt => (
                    <div key={apt.id} className="request-row">
                      <div className="req-info">
                        <h4>{apt.patientName || `Patient #${apt.patientId}`}</h4>
                        <span>{new Date(apt.appointmentDate).toDateString()} • {apt.appointmentTime || '--:--'} • {apt.appointmentType}</span>
                      </div>
                      <div className="req-actions">
                        <button className="btn-accept" onClick={() => handleUpdateStatus(apt.id, 'ACCEPTED')}>
                          <CheckCircle size={18} /> Accept
                        </button>
                        <button className="btn-reject" onClick={() => handleUpdateStatus(apt.id, 'REJECTED')}>
                          <XCircle size={18} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 5. RECENT PATIENT ACTIVITY */}
          <section className="premium-section">
            <h2 className="premium-section-title">Recent Patients</h2>
            <div className="doc-grid">
              {patients.slice(0, 3).map(pt => (
                <div key={pt.id} className="premium-card doc-card">
                  <div className="doc-avatar">{pt.name.substring(0,2).toUpperCase()}</div>
                  <div className="doc-details">
                    <h4>{pt.name}</h4>
                    <span>Last visit: {new Date(pt.lastVisitDate).toLocaleDateString()}</span>
                  </div>
                  <button className="premium-link" onClick={() => navigate('/doctor/dashboard/patients')}>View Record</button>
                </div>
              ))}
            </div>
          </section>

        </div>

        <div className="premium-col-side">
          {/* 6. QUICK ACTIONS ROW */}
          <section className="premium-section">
            <h2 className="premium-section-title">Quick Actions</h2>
            <div className="quick-actions-col">
              <button className="premium-card quick-action-btn" onClick={() => navigate('/doctor/dashboard/doctor-appointments')}>
                <Calendar className="qa-icon" />
                <span>Set Availability</span>
              </button>
              <button className="premium-card quick-action-btn" onClick={openPrescription}>
                <FilePen className="qa-icon" />
                <span>Issue Prescription</span>
              </button>
              <button className="premium-card quick-action-btn" onClick={() => toast('Select a video appointment from your schedule to start')}>
                <Video className="qa-icon" />
                <span>Start Consultation</span>
              </button>
            </div>
          </section>

          <section className="premium-section">
            <NotificationsSection userId={user?.id} />
          </section>
        </div>
      </div>

      <PrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        doctorId={profile?.id}
        doctorName={profile?.name || profile?.firstName}
      />

      <TelemedicineModal
        isOpen={isTelemedicineModalOpen}
        onClose={() => {
          setTelemedicineModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        doctorId={profile?.id}
      />
    </div>
  );
};

export default DoctorDashboard;
