import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCard, TrendingUp, Clock, AlertTriangle, FileText, Download } from 'lucide-react';

import '../pages/PatientDashboard.css';

const TransactionsPage = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentsRes, statsRes] = await Promise.allSettled([
          api.get('/admin/payments'),
          api.get('/admin/payments/stats'),
        ]);
        setPayments(paymentsRes.status === 'fulfilled' ? paymentsRes.value.data : []);
        setStats(statsRes.status === 'fulfilled' ? statsRes.value.data : null);
      } catch (err) {
        console.error('Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = statusFilter === 'ALL'
    ? payments
    : payments.filter(p => p.status === statusFilter);

  if (loading) return (
    <div style={{ padding: '32px', background: 'var(--admin-bg)', minHeight: '100vh' }}>
      <div className="skeleton" style={{ height: 100, borderRadius: '12px' }}></div>
    </div>
  );

  return (
    <div style={{ padding: '32px', background: 'var(--admin-bg)', minHeight: '100vh', fontFamily: 'var(--font-base)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>
          Transaction Audit
        </h1>
        <button className="admin-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
           <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Stats Row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderLeft: '4px solid var(--admin-accent)', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative' }}>
            <TrendingUp style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--admin-muted)', opacity: 0.3 }} size={24} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '8px' }}>{stats.totalPayments}</div>
            <div style={{ fontSize: '13px', color: 'var(--admin-muted)', fontWeight: 500 }}>Total Volume</div>
          </div>
          <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderLeft: '4px solid var(--status-green)', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative' }}>
            <CreditCard style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--status-green)', opacity: 0.3 }} size={24} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '8px' }}>LKR {Number(stats.totalRevenue || 0).toLocaleString()}</div>
            <div style={{ fontSize: '13px', color: 'var(--admin-muted)', fontWeight: 500 }}>Total Revenue</div>
          </div>
          <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderLeft: '4px solid var(--status-amber)', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative' }}>
            <Clock style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--status-amber)', opacity: 0.3 }} size={24} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '8px' }}>{stats.pendingPayments}</div>
            <div style={{ fontSize: '13px', color: 'var(--admin-muted)', fontWeight: 500 }}>Pending Settlements</div>
          </div>
          <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderLeft: '4px solid var(--status-red)', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative' }}>
            <AlertTriangle style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--status-red)', opacity: 0.3 }} size={24} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '8px' }}>{stats.failedPayments}</div>
            <div style={{ fontSize: '13px', color: 'var(--admin-muted)', fontWeight: 500 }}>Failed Invoices</div>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--admin-border)' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'PENDING', 'COMPLETED', 'SUCCESS', 'FAILED'].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                style={{ 
                  padding: '8px 16px', height: '38px', fontSize: '12px', fontWeight: 600, borderRadius: '8px',
                  border: '1px solid var(--admin-border)',
                  background: statusFilter === f ? 'var(--admin-sidebar)' : '#FFF',
                  color: statusFilter === f ? '#FFF' : 'var(--admin-muted)',
                  cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-base)'
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F8FAFC', color: 'var(--admin-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <tr>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}># Reference</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Payer ID</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Appointment</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Method</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Processed Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.paymentId} style={{ borderBottom: '1px solid var(--admin-border)', height: '48px', background: '#FFF' }}>
                  <td style={{ padding: '12px 24px' }}><code style={{ color: 'var(--admin-accent-2)', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>{p.paymentId}</code></td>
                  <td style={{ padding: '12px 24px', fontSize: '14px', color: 'var(--admin-text)' }}>User-{p.userId}</td>
                  <td style={{ padding: '12px 24px', fontSize: '14px', color: 'var(--admin-text)' }}>Apt-{p.appointmentId}</td>
                  <td style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 700, color: 'var(--admin-text)' }}>LKR {Number(p.amount || 0).toLocaleString()}</td>
                  <td style={{ padding: '12px 24px' }}><span style={{ fontSize: '11px', fontWeight: 700, background: '#F8FAFC', color: 'var(--admin-muted)', padding: '4px 8px', borderRadius: '4px' }}>{p.paymentMethod || 'CARD'}</span></td>
                  <td style={{ padding: '12px 24px' }}><span className={`status-badge ${p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'success' ? 'success' : p.status?.toLowerCase() === 'failed' ? 'failed' : 'pending'}`}>{p.status}</span></td>
                  <td style={{ padding: '12px 24px', fontSize: '13px', color: 'var(--admin-muted)' }}>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;

