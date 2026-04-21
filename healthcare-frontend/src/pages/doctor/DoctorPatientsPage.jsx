import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Users, FileText, Activity, Clock } from "lucide-react";
import "../../components/DashboardShared.css";

export default function DoctorPatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get(`/appointments/doctor/${user.id}`);
        // Extract unique patients with their latest appointment
        const patientMap = new Map();
        
        res.data.forEach(appt => {
           if (!patientMap.has(appt.patientId)) {
             patientMap.set(appt.patientId, {
               id: appt.patientId,
               lastConsultationDate: appt.appointmentDate,
               totalVisits: 1,
               status: appt.status
             });
           } else {
             const existing = patientMap.get(appt.patientId);
             existing.totalVisits += 1;
             if (new Date(appt.appointmentDate) > new Date(existing.lastConsultationDate)) {
               existing.lastConsultationDate = appt.appointmentDate;
             }
           }
        });
        
        setPatients(Array.from(patientMap.values()).sort((a,b) => new Date(b.lastConsultationDate) - new Date(a.lastConsultationDate)));
      } catch (err) {
        console.error(err);
        setError("Failed to load patient records.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [user.id]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Patients</h1>
        <p>Review the medical history and records of patients you have consulted.</p>
      </div>

      <div className="dash-card">
        {loading ? (
           <div className="skeleton" style={{ height: "400px" }}></div>
        ) : error ? (
           <div style={{ color: "var(--danger)", padding: "24px 0" }}>{error}</div>
        ) : patients.length === 0 ? (
           <div className="empty-state">
             <Users size={40} />
             <p style={{ marginTop: "12px" }}>You have no recorded patients yet.</p>
           </div>
        ) : (
          <div className="dash-grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {patients.map(p => (
              <div key={p.id} className="dash-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success)', border: '1px solid rgba(21, 128, 61, 0.1)' }}>
                    P{p.id}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: 'var(--text-main)' }}>Patient {p.id}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> Last Visit: {new Date(p.lastConsultationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '600', color: 'var(--primary)' }}>{p.totalVisits}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Visits</span>
                  </div>
                  <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
                     <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--success)', marginTop: '4px' }}>Active</span>
                  </div>
                </div>
                
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                    <FileText size={16} /> View Uploaded Reports
                  </button>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate(`/doctor/dashboard/prescriptions?patientId=${p.id}`)}>
                    <Activity size={16} /> Issue Prescription
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
