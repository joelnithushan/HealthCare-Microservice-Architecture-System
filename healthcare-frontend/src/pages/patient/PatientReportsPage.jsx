import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { FileUp, FileText, Download, Trash2, AlertCircle } from "lucide-react";
import "../../components/DashboardShared.css";

export default function PatientReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [uploadData, setUploadData] = useState({ title: "", description: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${user.id}/reports`);
      setReports(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load medical reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, [user.id]);

  const handleFileChange = (e) => {
    setUploadError(null);
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size should not exceed 5MB.");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    
    // Only allow pdf or images
    if (!file.type.match('application/pdf') && !file.type.match('image/.*')) {
      setUploadError("Only PDF and image files are allowed.");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError("Please select a file to upload.");
      return;
    }
    if (!uploadData.title) {
      setUploadError("Please provide a title for the report.");
      return;
    }
    
    setUploading(true);
    setUploadError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", uploadData.title);
      formData.append("description", uploadData.description);
      formData.append("patientId", user.id);

      // Attempt multipart upload
      await api.post(`/users/${user.id}/reports`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadData({ title: "", description: "" });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      fetchReports();
    } catch (err) {
      console.error(err);
      setUploadError("Failed to upload report. The backend may not fully support multipart. Please try again later.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await api.delete(`/users/reports/${reportId}`);
      setReports(reports.filter(r => r.id !== reportId));
    } catch (err) {
      alert("Failed to delete report.");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Medical Reports</h1>
        <p>Securely store and share your test results and medical documents.</p>
      </div>

      <div className="dash-grid-main">
        {/* Left Col: Upload Form */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title"><FileUp size={20} /> Upload New Report</h2>
            </div>
            
            {uploadError && (
              <div style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger)", padding: "12px", borderRadius: "var(--radius-md)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                <AlertCircle size={16} /> {uploadError}
              </div>
            )}

            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label className="form-label">Report Title *</label>
                <input type="text" className="form-input" required placeholder="e.g., Blood Test Results"
                  value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea className="form-input" rows="2" placeholder="Any additional notes..."
                  value={uploadData.description} onChange={e => setUploadData({...uploadData, description: e.target.value})}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Select File (PDF or Image, max 5MB)</label>
                <input type="file" className="form-input" accept=".pdf,image/*" onChange={handleFileChange} ref={fileInputRef} style={{ paddingTop: '8px' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload Report"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Reports List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title"><FileText size={20} /> My Uploaded Reports</h2>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: "200px" }}></div>
            ) : error ? (
              <div style={{ color: "var(--danger)" }}>{error}</div>
            ) : reports.length === 0 ? (
              <div className="empty-state" style={{ padding: "40px 20px" }}>
                <FileText size={40} />
                <p style={{ marginTop: "12px" }}>No reports uploaded yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {reports.map((report) => (
                  <div key={report.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ backgroundColor: "#F1F5F9", width: "40px", height: "40px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 style={{ margin: "0 0 4px", color: "var(--text-main)", fontSize: "0.95rem" }}>{report.title}</h4>
                        <p style={{ margin: "0", color: "var(--text-muted)", fontSize: "0.8rem" }}>{new Date(report.uploadDate || report.createdAt).toLocaleDateString()} • {report.fileType || "PDF"}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn btn-outline" style={{ padding: "6px" }} title="Download" onClick={() => window.open(report.fileUrl, '_blank')}>
                        <Download size={16} />
                      </button>
                      <button className="btn btn-outline" style={{ padding: "6px", color: "var(--danger)", borderColor: "var(--danger)" }} title="Delete" onClick={() => handleDelete(report.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
