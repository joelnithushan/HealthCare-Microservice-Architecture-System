import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const PrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const stored = localStorage.getItem('user');
        const user = stored ? JSON.parse(stored) : null;
        if (!user || user.role !== 'PATIENT') {
          toast.error('Only patients can view this page');
          return;
        }

        const res = await api.get(`/prescriptions/patient/${user.id}`);
        setPrescriptions(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading prescriptions...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>My Prescriptions</h2>
        <p>View your past prescriptions and medical instructions.</p>
      </div>

      {prescriptions.length === 0 ? (
        <div style={styles.emptyState}>No prescriptions found.</div>
      ) : (
        <div style={styles.grid}>
          {prescriptions.map(p => (
            <div key={p.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.medication}>{p.medication}</h3>
                <span style={styles.date}>{new Date(p.issuedDate).toLocaleDateString()}</span>
              </div>
              
              <div style={styles.details}>
                <div style={styles.detailRow}>
                  <strong>Dosage:</strong> <span>{p.dosage}</span>
                </div>
                {p.frequency && (
                  <div style={styles.detailRow}>
                    <strong>Frequency:</strong> <span>{p.frequency}</span>
                  </div>
                )}
                {p.duration && (
                  <div style={styles.detailRow}>
                    <strong>Duration:</strong> <span>{p.duration}</span>
                  </div>
                )}
                <div style={styles.detailRow}>
                  <strong>Instructions:</strong> <span>{p.instructions || 'N/A'}</span>
                </div>
                {p.notes && (
                  <div style={styles.detailRow}>
                    <strong>Notes:</strong> <span>{p.notes}</span>
                  </div>
                )}
              </div>

              {p.prescriptionPdfUrl && (
                <div style={styles.actions}>
                  <a href={p.prescriptionPdfUrl} target="_blank" rel="noopener noreferrer" style={styles.downloadBtn}>
                     View PDF
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
    background: 'var(--bg-main)',
    minHeight: 'calc(100vh - 64px)'
  },
  header: {
    marginBottom: '32px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px'
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid var(--border-light)',
    paddingBottom: '12px',
    marginBottom: '16px'
  },
  medication: {
    margin: 0,
    fontSize: '1.2rem',
    color: 'var(--navy)'
  },
  date: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  details: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px'
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '0.95rem',
    color: 'var(--text-main)',
    lineHeight: '1.4'
  },
  actions: {
    borderTop: '1px solid var(--border-light)',
    paddingTop: '16px'
  },
  downloadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#f8fafc',
    color: 'var(--primary)',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: 600,
    transition: 'background 0.2s'
  },
  emptyState: {
    background: '#fff',
    padding: '60px',
    textAlign: 'center',
    borderRadius: '12px',
    color: 'var(--text-muted)'
  }
};

export default PrescriptionsPage;
