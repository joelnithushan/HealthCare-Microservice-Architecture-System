import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { Search, UserCheck, Eye, X, Info } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

import "../pages/PatientDashboard.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: "",
    user: null,
  });
  const [suspendReason, setSuspendReason] = useState("");
  const [confirmSuspendModal, setConfirmSuspendModal] = useState({
    isOpen: false,
    user: null,
    reason: "",
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getSuspensionReason = (user) =>
    user?.suspensionReason || user?.suspendReason || user?.reason || "";

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    try {
      const response = await api.get(`/users/${user.id}`);
      if (response?.data) {
        setSelectedUser(response.data);
      }
    } catch (_) {
      // Fallback to list payload if detail API is unavailable.
    }
  };

  const validateSuspendReason = () => {
    const reason = suspendReason.trim();
    if (!reason) {
      toast.error("Please provide a reason for suspension");
      return null;
    }
    if (reason.length < 10) {
      toast.error("Suspension reason must be at least 10 characters.");
      return null;
    }
    if (reason.length > 300) {
      toast.error("Suspension reason cannot exceed 300 characters.");
      return null;
    }
    return reason;
  };

  const performSuspend = async (user, reason) => {
    try {
      const response = await api.post(`/admin/users/${user.id}/suspend`, {
        reason,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? response.data : u)),
      );
      setActionModal({ isOpen: false, type: "", user: null });
      setConfirmSuspendModal({ isOpen: false, user: null, reason: "" });
      setSuspendReason("");
      if (selectedUser?.id === user.id) setSelectedUser(response.data);
      toast.success(`User ${user.name} suspended.`);
    } catch (err) {
      toast.error("Failed to suspend user");
    }
  };

  const escapeCsv = (value) => {
    const normalized = value == null ? "" : String(value);
    if (/[",\n]/.test(normalized)) {
      return `"${normalized.replace(/"/g, '""')}"`;
    }
    return normalized;
  };

  const handleExportUsers = () => {
    const rows = filtered.length ? filtered : users;
    if (!rows.length) {
      toast.error("No users to export.");
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Email",
      "Role",
      "NIC",
      "Mobile Number",
      "DOB",
      "Gender",
      "District",
      "Profile Complete",
      "Suspended",
      "Suspension Reason",
      "SLMC Number",
      "Specialization",
      "Hospital/Clinic",
    ];

    const lines = rows.map((user) =>
      [
        user.id,
        user.name || "",
        user.email || "",
        user.role || "",
        user.nic || "",
        user.mobileNumber || "",
        user.dob || "",
        user.gender || "",
        user.district || "",
        user.profileComplete !== false ? "YES" : "NO",
        user.suspended ? "YES" : "NO",
        getSuspensionReason(user) || "",
        user.slmcNumber || "",
        user.specialization || "",
        user.hospitalAttached || "",
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
    link.download = `users-export-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} user records.`);
  };

  const confirmAction = async () => {
    if (actionModal.type === "SUSPEND") {
      const reason = validateSuspendReason();
      if (!reason) {
        return;
      }
      setConfirmSuspendModal({ isOpen: true, user: actionModal.user, reason });
      return;
    } else if (actionModal.type === "UNSUSPEND") {
      try {
        const response = await api.post(
          `/admin/users/${actionModal.user.id}/unsuspend`,
        );
        setUsers((prev) =>
          prev.map((u) => (u.id === actionModal.user.id ? response.data : u)),
        );
        setActionModal({ isOpen: false, type: "", user: null });
        if (selectedUser?.id === actionModal.user.id)
          setSelectedUser(response.data);
        toast.success(`User ${actionModal.user.name} restored.`);
      } catch (err) {
        toast.error("Failed to unsuspend user");
      }
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
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
          User Directory
        </h1>
        <button className="admin-btn-primary" onClick={handleExportUsers}>
          Export Users
        </button>
      </div>

      <div
        style={{
          background: "var(--admin-surface)",
          border: "1px solid var(--admin-border)",
          borderRadius: "12px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--admin-border)",
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: "300px" }}>
            <Search
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--admin-muted)",
              }}
              size={18}
            />
            <input
              type="text"
              className="admin-input"
              style={{ paddingLeft: "40px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["ALL", "PATIENT", "DOCTOR", "ADMIN"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  padding: "8px 16px",
                  height: "38px",
                  fontSize: "13px",
                  fontWeight: 500,
                  borderRadius: "8px",
                  border: "1px solid var(--admin-border)",
                  background: roleFilter === r ? "#dff6ec" : "#FFF",
                  color: roleFilter === r ? "#0f6e56" : "var(--admin-muted)",
                  cursor: "pointer",
                  fontFamily: "var(--font-base)",
                  transition: "all 0.2s",
                }}
              >
                {r === "ALL" ? "All Roles" : r}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        <div
          style={{
            padding: "10px 24px",
            borderBottom: "1px solid var(--admin-border)",
            fontSize: "13px",
            color: "var(--admin-muted)",
            fontWeight: 500,
            background: "#FAFCFE",
          }}
        >
          Showing <strong style={{ color: "var(--admin-text)" }}>{filtered.length}</strong> of{" "}
          <strong style={{ color: "var(--admin-text)" }}>{users.length}</strong> users
          {roleFilter !== "ALL" && (
            <span> • Filtered by <strong style={{ color: "var(--admin-accent)" }}>{roleFilter}</strong></span>
          )}
          {search && (
            <span> • Search: "<strong style={{ color: "var(--admin-accent)" }}>{search}</strong>"</span>
          )}
        </div>

        {/* Table */}
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
                <th style={{ padding: "16px 24px", fontWeight: 600 }}>
                  User Details
                </th>
                <th style={{ padding: "16px 24px", fontWeight: 600 }}>
                  Account Role
                </th>
                <th style={{ padding: "16px 24px", fontWeight: 600 }}>
                  Completion Status
                </th>
                <th style={{ padding: "16px 24px", fontWeight: 600 }}>
                  Safety Status
                </th>
                <th
                  style={{
                    padding: "16px 24px",
                    fontWeight: 600,
                    textAlign: "right",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: "1px solid var(--admin-border)",
                    height: "48px",
                    background: "#FFF",
                  }}
                >
                  <td style={{ padding: "12px 24px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        className="apt-avatar"
                        style={{
                          width: 40,
                          height: 40,
                          fontSize: 13,
                          background: "var(--admin-bg)",
                          color: "var(--admin-text)",
                        }}
                      >
                        {user.name?.substring(0, 2).toUpperCase() || "U"}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "var(--admin-text)",
                            fontSize: "14px",
                          }}
                        >
                          {user.name}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--admin-muted)",
                          }}
                        >
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 24px" }}>
                    <span
                      className={`status-badge ${user.role?.toLowerCase()}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "12px 24px" }}>
                    {user.profileComplete !== false ? (
                      <span
                        style={{
                          color: "var(--status-green)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        <UserCheck size={16} /> Complete
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "var(--status-amber)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        <Info size={16} /> Incomplete
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px 24px" }}>
                    {user.suspended ? (
                      <div>
                        <span className="status-badge suspended">
                          SUSPENDED
                        </span>
                        {getSuspensionReason(user) && (
                          <div
                            style={{
                              marginTop: "6px",
                              fontSize: "12px",
                              color: "var(--status-red)",
                              maxWidth: "280px",
                            }}
                          >
                            {getSuspensionReason(user)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="status-badge active">ACTIVE</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 24px", textAlign: "right" }}>
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
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye size={16} />
                      </button>
                      {currentUser.id !== user.id &&
                        (user.suspended ? (
                          <button
                            className="admin-btn-primary"
                            style={{
                              background: "#15803d",
                              padding: "6px 10px",
                            }}
                            onClick={() =>
                              setActionModal({
                                isOpen: true,
                                type: "UNSUSPEND",
                                user,
                              })
                            }
                          >
                            Unsuspend
                          </button>
                        ) : (
                          <button
                            className="admin-btn-danger"
                            style={{ padding: "6px 10px" }}
                            onClick={() => {
                              setSuspendReason("");
                              setActionModal({
                                isOpen: true,
                                type: "SUSPEND",
                                user,
                              });
                            }}
                          >
                            Suspend
                          </button>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="admin-modal large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">User Profile Details</h3>
              <button
                className="admin-modal-close"
                onClick={() => setSelectedUser(null)}
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
                <label className="admin-label">Full Name</label>
                <div style={modalStyles.value}>
                  {selectedUser.name || "N/A"}
                </div>
              </div>
              <div>
                <label className="admin-label">User ID</label>
                <div style={modalStyles.value}>#{selectedUser.id}</div>
              </div>
              <div>
                <label className="admin-label">Email Address</label>
                <div style={modalStyles.value}>
                  {selectedUser.email || "N/A"}
                </div>
              </div>
              <div>
                <label className="admin-label">Mobile Number</label>
                <div style={modalStyles.value}>
                  {selectedUser.mobileNumber || "N/A"}
                </div>
              </div>
              <div>
                <label className="admin-label">Role</label>
                <div
                  className={`status-badge ${selectedUser.role?.toLowerCase()}`}
                >
                  {selectedUser.role}
                </div>
              </div>
              <div>
                <label className="admin-label">Profile Completion</label>
                <div style={modalStyles.value}>
                  {selectedUser.profileComplete !== false
                    ? "Complete"
                    : "Incomplete"}
                </div>
              </div>
              <div>
                <label className="admin-label">NIC Number</label>
                <div style={modalStyles.value}>{selectedUser.nic || "N/A"}</div>
              </div>
              <div>
                <label className="admin-label">Gender</label>
                <div style={modalStyles.value}>
                  {selectedUser.gender || "N/A"}
                </div>
              </div>
              <div>
                <label className="admin-label">Date of Birth</label>
                <div style={modalStyles.value}>{selectedUser.dob || "N/A"}</div>
              </div>
              <div>
                <label className="admin-label">District</label>
                <div style={modalStyles.value}>
                  {selectedUser.district || "N/A"}
                </div>
              </div>
              <div>
                <label className="admin-label">Account Status</label>
                <div
                  className={`status-badge ${selectedUser.suspended ? "suspended" : "active"}`}
                >
                  {selectedUser.suspended ? "SUSPENDED" : "ACTIVE"}
                </div>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label className="admin-label">Suspension Reason</label>
                <div style={modalStyles.value}>
                  {getSuspensionReason(selectedUser) || "N/A"}
                </div>
              </div>
              {selectedUser.role === "DOCTOR" && (
                <>
                  <div>
                    <label className="admin-label">Specialization</label>
                    <div style={modalStyles.value}>
                      {selectedUser.specialization || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="admin-label">SLMC Number</label>
                    <div style={modalStyles.value}>
                      {selectedUser.slmcNumber || "N/A"}
                    </div>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="admin-label">
                      Primary Hospital / Clinic
                    </label>
                    <div style={modalStyles.value}>
                      {selectedUser.hospitalAttached || "N/A"}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionModal.isOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() =>
            setActionModal({ isOpen: false, type: "", user: null })
          }
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Confirm Action</h3>
              <button
                className="admin-modal-close"
                onClick={() =>
                  setActionModal({ isOpen: false, type: "", user: null })
                }
              >
                <X size={20} />
              </button>
            </div>
            <div>
              <p style={{ margin: "0 0 16px 0", fontSize: "15px" }}>
                Are you sure you want to{" "}
                {actionModal.type === "SUSPEND" ? "suspend" : "unsuspend"}{" "}
                <strong>{actionModal.user.name}</strong>?
              </p>
              {actionModal.type === "SUSPEND" && (
                <textarea
                  className="admin-input large"
                  placeholder="Reason for suspension..."
                  value={suspendReason}
                  maxLength={300}
                  onChange={(e) => setSuspendReason(e.target.value)}
                />
              )}
              {actionModal.type === "SUSPEND" && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "var(--admin-muted)",
                  }}
                >
                  {suspendReason.trim().length}/300 characters (minimum 10)
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button
                className="admin-btn-cancel"
                onClick={() =>
                  setActionModal({ isOpen: false, type: "", user: null })
                }
              >
                Cancel
              </button>
              <button
                className={
                  actionModal.type === "SUSPEND"
                    ? "admin-btn-danger"
                    : "admin-btn-primary"
                }
                onClick={confirmAction}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmSuspendModal.isOpen}
        title="Confirm User Suspension"
        message={`You are about to suspend ${confirmSuspendModal.user?.name || "this user"}. Reason: "${confirmSuspendModal.reason}". Do you want to continue?`}
        confirmLabel="Confirm Suspend"
        cancelLabel="Cancel"
        tone="danger"
        onCancel={() =>
          setConfirmSuspendModal({ isOpen: false, user: null, reason: "" })
        }
        onConfirm={() =>
          performSuspend(confirmSuspendModal.user, confirmSuspendModal.reason)
        }
      />
    </div>
  );
};

const modalStyles = {
  value: { fontSize: "15px", fontWeight: 500, color: "var(--admin-text)" },
};

export default UserManagement;
