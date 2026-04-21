import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Video, Calendar, Clock, CreditCard, Activity } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import ConfirmDialog from "../ConfirmDialog";

const NextAppointmentCard = ({ appointment, onCancel, loading, isPaid }) => {
  const [joining, setJoining] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (loading) {
    return (
      <div className="pat-panel">
        <div className="pat-panel__header">
          <h3 className="pat-panel__title">
            <span
              className="pat-panel__title-icon"
              style={{ background: "#dbeafe", color: "#2563eb" }}
            >
              <Clock size={18} />
            </span>
            Next Appointment
          </h3>
        </div>
        <div className="pat-panel__body">
          <div
            className="skeleton"
            style={{
              width: "40%",
              height: "20px",
              borderRadius: "6px",
              marginBottom: "10px",
            }}
          ></div>
          <div
            className="skeleton"
            style={{
              width: "60%",
              height: "16px",
              borderRadius: "6px",
              marginBottom: "10px",
            }}
          ></div>
          <div
            className="skeleton"
            style={{
              width: "30%",
              height: "32px",
              borderRadius: "8px",
              marginTop: "16px",
            }}
          ></div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="pat-panel">
        <div className="pat-panel__header">
          <h3 className="pat-panel__title">
            <span
              className="pat-panel__title-icon"
              style={{ background: "#dbeafe", color: "#2563eb" }}
            >
              <Clock size={18} />
            </span>
            Next Appointment
          </h3>
        </div>
        <div className="pat-panel__body">
          <div className="pat-empty-state">
            <div className="pat-empty-state__icon">
              <Calendar size={48} color="var(--border-focus)" />
            </div>
            <div className="pat-empty-state__text">No upcoming appointments</div>
            <div className="pat-empty-state__sub">
              Schedule a visit with one of our specialists
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleJoinVideo = async () => {
    setJoining(true);
    try {
      const res = await api.post("/v1/telemedicine/sessions", {
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
      });
      if (res.data && res.data.joinUrl) {
        window.open(res.data.joinUrl, "_blank");
      } else {
        toast.error("Session link could not be generated.");
      }
    } catch (err) {
      toast.error("Failed to create telemedicine session.");
    } finally {
      setJoining(false);
    }
  };

  const handleCancel = () => {
    setConfirmOpen(true);
  };

  const isVideo = appointment.appointmentType === "VIDEO";

  return (
    <>
      <div
        className="pat-panel"
        style={{ borderLeft: "4px solid var(--primary)" }}
      >
        <div className="pat-panel__header">
          <h3 className="pat-panel__title">
            <span
              className="pat-panel__title-icon"
              style={{ background: "#dbeafe", color: "#2563eb" }}
            >
              <Clock size={18} />
            </span>
            Next Appointment
          </h3>
          <span
            className={`pat-badge pat-badge--${appointment.status.toLowerCase()}`}
          >
            {appointment.status}
          </span>
        </div>
        <div
          className="pat-panel__body"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div className="pat-next-appt__info">
            <div className="pat-next-appt__doctor">
              Dr.{" "}
              {appointment.doctorName ||
                `Doctor #${appointment.doctorId || "Unknown"}`}
            </div>
            <div className="next-appt-card__type">
              {isVideo ? (
                <>
                  <Video size={14} style={{ marginRight: 6 }} /> Video
                  Consultation
                </>
              ) : (
                <>
                  <Activity size={14} style={{ marginRight: 6 }} /> In-Person
                  Consultation
                </>
              )}
            </div>

            <div className="next-appt-card__time">
              <span>
                <Calendar size={14} /> {appointment.appointmentDate}
              </span>
              <span>
                <Clock size={14} /> {appointment.appointmentTime}
              </span>
            </div>
          </div>

          <div className="pat-next-appt__actions">
            {isVideo &&
              (isPaid ? (
                <button
                  className="pat-btn pat-btn--accent"
                  onClick={handleJoinVideo}
                  disabled={joining}
                >
                  <Video size={16} style={{ marginRight: 6 }} />
                  {joining ? "Connecting..." : "Join Video Call"}
                </button>
              ) : (
                <Link
                  to={`/patient/dashboard/pay/${appointment.id}`}
                  className="pat-btn"
                  style={{
                    background: "#f59e0b",
                    borderColor: "#f59e0b",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: "8px",
                  }}
                >
                  💳 Pay to Join Video
                </Link>
              ))}
            <button className="pat-btn pat-btn--danger" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmLabel="Yes, Cancel"
        cancelLabel="No, Keep"
        tone="danger"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onCancel(appointment.id);
        }}
      />
    </>
  );
};

NextAppointmentCard.propTypes = {
  appointment: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  isPaid: PropTypes.bool,
};

export default NextAppointmentCard;
