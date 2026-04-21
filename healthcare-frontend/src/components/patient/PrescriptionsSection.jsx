import React, { useState, useEffect } from "react";
import { ClipboardList, Pill, Download } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const PrescriptionsSection = ({ userId }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!userId) return;
      try {
        const res = await api.get(`/prescriptions/patient/${userId}`);
        setPrescriptions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [userId]);

  if (loading)
    return (
      <div className="pat-panel">
        <div className="pat-panel__header">
          <h3 className="pat-panel__title">
            <span
              className="pat-panel__title-icon"
              style={{ background: "#fef3c7", color: "#d97706" }}
            >
              <Pill size={18} />
            </span>
            My Prescriptions
          </h3>
        </div>
        <div className="pat-panel__body">
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text" />
        </div>
      </div>
    );

  return (
    <div className="pat-panel" id="prescriptions">
      <div className="pat-panel__header">
        <h3 className="pat-panel__title">
          <span
            className="pat-panel__title-icon"
            style={{ background: "#fef3c7", color: "#d97706" }}
          >
            <Pill size={18} />
          </span>
          My Prescriptions
        </h3>
      </div>
      <div className="pat-panel__body">
        {prescriptions.length === 0 ? (
          <div className="pat-empty-state">
            <div className="pat-empty-state__icon">
              <ClipboardList size={48} color="#d97706" />
            </div>
            <div className="pat-empty-state__text">No prescriptions found</div>
            <div className="pat-empty-state__sub">
              Your prescriptions will appear here after consultations
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {prescriptions.map((p) => (
              <div
                key={p.id}
                className="flat-card"
                style={{ padding: "16px", fontSize: "0.9rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <strong style={{ color: "var(--primary)" }}>
                    {p.medication}
                  </strong>
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    {new Date(p.issuedDate).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>Dosage:</span> {p.dosage}
                  </div>
                  {p.instructions && (
                    <div>
                      <span style={{ fontWeight: 600 }}>Instructions:</span>{" "}
                      {p.instructions}
                    </div>
                  )}
                </div>
                {p.prescriptionPdfUrl && (
                  <button
                    type="button"
                    className="pat-btn pat-btn--outline"
                    style={{
                      padding: "4px 12px",
                      fontSize: "0.8rem",
                      width: "100%",
                      textAlign: "center",
                      display: "block",
                    }}
                    onClick={async () => {
                      try {
                        const downloadPath = p.prescriptionPdfUrl.startsWith(
                          "/api",
                        )
                          ? p.prescriptionPdfUrl.replace(/^\/api/, "")
                          : p.prescriptionPdfUrl;
                        const response = await api.get(downloadPath, {
                          responseType: "blob",
                        });
                        const blobUrl = window.URL.createObjectURL(
                          new Blob([response.data]),
                        );
                        const link = document.createElement("a");
                        link.href = blobUrl;
                        link.setAttribute(
                          "download",
                          `prescription-${p.id}.pdf`,
                        );
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(blobUrl);
                      } catch (err) {
                        toast.error("Failed to download prescription PDF.");
                      }
                    }}
                  >
                    <Download
                      size={14}
                      style={{ marginRight: 8, display: "inline" }}
                    />
                    View PDF
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionsSection;
