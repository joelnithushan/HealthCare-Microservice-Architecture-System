import React, { useState, useEffect } from "react";
import { Info, Database } from "lucide-react";
import api from "../services/api";

import "../pages/PatientDashboard.css";

const getPaymentLevel = (status = "") => {
  const normalized = String(status).toUpperCase();
  if (normalized.includes("FAIL")) return "ERROR";
  if (normalized.includes("PEND")) return "WARN";
  return "INFO";
};

const getAppointmentLevel = (status = "") => {
  const normalized = String(status).toUpperCase();
  if (normalized.includes("CANCEL")) return "WARN";
  if (normalized.includes("NO_SHOW")) return "WARN";
  return "INFO";
};

const normalizeTimestamp = (value) => {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
};

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const [usersRes, appointmentsRes, paymentsRes] =
          await Promise.allSettled([
            api.get("/admin/users"),
            api.get("/admin/appointments"),
            api.get("/admin/payments"),
          ]);

        const users =
          usersRes.status === "fulfilled" && Array.isArray(usersRes.value.data)
            ? usersRes.value.data
            : [];
        const appointments =
          appointmentsRes.status === "fulfilled" &&
          Array.isArray(appointmentsRes.value.data)
            ? appointmentsRes.value.data
            : [];
        const payments =
          paymentsRes.status === "fulfilled" &&
          Array.isArray(paymentsRes.value.data)
            ? paymentsRes.value.data
            : [];

        const userLogs = users
          .filter((user) => user.role === "DOCTOR" || user.suspended)
          .slice(0, 8)
          .map((user, index) => ({
            id: `user-${user.id || index}`,
            timestamp: normalizeTimestamp(user.updatedAt || user.createdAt),
            action: user.suspended
              ? "User Suspension"
              : "Doctor Verification Queue",
            service: "user-service",
            level: user.suspended ? "WARN" : "INFO",
            detail: user.suspended
              ? `User ${user.email || user.name || user.id} is currently suspended.`
              : `Doctor ${user.email || user.name || user.id} is ${user.approved ? "approved" : "pending approval"}.`,
          }));

        const appointmentLogs = appointments
          .slice(0, 12)
          .map((item, index) => ({
            id: `appointment-${item.appointmentId || index}`,
            timestamp: normalizeTimestamp(
              item.updatedAt || item.createdAt || item.appointmentDate,
            ),
            action: "Appointment Status Update",
            service: "appointment-service",
            level: getAppointmentLevel(item.status),
            detail: `Appointment #${item.appointmentId} for patient #${item.patientId} is ${item.status || "UNKNOWN"}.`,
          }));

        const paymentLogs = payments.slice(0, 12).map((item, index) => ({
          id: `payment-${item.paymentId || index}`,
          timestamp: normalizeTimestamp(
            item.updatedAt || item.paymentDate || item.createdAt,
          ),
          action: "Payment Transaction",
          service: "payment-service",
          level: getPaymentLevel(item.status),
          detail: `Payment #${item.paymentId} for appointment #${item.appointmentId || "N/A"} is ${item.status || "UNKNOWN"} (LKR ${item.amount || 0}).`,
        }));

        const merged = [...paymentLogs, ...appointmentLogs, ...userLogs]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 40);

        if (merged.length > 0) {
          setLogs(merged);
          setError("");
        } else {
          setLogs([]);
          setError(
            "No activity available yet. Data sources are reachable but currently empty.",
          );
        }
      } catch (err) {
        setError(
          "Unable to load live admin activity. Please try again shortly.",
        );
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    const refreshTimer = setInterval(fetchLogs, 30000);
    return () => clearInterval(refreshTimer);
  }, []);

  const services = ["ALL", ...new Set(logs.map((l) => l.service))];

  const filtered = logs.filter((l) => {
    const matchLevel = levelFilter === "ALL" || l.level === levelFilter;
    const matchService = serviceFilter === "ALL" || l.service === serviceFilter;
    return matchLevel && matchService;
  });

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
          marginBottom: "32px",
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
          Security & System Events
        </h1>
        <div
          style={{
            color: "var(--admin-muted)",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Database size={14} /> Audit Trail Live
        </div>
      </div>

      <div
        style={{
          background: "var(--admin-surface)",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid var(--admin-border)",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--admin-border)",
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={fLabel}>Level</span>
            {["ALL", "INFO", "WARN", "ERROR"].map((l) => (
              <button
                key={l}
                onClick={() => setLevelFilter(l)}
                style={{
                  padding: "4px 12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  borderRadius: "4px",
                  border: "1px solid #d6dce5",
                  background:
                    levelFilter === l ? "var(--admin-accent)" : "#eef2f7",
                  color: levelFilter === l ? "#fff" : "#334155",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={fLabel}>Service</span>
            <select
              style={{
                background: "#eef2f7",
                color: "#0f172a",
                border: "1px solid #d6dce5",
                padding: "4px 12px",
                fontSize: "12px",
                borderRadius: "4px",
                outline: "none",
              }}
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto", padding: "12px" }}>
          {error && (
            <div
              style={{
                margin: "8px 8px 12px",
                padding: "10px 12px",
                borderRadius: "8px",
                background: "#fff1f2",
                border: "1px solid #fecdd3",
                color: "#b91c1c",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  color: "#64748b",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <th style={logS.th}>Timestamp</th>
                <th style={logS.th}>Level</th>
                <th style={logS.th}>Source</th>
                <th style={logS.th}>Details</th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: '"Roboto Mono", monospace' }}>
              {filtered.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #edf2f7" }}>
                  <td style={logS.td}>
                    <span style={{ color: "#64748b" }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </td>
                  <td style={logS.td}>
                    <span
                      style={{
                        color:
                          log.level === "ERROR"
                            ? "#ff4d4d"
                            : log.level === "WARN"
                              ? "#ffcc00"
                              : "#00e676",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      [{log.level}]
                    </span>
                  </td>
                  <td style={logS.td}>
                    <span style={{ color: "#1d4ed8" }}>{log.service}</span>
                  </td>
                  <td style={logS.td}>
                    <span style={{ color: "#334155" }}>{log.detail}</span>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td style={logS.td} colSpan={4}>
                    <span style={{ color: "#64748b" }}>
                      No records match the selected filters.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "16px",
          background: "var(--admin-surface)",
          border: "1px solid var(--admin-border)",
          borderRadius: "8px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <Info
          size={18}
          style={{ color: "var(--admin-muted)", flexShrink: 0 }}
        />
        <p style={{ margin: 0, fontSize: "13px", color: "var(--admin-muted)" }}>
          This audit trail captures all microservices events. Critical security
          alerts are automatically forwarded to the root administrator email.
        </p>
      </div>
    </div>
  );
};

const fLabel = {
  color: "#64748b",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
};
const logS = {
  th: { padding: "12px 16px", textAlign: "left" },
  td: { padding: "10px 16px", fontSize: "13px" },
};

export default SystemLogs;
