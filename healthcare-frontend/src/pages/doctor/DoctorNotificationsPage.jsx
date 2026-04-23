import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Bell, Check, Trash2, ClipboardCheck } from "lucide-react";
import "../../components/DashboardShared.css";

export default function DoctorNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/notifications/user/${user.id}`);
      const notifs = res.data || [];
      setNotifications(notifs);
    } catch (err) {
      console.error(err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, [user.id]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put(`/notifications/user/${user.id}/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Platform Alerts</h1>
          <p>Important updates regarding your appointments and patients.</p>
        </div>
        {notifications.some(n => n.status === 'UNREAD') && (
          <button className="btn btn-outline" onClick={handleMarkAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="dash-card">
        {loading ? (
          <div className="skeleton" style={{ height: "300px" }}></div>
        ) : error ? (
          <div style={{ color: "var(--danger)", padding: "24px 0" }}>{error}</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={40} />
            <p style={{ marginTop: "12px" }}>You're all caught up!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {notifications.map((notif) => {
              const isUnread = notif.status === 'UNREAD';
              return (
                <div key={notif.id} style={{ 
                  borderLeft: isUnread ? "4px solid var(--warning)" : "4px solid transparent",
                  backgroundColor: isUnread ? "#FFFBEB" : "transparent",
                  borderTop: "1px solid var(--border)",
                  borderRight: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)",
                  borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                  padding: "16px",
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start" 
                }}>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ color: isUnread ? "var(--warning)" : "var(--text-muted)", marginTop: "2px" }}>
                      {notif.type === 'APPOINTMENT' ? <ClipboardCheck size={18} /> : <Bell size={18} />}
                    </div>
                    <div>
                      <p style={{ margin: "0 0 6px", fontSize: "0.95rem", color: "var(--text-main)", fontWeight: isUnread ? "600" : "400" }}>{notif.message}</p>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {notif.createdAt ? new Date(notif.createdAt.endsWith('Z') ? notif.createdAt : notif.createdAt + 'Z').toLocaleString() : 'Just now'}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: "8px" }}>
                    {isUnread && (
                      <button className="btn btn-outline" style={{ padding: "6px", border: "none" }} title="Mark as read" onClick={() => handleMarkAsRead(notif.id)}>
                        <Check size={16} />
                      </button>
                    )}
                    <button className="btn btn-outline" style={{ padding: "6px", border: "none", color: "var(--danger)" }} title="Delete" onClick={() => handleDelete(notif.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
