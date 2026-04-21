import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { CheckCircle, FileText, Info } from "lucide-react";
import "../../components/DashboardShared.css";

export default function PatientConsultationsPage() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const res = await api.get(`/appointments/user/${user.id}`);
        // Filter only COMPLETED appointments to represent past consultations
        const completed = res.data.filter(a => a.status === 'COMPLETED');
        completed.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
        
        setConsultations(completed);
      } catch (err) {
        console.error(err);
        setError("Failed to load past consultations.");
      } finally {
        setLoading(false);
      }
    };
    fetchConsultations();
  }, [user.id]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Past Consultations</h1>
        <p>View history of your completed medical visits.</p>
      </div>

      <div className="dash-card">
        {loading ? (
          <div className="skeleton" style={{ height: "300px" }}></div>
        ) : error ? (
          <div style={{ color: "var(--danger)", padding: "24px 0" }}>{error}</div>
        ) : consultations.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={32} />
            <p>You have no completed consultations yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Doctor</th>
                  <th>Consultation Type</th>
                  <th>Notes/Summary</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{new Date(c.appointmentDate).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.appointmentTime}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>Dr. {c.doctorName || 'Unknown'}</div>
                    </td>
                    <td>
                      <span className="badge badge-info">{c.appointmentType || 'PHYSICAL'}</span>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.notes || 'No specific notes recorded.'}
                      </p>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => navigate('/patient/dashboard/prescriptions')}>
                        <FileText size={14} /> Prescriptions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
