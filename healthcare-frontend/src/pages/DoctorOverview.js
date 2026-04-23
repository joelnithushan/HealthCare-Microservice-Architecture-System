import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DoctorOverview = () => {
  const [data, setData] = useState({ appointments: [] });
  const [loading, setLoading] = useState(true);
  const stored = localStorage.getItem('user');
  const user = stored && stored !== 'undefined' ? JSON.parse(stored) : {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/appointments/user/${user.id}`);
        setData({ appointments: res.data });
      } catch (err) {
        setData({ appointments: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = data.appointments.filter(a => a.appointmentDate === today);
  const upcoming = data.appointments.filter(a => a.status === 'ACCEPTED');
  const completed = data.appointments.filter(a => a.status === 'COMPLETED');
  const pending = data.appointments.filter(a => a.status === 'PENDING');

  if (loading) return (
    <div>
      <div style={s.greeting}>
        <div className="skeleton skeleton-title" style={{ width: '50%' }} />
        <div className="skeleton skeleton-text" style={{ width: '40%' }} />
      </div>
      <div style={s.statsGrid}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-text short" />
            <div className="skeleton" style={{ height: 36, width: '30%', marginBottom: 8 }} />
            <div className="skeleton skeleton-text short" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* Greeting */}
      <div style={s.greeting}>
        <h2 style={s.greetTitle}>Good day, Dr. {user.name || 'Doctor'}</h2>
        <p style={s.greetSub}>Here's your practice summary for today.</p>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        <div style={{ ...s.statCard, borderLeft: '4px solid var(--primary)' }}>
          <div style={s.statLabel}>Today's Patients</div>
          <div style={s.statValue}>{todayAppts.length}</div>
          <div style={s.statSub}>{today}</div>
        </div>
        <div style={{ ...s.statCard, borderLeft: '4px solid #10b981' }}>
          <div style={s.statLabel}>Upcoming</div>
          <div style={{ ...s.statValue, color: '#10b981' }}>{upcoming.length}</div>
          <div style={s.statSub}>Confirmed appointments</div>
        </div>
        <div style={{ ...s.statCard, borderLeft: '4px solid #f59e0b' }}>
          <div style={s.statLabel}>Pending Review</div>
          <div style={{ ...s.statValue, color: '#f59e0b' }}>{pending.length}</div>
          <div style={s.statSub}>Awaiting confirmation</div>
        </div>
        <div style={{ ...s.statCard, borderLeft: '4px solid #64748b' }}>
          <div style={s.statLabel}>Total Consultations</div>
          <div style={{ ...s.statValue, color: '#64748b' }}>{completed.length}</div>
          <div style={s.statSub}>Completed sessions</div>
        </div>
      </div>

      {/* Actions + Today Schedule */}
      <div style={s.row}>
        {/* Quick Actions */}
        <div style={s.sectionCard}>
          <h3 style={s.sectionTitle}>Quick Actions</h3>
          <div style={s.actionList}>
            <Link to="/doctor/dashboard#schedule" style={s.actionItem}>
              <div style={{ ...s.actionIcon, background: 'var(--primary-light)', color: 'var(--primary)' }}>S</div>
              <div>
                <div style={s.actionLabel}>My Schedule</div>
                <div style={s.actionDesc}>View and manage patient appointments</div>
              </div>
            </Link>
            <Link to="/doctor/dashboard#prescriptions" style={s.actionItem}>
              <div style={{ ...s.actionIcon, background: '#dcfce7', color: '#15803d' }}>R</div>
              <div>
                <div style={s.actionLabel}>Prescriptions</div>
                <div style={s.actionDesc}>Write and manage prescriptions</div>
              </div>
            </Link>
            <Link to="/doctor/dashboard#notifications" style={s.actionItem}>
              <div style={{ ...s.actionIcon, background: '#fef3c7', color: '#d97706' }}>N</div>
              <div>
                <div style={s.actionLabel}>Notifications</div>
                <div style={s.actionDesc}>System alerts and messages</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Today's Schedule */}
        <div style={s.sectionCard}>
          <h3 style={s.sectionTitle}>Today's Schedule</h3>
          {todayAppts.length === 0 ? (
            <div style={s.emptyState}>
              <p style={s.emptyText}>No appointments scheduled for today</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your schedule is clear. Check back later.</p>
            </div>
          ) : (
            <div style={s.scheduleList}>
              {todayAppts.map(apt => {
                const sc = statusMap[apt.status] || statusMap.PENDING;
                return (
                  <div key={apt.id} style={s.scheduleItem}>
                    <div style={s.scheduleTime}>
                      <div style={s.timeText}>{apt.appointmentTime || '--:--'}</div>
                    </div>
                    <div style={s.scheduleLine} />
                    <div style={s.scheduleContent}>
                      <div style={s.schedulePatient}>Patient #{apt.patientId || 'N/A'}</div>
                      <div style={s.scheduleActions}>
                        <span style={{ ...s.scheduleStatus, background: sc.bg, color: sc.color }}>{apt.status}</span>
                        {apt.status === 'ACCEPTED' && (
                          <Link to={`/doctor/dashboard/consult/${apt.id}`} className="flat-btn" style={{ padding: '3px 12px', fontSize: '0.7rem' }}>
                            Start Call
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Doctor Profile + Practice Info */}
      <div style={s.row}>
        <div style={{ ...s.sectionCard, flex: 1 }}>
          <h3 style={s.sectionTitle}>My Profile</h3>
          <div style={s.profileGrid}>
            <div style={s.profileItem}><span style={s.profileLabel}>Full Name</span><span style={s.profileValue}>Dr. {user.name || 'N/A'}</span></div>
            <div style={s.profileItem}><span style={s.profileLabel}>Email</span><span style={s.profileValue}>{user.email || 'N/A'}</span></div>
            <div style={s.profileItem}><span style={s.profileLabel}>SLMC No.</span><span style={s.profileValue}>{user.slmcNumber || 'N/A'}</span></div>
            <div style={s.profileItem}><span style={s.profileLabel}>Specialization</span><span style={s.profileValue}>{user.specialization || 'N/A'}</span></div>
            <div style={s.profileItem}><span style={s.profileLabel}>Hospital</span><span style={s.profileValue}>{user.hospitalAttached || 'N/A'}</span></div>
            <div style={s.profileItem}><span style={s.profileLabel}>Mobile</span><span style={s.profileValue}>{user.mobileNumber || 'N/A'}</span></div>
            <div style={s.profileItem}><span style={s.profileLabel}>Availability</span><span style={s.profileValue}>{user.availability || 'N/A'}</span></div>
            <div style={s.profileItem}><span style={s.profileLabel}>NIC</span><span style={s.profileValue}>{user.nic || 'N/A'}</span></div>
          </div>
        </div>

        <div style={{ ...s.sectionCard, flex: 0, minWidth: 260 }}>
          <h3 style={s.sectionTitle}>Practice Summary</h3>
          <div style={s.summaryList}>
            <div style={s.summaryRow}>
              <span style={s.summaryLabel}>All Appointments</span>
              <span style={s.summaryVal}>{data.appointments.length}</span>
            </div>
            <div style={s.summaryRow}>
              <span style={s.summaryLabel}>Confirmed</span>
              <span style={{ ...s.summaryVal, color: '#15803d' }}>{upcoming.length}</span>
            </div>
            <div style={s.summaryRow}>
              <span style={s.summaryLabel}>Pending</span>
              <span style={{ ...s.summaryVal, color: '#d97706' }}>{pending.length}</span>
            </div>
            <div style={s.summaryRow}>
              <span style={s.summaryLabel}>Completed</span>
              <span style={{ ...s.summaryVal, color: '#475569' }}>{completed.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const statusMap = {
  ACCEPTED: { bg: '#dcfce7', color: '#15803d' },
  PENDING: { bg: '#fef3c7', color: '#92400e' },
  COMPLETED: { bg: '#f1f5f9', color: '#475569' },
  CANCELLED: { bg: '#fee2e2', color: '#b91c1c' },
  REJECTED: { bg: '#fee2e2', color: '#b91c1c' },
};

const s = {
  greeting: { marginBottom: 24 },
  greetTitle: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy)', margin: 0, marginBottom: 4 },
  greetSub: { fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: 'var(--bg-white)', border: '1px solid var(--border-light)', padding: '20px' },
  statLabel: { fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 },
  statValue: { fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1, marginBottom: 4 },
  statSub: { fontSize: '0.7rem', color: 'var(--text-muted)' },
  row: { display: 'flex', gap: 20, marginBottom: 20 },
  sectionCard: { flex: 1, background: 'var(--bg-white)', border: '1px solid var(--border-light)', padding: '20px' },
  sectionTitle: { fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-light)' },
  actionList: { display: 'flex', flexDirection: 'column', gap: 10 },
  actionItem: { display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', border: '1px solid var(--border-light)', textDecoration: 'none', transition: 'background 0.15s' },
  actionIcon: { width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 },
  actionLabel: { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 1 },
  actionDesc: { fontSize: '0.7rem', color: 'var(--text-muted)' },
  emptyState: { textAlign: 'center', padding: '30px 20px' },
  emptyText: { color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 4 },
  scheduleList: { display: 'flex', flexDirection: 'column', gap: 0 },
  scheduleItem: { display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid #f1f5f9' },
  scheduleTime: { width: 60, textAlign: 'center', flexShrink: 0 },
  timeText: { fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' },
  scheduleLine: { width: 3, height: 32, background: 'var(--primary-light)', borderRadius: 2, flexShrink: 0 },
  scheduleContent: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  schedulePatient: { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' },
  scheduleActions: { display: 'flex', alignItems: 'center', gap: 8 },
  scheduleStatus: { padding: '2px 10px', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' },
  profileGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 24px' },
  profileItem: { display: 'flex', flexDirection: 'column' },
  profileLabel: { fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 },
  profileValue: { fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' },
  summaryList: { display: 'flex', flexDirection: 'column', gap: 12 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' },
  summaryLabel: { fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 },
  summaryVal: { fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' },
};

export default DoctorOverview;
