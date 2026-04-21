import React, { useState } from "react";
import PropTypes from "prop-types";
import { createSession } from "../../services/telemedicine";
import toast from "react-hot-toast";

const TelemedicineModal = ({ isOpen, onClose, appointment, doctorId }) => {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  const handleStartSession = async () => {
    if (!appointment) return;
    setLoading(true);
    try {
      // Assuming createSession returns { data: { joinUrl: '...' } }
      const res = await createSession(
        appointment.id,
        doctorId,
        appointment.patientId,
      );
      setSession(res.data);
      toast.success("Telemedicine session created successfully");
    } catch (error) {
      toast.error("Failed to create telemedicine session.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (session && session.joinUrl) {
      navigator.clipboard.writeText(session.joinUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="doc-modal-overlay" onClick={onClose}>
      <div className="doc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="doc-modal__header">
          <h3 className="doc-modal__title"> Telemedicine Session</h3>
          <button className="doc-modal__close" onClick={onClose}></button>
        </div>

        <div className="doc-modal__body">
          {!session ? (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <p style={{ marginBottom: "20px", color: "var(--text-main)" }}>
                You are about to start a secure video consultation with{" "}
                <strong>
                  {appointment?.patientName ||
                    `Patient #${appointment?.patientId || "N/A"}`}
                </strong>
                .
              </p>
              <button
                className="doc-modal-btn doc-modal-btn--accent"
                onClick={handleStartSession}
                disabled={loading}
              >
                {loading ? "Creating Session..." : "Generate Meeting Link"}
              </button>
            </div>
          ) : (
            <div className="doc-tele-result">
              <div className="doc-tele-result__icon"></div>
              <div className="doc-tele-result__title">Session Ready</div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Please share this link with your patient or join directly below.
              </p>
              <div className="doc-tele-result__link">
                {session.joinUrl || "https://meet.clinexa.com/session-abc-123"}
              </div>
              <button
                className="doc-modal-btn doc-modal-btn--cancel"
                onClick={copyToClipboard}
                style={{ marginRight: "10px" }}
              >
                Copy Link
              </button>
              <a
                href={session.joinUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="doc-modal-btn doc-modal-btn--primary"
                style={{ display: "inline-block", textDecoration: "none" }}
              >
                Join Now
              </a>
            </div>
          )}
        </div>

        <div className="doc-modal__footer">
          <button
            className="doc-modal-btn doc-modal-btn--cancel"
            onClick={onClose}
          >
            {session ? "Close" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

TelemedicineModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  appointment: PropTypes.object,
  doctorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default TelemedicineModal;
