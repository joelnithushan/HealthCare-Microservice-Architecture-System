import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Info, AlertTriangle, ShieldX, Database } from 'lucide-react';

import '../pages/PatientDashboard.css';

const generateMockLogs = () => {
  const actions = [
    { action: 'User Login', service: 'user-service', level: 'INFO', detail: 'User admin@gmail.com authenticated successfully.' },
    { action: 'Account Created', service: 'user-service', level: 'INFO', detail: 'New PATIENT account registered: nimal.p@gmail.com' },
    { action: 'Appointment Booked', service: 'appointment-service', level: 'INFO', detail: 'Appointment #142 created for patient ID 5.' },
    { action: 'Payment Processed', service: 'payment-service', level: 'INFO', detail: 'Payment of LKR 2,500 accepted for appointment #142.' },
    { action: 'Notification Sent', service: 'notification-service', level: 'INFO', detail: 'Email notification dispatched to patient ID 5.' },
    { action: 'Session Started', service: 'telemedicine-service', level: 'INFO', detail: 'Video consultation room created: room-abc123.' },
    { action: 'Password Reset', service: 'user-service', level: 'WARN', detail: 'Password reset requested for sanjeewa.f@gmail.com' },
    { action: 'Service Health Check', service: 'api-gateway', level: 'INFO', detail: 'All downstream services responding normally.' },
    { action: 'Doctor Registration', service: 'user-service', level: 'INFO', detail: 'New DOCTOR account registered: SLMC #23456' },
    { action: 'Failed Login Attempt', service: 'user-service', level: 'ERROR', detail: 'Invalid credentials for email: unknown@test.com' },
    { action: 'Token Expired', service: 'user-service', level: 'WARN', detail: 'JWT token expired for session of user ID 8.' },
    { action: 'Appointment Cancelled', service: 'appointment-service', level: 'WARN', detail: 'Appointment #98 cancelled by patient ID 3.' },
  ];

  const now = new Date();
  return actions.map((a, i) => ({
    id: i + 1,
    timestamp: new Date(now.getTime() - i * 1000 * 60 * (Math.floor(Math.random() * 30) + 1)).toISOString(),
    ...a,
  }));
};

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogs(generateMockLogs());
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const services = ['ALL', ...new Set(logs.map(l => l.service))];

  const filtered = logs.filter(l => {
    const matchLevel = levelFilter === 'ALL' || l.level === levelFilter;
    const matchService = serviceFilter === 'ALL' || l.service === serviceFilter;
    return matchLevel && matchService;
  });

  if (loading) return (
    <div style={{ padding: '32px', background: 'var(--admin-bg)', minHeight: '100vh' }}>
      <div className="skeleton" style={{ height: 400, borderRadius: '12px' }}></div>
    </div>
  );

  return (
    <div style={{ padding: '32px', background: 'var(--admin-bg)', minHeight: '100vh', fontFamily: 'var(--font-base)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>
          Security & System Events
        </h1>
        <div style={{ color: 'var(--admin-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
           <Database size={14} /> Audit Trail Live
        </div>
      </div>

      {/* Dark Terminal Card */}
      <div style={{ background: '#0B1F3A', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        {/* Terminal toolbar */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
             <span style={fLabel}>Level</span>
             {['ALL', 'INFO', 'WARN', 'ERROR'].map(l => (
              <button key={l} onClick={() => setLevelFilter(l)}
                style={{ 
                  padding: '4px 12px', fontSize: '11px', fontWeight: 700, borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: levelFilter === l ? 'var(--admin-accent)' : 'transparent',
                  color: '#fff', cursor: 'pointer', transition: 'all 0.2s'
                }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
             <span style={fLabel}>Service</span>
             <select 
                style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 12px', fontSize: '12px', borderRadius: '4px', outline: 'none' }}
                value={serviceFilter}
                onChange={e => setServiceFilter(e.target.value)}
              >
               {services.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto', padding: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={logS.th}>Timestamp</th>
                <th style={logS.th}>Level</th>
                <th style={logS.th}>Source</th>
                <th style={logS.th}>Details</th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: '"Roboto Mono", monospace' }}>
              {filtered.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={logS.td}><span style={{ color: 'rgba(255,255,255,0.3)' }}>{new Date(log.timestamp).toLocaleTimeString()}</span></td>
                  <td style={logS.td}>
                     <span style={{ 
                       color: log.level === 'ERROR' ? '#ff4d4d' : log.level === 'WARN' ? '#ffcc00' : '#00e676',
                       fontSize: '11px', fontWeight: 700 
                     }}>[{log.level}]</span>
                  </td>
                  <td style={logS.td}><span style={{ color: '#81d4fa' }}>{log.service}</span></td>
                  <td style={logS.td}><span style={{ color: 'rgba(255,255,255,0.8)' }}>{log.detail}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '16px', background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
         <Info size={18} style={{ color: 'var(--admin-muted)', flexShrink: 0 }} />
         <p style={{ margin: 0, fontSize: '13px', color: 'var(--admin-muted)' }}>This audit trail captures all microservices events. Critical security alerts are automatically forwarded to the root administrator email.</p>
      </div>
    </div>
  );
};

const fLabel = { color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' };
const logS = {
  th: { padding: '12px 16px', textAlign: 'left' },
  td: { padding: '10px 16px', fontSize: '13px' }
};

export default SystemLogs;
