import React from "react";

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

  return (
    <div className="admin-modal-backdrop" onClick={onCancel}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">{title}</h3>
          <button
            className="admin-modal-close"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            x
          </button>
        </div>

        <p
          style={{
            margin: 0,
            color: "var(--admin-muted)",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>

        <div className="admin-modal-footer">
          <button
            className="admin-btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className={
              tone === "danger" ? "admin-btn-danger" : "admin-btn-primary"
            }
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
