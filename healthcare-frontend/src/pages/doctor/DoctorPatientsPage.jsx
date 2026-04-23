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
        let doctorId = user.id;
        try {
          const dRes = await api.get(`/doctors/email/${encodeURIComponent(user.email)}`);
          if (dRes.data && dRes.data.id) doctorId = dRes.data.id;
        } catch (e) { /* fallback to user.id if lookup fails */ }

        const res = await api.get(`/appointments/doctor/${doctorId}`);
        // Extract unique patients with their latest appointment and name
        const patientMap = new Map();
        
        res.data.forEach(appt => {
           if (!patientMap.has(appt.patientId)) {
             patientMap.set(appt.patientId, {
               id: appt.patientId,
               name: appt.patientName || `Patient ${appt.patientId}`,
               lastConsultationDate: appt.appointmentDate,
               totalVisits: 1,
               status: appt.status
             });
           } else {
             const existing = patientMap.get(appt.patientId);
             existing.totalVisits += 1;
             if (new Date(appt.appointmentDate) > new Date(existing.lastConsultationDate)) {
               existing.lastConsultationDate = appt.appointmentDate;
               if (appt.patientName) existing.name = appt.patientName;
             }
           }
        });
        
        const patientList = Array.from(patientMap.values());
        
        // Fetch full profiles for each patient to get Age, Gender, NIC, etc.
        const enrichedPatients = await Promise.all(patientList.map(async (p) => {
          try {
            const pRes = await api.get(`/users/${p.id}`);
            return { ...p, ...pRes.data };
          } catch (e) {
            return p;
          }
        }));

        setPatients(enrichedPatients.sort((a,b) => new Date(b.lastConsultationDate) - new Date(a.lastConsultationDate)));
      } catch (err) {
        console.error(err);
        setError("Failed to load patient records.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [user.id, user.email]);

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
          <div className="dash-grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {patients.map(p => (
              <div key={p.id} className="dash-card patient-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', transition: 'transform 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '18px', backgroundColor: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)', border: '1px solid rgba(15, 110, 86, 0.1)' }}>
                    {p.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: '700' }}>{p.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} /> Last Visit: {new Date(p.lastConsultationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(248, 250, 252, 0.8)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Age</span>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{p.age || 'N/A'} yrs</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gender</span>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{p.gender || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>NIC</span>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{p.nic || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contact</span>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{p.mobileNumber || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div style={{ paddingTop: '12px', borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Visits</span>
                      <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>{p.totalVisits}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <span className="badge badge-success" style={{ padding: '4px 10px', fontSize: '0.7rem' }}>Active</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', gap: '8px' }} onClick={() => navigate(`/doctor/dashboard/reports/${p.id}`)}>
                    <FileText size={18} /> View Medical Reports
                  </button>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', gap: '8px' }} onClick={() => navigate(`/doctor/dashboard/prescriptions?patientId=${p.id}`)}>
                    <Activity size={18} /> Issue New Prescription
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
