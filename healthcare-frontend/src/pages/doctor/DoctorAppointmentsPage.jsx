import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Calendar, Video, CheckCircle, XCircle } from "lucide-react";
import ConfirmDialog from "../../components/ConfirmDialog";
import toast from "react-hot-toast";
import { connectWebSocket, disconnectWebSocket } from "../../services/WebSocketService";
import "../../components/DashboardShared.css";

export default function DoctorAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("CONFIRMED"); // CONFIRMED, ACCEPTED, COMPLETED, ALL
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, action: null, apptId: null });

  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);
  useEffect(() => {
    const fetchAppointments = async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        let doctorId = user.id;
        try {
          const dRes = await api.get(`/doctors/email/${encodeURIComponent(user.email)}`);
          if (dRes.data && dRes.data.id) doctorId = dRes.data.id;
        } catch (e) {
          // fallback to user.id
        }
        const res = await api.get(`/appointments/doctor/${doctorId}`);
        // Only show ACCEPTED/CONFIRMED/COMPLETED/CANCELLED (Exclude PENDING - those are in Requests tab)
        const filtered = res.data.filter(a => a.status !== 'PENDING' && a.status !== 'PENDING_PAYMENT');
        filtered.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
        setAppointments(filtered);
      } catch (err) {
        console.error(err);
        setError("Failed to load appointments.");
      } finally {
        if (showLoading) setLoading(false);
      }
    };
    
    fetchAppointments(true);

    // Polling for real-time updates every 10 seconds (fallback)
    const intervalId = setInterval(() => {
      fetchAppointments(false);
    }, 10000);

    // Connect WebSocket
    connectWebSocket(user.id, (message) => {
      fetchAppointments(false);
    });

    return () => {
      clearInterval(intervalId);
      disconnectWebSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.email]);

  const handleActionClick = (apptId, action) => {
    setConfirmConfig({ isOpen: true, action, apptId });
  };

  const executeAction = async () => {
    const { apptId, action } = confirmConfig;
    if (!apptId) return;
    
    setConfirmConfig({ isOpen: false, action: null, apptId: null });
    
    try {
      const newStatus = action === 'COMPLETED' ? 'COMPLETED' : 'CANCELLED';
      await api.put(`/appointments/${apptId}/status`, { status: newStatus });
      setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: newStatus } : a));
    } catch (err) {
      alert(`Failed to ${action.toLowerCase()} appointment.`);
    }
  };

  const getFilteredAppointments = () => {
    if (filter === "ALL") return appointments;
    return appointments.filter(a => a.status === filter);
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'ACCEPTED': case 'CONFIRMED': return 'badge-success';
      case 'COMPLETED': return 'badge-info';
      case 'CANCELLED': case 'REJECTED': return 'badge-danger';
      default: return 'badge-pending';
    }
  };

  const displayAppts = getFilteredAppointments();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Schedule</h1>
        <p>Manage your confirmed physical and video consultations.</p>
      </div>

      <div className="dash-card">
        <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", overflowX: 'auto' }}>
          {["CONFIRMED", "ACCEPTED", "COMPLETED", "CANCELLED", "ALL"].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: "transparent", border: "none", cursor: "pointer", 
                padding: "8px 16px", borderRadius: "var(--radius-md)",
                backgroundColor: filter === f ? "var(--primary)" : "transparent",
                color: filter === f ? "#fff" : "var(--text-muted)",
                fontWeight: filter === f ? "600" : "500"
              }}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="skeleton" style={{ height: "300px", marginTop: "24px" }}></div>
        ) : error ? (
          <div style={{ color: "var(--danger)", padding: "24px 0" }}>{error}</div>
        ) : displayAppts.length === 0 ? (
          <div className="empty-state">
             <Calendar size={32} />
             <p>No appointments match the selected filter.</p>
          </div>
        ) : (
          <div className="table-container" style={{ marginTop: "16px" }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayAppts.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{new Date(a.appointmentDate).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.appointmentTime}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{a.patientName || `Patient ${a.patientId}`}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.appointmentType || 'PHYSICAL'}</span>
                    </td>
                    <td>
                      <span className={`badge ${getBadgeClass(a.status)}`}>{a.status}</span>
                    </td>
                    <td style={{ maxWidth: "200px" }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.notes || '-'}
                      </p>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {a.status === 'CONFIRMED' && (a.appointmentType === 'VIDEO' || a.appointmentType === 'VIDEO_CONSULTATION') && (
                          <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => navigate(`/doctor/dashboard/consult/${a.id}`)}>
                            <Video size={14} /> Join
                          </button>
                        )}
                        {(a.status === 'ACCEPTED' || a.status === 'CONFIRMED') && (
                          <button className="btn btn-success" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => handleActionClick(a.id, 'COMPLETED')}>
                            <CheckCircle size={14} /> Complete
                          </button>
                        )}
                        {(a.status === 'ACCEPTED' || a.status === 'CONFIRMED') && (
                          <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleActionClick(a.id, 'CANCEL')}>
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
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
        title={confirmConfig.action === 'COMPLETED' ? 'Mark Completed' : 'Cancel Appointment'}
        message={confirmConfig.action === 'COMPLETED' ? "Are you sure you want to mark this appointment as completed?" : "Are you sure you want to cancel this confirmed appointment?"}
        confirmLabel={confirmConfig.action === 'COMPLETED' ? 'Mark Complete' : 'Cancel Appointment'}
        tone={confirmConfig.action === 'COMPLETED' ? 'success' : 'danger'}
        onConfirm={executeAction}
        onCancel={() => setConfirmConfig({ isOpen: false, action: null, apptId: null })}
      />
    </div>
  );
}
