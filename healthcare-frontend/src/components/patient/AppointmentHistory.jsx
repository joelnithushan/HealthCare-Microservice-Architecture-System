import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Calendar, Clock, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AppointmentHistory = ({ appointments, loading, onRescheduleSuccess }) => {
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  if (loading) {
    return (
      <div className="pat-panel">
        <div className="pat-panel__header">
          <h3 className="pat-panel__title">
            <span className="pat-panel__title-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><Calendar size={18} /></span>
            My Appointments
          </h3>
        </div>
        <div className="pat-panel__body">
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
              <div className="skeleton" style={{ flex: 1, height: '20px' }}></div>
              <div className="skeleton" style={{ flex: 1, height: '20px' }}></div>
              <div className="skeleton" style={{ flex: 1, height: '20px' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  
  // All upcoming
  const upcoming = appointments
    .filter(a => a.appointmentDate >= today && (a.status === 'PENDING' || a.status === 'ACCEPTED'))
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  // Past 
  const history = appointments
    .filter(a => a.appointmentDate < today || a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'REJECTED')
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
    .slice(0, 5);

  const handleOpenReschedule = (apt) => {
    setSelectedAppt(apt);
    setNewDate(apt.appointmentDate);
    setNewTime(apt.appointmentTime);
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate || !newTime) {
      toast.error("Date and time are required.");
      return;
    }
    
    // Check if past date
    if (newDate < today) {
      toast.error("Cannot reschedule to a past date.");
      return;
    }

    setRescheduling(true);
    try {
      await api.put(`/appointments/${selectedAppt.id}`, {
        patientId: selectedAppt.patientId,
        doctorId: selectedAppt.doctorId,
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: selectedAppt.status,
        notes: selectedAppt.notes
      });
      toast.success("Appointment rescheduled successfully!");
      setRescheduleModalOpen(false);
      if (onRescheduleSuccess) onRescheduleSuccess();
      else window.location.reload(); // Simple fallback
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reschedule appointment.");
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <>
      <div className="pat-panel">
        <div className="pat-panel__header">
          <h3 className="pat-panel__title">
            <span className="pat-panel__title-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><Calendar size={18} /></span>
            My Appointments
          </h3>
        </div>
        <div className="pat-panel__body pat-panel__body--no-pad">
          {appointments.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No appointments found.
            </div>
          ) : (
            <>
              {/* Upcoming Appointments */}
              {upcoming.length > 0 && (
                <div>
                  <div style={{ padding: '12px 20px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                    Upcoming
                  </div>
                  <table className="pat-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Doctor</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcoming.map((apt) => (
                        <tr key={apt.id}>
                          <td>
                            {new Date(apt.appointmentDate).toISOString().split('T')[0]} <br/>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.appointmentTime}</span>
                          </td>
                          <td style={{ fontWeight: 600 }}>Dr. {apt.doctorName || `Doctor #${apt.doctorId || 'N/A'}`}</td>
                          <td>{apt.appointmentType === 'VIDEO' ? 'Video' : 'In-Person'}</td>
                          <td>
                            <span className={`pat-badge pat-badge--${apt.status.toLowerCase()}`}>
                              {apt.status}
                            </span>
                          </td>
                          <td>
                            <button className="pat-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => handleOpenReschedule(apt)}>
                              <RefreshCw size={12} />
                              Reschedule
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Past Appointments */}
              {history.length > 0 && (
                <div>
                  <div style={{ padding: '12px 20px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)', borderTop: upcoming.length > 0 ? '1px solid var(--border-light)' : 'none', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                    Past (Recent 5)
                  </div>
                  <table className="pat-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Doctor</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((apt) => (
                        <tr key={apt.id}>
                          <td>
                            {new Date(apt.appointmentDate).toISOString().split('T')[0]} <br/>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.appointmentTime}</span>
                          </td>
                          <td style={{ fontWeight: 600 }}>Dr. {apt.doctorName || `Doctor #${apt.doctorId || 'N/A'}`}</td>
                          <td>{apt.appointmentType === 'VIDEO' ? 'Video' : 'In-Person'}</td>
                          <td>
                            <span className={`pat-badge ${apt.status === 'COMPLETED' ? 'pat-badge--completed' : 'pat-badge--cancelled'}`}>
                              {apt.status}
                            </span>
                          </td>
                          <td>-</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {rescheduleModalOpen && selectedAppt && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Reschedule Appointment</h3>
                <button 
                  onClick={() => setRescheduleModalOpen(false)} 
                  style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                >
                  <X size={20} />
                </button>
            </div>
            
            <form onSubmit={handleRescheduleSubmit} style={styles.modalBody}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Rescheduling appointment with <strong>Dr. {selectedAppt.doctorName}</strong>
              </p>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>New Date</label>
                <input 
                  type="date" 
                  className="flat-input" 
                  value={newDate} 
                  onChange={e => setNewDate(e.target.value)}
                  min={today}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>New Time</label>
                <input 
                  type="time" 
                  className="flat-input" 
                  value={newTime} 
                  onChange={e => setNewTime(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="pat-btn pat-btn--danger" style={{ flex: 1 }} onClick={() => setRescheduleModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="pat-btn pat-btn--accent" style={{ flex: 1 }} disabled={rescheduling}>
                  {rescheduling ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: '20px'
  },
  modalContent: {
    background: '#fff', borderRadius: '16px',
    width: '100%', maxWidth: '400px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  modalHeader: {
    padding: '20px 24px', borderBottom: '1px solid var(--border-light)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  modalBody: {
    padding: '24px'
  },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' },
};

AppointmentHistory.propTypes = {
  appointments: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onRescheduleSuccess: PropTypes.func
};

export default AppointmentHistory;
