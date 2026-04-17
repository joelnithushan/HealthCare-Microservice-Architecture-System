import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/doctors/verified');
        setDoctors(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch doctors');
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (loading) return (
    <div style={styles.loadingGrid}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flat-card" style={styles.skeletonCard}>
          <div className="skeleton" style={styles.skeletonAvatar} />
          <div className="skeleton" style={{ ...styles.skeletonLine, width: '60%' }} />
          <div className="skeleton" style={{ ...styles.skeletonLine, width: '40%' }} />
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div style={styles.errorBox}>
      <span style={{ fontSize: 20 }}>️</span> {error}
    </div>
  );

  return (
    <div>
      <p style={styles.subtitle}>{doctors.length} doctors available for consultation</p>
      {doctors.length === 0 ? (
        <div className="flat-card" style={styles.emptyState}>
          <div style={{ fontSize: 48, marginBottom: 12 }}></div>
          <p style={{ color: 'var(--text-muted)' }}>No doctors available at the moment.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {doctors.map((doctor, i) => (
            <div key={doctor.id || doctor.userId} className="flat-card" style={{ padding: '2rem 1.5rem', textAlign: 'center', animationDelay: `${i * 0.05}s` }}>
              <div style={styles.avatarWrapper}>
                <div style={styles.avatar}>
                  {(doctor.name || 'D').charAt(0).toUpperCase()}
                </div>
                <div style={{
                  ...styles.statusDot,
                  background: doctor.availability ? '#10b981' : 'var(--text-muted)',
                  boxShadow: '0 0 0 2px var(--bg-white)'
                }} />
              </div>

              <h3 style={styles.doctorName}>Dr. {doctor.name}</h3>
              <span style={styles.specBadge}>{doctor.specialization || 'General'}</span>
              <div style={styles.availRow}>
                <span style={{
                  ...styles.availBadge,
                  background: doctor.availability ? '#dcfce7' : '#fee2e2',
                  color: doctor.availability ? '#15803d' : '#b91c1c',
                }}>
                  {doctor.availability ? ' ' + doctor.availability : ' Check Availability'}
                </span>
              </div>
            </div>
          ))}
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1.25rem',
  },
  avatarWrapper: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '1rem',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    fontWeight: 700,
    color: '#fff',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: '50%',
  },
  doctorName: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: '0.5rem',
    margin: 0,
  },
  specBadge: {
    display: 'inline-block',
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    padding: '4px 12px',
    borderRadius: 'var(--radius-none)',
    fontSize: '0.75rem',
    fontWeight: 600,
    marginBottom: '1rem',
    marginTop: '0.5rem',
  },
  availRow: {
    marginTop: 4,
  },
  availBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 'var(--radius-none)',
    fontSize: '0.75rem',
    fontWeight: 600,
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
  loadingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 18,
  },
  skeletonCard: {
    padding: '2rem 1.5rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  skeletonAvatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'var(--border-light)',
    margin: '0 auto 16px',
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    margin: '8px auto',
  },
};

export default Doctors;
