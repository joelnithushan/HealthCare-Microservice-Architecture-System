import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Calendar, Video, CheckCircle, XCircle } from "lucide-react";
import "../../components/DashboardShared.css";

export default function DoctorAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ACCEPTED"); // ACCEPTED (Confirmed), COMPLETED, ALL

  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get(`/appointments/doctor/${user.id}`);
        // Only show ACCEPTED, COMPLETED OR CANCELLED (Exclude PENDING as they go to Requests tab)
        const filtered = res.data.filter(a => a.status !== 'PENDING');
        filtered.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
        setAppointments(filtered);
      } catch (err) {
        console.error(err);
        setError("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user.id]);

  const handleMarkCompleted = async (apptId) => {
    if (!window.confirm("Mark this appointment as COMPLETED?")) return;
    try {
      await api.put(`/appointments/${apptId}/status`, { status: "COMPLETED" });
      setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: "COMPLETED" } : a));
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleCancelClick = async (apptId) => {
    if (!window.confirm("Cancel this confirmed appointment?")) return;
    try {
      await api.put(`/appointments/${apptId}/status`, { status: "CANCELLED" });
      setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: "CANCELLED" } : a));
    } catch (err) {
      alert("Failed to cancel appointment.");
    }
  };

  const getFilteredAppointments = () => {
    if (filter === "ALL") return appointments;
    return appointments.filter(a => a.status === filter);
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'badge-success';
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
          {["ACCEPTED", "COMPLETED", "ALL"].map(f => (
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
              {f === 'ACCEPTED' ? 'Confirmed' : f.charAt(0) + f.slice(1).toLowerCase()}
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
                  <th>Patient ID</th>
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
                      <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>Patient {a.patientId}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.appointmentType || 'PHYSICAL'}</span>
                    </td>
                    <td>
                      <span className={`badge ${getBadgeClass(a.status)}`}>{a.status === 'ACCEPTED' ? 'CONFIRMED' : a.status}</span>
                    </td>
                    <td style={{ maxWidth: "200px" }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.notes || '-'}
                      </p>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {a.status === 'ACCEPTED' && a.appointmentType === 'VIDEO' && (
                          <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => navigate(`/doctor/dashboard/consult/${a.id}`)}>
                            <Video size={14} /> Join
                          </button>
                        )}
                        {a.status === 'ACCEPTED' && (
                          <button className="btn btn-success" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => handleMarkCompleted(a.id)}>
                            <CheckCircle size={14} /> Complete
                          </button>
                        )}
                        {a.status === 'ACCEPTED' && (
                          <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleCancelClick(a.id)}>
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
    </div>
  );
}
