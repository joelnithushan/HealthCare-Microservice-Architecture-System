import React from "react";
import { AlertTriangle, CheckCircle, AlertCircle, Info, X } from "lucide-react";

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (tone) {
      case "danger":
        return <AlertCircle size={48} className="text-danger-icon" style={{ color: "#ef4444" }} />;
      case "warning":
        return <AlertTriangle size={48} className="text-warning-icon" style={{ color: "#f59e0b" }} />;
      case "success":
        return <CheckCircle size={48} className="text-success-icon" style={{ color: "#10b981" }} />;
      default:
        return <Info size={48} className="text-info-icon" style={{ color: "#3b82f6" }} />;
    }
  };

  const getToneClass = () => {
    switch (tone) {
      case "danger": return "admin-btn-danger";
      case "success": return "admin-btn-primary";
      default: return "admin-btn-primary";
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onCancel}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
        <button
          className="admin-modal-close"
          onClick={onCancel}
          aria-label="Close dialog"
          style={{ position: "absolute", top: "20px", right: "20px" }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
          {getIcon()}
        </div>

        <h3 className="admin-modal-title" style={{ marginBottom: "12px", fontSize: "24px" }}>
          {title}
        </h3>

        <p
          style={{
            margin: "0 0 32px",
            color: "var(--text-muted)",
            fontSize: "15px",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>

        <div className="admin-modal-footer" style={{ justifyContent: "center", width: "100%", gap: "16px" }}>
          <button
            className="admin-btn-cancel"
            onClick={onCancel}
            disabled={loading}
            style={{ flex: 1, maxWidth: "160px" }}
          >
            {cancelLabel}
          </button>
          <button
            className={getToneClass()}
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1, maxWidth: "160px" }}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
