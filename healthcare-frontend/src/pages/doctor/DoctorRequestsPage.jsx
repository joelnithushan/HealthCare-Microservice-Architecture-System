import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { ClipboardCheck, Check, X } from "lucide-react";
import "../../components/DashboardShared.css";

export default function DoctorRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get(`/appointments/doctor/${user.id}`);
        // Filter ONLY pending
        const pending = res.data.filter(a => a.status === 'PENDING');
        pending.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
        
        setRequests(pending);
      } catch (err) {
        console.error(err);
        setError("Failed to load appointment requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user.id]);

  const handleAction = async (apptId, action, patientId) => {
    const newStatus = action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
    
    if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this request?`)) return;

    try {
      // 1. Update appointment status
      await api.put(`/appointments/${apptId}/status`, { status: newStatus });
      
      // 2. Remove from local list
      setRequests(prev => prev.filter(r => r.id !== apptId));
      
      // 3. Send Notification to Patient via API
      try {
        await api.post('/notifications', {
          userId: patientId,
          message: `Your appointment request with Dr. ${user.name} on has been ${newStatus.toLowerCase()}.`,
          type: "APPOINTMENT",
          read: false
        });
      } catch (notifErr) {
        console.warn("Could not send patient notification:", notifErr);
      }

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
                      <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>Patient {req.patientId}</div>
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
                        <button className="btn btn-primary" style={{ padding: '6px 12px' }} onClick={() => handleAction(req.id, 'ACCEPT', req.patientId)}>
                           <Check size={16} /> Accept
                        </button>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleAction(req.id, 'REJECT', req.patientId)}>
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
    </div>
  );
}
