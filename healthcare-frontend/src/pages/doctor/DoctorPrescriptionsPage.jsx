import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../services/api";
import { Plus, Trash2, FilePen, FileText, CheckCircle } from "lucide-react";
import "../../components/DashboardShared.css";

export default function DoctorPrescriptionsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialPatientId = searchParams.get('patientId') || "";

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    patientId: initialPatientId,
    notes: ""
  });
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", instructions: "" }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [doctorProfileId, setDoctorProfileId] = useState(null);

  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      try {
        let doctorId = user.id;
        try {
          const dRes = await api.get(`/doctors/email/${encodeURIComponent(user.email)}`);
          if (dRes.data && dRes.data.id) {
            doctorId = dRes.data.id;
            setDoctorProfileId(dRes.data.id);
          }
        } catch (e) { /* fallback */ }
        const res = await api.get(`/prescriptions/doctor/${doctorId}`);
        setPrescriptions(res.data || []);
      } catch (e) {
         // Fallback mock if endpoint missing
         setPrescriptions([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load past prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    // eslint-disable-next-line
  }, [user.id]);

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", instructions: "" }]);
  };

  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId) return alert("Patient ID is required");
    
    // Validate medicines
    const validMedicines = medicines.filter(m => m.name.trim() !== "");
    if (validMedicines.length === 0) return alert("Please add at least one medicine.");

    try {
      setSubmitting(true);
      
      const docId = doctorProfileId || user.id;

      const payload = {
        patientId: parseInt(formData.patientId),
        doctorId: docId,
        doctorName: user.name,
        diagnosis: "General Consultation", // We can add this to form later if needed
        medications: validMedicines.map(m => ({
            medicationName: m.name,
            strength: "", // Optional
            frequency: m.dosage,
            duration: "", // Optional
            instructions: m.instructions
        })),
        notes: formData.notes || ""
      };

      await api.post(`/prescriptions`, payload);
      
      // Notification is handled by the backend controller

      alert("Prescription issued successfully.");
      setFormData({ patientId: "", notes: "" });
      setMedicines([{ name: "", dosage: "", instructions: "" }]);
      fetchPrescriptions();
    } catch (err) {
      console.error(err);
      alert("Failed to issue prescription.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Digital Prescriptions</h1>
        <p>Issue new prescriptions and view your previously issued medical instructions.</p>
      </div>

      <div className="dash-grid-main">
        {/* Left Col: Issue Prescription Form */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title"><FilePen size={20} /> Issue New Prescription</h2>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Patient ID</label>
                <input type="text" className="form-input" required placeholder="e.g., 5"
                  value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})} />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Medicines</label>
                {medicines.map((med, index) => (
                  <div key={index} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                    <div style={{ flex: 2 }}>
                      <input type="text" className="form-input" placeholder="Medicine Name" required 
                        value={med.name} onChange={e => updateMedicine(index, 'name', e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input type="text" className="form-input" placeholder="Dosage (e.g., 1-0-1)" required
                        value={med.dosage} onChange={e => updateMedicine(index, 'dosage', e.target.value)} />
                    </div>
                    <div style={{ flex: 2 }}>
                      <input type="text" className="form-input" placeholder="Instructions"
                        value={med.instructions} onChange={e => updateMedicine(index, 'instructions', e.target.value)} />
                    </div>
                    <button type="button" onClick={() => removeMedicine(index)} className="btn btn-outline" style={{ padding: "10px", color: "var(--danger)", borderColor: "var(--danger)" }} disabled={medicines.length === 1}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addMedicine} className="btn btn-outline" style={{ fontSize: "0.85rem", padding: "6px 12px", marginTop: "4px" }}>
                  <Plus size={14} /> Add Medicine
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Doctor's Notes / Advice</label>
                <textarea className="form-input" rows="3" placeholder="Drink plenty of water, rest well..."
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }} disabled={submitting}>
                {submitting ? "Issuing..." : "Issue Prescription"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Past Prescriptions */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title"><FileText size={20} /> Previously Issued</h2>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: "300px" }}></div>
            ) : error ? (
              <div style={{ color: "var(--danger)" }}>{error}</div>
            ) : prescriptions.length === 0 ? (
              <div className="empty-state" style={{ padding: "40px 20px" }}>
                <CheckCircle size={40} />
                <p style={{ marginTop: "12px" }}>No prescriptions issued yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {prescriptions.map((pre) => (
                  <div key={pre.id} style={{ display: "flex", flexDirection: "column", padding: "16px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontWeight: '600', color: 'var(--primary)' }}>Patient {pre.patientId}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(pre.issuedDate || new Date()).toLocaleDateString()}</span>
                    </div>
                    <p style={{ margin: "0 0 8px", fontSize: "0.9rem", color: "var(--text-main)" }}>
                      {pre.medications?.length || 0} medicines prescribed.
                    </p>
                    <button className="btn btn-outline" style={{ padding: "4px", fontSize: "0.8rem", width: "max-content" }} onClick={() => window.open(`/patient/dashboard/prescriptions/${pre.id}/print`, '_blank')}>View / Print</button>
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
