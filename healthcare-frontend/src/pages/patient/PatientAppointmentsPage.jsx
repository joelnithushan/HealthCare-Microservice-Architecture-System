import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Calendar, Video, CreditCard, XCircle } from "lucide-react";
import ConfirmDialog from "../../components/ConfirmDialog";
import toast from "react-hot-toast";
import { connectWebSocket, disconnectWebSocket } from "../../services/WebSocketService";
import "../../components/DashboardShared.css";

export default function PatientAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("UPCOMING"); // UPCOMING, PENDING, ACCEPTED, CANCELLED, COMPLETED, ALL
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, apptId: null });
  const [rescheduleConfig, setRescheduleConfig] = useState({ isOpen: false, apptId: null, doctorId: null, date: "", timeSlot: "" });
  const [rescheduling, setRescheduling] = useState(false);
  
  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  const fetchAppointments = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [apptsRes, paysRes] = await Promise.allSettled([
        api.get(`/appointments/user/${user.id}`),
        api.get(`/payments/user/${user.id}`)
      ]);

      let fetchedAppts = apptsRes.status === 'fulfilled' ? apptsRes.value.data : [];
      let fetchedPays = paysRes.status === 'fulfilled' ? paysRes.value.data : [];
      
      fetchedAppts.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)); // newest first
      setAppointments(fetchedAppts);
      setPayments(fetchedPays);
      setError(null); // Clear error on success
    } catch (err) {
      console.error(err);
      setError("Failed to load your appointments.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    
    // Initial fetch with loading state
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
  }, [user.id]);

  const handleCancelClick = (apptId) => {
    setConfirmConfig({ isOpen: true, apptId });
  };

  const executeCancel = async () => {
    const { apptId } = confirmConfig;
    if (!apptId) return;
    setConfirmConfig({ isOpen: false, apptId: null });
    try {
      await api.put(`/appointments/${apptId}/status`, { status: 'CANCELLED' });
      setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: 'CANCELLED' } : a));
    } catch (err) {
      alert("Failed to cancel the appointment.");
    }
  };

  const handleRescheduleClick = (appt) => {
    setRescheduleConfig({
      isOpen: true,
      apptId: appt.id,
      doctorId: appt.doctorId,
      date: appt.appointmentDate,
      timeSlot: appt.appointmentTime
    });
  };

  const executeReschedule = async (e) => {
    e.preventDefault();
    const { apptId, doctorId, date, timeSlot } = rescheduleConfig;
    if (!apptId || !date || !timeSlot) return;

    setRescheduling(true);
    try {
      // Check availability first
      const availRes = await api.get(`/appointments/check-availability?doctorId=${doctorId}&date=${date}&timeSlot=${timeSlot}`);
      if (!availRes.data.available) {
        toast.error("Selected time slot is not available");
        setRescheduling(false);
        return;
      }

      await api.put(`/appointments/${apptId}/reschedule`, {
        newDate: date,
        newTimeSlot: timeSlot
      });
      
      toast.success("Appointment rescheduled successfully");
      setRescheduleConfig({ isOpen: false, apptId: null, doctorId: null, date: "", timeSlot: "" });
      fetchAppointments(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reschedule the appointment");
    } finally {
      setRescheduling(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const getFilteredAppointments = () => {
    if (filter === "ALL") return appointments;
    if (filter === "UPCOMING") return appointments.filter(a => a.appointmentDate >= today && (a.status === 'PENDING_PAYMENT' || a.status === 'PENDING' || a.status === 'CONFIRMED'));
    if (filter === "COMPLETED") return appointments.filter(a => a.status === 'COMPLETED');
    return appointments.filter(a => a.status === filter);
  };

  const getPaymentStatus = (apptId) => {
    const pay = payments.find(p => p.appointmentId === apptId);
    if (!pay) return "NO_RECORD";
    return pay.status; // PENDING, SUCCESS, FAILED
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'badge-success';
      case 'COMPLETED': return 'badge-info';
      case 'CANCELLED': case 'REJECTED': return 'badge-danger';
      case 'PENDING': case 'PENDING_PAYMENT': default: return 'badge-pending';
    }
  };

  const filteredAppts = getFilteredAppointments();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Appointments</h1>
        <p>Manage your medical bookings and upcoming consultations.</p>
      </div>

      <div className="dash-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", overflowX: 'auto' }}>
          {["UPCOMING", "PENDING_PAYMENT", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "ALL"].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: "transparent", border: "none", cursor: "pointer", 
                padding: "8px 16px", borderRadius: "var(--radius-md)",
                backgroundColor: filter === f ? "var(--primary)" : "transparent",
                color: filter === f ? "#fff" : "var(--text-muted)",
                fontWeight: filter === f ? "600" : "500",
                minWidth: 'max-content'
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
        ) : filteredAppts.length === 0 ? (
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
                  <th>Doctor</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppts.map(a => {
                  const payStatus = getPaymentStatus(a.id);
                  return (
                    <tr key={a.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{new Date(a.appointmentDate).toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.appointmentTime}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>Dr. {a.doctorName || 'Unknown'}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.appointmentType || 'PHYSICAL'}</span>
                      </td>
                      <td>
                        <span className={`badge ${getBadgeClass(a.status)}`}>{a.status}</span>
                      </td>
                      <td>
                        {payStatus === 'NO_RECORD' ? (
                           <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Unpaid</span>
                        ) : payStatus === 'SUCCESS' ? (
                           <span className="badge badge-success">Paid</span>
                        ) : payStatus === 'FAILED' ? (
                           <span className="badge badge-danger">Failed</span>
                        ) : (
                           <span className="badge badge-pending">{payStatus}</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {(payStatus === 'NO_RECORD' || payStatus === 'PENDING' || payStatus === 'FAILED') && a.status === 'PENDING_PAYMENT' && (
                            <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => navigate(`/patient/dashboard/pay/${a.id}`)}>
                              <CreditCard size={14} /> Pay
                            </button>
                          )}
                          {a.status === 'CONFIRMED' && (a.appointmentType === 'VIDEO' || a.appointmentType === 'VIDEO_CONSULTATION') && (
                            <button className="btn btn-success" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => navigate(`/patient/dashboard/consult/${a.id}`)}>
                              <Video size={14} /> Join
                            </button>
                          )}
                          {(a.status === 'PENDING_PAYMENT' || a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                            <>
                              <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={() => handleRescheduleClick(a)}>
                                <Calendar size={14} /> Reschedule
                              </button>
                              <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleCancelClick(a.id)}>
                                <XCircle size={14} /> Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment?"
        confirmLabel="Yes, Cancel"
        tone="danger"
        onConfirm={executeCancel}
        onCancel={() => setConfirmConfig({ isOpen: false, apptId: null })}
      />

      {rescheduleConfig.isOpen && (
        <div className="modal-overlay" onClick={() => setRescheduleConfig({ ...rescheduleConfig, isOpen: false })}>
          <div className="dash-card" style={{ maxWidth: '400px', width: '100%', margin: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Reschedule Appointment</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setRescheduleConfig({ ...rescheduleConfig, isOpen: false })}>✕</button>
            </div>
            
            <form onSubmit={executeReschedule}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '500' }}>New Date</label>
                <input 
                  type="date" 
                  value={rescheduleConfig.date} 
                  min={today}
                  onChange={e => setRescheduleConfig({ ...rescheduleConfig, date: e.target.value })}
                  className="form-input"
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '500' }}>New Time</label>
                <input 
                  type="time" 
                  value={rescheduleConfig.timeSlot} 
                  onChange={e => setRescheduleConfig({ ...rescheduleConfig, timeSlot: e.target.value })}
                  className="form-input"
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                  required
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setRescheduleConfig({ ...rescheduleConfig, isOpen: false })}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={rescheduling}>
                  {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
