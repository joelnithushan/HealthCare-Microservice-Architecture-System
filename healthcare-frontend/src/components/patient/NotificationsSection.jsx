import React, { useState, useEffect } from 'react';
import { Bell, Check, BellOff } from 'lucide-react';
import api from '../../services/api';

const NotificationsSection = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;
      try {
        const response = await api.get(`/notifications/user/${userId}`);
        setNotifications(response.data);
      } catch (err) {
        console.error('Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [userId]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, status: 'READ' } : n)
      );
    } catch {
      // silent fail
    }
  };

  if (loading) return (
    <div className="pat-panel">
      <div className="pat-panel__header">
        <h3 className="pat-panel__title">Notifications</h3>
      </div>
      <div className="pat-panel__body">
        <div className="skeleton skeleton-text" />
      </div>
    </div>
  );

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  return (
    <div className="pat-panel" id="notifications">
      <div className="pat-panel__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="pat-panel__title">
          <span className="pat-panel__title-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <Bell size={18} />
          </span>
          Notifications
        </h3>
        {unreadCount > 0 && <span className="pat-badge pat-badge--pending">{unreadCount} New</span>}
      </div>
      <div className="pat-panel__body">
        {notifications.length === 0 ? (
          <div className="pat-empty-state">
            <div className="pat-empty-state__icon">
              <BellOff size={48} color="#dc2626" />
            </div>
            <div className="pat-empty-state__text">No notifications yet</div>
            <div className="pat-empty-state__sub">You'll be notified about appointments and updates</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.slice(0, 5).map(notif => (
              <div 
                key={notif.id} 
                className="flat-card" 
                style={{ 
                  padding: '14px 16px', 
                  fontSize: '0.85rem',
                  borderLeft: notif.status === 'UNREAD' ? '3px solid var(--primary)' : '1px solid var(--border-light)',
                  background: notif.status === 'UNREAD' ? 'var(--primary-light)' : '#fff',
                  borderRadius: '10px',
                  border: `1px solid ${notif.status === 'UNREAD' ? 'rgba(15,76,129,0.15)' : 'var(--border-light)'}`,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>{notif.subject}</div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>{notif.message}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(notif.createdAt).toLocaleString()}</span>
                  {notif.status === 'UNREAD' && (
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Check size={14} />
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
            {notifications.length > 5 && (
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', margin: '10px 0 0' }}>
                And {notifications.length - 5} more notifications...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsSection;
