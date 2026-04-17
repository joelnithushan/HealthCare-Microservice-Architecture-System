import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PrescriptionModal from './doctor/PrescriptionModal';

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const stored = localStorage.getItem('user');
        const user = stored && stored !== 'undefined' ? JSON.parse(stored) : null;
        if (!user || !user.id) {
          console.error('User not found');
          setLoading(false);
          return;
        }
        const response = await api.get(`/appointments/user/${user.id}`);
        setAppointments(response.data);
      } catch (err) {
        console.error('Failed to fetch doctor appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flat-card skeleton-card">
          <div className="skeleton skeleton-text short" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text short" />
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <h3>My Patient Appointments</h3>
      <div className="list">
        {appointments.length === 0 ? (
          <p>No appointments scheduled.</p>
        ) : (
          appointments.map(app => (
            <div key={app.id} className="flat-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
              <p><strong>Patient ID:</strong> {app.patientId || 'N/A'}</p>
              <p><strong>Date:</strong> {app.appointmentDate} at {app.appointmentTime}</p>
              <p><strong>Status:</strong> {app.status}</p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
                <button 
                  className="flat-btn"
                  onClick={() => navigate(`/dashboard/consult/${app.id}`)}
                >
                  Start Consultation
                </button>
                <button 
                  className="flat-btn-outline"
                  onClick={() => {
                    setSelectedAppointment(app);
                    setIsPrescriptionModalOpen(true);
                  }}
                >
                  Add Prescription
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedAppointment && (
        <PrescriptionModal 
          isOpen={isPrescriptionModalOpen}
          onClose={() => {
            setIsPrescriptionModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onSuccess={() => {
            // Optional: refresh data or show indication
          }}
        />
      )}
    </div>
  );
};

export default DoctorAppointments;
