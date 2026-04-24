import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Video, PhoneOff, ShieldAlert, Clock } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "../components/ConfirmDialog";
import "../components/DashboardShared.css";

export default function VideoConsultation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ending, setEnding] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const user = useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  const [jitsiUrl, setJitsiUrl] = useState("");

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

  const isVideo = appointment?.appointmentType === "VIDEO" || appointment?.appointmentType === "VIDEO_CONSULTATION";

  useEffect(() => {
    if (appointment && appointment.status === "CONFIRMED" && isVideo) {
      // Fetch or create session from telemedicine service
      api.get(`/telemedicine/sessions/appointment/${appointmentId}`)
        .then(res => {
          setJitsiUrl(res.data.sessionUrl);
          api.put(`/telemedicine/sessions/${res.data.id}/start`).catch(() => {});
        })
        .catch(err => {
          if (err.response?.status === 404) {
            api.post('/telemedicine/sessions', {
              appointmentId: appointment.id,
              doctorId: appointment.doctorId,
              patientId: appointment.patientId
            }).then(res => {
              setJitsiUrl(res.data.sessionUrl);
              api.put(`/telemedicine/sessions/${res.data.id}/start`).catch(() => {});
            }).catch(e => console.error("Failed to create session", e));
          }
        });
    }
  }, [appointment, appointmentId, isVideo]);

  const redirectPath = user?.role === "DOCTOR"
    ? "/doctor/dashboard/doctor-appointments"
    : "/patient/dashboard/appointments";

  const handleEndClick = () => {
    setShowEndConfirm(true);
  };

  const executeEndCall = async () => {
    setShowEndConfirm(false);
    setEnding(true);
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status: "COMPLETED" });
      try {
        const sessionRes = await api.get(`/telemedicine/sessions/appointment/${appointmentId}`);
        await api.put(`/telemedicine/sessions/${sessionRes.data.id}/end`);
      } catch (e) { /* ignore if no session found */ }
      toast.success("Consultation ended and marked completed");
    } catch (e) {
      toast.error("Failed to mark appointment completed");
    } finally {
      setEnding(false);
      navigate(redirectPath);
    }
  };

  const displayName = user?.role === "DOCTOR"
    ? `Dr. ${user.name || "Doctor"}`
    : (user?.name || "Patient");

  const finalJitsiUrl = jitsiUrl ? `${jitsiUrl}#userInfo.displayName="${encodeURIComponent(displayName)}"&config.prejoinPageEnabled=false` : "";

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="skeleton" style={{ width: "100%", maxWidth: "800px", height: "500px", borderRadius: "16px" }}></div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="dashboard-container">
        <div className="dash-card empty-state" style={{ padding: "60px 20px" }}>
          <p style={{ color: "var(--danger)" }}>{error || "Consultation room not found."}</p>
          <button className="btn btn-outline" style={{ marginTop: "16px" }} onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  // Gate: only CONFIRMED video consultations can be joined
  if (!isVideo) {
    return (
      <div className="dashboard-container">
        <div className="dash-card empty-state" style={{ padding: "60px 20px" }}>
          <ShieldAlert size={44} color="var(--warning)" />
          <h3 style={{ marginTop: "12px" }}>This is not a video consultation</h3>
          <p style={{ color: "var(--text-muted)" }}>Only video appointments can be joined online.</p>
          <button className="btn btn-outline" style={{ marginTop: "16px" }} onClick={() => navigate(redirectPath)}>Back</button>
        </div>
      </div>
    );
  }

  if (appointment.status !== "CONFIRMED") {
    const msg =
      appointment.status === "COMPLETED"
        ? "This consultation has already been completed."
        : appointment.status === "PENDING_PAYMENT"
          ? "Payment is required before you can join the video call."
          : appointment.status === "PENDING"
            ? "Waiting for the doctor to accept this appointment."
            : `Cannot join — appointment status is ${appointment.status}.`;
    return (
      <div className="dashboard-container">
        <div className="dash-card empty-state" style={{ padding: "60px 20px" }}>
          <Clock size={44} color="var(--warning)" />
          <h3 style={{ marginTop: "12px" }}>Room not available</h3>
          <p style={{ color: "var(--text-muted)" }}>{msg}</p>
          <div style={{ marginTop: "16px", display: "flex", gap: "12px", justifyContent: "center" }}>
            <button className="btn btn-outline" onClick={() => navigate(redirectPath)}>Back to Appointments</button>
            {appointment.status === "PENDING_PAYMENT" && user?.role === "PATIENT" && (
              <button className="btn btn-primary" onClick={() => navigate(`/patient/dashboard/pay/${appointment.id}`)}>
                Proceed to Payment
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="dashboard-container" style={{ padding: "0", height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#000" }}>
      <div style={{ backgroundColor: "rgba(30, 41, 59, 0.95)", color: "#fff", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "8px", backgroundColor: "var(--danger)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Video size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600 }}>
              Teleconsultation — Room {jitsiUrl ? jitsiUrl.split('/').pop() : "Loading..."}
            </h2>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#94A3B8" }}>
              {user?.role === "PATIENT"
                ? `With Dr. ${appointment.doctorName || ""}`
                : `With ${appointment.patientName || `Patient ${appointment.patientId}`}`}
            </p>
          </div>
        </div>
        <button
          onClick={handleEndClick}
          disabled={ending}
          className="btn btn-danger"
          style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--danger)", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "var(--radius-md)", cursor: ending ? "not-allowed" : "pointer" }}
        >
          <PhoneOff size={16} /> {ending ? "Ending..." : "End Call"}
        </button>
      </div>

      <div style={{ flex: 1, position: "relative", overflow: "hidden", backgroundColor: "#0F172A" }}>
        {finalJitsiUrl ? (
          <iframe
            title="Jitsi Video Consultation"
            src={finalJitsiUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            style={{ border: 0, width: "100%", height: "100%" }}
          />
        ) : (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#fff" }}>
            <p>Initializing video session...</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showEndConfirm}
        title="End Consultation"
        message="End this consultation? The appointment will be marked as COMPLETED and the video session will close."
        confirmLabel="End Call"
        tone="danger"
        onConfirm={executeEndCall}
        onCancel={() => setShowEndConfirm(false)}
      />
    </div>
  );
}
