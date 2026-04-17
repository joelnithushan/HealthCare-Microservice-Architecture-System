import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const NextAppointmentCard = ({ appointment, onCancel, loading, isPaid }) => {
  const [joining, setJoining] = useState(false);

  if (loading) {
    return (
      <div className="pat-panel">
        <div className="pat-panel__header">
          <h3 className="pat-panel__title">
            <span className="pat-panel__title-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>⏰</span>
            Next Appointment
          </h3>
        </div>
        <div className="pat-panel__body">
          <div className="skeleton" style={{ width: '40%', height: '20px', borderRadius: '6px', marginBottom: '10px' }}></div>
          <div className="skeleton" style={{ width: '60%', height: '16px', borderRadius: '6px', marginBottom: '10px' }}></div>
          <div className="skeleton" style={{ width: '30%', height: '32px', borderRadius: '8px', marginTop: '16px' }}></div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="pat-panel">
        <div className="pat-panel__header">
          <h3 className="pat-panel__title">
            <span className="pat-panel__title-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>⏰</span>
            Next Appointment
          </h3>
        </div>
        <div className="pat-empty-state">
          <div className="pat-empty-state__icon">📅</div>
          <div className="pat-empty-state__text">No upcoming appointments</div>
          <div className="pat-empty-state__sub">Book your next consultation below!</div>
        </div>
      </div>
    );
  }

  const handleJoinVideo = async () => {
    setJoining(true);
    try {
      const res = await api.post('/v1/telemedicine/sessions', {
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId
      });
      if (res.data && res.data.joinUrl) {
        window.open(res.data.joinUrl, '_blank');
      } else {
        toast.error('Session link could not be generated.');
      }
    } catch (err) {
      toast.error('Failed to create telemedicine session.');
    } finally {
      setJoining(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      onCancel(appointment.id);
    }
  };

  const isVideo = appointment.appointmentType === 'VIDEO';

  return (
    <div className="pat-panel" style={{ borderLeft: '4px solid var(--primary)' }}>
      <div className="pat-panel__header">
        <h3 className="pat-panel__title">
          <span className="pat-panel__title-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>⏰</span>
          Next Appointment
        </h3>
        <span className={`pat-badge pat-badge--${appointment.status.toLowerCase()}`}>{appointment.status}</span>
      </div>
      <div className="pat-panel__body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div className="pat-next-appt__info">
          <div className="pat-next-appt__doctor">Dr. {appointment.doctorName || `Doctor #${appointment.doctorId || 'Unknown'}`}</div>
          <div className="pat-next-appt__spec">{isVideo ? '📹 Video Consultation' : '🏥 In-Person Consultation'}</div>
          
          <div className="pat-next-appt__datetime">
            <span>📅 {appointment.appointmentDate}</span>
            <span>🕐 {appointment.appointmentTime}</span>
          </div>
        </div>
        
        <div className="pat-next-appt__actions">
          {isVideo && (
            isPaid ? (
              <button 
                className="pat-btn pat-btn--accent" 
                onClick={handleJoinVideo}
                disabled={joining}
              >
                {joining ? 'Connecting...' : '📹 Join Video Call'}
              </button>
            ) : (
               <Link to={`/patient/dashboard/pay/${appointment.id}`} className="pat-btn" style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#fff', textDecoration: 'none', borderRadius: '8px' }}>
                 💳 Pay to Join Video
               </Link>
            )
          )}
          <button className="pat-btn pat-btn--danger" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

NextAppointmentCard.propTypes = {
  appointment: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  isPaid: PropTypes.bool
};

export default NextAppointmentCard;
