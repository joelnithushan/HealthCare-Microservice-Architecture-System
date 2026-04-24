import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { FileUp, FileText, Download, Trash2, AlertCircle, ChevronLeft, Activity } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import "../../components/DashboardShared.css";

export default function PatientReportsPage() {
  const { patientId: urlPatientId } = useParams();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [uploadData, setUploadData] = useState({ title: "", description: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Preview State
  const [previewReport, setPreviewReport] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [deleteConfig, setDeleteConfig] = useState({ isOpen: false, reportId: null });

  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  // Determine whose reports to fetch
  const targetId = urlPatientId || user?.id;
  const isDoctorViewing = user?.role === 'DOCTOR' && urlPatientId;

  const fetchReports = async () => {
    if (!targetId) return;
    try {
      setLoading(true);
      const res = await api.get(`/users/${targetId}/reports`);
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
  }, [user.id, targetId]);

  const handlePreview = async (report) => {
    try {
      setPreviewLoading(true);
      setPreviewReport(report);
      
      const res = await api.get(`/users/reports/${report.id}`, {
        responseType: 'blob'
      });
      
      const url = URL.createObjectURL(res.data);
      setPreviewUrl(url);
    } catch (err) {
      console.error(err);
      alert("Failed to load preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewReport(null);
  };

  const handleFileChange = (e) => {
    setUploadError(null);
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // Increased to 10MB
      setUploadError("File size should not exceed 10MB.");
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
    // Auto-fill title if empty
    if (!uploadData.title) {
      const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      setUploadData(prev => ({ ...prev, title: nameWithoutExt }));
    }
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
      setUploadError("Failed to upload report. Please check file size or network.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (reportId) => {
    setDeleteConfig({ isOpen: true, reportId });
  };

  const executeDelete = async () => {
    const { reportId } = deleteConfig;
    if (!reportId) return;
    setDeleteConfig({ isOpen: false, reportId: null });
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isDoctorViewing && (
            <button className="btn btn-outline" style={{ padding: '8px' }} onClick={() => navigate(-1)}>
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h1>{isDoctorViewing ? `Patient Medical Reports` : "Medical Reports"}</h1>
            <p>{isDoctorViewing ? `Viewing uploaded records for Patient ID: ${urlPatientId}` : "Securely store and share your test results and medical documents."}</p>
          </div>
        </div>
      </div>

      <div className={isDoctorViewing ? "" : "dash-grid-main"}>
        {/* Left Col: Upload Form */}
        {!isDoctorViewing && (
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
                <label className="form-label">Select File (PDF or Image, max 10MB)</label>
                <input type="file" className="form-input" accept=".pdf,image/*" onChange={handleFileChange} ref={fileInputRef} style={{ paddingTop: '8px' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload Report"}
              </button>
            </form>
          </div>
        </div>
        )}

        {/* Right Col: Reports List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title"><FileText size={20} /> {isDoctorViewing ? "Patient Reports" : "My Uploaded Reports"}</h2>
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
                  <div key={report.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", backgroundColor: "white" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ backgroundColor: "#F1F5F9", width: "40px", height: "40px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 style={{ margin: "0 0 4px", color: "var(--text-main)", fontSize: "1rem", fontWeight: "600" }}>{report.title || report.fileName}</h4>
                        <p style={{ margin: "0", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                          {new Date(report.uploadDate).toLocaleDateString()} • {report.fileType?.split('/')[1]?.toUpperCase() || "FILE"}
                        </p>
                        {report.description && (
                           <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>{report.description}</p>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn btn-outline" style={{ padding: "8px" }} title="Preview" onClick={() => handlePreview(report)}>
                        <Activity size={16} />
                      </button>
                      <button className="btn btn-outline" style={{ padding: "8px" }} title="Download" onClick={() => {
                        const link = document.createElement('a');
                        link.href = `${api.defaults.baseURL}/users/reports/${report.id}`;
                        link.setAttribute('download', report.fileName);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}>
                        <Download size={16} />
                      </button>
                      {!isDoctorViewing && (
                        <button className="btn btn-outline" style={{ padding: "8px", color: "var(--danger)", borderColor: "var(--danger)" }} title="Delete" onClick={() => handleDeleteClick(report.id)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '40px' }}>
          <div className="dash-card" style={{ width: '100%', maxWidth: '900px', maxHeight: '100%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
              <div>
                <h3 style={{ margin: 0 }}>{previewReport.title}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{previewReport.fileName}</span>
              </div>
              <button className="btn btn-outline" onClick={closePreview}>Close</button>
            </div>
            <div style={{ flex: 1, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', minHeight: '500px' }}>
              {previewLoading ? (
                <div className="skeleton" style={{ width: '80%', height: '80%' }}></div>
              ) : previewUrl ? (
                previewReport.fileType.startsWith('image/') ? (
                  <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : previewReport.fileType === 'application/pdf' ? (
                  <iframe src={previewUrl} title="PDF Preview" style={{ width: '100%', height: '700px', border: 'none' }}></iframe>
                ) : (
                  <div className="empty-state">
                    <AlertCircle size={40} />
                    <p>Preview not available for this file type.</p>
                    <button className="btn btn-primary" onClick={() => window.open(previewUrl, '_blank')}>Open in New Tab</button>
                  </div>
                )
              ) : (
                <p>Failed to load preview.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfig.isOpen}
        title="Delete Report"
        message="Are you sure you want to delete this medical report? This action cannot be undone."
        confirmLabel="Delete Report"
        tone="danger"
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfig({ isOpen: false, reportId: null })}
      />
    </div>
  );
}
