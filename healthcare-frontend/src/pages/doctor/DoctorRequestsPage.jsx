import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { ClipboardCheck, Check, X } from "lucide-react";
import ConfirmDialog from "../../components/ConfirmDialog";
import "../../components/DashboardShared.css";

export default function DoctorRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, action: null, apptId: null, patientId: null });

  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  const fetchRequests = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      let doctorId = user.id;
      try {
        const dRes = await api.get(`/doctors/email/${encodeURIComponent(user.email)}`);
        if (dRes.data && dRes.data.id) doctorId = dRes.data.id;
      } catch (e) { /* fallback */ }
      const res = await api.get(`/appointments/doctor/${doctorId}`);
      const pending = res.data.filter(a => a.status === 'PENDING');
      pending.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
      setRequests(pending);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load appointment requests.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    
    // Initial fetch with loading state
    fetchRequests(true);

    // Polling for real-time updates every 10 seconds
    const intervalId = setInterval(() => {
      fetchRequests(false);
    }, 10000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.email]);

  const handleActionClick = (apptId, action, patientId) => {
    setConfirmConfig({ isOpen: true, action, apptId, patientId });
  };

  const executeAction = async () => {
    const { apptId, action } = confirmConfig;
    if (!apptId) return;
    const newStatus = action === 'ACCEPT' ? 'CONFIRMED' : 'REJECTED';
    
    setConfirmConfig({ isOpen: false, action: null, apptId: null, patientId: null });

    try {
      await api.put(`/appointments/${apptId}/status`, { status: newStatus });
      setRequests(prev => prev.filter(r => r.id !== apptId));
    } catch (err) {
      alert(`Failed to ${action.toLowerCase()} request.`);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Pending Requests</h1>
        <p>Review and accept or reject new appointment bookings.</p>
      </div>

      <div className="dash-card">
        {loading ? (
           <div className="skeleton" style={{ height: "300px" }}></div>
        ) : error ? (
           <div style={{ color: "var(--danger)", padding: "24px 0" }}>{error}</div>
        ) : requests.length === 0 ? (
           <div className="empty-state">
             <ClipboardCheck size={40} />
             <p style={{ marginTop: "12px" }}>Great! You're caught up. No pending requests.</p>
           </div>
        ) : (
          <div className="table-container">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Requested Date & Time</th>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{new Date(req.appointmentDate).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.appointmentTime}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{req.patientName || `Patient ${req.patientId}`}</div>
                    </td>
                    <td>
                      <span className="badge badge-pending">{req.appointmentType || 'PHYSICAL'}</span>
                    </td>
                    <td style={{ maxWidth: '250px' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {req.notes || '-'}
                      </p>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyItems: 'flex-end', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" style={{ padding: '6px 12px' }} onClick={() => handleActionClick(req.id, 'ACCEPT', req.patientId)}>
                           <Check size={16} /> Accept
                        </button>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleActionClick(req.id, 'REJECT', req.patientId)}>
                           <X size={16} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.action === 'ACCEPT' ? 'Accept Appointment' : 'Reject Appointment'}
        message={`Are you sure you want to ${confirmConfig.action?.toLowerCase()} this request?`}
        confirmLabel={confirmConfig.action === 'ACCEPT' ? 'Accept Request' : 'Reject Request'}
        tone={confirmConfig.action === 'ACCEPT' ? 'success' : 'danger'}
        onConfirm={executeAction}
        onCancel={() => setConfirmConfig({ isOpen: false, action: null, apptId: null, patientId: null })}
      />
    </div>
  );
}
