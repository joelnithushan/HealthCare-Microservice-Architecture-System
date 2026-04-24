import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FileText, Printer, Activity, Calendar } from "lucide-react";
import "../../components/DashboardShared.css";

export default function PatientPrescriptionsPage() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await api.get(`/prescriptions/patient/${user.id}`);
        const pre = res.data || [];
        pre.sort((a, b) => new Date(b.issuedDate || 0) - new Date(a.issuedDate || 0));
        setPrescriptions(pre);
      } catch (err) {
        console.error(err);
        setError("Failed to load prescriptions.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [user.id]);

  const handlePrint = (pre) => {
    navigate(`prescriptions/${pre.id}/print`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Prescriptions</h1>
        <p>Review medications and instructions prescribed by your doctors.</p>
      </div>

      <div className="dash-card">
        {loading ? (
          <div className="skeleton" style={{ height: "300px" }}></div>
        ) : error ? (
          <div style={{ color: "var(--danger)", padding: "24px 0" }}>{error}</div>
        ) : prescriptions.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} />
            <p style={{ marginTop: "12px" }}>No prescriptions found.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {prescriptions.map((pre) => (
              <div key={pre.id} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px", display: "flex", alignItems: "center", gap: "6px", fontSize: "1.1rem", color: "var(--primary)" }}>
                      <Activity size={18} /> Prescription #{pre.id}
                    </h3>
                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Calendar size={14} /> Issued on {new Date(pre.issuedDate).toLocaleDateString()} by Dr. {pre.doctorName || `Doctor #${pre.doctorId}`}
                    </p>
                    {pre.diagnosis && (
                      <p style={{ margin: "4px 0 0", color: "var(--text-main)", fontSize: "0.9rem" }}>
                        <strong>Diagnosis:</strong> {pre.diagnosis}
                      </p>
                    )}
                  </div>
                  <button className="btn btn-outline" onClick={() => handlePrint(pre)}>
                    <Printer size={16} /> Print
                  </button>
                </div>
                
                <div>
                  <h4 style={{ margin: "0 0 8px", fontSize: "0.9rem", color: "var(--text-main)" }}>Medications:</h4>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {pre.medications && pre.medications.map((med, idx) => (
                      <li key={idx} style={{ marginBottom: "4px" }}>
                        <strong style={{ color: "var(--text-main)" }}>{med.medicationName}</strong> — {med.frequency} {med.instructions ? `(${med.instructions})` : ""}
                      </li>
                    ))}
                    {(!pre.medications || pre.medications.length === 0) && (
                      <li>No medications listed.</li>
                    )}
                  </ul>
                </div>
                
                {pre.notes && (
                  <div style={{ backgroundColor: "#F1F5F9", padding: "12px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    <strong>Doctor's Notes:</strong> {pre.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
