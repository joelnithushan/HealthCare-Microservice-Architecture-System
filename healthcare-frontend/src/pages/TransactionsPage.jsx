import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { CreditCard, TrendingUp, Clock, AlertTriangle, Download, BarChart3, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import '../pages/PatientDashboard.css';

const TransactionsPage = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [revPeriod, setRevPeriod] = useState('MONTH');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentsRes, statsRes, usersRes] = await Promise.allSettled([
          api.get('/admin/payments'),
          api.get('/admin/payments/stats'),
          api.get('/admin/users'),
        ]);
        setPayments(paymentsRes.status === 'fulfilled' ? paymentsRes.value.data : []);
        setStats(statsRes.status === 'fulfilled' ? statsRes.value.data : null);
        setAllUsers(usersRes.status === 'fulfilled' ? usersRes.value.data : []);
      } catch (err) {
        console.error('Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = statusFilter === 'ALL' ? payments : payments.filter(p => p.status === statusFilter);

  // Revenue by period
  const revenueByPeriod = useMemo(() => {
    const now = new Date();
    const successPayments = payments.filter(p => p.status === 'SUCCESS' || p.status === 'COMPLETED');
    
    if (revPeriod === 'DAY') {
      const todayStr = now.toISOString().slice(0, 10);
      return successPayments
        .filter(p => p.paymentDate && p.paymentDate.startsWith(todayStr))
        .reduce((s, p) => s + Number(p.amount || 0), 0);
    }
    if (revPeriod === 'WEEK') {
      const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
      return successPayments
        .filter(p => p.paymentDate && new Date(p.paymentDate) >= weekAgo)
        .reduce((s, p) => s + Number(p.amount || 0), 0);
    }
    // MONTH
    return successPayments
      .filter(p => {
        if (!p.paymentDate) return false;
        const d = new Date(p.paymentDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, p) => s + Number(p.amount || 0), 0);
  }, [payments, revPeriod]);

  // Revenue per doctor
  const revenuePerDoctor = useMemo(() => {
    const successPayments = payments.filter(p => p.status === 'SUCCESS' || p.status === 'COMPLETED');
    const byDoctor = {};
    // We need appointment data to map payments to doctors. Since payments have appointmentId,
    // and we don't have a direct doctorId on payment, we'll group by appointmentId patterns.
    // Actually, payments don't have doctorId directly. Let's use userId (payer = patient).
    // For a simpler approach, let's show revenue per user/payer for now and label it.
    // Better: group by appointmentId and match if possible.
    successPayments.forEach(p => {
      const key = p.userId || 'unknown';
      if (!byDoctor[key]) byDoctor[key] = { total: 0, count: 0 };
      byDoctor[key].total += Number(p.amount || 0);
      byDoctor[key].count += 1;
    });

    return Object.entries(byDoctor)
      .map(([userId, data]) => {
        const user = allUsers.find(u => String(u.id) === String(userId));
        return { userId, name: user?.name || `User #${userId}`, ...data };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [payments, allUsers]);

  // Success/failure rate
  const rateStats = useMemo(() => {
    const total = payments.length || 1;
    const success = payments.filter(p => p.status === 'SUCCESS' || p.status === 'COMPLETED').length;
    const failed = payments.filter(p => p.status === 'FAILED').length;
    const pending = payments.filter(p => p.status === 'PENDING').length;
    return {
      success, failed, pending, total: payments.length,
      successPct: Math.round((success / total) * 100),
      failedPct: Math.round((failed / total) * 100),
      pendingPct: Math.round((pending / total) * 100),
    };
  }, [payments]);

  // Revenue trend (last 30 days)
  const revenueTrend = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    const successPayments = payments.filter(p => p.status === 'SUCCESS' || p.status === 'COMPLETED');
    const byDay = {};
    successPayments.forEach(p => {
      if (!p.paymentDate) return;
      const dayKey = new Date(p.paymentDate).toISOString().slice(0, 10);
      byDay[dayKey] = (byDay[dayKey] || 0) + Number(p.amount || 0);
    });
    return days.map(d => ({ date: d, amount: byDay[d] || 0 }));
  }, [payments]);

  const maxRevenue = Math.max(...revenueTrend.map(d => d.amount), 1);

  const handleExportCSV = () => {
    const rows = filtered.length ? filtered : payments;
    if (!rows.length) { toast.error("No data to export."); return; }
    const headers = ["Payment ID","User ID","Appointment ID","Amount","Method","Status","Date"];
    const lines = rows.map(p => [
      p.paymentId, p.userId, p.appointmentId,
      p.amount || 0, p.paymentMethod || 'CARD', p.status || '',
      p.paymentDate ? new Date(p.paymentDate).toLocaleString() : 'N/A'
    ].map(v => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
    }).join(','));
    const blob = new Blob([[headers.join(','), ...lines].join('\n')], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} records.`);
  };

  if (loading) return (
    <div style={{ padding: '32px', background: 'var(--admin-bg)', minHeight: '100vh' }}>
      <div className="skeleton" style={{ height: 100, borderRadius: '12px' }}></div>
    </div>
  );

  return (
    <div style={{ padding: '32px', background: 'var(--admin-bg)', minHeight: '100vh', fontFamily: 'var(--font-base)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>
          Financial Reports & Transactions
        </h1>
        <button className="admin-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleExportCSV}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Quick Stats Row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <QuickStat icon={TrendingUp} label="Total Volume" value={stats.totalPayments} borderColor="var(--admin-accent)" />
          <QuickStat icon={CreditCard} label="Total Revenue" value={`LKR ${Number(stats.totalRevenue || 0).toLocaleString()}`} borderColor="var(--status-green)" />
          <QuickStat icon={Clock} label="Pending" value={stats.pendingPayments} borderColor="var(--status-amber)" />
          <QuickStat icon={AlertTriangle} label="Failed" value={stats.failedPayments} borderColor="var(--status-red)" />
        </div>
      )}

      {/* Financial Reports Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Revenue by Period */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={panelTitleStyle}>Revenue by Period</h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['DAY', 'WEEK', 'MONTH'].map(p => (
                <button key={p} onClick={() => setRevPeriod(p)} style={{
                  padding: '5px 14px', fontSize: '11px', fontWeight: 700, borderRadius: '6px',
                  border: '1px solid var(--admin-border)',
                  background: revPeriod === p ? '#dff6ec' : '#FFF',
                  color: revPeriod === p ? '#0f6e56' : 'var(--admin-muted)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>{p === 'DAY' ? 'Today' : p === 'WEEK' ? '7 Days' : '30 Days'}</button>
              ))}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 700, color: 'var(--admin-text)' }}>
            LKR {revenueByPeriod.toLocaleString()}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--admin-muted)', marginTop: '8px' }}>
            {revPeriod === 'DAY' ? "Today's revenue" : revPeriod === 'WEEK' ? 'Last 7 days' : 'Current month'}
          </div>
        </div>

        {/* Success/Failure Rate */}
        <div style={panelStyle}>
          <h2 style={{ ...panelTitleStyle, marginBottom: '16px' }}>Payment Success Rate</h2>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              {/* Stacked bar */}
              <div style={{ display: 'flex', height: '20px', borderRadius: '10px', overflow: 'hidden', background: '#F1F5F9' }}>
                {rateStats.successPct > 0 && <div style={{ width: `${rateStats.successPct}%`, background: 'var(--status-green)', transition: 'width 0.5s' }} />}
                {rateStats.pendingPct > 0 && <div style={{ width: `${rateStats.pendingPct}%`, background: 'var(--status-amber)', transition: 'width 0.5s' }} />}
                {rateStats.failedPct > 0 && <div style={{ width: `${rateStats.failedPct}%`, background: 'var(--status-red)', transition: 'width 0.5s' }} />}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <RateLegend color="var(--status-green)" label="Success" count={rateStats.success} pct={rateStats.successPct} />
            <RateLegend color="var(--status-amber)" label="Pending" count={rateStats.pending} pct={rateStats.pendingPct} />
            <RateLegend color="var(--status-red)" label="Failed" count={rateStats.failed} pct={rateStats.failedPct} />
          </div>
          <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--admin-muted)' }}>
            Total: {rateStats.total} payments processed
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div style={{ ...panelStyle, marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <BarChart3 size={18} color="var(--admin-accent)" />
          <h2 style={{ ...panelTitleStyle, margin: 0 }}>Revenue Trend (Last 30 Days)</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '160px', padding: '0 4px' }}>
          {revenueTrend.map((day, i) => {
            const h = maxRevenue > 0 ? (day.amount / maxRevenue) * 140 : 0;
            return (
              <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }} title={`${day.date}: LKR ${day.amount.toLocaleString()}`}>
                <div style={{
                  width: '100%', maxWidth: '24px', height: `${Math.max(h, 2)}px`,
                  background: day.amount > 0 ? 'linear-gradient(180deg, var(--admin-accent), #157959)' : '#E2E8F0',
                  borderRadius: '3px 3px 0 0', transition: 'height 0.3s',
                }} />
                {i % 5 === 0 && (
                  <span style={{ fontSize: '9px', color: 'var(--admin-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--admin-muted)' }}>
          <span>LKR 0</span>
          <span>LKR {maxRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Revenue per Payer */}
      {revenuePerDoctor.length > 0 && (
        <div style={{ ...panelStyle, marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Users size={18} color="var(--admin-accent-2)" />
            <h2 style={{ ...panelTitleStyle, margin: 0 }}>Revenue by Patient</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {revenuePerDoctor.map((item, idx) => {
              const pct = stats?.totalRevenue > 0 ? Math.round((item.total / Number(stats.totalRevenue)) * 100) : 0;
              return (
                <div key={item.userId} style={{ padding: '14px 16px', borderRadius: '10px', background: '#F8FBFD', border: '1px solid #E7EEF6', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(29,158,117,0.16), rgba(24,95,165,0.12))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', color: 'var(--admin-text)', flexShrink: 0 }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>{item.count} payments • {pct}% of total</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--admin-text)', whiteSpace: 'nowrap' }}>
                    LKR {item.total.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction Table */}
      <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={panelTitleStyle}>All Transactions</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'PENDING', 'COMPLETED', 'SUCCESS', 'FAILED'].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                style={{
                  padding: '8px 16px', height: '38px', fontSize: '12px', fontWeight: 600, borderRadius: '8px',
                  border: '1px solid var(--admin-border)',
                  background: statusFilter === f ? '#dff6ec' : '#FFF',
                  color: statusFilter === f ? '#0f6e56' : 'var(--admin-muted)',
                  cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-base)'
                }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F8FAFC', color: 'var(--admin-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <tr>
                <th style={thS}>Reference</th>
                <th style={thS}>Payer</th>
                <th style={thS}>Appointment</th>
                <th style={thS}>Amount</th>
                <th style={thS}>Method</th>
                <th style={thS}>Status</th>
                <th style={thS}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.paymentId} style={{ borderBottom: '1px solid var(--admin-border)', height: '48px', background: '#FFF' }}>
                  <td style={tdS}><code style={{ color: 'var(--admin-accent-2)', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>{p.paymentId}</code></td>
                  <td style={{ ...tdS, fontSize: '14px', color: 'var(--admin-text)' }}>{(() => { const u = allUsers.find(u => String(u.id) === String(p.userId)); return u?.name || `User #${p.userId}`; })()}</td>
                  <td style={{ ...tdS, fontSize: '14px', color: 'var(--admin-text)' }}>Apt-{p.appointmentId}</td>
                  <td style={{ ...tdS, fontSize: '14px', fontWeight: 700, color: 'var(--admin-text)' }}>LKR {Number(p.amount || 0).toLocaleString()}</td>
                  <td style={tdS}><span style={{ fontSize: '11px', fontWeight: 700, background: '#F8FAFC', color: 'var(--admin-muted)', padding: '4px 8px', borderRadius: '4px' }}>{p.paymentMethod || 'CARD'}</span></td>
                  <td style={tdS}><span className={`status-badge ${p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'success' ? 'success' : p.status?.toLowerCase() === 'failed' ? 'failed' : 'pending'}`}>{p.status}</span></td>
                  <td style={{ ...tdS, fontSize: '13px', color: 'var(--admin-muted)' }}>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-muted)' }}>No transactions match the filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const QuickStat = ({ icon: Icon, label, value, borderColor }) => (
  <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderLeft: `4px solid ${borderColor}`, borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative' }}>
    <Icon style={{ position: 'absolute', top: '20px', right: '20px', color: borderColor, opacity: 0.3 }} size={24} />
    <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '8px' }}>{value}</div>
    <div style={{ fontSize: '13px', color: 'var(--admin-muted)', fontWeight: 500 }}>{label}</div>
  </div>
);

const RateLegend = ({ color, label, count, pct }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color }} />
    <span style={{ fontSize: '13px', color: 'var(--admin-text)', fontWeight: 500 }}>{label}: {count} ({pct}%)</span>
  </div>
);

const panelStyle = { background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };
const panelTitleStyle = { fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--admin-text)', margin: 0 };
const thS = { padding: '16px 24px', fontWeight: 600 };
const tdS = { padding: '12px 24px' };

export default TransactionsPage;
