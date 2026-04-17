import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionByAppointment, createSession, startSession, endSession } from '../services/telemedicine';
import api from '../services/api';
import ConsultationSidePanel from '../components/doctor/ConsultationSidePanel';
import './VideoConsultation.css'; // Will create this for cleaner layout

const JITSI_DOMAIN = 'meet.jit.si';

export default function VideoConsultation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);

  const [session, setSession] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    const loadOrCreateSession = async () => {
      try {
        const apptRes = await api.get(`/appointments/${appointmentId}`);
        if (apptRes.data.status !== 'ACCEPTED') {
          setError('Video consultation is only available for accepted appointments.');
          setLoading(false);
          return;
        }

        // Logical Security Fix: Verify User Ownership
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isParticipant = 
          (user.role === 'PATIENT' && Number(user.id) === Number(apptRes.data.patientId)) ||
          (user.role === 'DOCTOR' && (Number(user.id) === Number(apptRes.data.doctorId) || Number(user.doctorId) === Number(apptRes.data.doctorId)));

        if (!isParticipant && user.role !== 'ADMIN') {
          setError('Unauthorized: You are not a participant in this consultation.');
          setLoading(false);
          return;
        }

        const res = await getSessionByAppointment(appointmentId);
        setSession(res.data);
        setAppointment(apptRes.data);
      } catch (err) {
        if (err.response?.status === 404) {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          try {
            const create = await createSession(appointmentId, user.doctorId || null, user.id);
            setSession(create.data);
          } catch (createErr) {
            setError('Failed to create consultation session.');
          }
        } else {
          setError('Failed to load consultation session.');
        }
      } finally {
        setLoading(false);
      }
    };
    loadOrCreateSession();
  }, [appointmentId]);

  useEffect(() => {
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) { resolve(); return; }
        const script = document.createElement('script');
        script.src = `https://${JITSI_DOMAIN}/external_api.js`;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    if (inCall && session?.roomName) {
      loadJitsiScript().then(() => {
        if (!jitsiContainerRef.current) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        apiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: session.roomName,
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          },
          userInfo: {
            displayName: user.fullName || user.email || 'User',
          },
        });

        apiRef.current.addEventListener('videoConferenceLeft', () => {
          handleEndCall();
        });
      });
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [inCall, session]);

  const handleJoinCall = async () => {
    try {
      await startSession(session.id);
      setInCall(true);
    } catch {
      setInCall(true);
    }
  };

  const handleEndCall = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null; }
      await endSession(session.id);
    } finally {
      setInCall(false);
      if (user.role === 'DOCTOR') {
        navigate('/doctor-dashboard#schedule');
      } else {
        navigate('/dashboard#appointments');
      }
    }
  };

  if (loading) return (
    <div style={{ ...styles.wrapper, justifyContent: 'center' }}>
      <div style={styles.waitingRoom}>
        <div className="flat-card skeleton-card" style={styles.card}>
          <div className="skeleton skeleton-avatar" style={{ width: 64, height: 64, margin: '0 auto 16px' }} />
          <div className="skeleton skeleton-title" style={{ margin: '0 auto 16px', width: '50%' }} />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text short" style={{ margin: '0 auto 24px' }} />
          <div className="skeleton" style={{ height: 42, width: '100%', marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 42, width: '100%' }} />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div style={styles.centered}>
      <div style={styles.errorBox}>{error}</div>
      <button className="flat-btn-outline" onClick={() => navigate(-1)}>← Go Back</button>
    </div>
  );

  return (
    <div style={styles.wrapper} className="consult-room-wrapper">
      <div style={styles.infoBar}>
        <span style={styles.roomBadge}>Room: {session?.roomName}</span>
        <span style={{
          ...styles.statusBadge,
          background: session?.status === 'ACTIVE' ? 'var(--primary)' : session?.status === 'COMPLETED' ? '#475569' : '#eab308',
        }}>{session?.status}</span>
        {inCall && (
          <button style={styles.endBtn} onClick={handleEndCall}>End Session</button>
        )}
      </div>
        <div style={styles.mainArea}>
          {inCall ? (
            <div style={styles.callLayout}>
              <div ref={jitsiContainerRef} style={styles.jitsiContainer} />
              {JSON.parse(localStorage.getItem('user') || '{}').role === 'DOCTOR' && (
                <ConsultationSidePanel appointment={appointment} appointmentId={appointmentId} />
              )}
            </div>
          ) : (
            <div style={styles.waitingRoom}>
              <div className="flat-card" style={styles.card}>
                <div style={{ marginBottom: 16 }}></div>
                <h2 style={styles.heading}>Video Consultation</h2>
                <p style={styles.sub}>
                  You are about to join a secure telemedicine session using{' '}
                  <strong>Jitsi Meet</strong>. Your video and microphone will be requested.
                </p>
                <div style={styles.sessionInfo}>
                  <div><strong>Patient:</strong> {appointment?.patientName || `Patient ID: ${appointment?.patientId}`}</div>
                  <div><strong>Room:</strong> {session?.roomName}</div>
                  <div><strong>Status:</strong> {session?.status}</div>
                </div>
                <button className="flat-btn" style={{ width: '100%', marginBottom: '1rem' }} onClick={handleJoinCall}>
                  Join Video Call
                </button>
                <button className="flat-btn-outline" style={{ width: '100%', border: 'none' }} onClick={() => navigate(-1)}>← Back</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 120px)', // Adjust for header/footer
    width: '100%',
    overflow: 'hidden',
    background: '#000',
  },
  infoBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 20px',
    background: 'var(--bg-white)',
    borderBottom: '1px solid var(--border-light)',
    zIndex: 10,
  },
  roomBadge: {
    background: 'var(--primary-light)',
    color: 'var(--primary-hover)',
    borderRadius: '4px',
    padding: '2px 10px',
    fontSize: 12,
    fontWeight: 600,
  },
  statusBadge: {
    color: '#fff',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  endBtn: {
    marginLeft: 'auto',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 12,
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  callLayout: {
    display: 'flex',
    flex: 1,
    width: '100%',
    height: '100%',
    background: '#000',
  },
  jitsiContainer: {
    flex: 1,
    height: '100%',
    background: '#000',
  },
  waitingRoom: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    background: 'transparent',
  },
  card: {
    padding: 40,
    maxWidth: 480,
    width: '100%',
    textAlign: 'center',
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: 8,
    margin: 0,
  },
  sub: {
    color: 'var(--text-muted)',
    fontSize: 14,
    lineHeight: 1.6,
    marginBottom: 24,
  },
  sessionInfo: {
    background: '#f8fafc',
    borderRadius: 'var(--radius-none)',
    padding: 16,
    textAlign: 'left',
    fontSize: 13,
    color: 'var(--text-muted)',
    marginBottom: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    border: '1px solid var(--border-light)',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 16,
    padding: 20,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '14px 18px',
    borderRadius: 'var(--radius-none)',
    border: '1px solid #f87171',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid #e2e8f0',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
