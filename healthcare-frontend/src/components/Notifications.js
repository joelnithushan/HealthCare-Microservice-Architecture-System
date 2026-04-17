import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload.userId || payload.sub || payload.id;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = getUserIdFromToken();
        const response = await api.get(`/notifications/user/${userId}`);
        setNotifications(response.data);
      } catch {
        setError('Failed to fetch notifications.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

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

  const typeConfig = {
    EMAIL: { icon: '', bg: '#e0f2fe', color: '#0284c7' },
    SMS: { icon: '', bg: '#dcfce7', color: '#15803d' },
  };

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  if (loading) return (
    <div style={styles.loadingList}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flat-card skeleton-card" style={{ flexDirection: 'row', alignItems: 'center' }}>
          <div className="skeleton skeleton-avatar" style={{ width: 42, height: 42 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text short" style={{ marginBottom: 8 }} />
            <div className="skeleton skeleton-text" />
          </div>
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div style={styles.errorBox}>{error}</div>
  );

  return (
    <div>
      <div style={styles.headerRow}>
        <p style={styles.subtitle}>
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </p>
        {unreadCount > 0 && (
          <span style={styles.unreadBadge}>{unreadCount} unread</span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flat-card" style={styles.emptyState}>
          <div style={{ fontSize: 48, marginBottom: 12 }}></div>
          <p style={{ color: 'var(--text-muted)' }}>You have no notifications yet.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {notifications.map((notif, i) => {
            const tc = typeConfig[notif.type] || { icon: '', bg: '#f1f5f9', color: '#475569' };
            const isUnread = notif.status === 'UNREAD';

            return (
              <div key={notif.id} className="flat-card" style={{
                ...styles.card,
                ...(isUnread ? styles.cardUnread : {}),
                animationDelay: `${i * 0.04}s`,
              }}>
                {isUnread && <div style={styles.unreadIndicator} />}

                <div style={{
                  ...styles.iconCircle,
                  background: tc.bg,
                }}>
                  <span style={{ fontSize: 18 }}>{tc.icon}</span>
                </div>

                <div style={styles.cardContent}>
                  {notif.subject && (
                    <div style={styles.notifSubject}>{notif.subject}</div>
                  )}
                  <div style={styles.notifMessage}>{notif.message}</div>
                  <div style={styles.metaRow}>
                    <span style={styles.timestamp}>{new Date(notif.createdAt).toLocaleString()}</span>
                    <span style={{
                      ...styles.typeBadge,
                      background: tc.bg,
                      color: tc.color,
                    }}>
                      {notif.type}
                    </span>
                    {isUnread && (
                      <button onClick={() => markAsRead(notif.id)} className="flat-btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
  },
  unreadBadge: {
    background: 'var(--primary-light)',
    color: 'var(--primary-hover)',
    padding: '4px 12px',
    borderRadius: 'var(--radius-none)',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    padding: '1.25rem 1.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  cardUnread: {
    background: '#f8fafc',
    borderLeft: '4px solid var(--primary)',
  },
  unreadIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    background: 'var(--primary)',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  notifSubject: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: 4,
  },
  notifMessage: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    marginBottom: 12,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  timestamp: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  typeBadge: {
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '1rem',
    borderRadius: 'var(--radius-none)',
    border: '1px solid #f87171',
  },
  loadingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  }
};

export default Notifications;
