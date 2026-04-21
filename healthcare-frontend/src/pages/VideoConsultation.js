import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Video, Mic, MicOff, VideoOff, PhoneOff, Settings, Users } from "lucide-react";
import "../components/DashboardShared.css";

export default function VideoConsultation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/appointments/${appointmentId}`);
        setAppointment(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load consultation details.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [appointmentId]);

  const endCall = () => {
    if (window.confirm("Are you sure you want to end this consultation?")) {
      const redirectPath = user.role === 'DOCTOR' ? '/doctor/dashboard/doctor-appointments' : '/patient/dashboard/appointments';
      navigate(redirectPath);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="skeleton" style={{ width: '100%', maxWidth: '800px', height: '500px', borderRadius: '16px' }}></div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="dashboard-container">
        <div className="dash-card empty-state" style={{ padding: '60px 20px' }}>
           <p style={{ color: "var(--danger)" }}>{error || "Consultation room not found."}</p>
           <button className="btn btn-outline" style={{ marginTop: '16px' }} onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ padding: '0', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000' }}>
      
      {/* Top Header */}
      <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', color: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', backgroundColor: 'var(--danger)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Video size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
              Teleconsultation with {user.role === 'PATIENT' ? `Dr. ${appointment.doctorName}` : `Patient ${appointment.patientId}`}
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8' }}>Secure End-to-End Encrypted Session</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
           <span className="badge badge-success" style={{ backgroundColor: 'rgba(21, 128, 61, 0.2)', color: '#4ADE80' }}>● Live Recording Active</span>
        </div>
      </div>

      {/* Main Video Area */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
         {/* Main feed (Remote) */}
         <div style={{ flex: 1, backgroundColor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Users size={80} color="#334155" />
            <div style={{ position: 'absolute', bottom: '24px', left: '24px', backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.9rem' }}>
              {user.role === 'PATIENT' ? `Dr. ${appointment.doctorName}` : `Patient ${appointment.patientId}`}
            </div>
         </div>

         {/* Self feed (Local) */}
         <div style={{ position: 'absolute', top: '24px', right: '24px', width: '240px', height: '160px', backgroundColor: '#1E293B', borderRadius: 'var(--radius-lg)', border: '2px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            {isVideoOff ? (
              <VideoOff size={40} color="#64748B" />
            ) : (
              <div style={{ width: '100%', height: '100%', backgroundColor: '#475569' }}></div>
            )}
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.75rem' }}>
              You
            </div>
            {isMuted && (
              <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'var(--danger)', padding: '4px', borderRadius: '50%' }}>
                <MicOff size={12} color="#fff" />
              </div>
            )}
         </div>
      </div>

      {/* Controls Footer */}
      <div style={{ backgroundColor: '#1E293B', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', zIndex: 10 }}>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          style={{ width: '56px', height: '56px', borderRadius: '50%', border: 'none', backgroundColor: isMuted ? 'var(--danger)' : '#334155', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: '0.2s' }}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <button 
          onClick={() => setIsVideoOff(!isVideoOff)}
          style={{ width: '56px', height: '56px', borderRadius: '50%', border: 'none', backgroundColor: isVideoOff ? 'var(--danger)' : '#334155', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: '0.2s' }}
        >
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>
        <button 
          onClick={endCall}
          style={{ width: '64px', height: '64px', borderRadius: '50%', border: 'none', backgroundColor: 'var(--danger)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: '0.2s', boxShadow: '0 0 15px rgba(220, 38, 38, 0.4)' }}
        >
          <PhoneOff size={28} />
        </button>
        <button 
          style={{ width: '56px', height: '56px', borderRadius: '50%', border: 'none', backgroundColor: '#334155', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: '0.2s' }}
        >
          <Settings size={24} />
        </button>
      </div>

    </div>
  );
}
