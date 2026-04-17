import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ConsultationSidePanel = ({ appointment, appointmentId }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('prescription');
  const [notes, setNotes] = useState('');
  
  const [formData, setFormData] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: '',
    instructions: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchPatientInfo = async () => {
      if (!appointment && !appointmentId) return;
      try {
        let appt = appointment;
        if (!appt && appointmentId) {
          const res = await api.get(`/appointments/${appointmentId}`);
          appt = res.data;
        }
        
        // Fetch patient details
        const patientRes = await api.get(`/users/${appt.patientId}`);
        setPatient(patientRes.data);
      } catch (err) {
        console.error('Failed to fetch patient context');
      } finally {
        setLoading(false);
      }
    };
    fetchPatientInfo();
  }, [appointment, appointmentId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a PDF file');
    }
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    if (!formData.medication || !formData.dosage) {
      toast.error('Medication and Dosage are required');
      return;
    }

    setUploading(true);
    try {
      const stored = localStorage.getItem('user');
      const doctor = stored ? JSON.parse(stored) : null;
      
      const data = new FormData();
      data.append('patientId', appointment?.patientId || patient?.id);
      data.append('appointmentId', appointmentId);
      data.append('medication', formData.medication);
      data.append('dosage', formData.dosage);
      data.append('frequency', formData.frequency);
      data.append('duration', formData.duration);
      data.append('notes', formData.notes);
      data.append('instructions', formData.instructions);

      if (file) {
        data.append('file', file);
      }

      await api.post(`/prescriptions?doctorId=${doctor.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Prescription saved successfully!');
      // Reset form
      setFormData({ medication: '', dosage: '', frequency: '', duration: '', notes: '', instructions: '' });
      setFile(null);
    } catch (error) {
      toast.error('Failed to save prescription');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div style={{ padding: '20px', color: '#fff' }}>Loading patient context...</div>;

  return (
    <div style={styles.panel}>
      {/* Patient Header */}
      <div style={styles.patientHeader}>
        <div style={styles.patientName}>{patient?.name || 'Unknown Patient'}</div>
        <div style={styles.patientMeta}>ID: {patient?.id} • {patient?.gender || 'N/A'} • {patient?.age || 'N/A'} yrs</div>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        <button 
          style={{ ...styles.tab, borderBottom: activeTab === 'prescription' ? '2px solid var(--primary)' : 'none' }}
          onClick={() => setActiveTab('prescription')}
        >Prescription</button>
        <button 
          style={{ ...styles.tab, borderBottom: activeTab === 'notes' ? '2px solid var(--primary)' : 'none' }}
          onClick={() => setActiveTab('notes')}
        >Private Notes</button>
      </div>

      <div style={styles.tabContent}>
        {activeTab === 'prescription' ? (
          <form onSubmit={handleSubmitPrescription} style={styles.form}>
            <div style={styles.fieldGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Medication*</label>
                <input name="medication" value={formData.medication} onChange={handleChange} style={styles.input} required />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Dosage*</label>
                <input name="dosage" value={formData.dosage} onChange={handleChange} style={styles.input} placeholder="500mg" required />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Frequency</label>
                <input name="frequency" value={formData.frequency} onChange={handleChange} style={styles.input} placeholder="Twice a day" />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Duration</label>
                <input name="duration" value={formData.duration} onChange={handleChange} style={styles.input} placeholder="7 days" />
              </div>
            </div>
            
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Instructions</label>
              <textarea name="instructions" value={formData.instructions} onChange={handleChange} style={{ ...styles.input, height: '60px' }} />
            </div>

            <div style={styles.uploadArea}>
              <label style={styles.label}>Attach PDF</label>
              <input type="file" accept=".pdf" onChange={handleFileChange} style={{ fontSize: '0.8rem' }} />
            </div>

            <button type="submit" className="flat-btn" style={{ width: '100%', marginTop: 'auto' }} disabled={uploading}>
              {uploading ? 'Saving...' : 'Save Prescription'}
            </button>
          </form>
        ) : (
          <div style={styles.notesArea}>
            <label style={styles.label}>Consultation Notes (Private)</label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Enter your observations here..." 
              style={styles.notesTextarea}
            />
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>Notes are saved only during this session.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  panel: {
    width: '350px',
    background: '#1e293b',
    color: '#f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    borderLeft: '1px solid #334155',
  },
  patientHeader: {
    padding: '20px',
    background: '#0f172a',
    borderBottom: '1px solid #334155',
  },
  patientName: {
    fontSize: '1.2rem',
    fontWeight: 700,
    marginBottom: '4px',
  },
  patientMeta: {
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  tabBar: {
    display: 'flex',
    background: '#0f172a',
  },
  tab: {
    flex: 1,
    padding: '12px',
    background: 'none',
    border: 'none',
    color: '#cbd5e1',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  tabContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: '16px',
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#94a3b8',
  },
  input: {
    background: '#334155',
    border: '1px solid #475569',
    borderRadius: '6px',
    padding: '8px 10px',
    color: '#fff',
    fontSize: '0.9rem',
  },
  uploadArea: {
    background: '#0f172a',
    padding: '12px',
    borderRadius: '8px',
    border: '1px dashed #475569',
  },
  notesArea: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  notesTextarea: {
    flex: 1,
    background: '#334155',
    border: '1px solid #475569',
    borderRadius: '6px',
    padding: '12px',
    color: '#fff',
    fontSize: '0.95rem',
    resize: 'none',
    minHeight: '300px',
  }
};

export default ConsultationSidePanel;
