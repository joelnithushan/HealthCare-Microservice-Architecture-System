import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function PrescriptionPrintPage() {
    const { id } = useParams();
    const [prescription, setPrescription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrescription = async () => {
            try {
                // Actually we need to fetch prescription by ID, but doctor-service doesn't have an endpoint for it yet.
                // Or maybe we can fetch all for patient and filter.
                const userStr = localStorage.getItem("user");
                const user = userStr ? JSON.parse(userStr) : null;
                if (!user) throw new Error("Not logged in");

                let res;
                if (user.role === 'DOCTOR') {
                    let doctorId = user.id;
                    try {
                        const dRes = await api.get(`/doctors/email/${encodeURIComponent(user.email)}`);
                        if (dRes.data && dRes.data.id) doctorId = dRes.data.id;
                    } catch (e) { }
                    res = await api.get(`/prescriptions/doctor/${doctorId}`);
                } else {
                    res = await api.get(`/prescriptions/patient/${user.id}`);
                }

                const p = res.data.find(x => x.id === parseInt(id));
                if (p) {
                    setPrescription(p);
                } else {
                    setError("Prescription not found.");
                }
            } catch (err) {
                setError("Failed to load prescription.");
            } finally {
                setLoading(false);
            }
        };
        fetchPrescription();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!prescription) return <div>No data.</div>;

    return (
        <div className="print-container">
            <div className="print-header">
                <div className="hospital-details">
                    <h2>Clinexa Clinic</h2>
                    <p>123 Health Ave, Medical District</p>
                    <p>Phone: (555) 123-4567 | Email: care@clinexa.com</p>
                </div>
                <div className="doctor-details">
                    <h3>Dr. {prescription.doctorName || `Doctor #${prescription.doctorId}`}</h3>
                </div>
            </div>

            <hr />

            <div className="patient-details">
                <div>
                    <p><strong>Patient Name:</strong> {prescription.patientName || `Patient #${prescription.patientId}`}</p>
                    <p><strong>Patient ID:</strong> {prescription.patientId}</p>
                </div>
                <div>
                    <p><strong>Date Issued:</strong> {new Date(prescription.issuedDate).toLocaleDateString()} {new Date(prescription.issuedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
                </div>
            </div>

            <div className="medications-section">
                <h3>Medications Rx</h3>
                <table className="med-table">
                    <thead>
                        <tr>
                            <th>Medicine</th>
                            <th>Dosage/Frequency</th>
                            <th>Instructions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prescription.medications && prescription.medications.map((m, idx) => (
                            <tr key={idx}>
                                <td>{m.medicationName}</td>
                                <td>{m.frequency}</td>
                                <td>{m.instructions}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="notes-section">
                <h3>Doctor's Advice / Notes</h3>
                <p>{prescription.notes || "No additional notes."}</p>
            </div>

            <div className="print-footer">
                <button onClick={() => window.print()} className="print-btn">Print Prescription</button>
            </div>
            
            <style>{`
                .print-container { max-width: 800px; margin: 40px auto; padding: 40px; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; color: #333; font-family: 'Inter', sans-serif; }
                .print-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                .hospital-details h2 { margin: 0 0 5px; color: #0F4C81; }
                .hospital-details p { margin: 2px 0; font-size: 0.9rem; color: #666; }
                .doctor-details h3 { margin: 0; color: #222; }
                hr { border: 0; border-top: 2px solid #0F4C81; margin: 20px 0; }
                .patient-details { margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .patient-details p { margin: 0; }
                .med-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                .med-table th, .med-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                .med-table th { background-color: #f8f9fa; color: #0F4C81; }
                .notes-section { margin-top: 30px; padding: 20px; background: #f8f9fa; border-left: 4px solid #0F4C81; }
                .print-footer { margin-top: 40px; text-align: center; }
                .print-btn { background: #0F4C81; color: white; border: none; padding: 10px 20px; font-size: 1rem; border-radius: 4px; cursor: pointer; }
                @media print {
                    .print-btn { display: none; }
                    .print-container { box-shadow: none; margin: 0; padding: 0; }
                }
            `}</style>
        </div>
    );
}
