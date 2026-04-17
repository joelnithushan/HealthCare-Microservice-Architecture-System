import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const statusConfig = {
  ACCEPTED: { bg: 'var(--primary-light)', color: 'var(--primary-hover)', border: 'transparent', label: 'Accepted' },
  CANCELLED: { bg: '#fee2e2', color: '#dc2626', border: 'transparent', label: 'Cancelled' },
  REJECTED: { bg: '#fee2e2', color: '#dc2626', border: 'transparent', label: 'Rejected' },
  PENDING: { bg: '#fef3c7', color: '#d97706', border: 'transparent', label: 'Pending' },
  COMPLETED: { bg: '#f1f5f9', color: '#475569', border: 'transparent', label: 'Completed' },
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const stored = localStorage.getItem('user');
        const user = stored && stored !== 'undefined' ? JSON.parse(stored) : null;
        if (!user || !user.id) {
          setError('User not found. Please log in again.');
          setLoading(false);
          return;
        }
        const response = await api.get(`/appointments/user/${user.id}`);
        setAppointments(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch appointments');
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) return (
    <div style={styles.loadingList}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flat-card skeleton-card">
          <div className="skeleton skeleton-text short" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text short" />
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div style={styles.errorBox}><span>️</span> {error}</div>
  );

  return (
    <div>
      <p style={styles.subtitle}>{appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found</p>

      {appointments.length === 0 ? (
        <div className="flat-card" style={styles.emptyState}>
          <div style={{ fontSize: 48, marginBottom: 12 }}></div>
          <p style={{ color: 'var(--text-muted)' }}>You don't have any appointments yet.</p>
          <button onClick={() => navigate('/dashboard/book-appointment')} className="flat-btn" style={{ marginTop: '1rem' }}>
             Book your first appointment
          </button>
        </div>
      ) : (
        <div style={styles.list}>
          {appointments.map((app, i) => {
            const sc = statusConfig[app.status] || statusConfig.PENDING;
            return (
              <div key={app.id} className="flat-card" style={{ padding: '1.5rem', marginBottom: '1rem', animationDelay: `${i * 0.05}s` }}>
                <div style={styles.cardTop}>
                  <div style={styles.cardInfo}>
                    <div style={styles.cardRow}>
                      <span style={styles.iconLabel}></span>
                      <span style={styles.cardLabel}>Doctor ID:</span>
                      <span style={styles.cardValue}>{app.doctorId}</span>
                    </div>
                    <div style={styles.cardRow}>
                      <span style={styles.iconLabel}></span>
                      <span style={styles.cardLabel}>Date:</span>
                      <span style={styles.cardValue}>{app.appointmentDate}</span>
                    </div>
                    <div style={styles.cardRow}>
                      <span style={styles.iconLabel}></span>
                      <span style={styles.cardLabel}>Time:</span>
                      <span style={styles.cardValue}>{app.appointmentTime}</span>
                    </div>
                  </div>

                  <span style={{
                    ...styles.statusPill,
                    background: sc.bg,
                    color: sc.color,
                    borderColor: sc.border,
                  }}>
                    {sc.label}
                  </span>
                </div>

                {app.status === 'ACCEPTED' && (
                  <div style={styles.actions}>
                    <button
                      onClick={() => navigate(`/dashboard/pay/${app.id}`)}
                      className="flat-btn-outline"
                    >
                       Pay Now
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/consult/${app.id}`)}
                      className="flat-btn"
                    >
                       Join Video
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  cardRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
  },
  iconLabel: {
    fontSize: '1rem',
    width: 22,
    textAlign: 'center',
    flexShrink: 0,
  },
  cardLabel: {
    color: 'var(--text-muted)',
    fontWeight: 500,
    minWidth: 70,
  },
  cardValue: {
    color: 'var(--text-main)',
    fontWeight: 600,
  },
  statusPill: {
    padding: '0.25rem 0.75rem',
    borderRadius: 'var(--radius-none)',
    fontSize: '0.75rem',
    fontWeight: 600,
    border: '1px solid',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.25rem',
    paddingTop: '1.25rem',
    borderTop: '1px solid var(--border-light)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '1rem',
    borderRadius: 'var(--radius-none)',
    border: '1px solid #f87171',
  },
  loadingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  }
};

export default Appointments;
