import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  Calendar,
  Search,
  Download,
  Eye,
  XCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import "../pages/PatientDashboard.css";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Cancel with reason
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get("/admin/appointments");
        const list = Array.isArray(res.data) ? res.data : [];
        list.sort(
          (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate),
        );
        setAppointments(list);
      } catch (err) {
        console.error(err);
        setError("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Multi-filter logic
  const filtered = appointments.filter((a) => {
    // Status filter
    if (filter !== "ALL" && a.status !== filter) return false;

    // Search filter (doctor name, patient name, ID)
    if (searchText) {
      const q = searchText.toLowerCase();
      const matchDoctor = (a.doctorName || "").toLowerCase().includes(q);
      const matchPatient = (a.patientName || "").toLowerCase().includes(q);
      const matchId = String(a.id || "").includes(q);
      const matchSpec = (a.doctorSpecialization || "").toLowerCase().includes(q);
      if (!matchDoctor && !matchPatient && !matchId && !matchSpec) return false;
    }

    // Date range filter
    if (dateFrom && a.appointmentDate) {
      if (a.appointmentDate < dateFrom) return false;
    }
    if (dateTo && a.appointmentDate) {
      if (a.appointmentDate > dateTo) return false;
    }

    return true;
  });

  const handleCancelAppointment = async () => {
    if (!cancelTarget) return;
    const reason = cancelReason.trim();
    if (reason.length < 10) {
      toast.error("Please provide at least 10 characters for the cancellation reason.");
      return;
    }

    setIsCancelling(true);
    try {
      // Cancel via status update (admin is allowed)
      await api.put(`/appointments/${cancelTarget.id}/status`, {
        status: "CANCELLED",
      });

      // Notify patient
      try {
        await api.post("/notifications/send", {
          userId: cancelTarget.patientId,
          type: "APPOINTMENT_CANCELLED",
          subject: "Appointment Cancelled by Admin",
          message: `Your appointment #${cancelTarget.id} with ${cancelTarget.doctorName ? `Dr. ${cancelTarget.doctorName}` : "your doctor"} on ${cancelTarget.appointmentDate} has been cancelled by the administrator. Reason: "${reason}"`,
          status: "SENT",
        });
      } catch (_) {}

      // Notify doctor
      try {
        await api.post("/notifications/send", {
          userId: cancelTarget.doctorId,
          type: "APPOINTMENT_CANCELLED",
          subject: "Appointment Cancelled by Admin",
          message: `Appointment #${cancelTarget.id} with patient ${cancelTarget.patientName || `#${cancelTarget.patientId}`} on ${cancelTarget.appointmentDate} has been cancelled by the administrator. Reason: "${reason}"`,
          status: "SENT",
        });
      } catch (_) {}

      // Update local state
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === cancelTarget.id ? { ...a, status: "CANCELLED" } : a,
        ),
      );
      toast.success(`Appointment #${cancelTarget.id} cancelled successfully`);
      setCancelTarget(null);
      setCancelReason("");
    } catch (err) {
      toast.error("Failed to cancel appointment");
    } finally {
      setIsCancelling(false);
    }
  };

  const escapeCsv = (value) => {
    const normalized = value == null ? "" : String(value);
    if (/[",\n]/.test(normalized)) {
      return `"${normalized.replace(/"/g, '""')}"`;
    }
    return normalized;
  };

  const handleExportCSV = () => {
    const rows = filtered.length ? filtered : appointments;
    if (!rows.length) {
      toast.error("No appointments to export.");
      return;
    }

    const headers = [
      "ID",
      "Date",
      "Time",
      "Patient Name",
      "Patient ID",
      "Doctor Name",
      "Doctor ID",
      "Specialization",
      "Type",
      "Status",
      "Notes",
    ];
    const lines = rows.map((a) =>
      [
        a.id,
        a.appointmentDate || "",
        a.appointmentTime || "",
        a.patientName || "",
        a.patientId || "",
        a.doctorName || "",
        a.doctorId || "",
        a.doctorSpecialization || "",
        a.appointmentType || "PHYSICAL",
        a.status || "",
        a.notes || "",
      ]
        .map(escapeCsv)
        .join(","),
    );

    const content = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-");
    const link = document.createElement("a");
    link.href = url;
    link.download = `appointments-export-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} appointment records.`);
  };

  const clearFilters = () => {
    setFilter("ALL");
    setSearchText("");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters =
    filter !== "ALL" || searchText || dateFrom || dateTo;

  if (loading)
    return (
      <div
        style={{
          padding: "32px",
          background: "var(--admin-bg)",
          minHeight: "100vh",
        }}
      >
        <div
          className="skeleton"
          style={{ height: 400, borderRadius: "12px" }}
        ></div>
      </div>
    );

  return (
    <div
      style={{
        padding: "32px",
        background: "var(--admin-bg)",
        minHeight: "100vh",
        fontFamily: "var(--font-base)",
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--admin-text)",
            margin: 0,
          }}
        >
          Appointment Management
        </h1>
        <button
          className="admin-btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
          onClick={handleExportCSV}
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters Panel */}
      <div
        style={{
          background: "var(--admin-surface)",
          border: "1px solid var(--admin-border)",
          borderRadius: "12px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          marginBottom: "24px",
        }}
      >
        {/* Status Filter Tabs */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--admin-border)",
            display: "flex",
            gap: "8px",
            overflowX: "auto",
          }}
        >
          {[
            "ALL",
            "PENDING_PAYMENT",
            "PENDING",
            "ACCEPTED",
            "CONFIRMED",
            "COMPLETED",
            "CANCELLED",
            "REJECTED",
          ].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 16px",
                height: "36px",
                fontSize: "12px",
                fontWeight: 600,
                borderRadius: "8px",
                border: "1px solid var(--admin-border)",
                background: filter === f ? "#dff6ec" : "#FFF",
                color: filter === f ? "#0f6e56" : "var(--admin-muted)",
                cursor: "pointer",
                fontFamily: "var(--font-base)",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search + Date Range */}
        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: "250px" }}>
            <Search
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--admin-muted)",
              }}
              size={16}
            />
            <input
              type="text"
              className="admin-input"
              style={{ paddingLeft: "40px" }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by patient, doctor, or ID..."
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--admin-muted)",
                textTransform: "uppercase",
              }}
            >
              From
            </span>
            <input
              type="date"
              className="admin-input"
              style={{ width: "160px" }}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--admin-muted)",
                textTransform: "uppercase",
              }}
            >
              To
            </span>
            <input
              type="date"
              className="admin-input"
              style={{ width: "160px" }}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--status-red)",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <XCircle size={14} /> Clear
            </button>
          )}
        </div>

        {/* Result count */}
        <div
          style={{
            padding: "8px 24px 12px",
            fontSize: "13px",
            color: "var(--admin-muted)",
            fontWeight: 500,
          }}
        >
          Showing{" "}
          <strong style={{ color: "var(--admin-text)" }}>
            {filtered.length}
          </strong>{" "}
          of{" "}
          <strong style={{ color: "var(--admin-text)" }}>
            {appointments.length}
          </strong>{" "}
          appointments
        </div>
      </div>

      {/* Appointments Table */}
      <div
        style={{
          background: "var(--admin-surface)",
          border: "1px solid var(--admin-border)",
          borderRadius: "12px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {error ? (
          <div style={{ color: "var(--status-red)", padding: "24px" }}>
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: "60px 32px",
              textAlign: "center",
              color: "var(--admin-muted)",
            }}
          >
            <Calendar
              size={40}
              style={{ opacity: 0.4, marginBottom: "12px" }}
            />
            <p style={{ margin: 0, fontSize: "15px" }}>
              No appointments match the selected filters.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead
                style={{
                  background: "#F8FAFC",
                  color: "var(--admin-muted)",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <tr>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Date & Time</th>
                  <th style={thStyle}>Patient</th>
                  <th style={thStyle}>Doctor</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    style={{
                      borderBottom: "1px solid var(--admin-border)",
                      height: "48px",
                      background: "#FFF",
                    }}
                  >
                    <td style={tdStyle}>
                      <code
                        style={{
                          color: "var(--admin-accent-2)",
                          background: "#F1F5F9",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "13px",
                        }}
                      >
                        #{a.id}
                      </code>
                    </td>
                    <td style={tdStyle}>
                      <div
                        style={{
                          fontWeight: 500,
                          color: "var(--admin-text)",
                          fontSize: "14px",
                        }}
                      >
                        {a.appointmentDate
                          ? new Date(a.appointmentDate).toLocaleDateString()
                          : "N/A"}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--admin-muted)",
                        }}
                      >
                        {a.appointmentTime || ""}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "var(--admin-text)",
                        }}
                      >
                        {a.patientName || `Patient #${a.patientId}`}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "var(--admin-text)",
                        }}
                      >
                        {a.doctorName
                          ? `Dr. ${a.doctorName}`
                          : `Doctor #${a.doctorId}`}
                      </div>
                      {a.doctorSpecialization && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--admin-muted)",
                          }}
                        >
                          {a.doctorSpecialization}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          background: "#F8FAFC",
                          color: "var(--admin-muted)",
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {a.appointmentType || "PHYSICAL"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        className={`status-badge ${getStatusBadge(a.status)}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          className="admin-btn-cancel"
                          style={{ padding: "6px 10px" }}
                          onClick={() => setSelectedAppointment(a)}
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        {a.status !== "CANCELLED" &&
                          a.status !== "COMPLETED" &&
                          a.status !== "REJECTED" && (
                            <button
                              className="admin-btn-danger"
                              style={{ padding: "6px 10px", fontSize: "12px" }}
                              onClick={() => {
                                setCancelTarget(a);
                                setCancelReason("");
                              }}
                            >
                              Cancel
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="admin-modal large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                Appointment Details #{selectedAppointment.id}
              </h3>
              <button
                className="admin-modal-close"
                onClick={() => setSelectedAppointment(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              <div>
                <label style={fieldLabelStyle}>Patient</label>
                <div style={fieldValueStyle}>
                  {selectedAppointment.patientName ||
                    `Patient #${selectedAppointment.patientId}`}
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Patient ID</label>
                <div style={fieldValueStyle}>
                  #{selectedAppointment.patientId}
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Doctor</label>
                <div style={fieldValueStyle}>
                  {selectedAppointment.doctorName
                    ? `Dr. ${selectedAppointment.doctorName}`
                    : `Doctor #${selectedAppointment.doctorId}`}
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Doctor ID</label>
                <div style={fieldValueStyle}>
                  #{selectedAppointment.doctorId}
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Specialization</label>
                <div style={fieldValueStyle}>
                  {selectedAppointment.doctorSpecialization || "N/A"}
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Hospital</label>
                <div style={fieldValueStyle}>
                  {selectedAppointment.doctorHospital || "N/A"}
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Date</label>
                <div style={fieldValueStyle}>
                  {selectedAppointment.appointmentDate
                    ? new Date(
                        selectedAppointment.appointmentDate,
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Time</label>
                <div style={fieldValueStyle}>
                  {selectedAppointment.appointmentTime || "N/A"}
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Type</label>
                <div style={fieldValueStyle}>
                  {selectedAppointment.appointmentType || "PHYSICAL"}
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Status</label>
                <div>
                  <span
                    className={`status-badge ${getStatusBadge(selectedAppointment.status)}`}
                  >
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>
              {selectedAppointment.notes && (
                <div style={{ gridColumn: "span 2" }}>
                  <label style={fieldLabelStyle}>Notes</label>
                  <div style={fieldValueStyle}>
                    {selectedAppointment.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn-cancel"
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </button>
              {selectedAppointment.status !== "CANCELLED" &&
                selectedAppointment.status !== "COMPLETED" &&
                selectedAppointment.status !== "REJECTED" && (
                  <button
                    className="admin-btn-danger"
                    onClick={() => {
                      setSelectedAppointment(null);
                      setCancelTarget(selectedAppointment);
                      setCancelReason("");
                    }}
                  >
                    Cancel Appointment
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel with Reason Modal */}
      {cancelTarget && (
        <div
          className="admin-modal-backdrop"
          onClick={() => {
            setCancelTarget(null);
            setCancelReason("");
          }}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Cancel Appointment</h3>
              <button
                className="admin-modal-close"
                onClick={() => {
                  setCancelTarget(null);
                  setCancelReason("");
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <p
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "15px",
                  color: "var(--admin-text)",
                }}
              >
                Cancel appointment{" "}
                <strong>#{cancelTarget.id}</strong> between{" "}
                <strong>
                  {cancelTarget.patientName ||
                    `Patient #${cancelTarget.patientId}`}
                </strong>{" "}
                and{" "}
                <strong>
                  {cancelTarget.doctorName
                    ? `Dr. ${cancelTarget.doctorName}`
                    : `Doctor #${cancelTarget.doctorId}`}
                </strong>
                ?
              </p>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "13px",
                  color: "var(--admin-muted)",
                }}
              >
                Both the patient and doctor will be notified with your reason.
              </p>
            </div>

            <div style={{ marginBottom: "8px" }}>
              <label style={fieldLabelStyle}>CANCELLATION REASON</label>
              <textarea
                className="admin-input large"
                placeholder="Enter reason for cancellation (min 10 characters)..."
                value={cancelReason}
                maxLength={500}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ minHeight: "100px", resize: "vertical" }}
              />
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "12px",
                  color: "var(--admin-muted)",
                }}
              >
                {cancelReason.trim().length}/500 characters (minimum 10)
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn-cancel"
                onClick={() => {
                  setCancelTarget(null);
                  setCancelReason("");
                }}
              >
                Keep Appointment
              </button>
              <button
                className="admin-btn-danger"
                disabled={isCancelling || cancelReason.trim().length < 10}
                onClick={handleCancelAppointment}
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusBadge(status) {
  switch (status) {
    case "ACCEPTED":
    case "CONFIRMED":
    case "COMPLETED":
      return "success";
    case "CANCELLED":
    case "REJECTED":
      return "failed";
    default:
      return "pending";
  }
}

const thStyle = { padding: "16px 24px", fontWeight: 600 };
const tdStyle = { padding: "12px 24px" };
const fieldLabelStyle = {
  fontSize: "11px",
  fontWeight: 700,
  color: "var(--admin-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  display: "block",
  marginBottom: "6px",
};
const fieldValueStyle = {
  fontSize: "15px",
  fontWeight: 500,
  color: "var(--admin-text)",
};
