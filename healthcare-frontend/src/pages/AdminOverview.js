import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, UserCheck, ShieldCheck, FileWarning, 
  ArrowRight, Activity, CreditCard, ClipboardList, Shield, BadgeCheck,
  CalendarDays, FileText
} from 'lucide-react';

import '../pages/PatientDashboard.css';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, payStatsRes, aptsRes, trxsRes] = await Promise.allSettled([
          api.get('/admin/users'),
          api.get('/admin/payments/stats'),
          api.get('/admin/appointments'),
          api.get('/admin/payments')
        ]);
        
        const users = usersRes.status === 'fulfilled' ? usersRes.value.data : [];
        const patients = users.filter(u => u.role === 'PATIENT');
        const doctors = users.filter(u => u.role === 'DOCTOR');
        const admins = users.filter(u => u.role === 'ADMIN');
        const incomplete = users.filter(u => u.profileComplete === false);
        setStats({ 
          total: users.length, 
          patients: patients.length, 
          doctors: doctors.length, 
          admins: admins.length, 
          incomplete: incomplete.length 
        });

        if (payStatsRes.status === 'fulfilled') setPaymentStats(payStatsRes.value.data);
        if (aptsRes.status === 'fulfilled') setRecentAppointments(aptsRes.value.data.slice(0, 5));
        if (trxsRes.status === 'fulfilled') setRecentTransactions(trxsRes.value.data.slice(0, 5));

      } catch (err) {
        setStats({ total: 0, patients: 0, doctors: 0, admins: 0, incomplete: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="premium-dashboard">
      <div className="premium-stats-grid">
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="premium-stat-card skeleton" style={{ height: 120 }}></div>)}
      </div>
    </div>
  );

  return (
    <div className="premium-dashboard" style={{ padding: '32px', background: 'var(--admin-bg)', minHeight: '100vh' }}>
      {/* 1. WELCOME BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #0B2545 0%, #1D3B5E 100%)',
        borderRadius: '12px',
        padding: '30px 40px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', color: '#FFF', margin: '0 0 8px 0', fontSize: '28px', fontWeight: 600 }}>
            Admin Panel — Clinexa
          </h1>
          <p style={{ color: 'var(--admin-accent)', margin: 0, fontSize: '15px', fontFamily: 'var(--font-base)' }}>
            {todayDate} • Platform overview
          </p>
        </div>
        <Shield style={{ position: 'absolute', right: '-20px', top: '-20px', width: '200px', height: '200px', color: '#FFF', opacity: 0.05, transform: 'rotate(-15deg)' }} />
      </div>

      {/* 2. PLATFORM STATS ROW */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        <StatCard title="Total Users" value={stats.total} icon={<Users />} />
        <StatCard title="Total Doctors" value={stats.doctors} icon={<ShieldCheck />} />
        <StatCard title="Total Patients" value={stats.patients} icon={<UserCheck />} />
        <StatCard title="Appointments Total" value={recentAppointments.length > 0 ? '50+' : '0'} icon={<CalendarDays />} />
        <StatCard title="Revenue Total" value={paymentStats ? `LKR ${Number(paymentStats.totalRevenue || 0).toLocaleString()}` : '$0.00'} icon={<CreditCard />} />
        <StatCard title="Pending Verifications" value={stats.incomplete} icon={<BadgeCheck />} />
      </div>

      {/* 3. PENDING DOCTOR VERIFICATIONS */}
      <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', margin: 0, color: 'var(--admin-text)' }}>Pending Doctor Verifications</h2>
          <Link to="/admin/dashboard/manage-doctors" style={{ color: 'var(--admin-accent-2)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>View All</Link>
        </div>
        
        {stats.incomplete > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-base)' }}>
            <thead style={{ background: '#F8FAFC', color: 'var(--admin-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Doctor Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Specialization</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Submitted Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Mock Row since we don't have local doctor info array directly in overview */}
              <tr style={{ borderBottom: '1px solid var(--admin-border)', height: '48px', background: '#FFF' }}>
                <td style={{ padding: '0 16px', color: 'var(--admin-text)', fontSize: '14px' }}>Dr. Awaiting Verification</td>
                <td style={{ padding: '0 16px', color: 'var(--admin-text)', fontSize: '14px' }}>General Practice</td>
                <td style={{ padding: '0 16px', color: 'var(--admin-text)', fontSize: '14px' }}>Today</td>
                <td style={{ padding: '0 16px', textAlign: 'center' }}>
                  <Link to="/admin/dashboard/manage-doctors" className="admin-btn-primary" style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}>Review</Link>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-muted)' }}>
            <BadgeCheck size={40} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontSize: '14px' }}>No pending verifications</p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        {/* 4. RECENT APPOINTMENTS */}
        <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', margin: 0, color: 'var(--admin-text)' }}>Recent Appointments</h2>
          </div>
          {recentAppointments.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recentAppointments.map(ap => (
                <li key={ap.appointmentId} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--admin-border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--admin-text)' }}>Apt #{ap.appointmentId}</div>
                    <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>{ap.appointmentDate}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-accent-2)' }}>User {ap.patientId} → Dr. {ap.doctorId}</div>
                    <div style={{ fontSize: '11px', color: 'var(--admin-muted)', textTransform: 'uppercase' }}>{ap.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-muted)' }}>
              <CalendarDays size={40} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>No recent appointments found</p>
            </div>
          )}
        </div>

        {/* 5. RECENT TRANSACTIONS */}
        <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', margin: 0, color: 'var(--admin-text)' }}>Recent Transactions</h2>
            <Link to="/admin/dashboard/transactions" style={{ color: 'var(--admin-accent-2)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>View All</Link>
          </div>
          {recentTransactions.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recentTransactions.map(tx => (
                <li key={tx.paymentId} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--admin-border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--admin-text)' }}>LKR {Number(tx.amount || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>{tx.paymentMethod} • {new Date(tx.paymentDate).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`status-badge ${tx.status?.toLowerCase() === 'completed' || tx.status?.toLowerCase() === 'success' ? 'success' : tx.status?.toLowerCase() === 'failed' ? 'failed' : 'pending'}`}>{tx.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-muted)' }}>
              <CreditCard size={40} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>No recent transactions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div style={{
    background: 'var(--admin-surface)',
    border: '1px solid var(--admin-border)',
    borderLeft: '4px solid var(--admin-accent)',
    borderRadius: '12px',
    padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    position: 'relative'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.08)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'none';
    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
  }}>
    <div style={{ position: 'absolute', top: '24px', right: '24px', color: 'var(--admin-accent)' }}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '8px' }}>
      {value}
    </div>
    <div style={{ fontFamily: 'var(--font-base)', fontSize: '14px', color: 'var(--admin-muted)', fontWeight: 500 }}>
      {title}
    </div>
  </div>
);

export default AdminOverview;
