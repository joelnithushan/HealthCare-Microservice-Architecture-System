import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  Search,
  XCircle,
  UserCheck,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Hospital,
  Stethoscope,
  User,
  Cake,
  MapPin,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import "../pages/PatientDashboard.css";

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Reject with reason
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Fee update
  const [feeTarget, setFeeTarget] = useState(null);
  const [feeValue, setFeeValue] = useState("");
  const [feeLoading, setFeeLoading] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/admin/users");
        setDoctors(res.data.filter((u) => u.role === "DOCTOR"));
      } catch (err) {
        toast.error("Failed to fetch doctor registration data");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const sendNotification = async (doctor, type, subject, message) => {
    try {
      await api.post("/notifications/send", {
        userId: doctor.id,
        type,
        subject,
        message,
        recipientEmail: doctor.email,
        status: "SENT",
      });
    } catch (err) {
      console.warn("Notification delivery skipped:", err.message);
    }
  };

  const handleApprove = async () => {
    if (!selectedDoc) return;
    setIsProcessing(true);
    try {
      // 1. Approve Identity in User Service
      await api.put(`/admin/users/${selectedDoc.id}/approve`);

      // 2. Sync and Verify in Doctor Service
      try {
        let doctorProfileId = null;
        try {
          const docRes = await api.get(`/doctors/email/${selectedDoc.email}`);
          doctorProfileId = docRes.data?.id;
        } catch (err) {
          // If not found, create the profile
          if (err.response?.status === 404) {
            const createRes = await api.post("/doctors", {
              name: selectedDoc.name,
              email: selectedDoc.email,
              specialization:
                selectedDoc.specialization || "General Physician",
              phone: selectedDoc.mobileNumber,
              availability: "Schedule pending verification",
            });
            doctorProfileId = createRes.data?.id;
          } else {
            throw err;
          }
        }

        if (doctorProfileId) {
          await api.put(`/admin/doctors/${doctorProfileId}/verify`);
        }
      } catch (err) {
        console.warn(
          "Medical profile sync skipped or failed, only identity approved",
          err,
        );
      }

      // 3. Send approval notification
      await sendNotification(
        selectedDoc,
        "DOCTOR_VERIFIED",
        "Your MediConnect Account Has Been Verified",
        `Congratulations Dr. ${selectedDoc.name}! Your medical credentials have been verified. You can now accept patient bookings, issue prescriptions, and conduct video consultations through the Clinexa platform.`,
      );

      setDoctors(
        doctors.map((d) =>
          d.id === selectedDoc.id ? { ...d, approved: true } : d,
        ),
      );
      setShowDetails(false);
      toast.success(`Dr. ${selectedDoc.name} has been verified successfully`);
    } catch (err) {
      toast.error("Verification failed. Please check network connectivity.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    const reason = rejectReason.trim();
    if (reason.length < 10) {
      toast.error("Please provide at least 10 characters for the rejection reason.");
      return;
    }

    setIsProcessing(true);
    try {
      await api.put(`/admin/users/${rejectTarget.id}/reject`);
      try {
        const docRes = await api.get(`/doctors/email/${rejectTarget.email}`);
        if (docRes.data && docRes.data.id) {
          await api.put(`/admin/doctors/${docRes.data.id}/reject`);
        }
      } catch (err) {
        // Doctor service profile may not exist
      }

      // Send rejection notification with reason
      await sendNotification(
        rejectTarget,
        "DOCTOR_REJECTED",
        "MediConnect Verification Update",
        `Dear Dr. ${rejectTarget.name}, we regret to inform you that your medical credentials verification has not been approved. Reason: "${reason}". Please contact support or re-submit your documentation for review.`,
      );

      setDoctors(
        doctors.map((d) =>
          d.id === rejectTarget.id ? { ...d, approved: false, rejected: true } : d,
        ),
      );
      toast.success("Doctor verification has been rejected");
      setRejectTarget(null);
      setRejectReason("");
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenFeeModal = async (doc) => {
    setFeeTarget(doc);
    setFeeValue("2500");
    try {
      const docRes = await api.get(`/doctors/email/${doc.email}`);
      if (docRes.data && docRes.data.consultationFee) {
        setFeeValue(docRes.data.consultationFee.toString());
      }
    } catch (e) {
      // Ignored, default to 2500
    }
  };

  const handleUpdateFee = async () => {
    if (!feeTarget) return;
    setFeeLoading(true);
    try {
      const docRes = await api.get(`/doctors/email/${feeTarget.email}`);
      if (docRes.data && docRes.data.id) {
        const req = {
          name: docRes.data.name,
          email: docRes.data.email,
          specialization: docRes.data.specialization,
          phone: docRes.data.phone,
          availability: docRes.data.availability,
          hospital: docRes.data.hospital,
          consultationModes: docRes.data.consultationModes,
          consultationFee: parseFloat(feeValue) || 2500.0,
        };
        await api.put(`/doctors/${docRes.data.id}`, req);
        toast.success(`Fee updated successfully for Dr. ${feeTarget.name}`);
        setFeeTarget(null);
      } else {
        toast.error("Doctor profile not fully registered yet.");
      }
    } catch (e) {
      toast.error("Failed to update consultation fee");
    } finally {
      setFeeLoading(false);
    }
  };

  const filtered = doctors.filter((d) => {
    const matchSearch =
      (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.specialization || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.hospitalAttached || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.slmcNumber || "").toLowerCase().includes(search.toLowerCase());

    if (statusFilter === "PENDING") return matchSearch && !d.approved;
    if (statusFilter === "VERIFIED") return matchSearch && d.approved === true;
    if (statusFilter === "REJECTED") return matchSearch && d.rejected === true;
    return matchSearch;
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
          style={{ height: 200, borderRadius: "12px" }}
        ></div>
      </div>
    );

  const doctorDisplayName = selectedDoc?.name
    ? selectedDoc.name.trim().toLowerCase().startsWith("dr.")
      ? selectedDoc.name.trim()
      : `Dr. ${selectedDoc.name.trim()}`
    : "Dr. Unknown";

  const detailFields = selectedDoc
    ? [
        {
          icon: ShieldCheck,
          label: "SLMC Registration",
          value: selectedDoc.slmcNumber,
        },
        {
          icon: Hospital,
          label: "Current Practice",
          value: selectedDoc.hospitalAttached,
        },
        {
          icon: Mail,
          label: "Contact Email",
          value: selectedDoc.email,
        },
        {
          icon: Phone,
          label: "Mobile Number",
          value: selectedDoc.mobileNumber,
        },
        {
          icon: Calendar,
          label: "Date of Birth",
          value: selectedDoc.dob || "N/A",
        },
        {
          icon: Cake,
          label: "Age",
          value: selectedDoc.age != null ? `${selectedDoc.age} years` : "N/A",
        },
        {
          icon: User,
          label: "Gender",
          value: selectedDoc.gender || "N/A",
        },
        {
          icon: MapPin,
          label: "District",
          value: selectedDoc.district || "N/A",
        },
        {
          icon: UserCheck,
          label: "NIC / ID",
          value: selectedDoc.nic,
        },
        {
          icon: ShieldCheck,
          label: "Verification Status",
          value: selectedDoc.approved ? "Verified" : "Pending Review",
        },
        {
          icon: User,
          label: "Profile Completeness",
          value: selectedDoc.profileComplete ? "Complete" : "Incomplete",
        },
        {
          icon: Stethoscope,
          label: "Specialization",
          value: selectedDoc.specialization || "N/A",
        },
      ]
    : [];

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
          Practitioner Verification
        </h1>
        <div style={{ position: "relative", width: "300px" }}>
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SLMC..."
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
        }}
      >
        {["ALL", "PENDING", "VERIFIED", "REJECTED"].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            style={{
              padding: "8px 18px",
              height: "38px",
              fontSize: "13px",
              fontWeight: 600,
              borderRadius: "8px",
              border: "1px solid var(--admin-border)",
              background:
                statusFilter === f
                  ? f === "PENDING"
                    ? "#FEF3C7"
                    : f === "VERIFIED"
                      ? "#dff6ec"
                      : f === "REJECTED"
                        ? "#FEE2E2"
                        : "#dff6ec"
                  : "#FFF",
              color:
                statusFilter === f
                  ? f === "PENDING"
                    ? "#92400E"
                    : f === "VERIFIED"
                      ? "#0f6e56"
                      : f === "REJECTED"
                        ? "#991B1B"
                        : "#0f6e56"
                  : "var(--admin-muted)",
              cursor: "pointer",
              fontFamily: "var(--font-base)",
              transition: "all 0.2s",
            }}
          >
            {f === "ALL"
              ? `All (${doctors.length})`
              : f === "PENDING"
                ? `Pending (${doctors.filter((d) => !d.approved).length})`
                : f === "VERIFIED"
                  ? `Verified (${doctors.filter((d) => d.approved === true).length})`
                  : `Rejected (${doctors.filter((d) => d.rejected === true).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            background: "var(--admin-surface)",
            border: "1px solid var(--admin-border)",
            borderRadius: "12px",
            padding: "60px 32px",
            textAlign: "center",
            color: "var(--admin-muted)",
          }}
        >
          <ShieldCheck size={40} style={{ opacity: 0.4, marginBottom: "12px" }} />
          <p style={{ margin: 0, fontSize: "15px" }}>
            No doctors match the current filter.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "24px",
          }}
        >
          {filtered.map((doc) => (
            <div
              key={doc.id}
              style={{
                background: "var(--admin-surface)",
                border: "1px solid var(--admin-border)",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div
                  className="apt-avatar"
                  style={{
                    width: 50,
                    height: 50,
                    background: "var(--admin-bg)",
                    color: "var(--admin-text)",
                    fontSize: "16px",
                  }}
                >
                  {doc.name?.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      margin: "0 0 4px 0",
                      color: "var(--admin-text)",
                      fontSize: "16px",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Dr. {doc.name}
                  </h4>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span
                      style={{ fontSize: "13px", color: "var(--admin-muted)" }}
                    >
                      {doc.specialization || "General"}
                    </span>
                    <span
                      className={`status-badge ${doc.approved ? "approved" : doc.rejected ? "failed" : "pending"}`}
                    >
                      {doc.approved ? "Verified" : doc.rejected ? "Rejected" : "Pending Review"}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  padding: "16px",
                  background: "#F8FAFC",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "4px" }}
                >
                  <span style={labelStyle}>SLMC LICENSE</span>
                  <span style={valueStyle}>{doc.slmcNumber || "N/A"}</span>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "4px" }}
                >
                  <span style={labelStyle}>HOSPITAL</span>
                  <span style={valueStyle}>{doc.hospitalAttached || "None"}</span>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "4px" }}
                >
                  <span style={labelStyle}>EMAIL</span>
                  <span style={valueStyle} title={doc.email}>
                    {doc.email?.split("@")[0]}...
                  </span>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "4px" }}
                >
                  <span style={labelStyle}>MEMBER ID</span>
                  <span style={valueStyle}>#{doc.id}</span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "auto",
                }}
              >
                {!doc.approved ? (
                  <>
                    <button
                      className="admin-btn-danger"
                      onClick={() => {
                        setRejectTarget(doc);
                        setRejectReason("");
                      }}
                    >
                      <XCircle
                        size={16}
                        style={{
                          display: "inline",
                          verticalAlign: "text-bottom",
                          marginRight: "4px",
                        }}
                      />
                      Reject
                    </button>
                    <button
                      className="admin-btn-primary"
                      onClick={() => {
                        setSelectedDoc(doc);
                        setShowDetails(true);
                      }}
                    >
                      <ShieldCheck
                        size={16}
                        style={{
                          display: "inline",
                          verticalAlign: "text-bottom",
                          marginRight: "4px",
                        }}
                      />{" "}
                      Review & Approve
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="admin-btn-primary"
                      style={{ background: "#0284c7", borderColor: "#0284c7" }}
                      onClick={() => handleOpenFeeModal(doc)}
                    >
                      Set Fee
                    </button>
                    <button
                      className="admin-btn-danger"
                      onClick={() => {
                        setRejectTarget(doc);
                        setRejectReason("");
                      }}
                    >
                      Revoke Verification
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verification Modal */}
      {showDetails && selectedDoc && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="admin-modal large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Doctor Credential Review</h3>
              <button
                className="admin-modal-close"
                onClick={() => setShowDetails(false)}
              >
                <XCircle size={20} />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginBottom: "32px",
                padding: "20px",
                background: "#F8FAFC",
                borderRadius: "12px",
              }}
            >
              <div
                className="apt-avatar"
                style={{
                  width: 64,
                  height: 64,
                  fontSize: "24px",
                  background: "var(--admin-bg)",
                  color: "var(--admin-text)",
                }}
              >
                {selectedDoc.name?.charAt(0)?.toUpperCase() || "D"}
              </div>
              <div>
                <h3
                  style={{
                    margin: "0 0 4px 0",
                    color: "var(--admin-text)",
                    fontFamily: "var(--font-display)",
                    fontSize: "18px",
                  }}
                >
                  {doctorDisplayName}
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "var(--admin-muted)",
                    fontSize: "14px",
                    flexWrap: "wrap",
                  }}
                >
                  <Stethoscope size={14} />
                  <span>
                    {selectedDoc.specialization || "General Physician"}
                  </span>
                  <span>•</span>
                  <span>
                    {selectedDoc.approved ? "Verified" : "Pending Review"}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "24px",
              }}
            >
              {detailFields.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: "12px" }}>
                  <div
                    style={{
                      color: "var(--admin-accent)",
                      background: "#E1F5EE",
                      padding: "8px",
                      borderRadius: "8px",
                      height: "fit-content",
                    }}
                  >
                    <item.icon size={18} color="#0F6E56" />
                  </div>
                  <div>
                    <div style={labelStyle}>{item.label}</div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "var(--admin-text)",
                      }}
                    >
                      {item.value || "Not provided"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "32px",
                padding: "16px",
                background: "#FAEEDA",
                color: "#633806",
                borderRadius: "8px",
                fontSize: "13px",
                display: "flex",
                gap: "12px",
              }}
            >
              <ShieldCheck size={20} style={{ flexShrink: 0 }} />
              <p style={{ margin: 0 }}>
                <strong>Verification Disclaimer:</strong> Confirming this
                verification will enable this user to issue prescriptions, view
                patient records, and conduct video consultations.
              </p>
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn-cancel"
                onClick={() => setShowDetails(false)}
              >
                Cancel
              </button>
              <button
                className="admin-btn-primary"
                disabled={isProcessing}
                onClick={handleApprove}
              >
                {isProcessing ? "Verifying..." : "Confirm Verification"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject with Reason Modal */}
      {rejectTarget && (
        <div
          className="admin-modal-backdrop"
          onClick={() => {
            setRejectTarget(null);
            setRejectReason("");
          }}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {rejectTarget.approved ? "Revoke Verification" : "Reject Doctor Verification"}
              </h3>
              <button
                className="admin-modal-close"
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason("");
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "15px", color: "var(--admin-text)" }}>
                {rejectTarget.approved
                  ? <>You are about to revoke the verification for <strong>Dr. {rejectTarget.name}</strong>. They will lose medical privileges.</>
                  : <>Please provide a reason for rejecting <strong>Dr. {rejectTarget.name}</strong>'s verification.</>}
              </p>
              <p style={{ margin: "8px 0 0", fontSize: "13px", color: "var(--admin-muted)" }}>
                The doctor will be notified via email with your reason.
              </p>
            </div>

            <div style={{ marginBottom: "8px" }}>
              <label style={labelStyle}>REJECTION REASON</label>
              <textarea
                className="admin-input large"
                placeholder="Enter reason for rejection (min 10 characters)..."
                value={rejectReason}
                maxLength={500}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ minHeight: "100px", resize: "vertical" }}
              />
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "12px",
                  color: "var(--admin-muted)",
                }}
              >
                {rejectReason.trim().length}/500 characters (minimum 10)
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn-cancel"
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason("");
                }}
              >
                Cancel
              </button>
              <button
                className="admin-btn-danger"
                disabled={isProcessing || rejectReason.trim().length < 10}
                onClick={handleReject}
              >
                {isProcessing
                  ? "Processing..."
                  : rejectTarget.approved
                    ? "Revoke Verification"
                    : "Reject Verification"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Fee Modal */}
      {feeTarget && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setFeeTarget(null)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Set Consultation Fee</h3>
              <button
                className="admin-modal-close"
                onClick={() => setFeeTarget(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "15px", color: "var(--admin-text)" }}>
                Adjust the base consultation fee for <strong>Dr. {feeTarget.name}</strong>.
              </p>
              <p style={{ margin: "8px 0 0", fontSize: "13px", color: "var(--admin-muted)" }}>
                This amount will be charged to patients at checkout.
              </p>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>FEE AMOUNT (LKR)</label>
              <input
                type="number"
                className="admin-input large"
                placeholder="2500"
                value={feeValue}
                min="0"
                step="100"
                onChange={(e) => setFeeValue(e.target.value)}
              />
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn-cancel"
                onClick={() => setFeeTarget(null)}
              >
                Cancel
              </button>
              <button
                className="admin-btn-primary"
                disabled={feeLoading || !feeValue}
                onClick={handleUpdateFee}
              >
                {feeLoading ? "Saving..." : "Save Fee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const labelStyle = {
  fontSize: "11px",
  fontWeight: 700,
  color: "var(--admin-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};
const valueStyle = {
  fontSize: "14px",
  fontWeight: 600,
  color: "var(--admin-text)",
};

export default DoctorManagement;
