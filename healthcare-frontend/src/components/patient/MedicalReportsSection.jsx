import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MedicalReportsSection = ({ userId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/users/${userId}/reports`);
      setReports(res.data || []);
    } catch (err) {
      console.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF and image files are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/users/${userId}/reports`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReports(prev => [res.data, ...prev]);
      toast.success('Report uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload report.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };



  const handleDownload = (reportId, fileName) => {
    window.open(`http://localhost:8080/api/users/reports/${reportId}`, '_blank');
  };

  const getFileIcon = (type) => {
    if (type && type.includes('pdf')) return '';
    if (type && type.includes('image')) return '';
    return '';
  };

  return (
    <div className="pat-panel">
      <div className="pat-panel__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="pat-panel__title">
          <span className="pat-panel__title-icon" style={{ background: '#fce7f3', color: '#db2777' }}>📝</span>
          Medical Reports
        </h3>
        <label style={s.uploadBtn}>
          {uploading ? 'Uploading...' : 'Upload Report'}
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
        </label>
      </div>
      <div className="pat-panel__body pat-panel__body--no-pad">
        {loading ? (
          <div style={{ padding: '20px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="pat-empty-state">
            <div className="pat-empty-state__icon">📄</div>
            <div className="pat-empty-state__text">No medical reports uploaded yet</div>
            <div className="pat-empty-state__sub">Upload your lab results, scans, or prescriptions</div>
          </div>
        ) : (
          <table className="pat-table">
            <thead>
              <tr>
                <th>File</th>
                <th>Type</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id}>
                  <td style={{ fontWeight: 600 }}>
                    <span style={{ marginRight: 8 }}>{getFileIcon(report.fileType)}</span>
                    {report.fileName || 'Untitled'}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {report.fileType || 'Unknown'}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {report.uploadDate ? new Date(report.uploadDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={s.actionBtn} onClick={() => handleDownload(report.id, report.fileName)}>
                        Download
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const s = {
  uploadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 16px',
    background: 'var(--primary)',
    color: '#fff',
    fontSize: '0.78rem',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px',
  },
  actionBtn: {
    padding: '5px 12px',
    fontSize: '0.7rem',
    fontWeight: 600,
    border: '1px solid var(--border-light)',
    background: 'var(--bg-white)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.15s',
  },
  deleteBtn: {
    border: '1px solid #fca5a5',
    color: '#dc2626',
  },
};

MedicalReportsSection.propTypes = {
  userId: PropTypes.number,
};

export default MedicalReportsSection;
