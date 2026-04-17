import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, CheckCircle, XCircle, UserCheck, ShieldCheck, Mail, Phone, Calendar, Hospital, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';

import '../pages/PatientDashboard.css';

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/admin/users');
        setDoctors(res.data.filter(u => u.role === 'DOCTOR'));
      } catch (err) {
        toast.error('Failed to fetch doctor registration data');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleApprove = async () => {
    if (!selectedDoc) return;
    setIsProcessing(true);
    try {
      await api.put(`/admin/users/${selectedDoc.id}/approve`);
      try {
        const docRes = await api.get(`/doctors/email/${selectedDoc.email}`);
        if (docRes.data && docRes.data.id) {
          await api.put(`/admin/doctors/${docRes.data.id}/verify`);
        }
      } catch (err) {
        console.warn('Medical profile service unavailable, only identity approved');
      }

      setDoctors(doctors.map(d => d.id === selectedDoc.id ? { ...d, approved: true } : d));
      setShowDetails(false);
      toast.success(`Dr. ${selectedDoc.name} has been verified successfully`);
    } catch (err) {
      toast.error('Verification failed. Please check network connectivity.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id, email) => {
    if (!window.confirm('Reset verification status? The doctor will lose medical privileges.')) return;
    try {
      await api.put(`/admin/users/${id}/reject`);
      try {
        const docRes = await api.get(`/doctors/email/${email}`);
        if (docRes.data && docRes.data.id) {
          await api.put(`/admin/doctors/${docRes.data.id}/reject`);
        }
      } catch (err) {}
      setDoctors(doctors.map(d => d.id === id ? { ...d, approved: false } : d));
      toast.success('Verification status reset');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filtered = doctors.filter(d =>
    (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.specialization || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.hospitalAttached || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ padding: '32px', background: 'var(--admin-bg)', minHeight: '100vh' }}>
      <div className="skeleton" style={{ height: 200, borderRadius: '12px' }}></div>
    </div>
  );

  return (
    <div style={{ padding: '32px', background: 'var(--admin-bg)', minHeight: '100vh', fontFamily: 'var(--font-base)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>
          Practitioner Verification
        </h1>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} size={16} />
          <input
            type="text"
            className="admin-input"
            style={{ paddingLeft: '40px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SLMC..."
          />
        </div>
      </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {filtered.map(doc => (
            <div key={doc.id} style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="apt-avatar" style={{ width: 50, height: 50, background: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: '16px' }}>
                  {doc.name?.substring(0,2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', color: 'var(--admin-text)', fontSize: '16px', fontFamily: 'var(--font-display)' }}>Dr. {doc.name}</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--admin-muted)' }}>{doc.specialization || 'General'}</span>
                    <span className={`status-badge ${doc.approved ? 'approved' : 'pending'}`}>
                      {doc.approved ? 'Verified' : 'Pending Review'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', background: '#F8FAFC', borderRadius: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={labelStyle}>SLMC LICENSE</span>
                  <span style={valueStyle}>{doc.slmcNumber || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={labelStyle}>HOSPITAL</span>
                  <span style={valueStyle}>{doc.hospitalAttached || 'None'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={labelStyle}>EMAIL</span>
                  <span style={valueStyle} title={doc.email}>{doc.email?.split('@')[0]}...</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={labelStyle}>MEMBER ID</span>
                  <span style={valueStyle}>#{doc.id}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 'auto' }}>
                {!doc.approved ? (
                  <button className="admin-btn-primary" onClick={() => { setSelectedDoc(doc); setShowDetails(true); }}>
                    <ShieldCheck size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> Review & Approve
                  </button>
                ) : (
                  <button className="admin-btn-danger" onClick={() => handleReject(doc.id, doc.email)}>
                    Reset Credentials
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      {/* Verification Modal */}
      {showDetails && selectedDoc && (
        <div className="admin-modal-backdrop" onClick={() => setShowDetails(false)}>
          <div className="admin-modal large" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Doctor Credential Review</h3>
              <button className="admin-modal-close" onClick={() => setShowDetails(false)}><XCircle size={20}/></button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', padding: '20px', background: '#F8FAFC', borderRadius: '12px' }}>
               <div className="apt-avatar" style={{ width: 64, height: 64, fontSize: '24px', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}>{selectedDoc.name.charAt(0)}</div>
               <div>
                 <h3 style={{ margin: '0 0 4px 0', color: 'var(--admin-text)', fontFamily: 'var(--font-display)', fontSize: '18px' }}>Dr. {selectedDoc.name}</h3>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--admin-muted)', fontSize: '14px' }}>
                   <Stethoscope size={14} /> {selectedDoc.specialization}
                 </div>
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {[
                { icon: ShieldCheck, label: 'SLMC Registration', value: selectedDoc.slmcNumber },
                { icon: Hospital, label: 'Current Practice', value: selectedDoc.hospitalAttached },
                { icon: Mail, label: 'Contact Email', value: selectedDoc.email },
                { icon: Phone, label: 'Mobile Number', value: selectedDoc.mobileNumber },
                { icon: Calendar, label: 'Date of Birth', value: selectedDoc.dob || 'N/A' },
                { icon: UserCheck, label: 'NIC / ID', value: selectedDoc.nic }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ color: 'var(--admin-accent)', background: '#E1F5EE', padding: '8px', borderRadius: '8px', height: 'fit-content' }}>
                    <item.icon size={18} color="#0F6E56" />
                  </div>
                  <div>
                    <div style={labelStyle}>{item.label}</div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--admin-text)' }}>{item.value || 'Not provided'}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '32px', padding: '16px', background: '#FAEEDA', color: '#633806', borderRadius: '8px', fontSize: '13px', display: 'flex', gap: '12px' }}>
              <ShieldCheck size={20} style={{ flexShrink: 0 }} />
              <p style={{ margin: 0 }}><strong>Verification Disclaimer:</strong> Confirming this verification will enable this user to issue prescriptions, view patient records, and conduct video consultations.</p>
            </div>
            
            <div className="admin-modal-footer">
              <button className="admin-btn-cancel" onClick={() => setShowDetails(false)}>Cancel</button>
              <button className="admin-btn-primary" disabled={isProcessing} onClick={handleApprove}>
                {isProcessing ? 'Verifying...' : 'Confirm Verification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const labelStyle = { fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const valueStyle = { fontSize: '14px', fontWeight: 600, color: 'var(--admin-text)' };

export default DoctorManagement;
