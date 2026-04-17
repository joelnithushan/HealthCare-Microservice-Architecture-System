import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { 
  Calendar, CheckCircle, CreditCard, Activity, Video, FileText, FilePlus, CalendarPlus, ChevronRight 
} from 'lucide-react';

import BookingModal from '../components/patient/BookingModal';
// Retaining components that handle their own complex state, updating their wrapper in CSS if needed
import AppointmentHistory from '../components/patient/AppointmentHistory';
import NotificationsSection from '../components/patient/NotificationsSection';

import './PatientDashboard.css';

const PatientDashboard = () => {
  const navigate = useNavigate();

  // ----- State (Untouched) -----
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specFilter, setSpecFilter] = useState('');

  // Modals (Untouched)
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Authentication Context (Untouched)
  const token = localStorage.getItem('token');
  const user = React.useMemo(() => {
    const stored = localStorage.getItem('user');
    return stored && stored !== 'undefined' ? JSON.parse(stored) : null;
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [apptsRes, paysRes, docsRes, profRes] = await Promise.allSettled([
        api.get(`/appointments/user/${user.id}`),
        api.get(`/payments/user/${user.id}`),
        api.get('/doctors/verified'),
        api.get(`/users/${user.id}`)
      ]);
      setProfile(profRes.status === 'fulfilled' ? profRes.value.data : user);
      let fetchedAppts = apptsRes.status === 'fulfilled' ? apptsRes.value.data : [];
      fetchedAppts.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
      setAppointments(fetchedAppts);
      setPayments(paysRes.status === 'fulfilled' ? paysRes.value.data : []);
      setDoctorsList(docsRes.status === 'fulfilled' ? docsRes.value.data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, user?.id, user?.role, navigate]);

  useEffect(() => {
    fetchData();
    const pollInterval = setInterval(() => {
      if (!document.hidden) fetchData();
    }, 30000);
    return () => clearInterval(pollInterval);
  }, [fetchData]);

  // Actions (Untouched)
  const handleCancelAppointment = async (apptId) => {
    try {
      await api.put(`/appointments/${apptId}/status`, { status: 'CANCELLED' });
      toast.success('Appointment cancelled successfully');
      setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: 'CANCELLED' } : a));
    } catch (err) {
      toast.error('Failed to cancel appointment');
    }
  };

  const openBookModal = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingModalOpen(true);
  };

  const handleBookSuccess = (newAppt) => {
    setAppointments(prev => [...prev, newAppt].sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)));
  };

  // Derived Data (Untouched)
  const today = new Date().toISOString().split('T')[0];
  const upcomingAppts = appointments.filter(a => a.appointmentDate >= today && (a.status === 'PENDING' || a.status === 'ACCEPTED'));
  const nextAppt = upcomingAppts.length > 0 ? upcomingAppts[0] : null;
  const pastAppts = appointments.filter(a => a.appointmentDate < today || a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'REJECTED');
  const pendingPayments = payments.filter(p => p.status === 'PENDING');
  const uniqueDoctors = new Set(appointments.map(a => a.doctorId)).size;
  
  const filteredDoctors = specFilter ? doctorsList.filter(d => d.specialization?.toLowerCase().includes(specFilter.toLowerCase())) : doctorsList;

  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role && user.role !== 'PATIENT') return <Navigate to="/login" replace />;
  if (user.profileComplete === false) return <Navigate to="/complete-profile" replace />;

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="premium-dashboard">
      {/* 1. WELCOME BANNER */}
      <div className="premium-banner">
        <div className="premium-banner-content">
          <h1>{greeting}, {profile?.name || user?.name || 'Patient'}</h1>
          <p>{currentDateFormatted} • You have {upcomingAppts.length} upcoming appointments</p>
        </div>
        <Activity className="premium-banner-icon" />
      </div>

      {error && (
        <div className="premium-error">
          <span>{error}</span>
          <button className="premium-btn-danger" onClick={fetchData}>Retry</button>
        </div>
      )}

      {/* 2. STATS ROW */}
      <div className="premium-stats-grid">
        <div className="premium-stat-card">
          <div className="stat-stripe"></div>
          <Calendar className="stat-icon" />
          <div className="stat-value">{upcomingAppts.length}</div>
          <div className="stat-label">Upcoming Appointments</div>
        </div>
        <div className="premium-stat-card">
          <div className="stat-stripe"></div>
          <CheckCircle className="stat-icon" />
          <div className="stat-value">{pastAppts.length}</div>
          <div className="stat-label">Consultations Done</div>
        </div>
        <div className="premium-stat-card">
          <div className="stat-stripe border-warning"></div>
          <CreditCard className="stat-icon text-warning" />
          <div className="stat-value text-warning">{pendingPayments.length}</div>
          <div className="stat-label">Pending Payments</div>
        </div>
        <div className="premium-stat-card">
          <div className="stat-stripe"></div>
          <Activity className="stat-icon" />
          <div className="stat-value">{uniqueDoctors}</div>
          <div className="stat-label">Doctors Consulted</div>
        </div>
      </div>

      <div className="premium-main-grid">
        <div className="premium-col-main">
          {/* 3. NEXT APPOINTMENT CARD */}
          <section className="premium-section">
            <h2 className="premium-section-title">Next Appointment</h2>
            {loading ? (
              <div className="premium-card skeleton" style={{ height: '120px' }}></div>
            ) : nextAppt ? (
               <div className="premium-card appointment-card">
                 <div className="apt-info">
                   <div className="apt-avatar">{nextAppt.doctorName ? nextAppt.doctorName.substring(0,2).toUpperCase() : 'DR'}</div>
                   <div>
                     <h3 className="apt-doc-name">Dr. {nextAppt.doctorName}</h3>
                     <span className="apt-spec">{nextAppt.appointmentType}</span>
                     <div className="apt-date">{new Date(nextAppt.appointmentDate).toDateString()} at {nextAppt.appointmentTime}</div>
                   </div>
                 </div>
                 <div className="apt-actions">
                   {nextAppt.appointmentType === 'VIDEO' && (
                     <button className="premium-btn-primary" onClick={() => navigate(`/patient/dashboard/consult/${nextAppt.id}`)}>
                       <Video size={16} /> Join Video Call
                     </button>
                   )}
                   <button className="premium-link" onClick={() => navigate('/patient/dashboard/appointments')}>View Details</button>
                 </div>
               </div>
            ) : (
               <div className="premium-card empty-state">No upcoming appointments</div>
            )}
          </section>

          {/* 4. RECENTLY CONSULTED DOCTORS (Now replacing it with quick booking for matching doctors) */}
          <section className="premium-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="premium-section-title" style={{ margin: 0 }}>Browse Doctors</h2>
              <select className="premium-select" value={specFilter} onChange={(e) => setSpecFilter(e.target.value)}>
                <option value="">All Specializations</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Psychiatrist">Psychiatrist</option>
              </select>
            </div>
            
            {loading ? (
              <div className="doc-grid">
                {[1,2,3].map(i => <div key={i} className="premium-card skeleton" style={{height: 160}}></div>)}
              </div>
            ) : (
              <div className="doc-grid">
                {filteredDoctors.slice(0, 3).map(doctor => (
                  <div key={doctor.id} className="premium-card doc-card">
                    <div className="doc-avatar">{doctor.name ? doctor.name.substring(0,2).toUpperCase() : 'DR'}</div>
                    <div className="doc-details">
                      <h4>Dr. {doctor.name}</h4>
                      <span>{doctor.specialization || 'General'}</span>
                    </div>
                    <button className="premium-btn-outline" onClick={() => openBookModal(doctor)}>Book</button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Legacy Components Retained for seamless functionality */}
          <section className="premium-section">
             <AppointmentHistory appointments={appointments} loading={loading} />
          </section>

        </div>

        <div className="premium-col-side">
          {/* 6. QUICK ACTIONS ROW (Vertical layout on side column) */}
          <section className="premium-section">
            <h2 className="premium-section-title">Quick Actions</h2>
            <div className="quick-actions-col">
              <button className="premium-card quick-action-btn" onClick={() => document.querySelector('.premium-select')?.focus()}>
                <CalendarPlus className="qa-icon" />
                <span>Book Appointment</span>
              </button>
              <button className="premium-card quick-action-btn" onClick={() => navigate('/patient/dashboard/reports')}>
                <FilePlus className="qa-icon" />
                <span>Upload Report</span>
              </button>
              <button className="premium-card quick-action-btn" onClick={() => navigate('/patient/dashboard/prescriptions')}>
                <FileText className="qa-icon" />
                <span>View Prescriptions</span>
              </button>
            </div>
          </section>

          <section className="premium-section">
             <NotificationsSection userId={user?.id} />
          </section>
        </div>
      </div>

      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        doctor={selectedDoctor}
        patientId={profile?.id}
        patientName={profile?.name || profile?.firstName || 'Patient'}
        onBookSuccess={handleBookSuccess}
      />
    </div>
  );
};

export default PatientDashboard;
