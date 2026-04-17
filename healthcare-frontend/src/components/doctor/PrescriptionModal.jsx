import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const PrescriptionModal = ({ isOpen, onClose, appointment, onSuccess }) => {
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

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed for prescriptions');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.medication || !formData.dosage) {
      toast.error('Medication and Dosage are required');
      return;
    }

    setUploading(true);

    try {
      const stored = localStorage.getItem('user');
      const doctor = stored ? JSON.parse(stored) : null;
      if (!doctor || !doctor.id) throw new Error('Doctor session not found');

      const data = new FormData();
      data.append('patientId', appointment.patientId);
      data.append('appointmentId', appointment.id);
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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Prescription added successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add prescription.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3>Add Prescription</h3>
          <button style={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.patientInfo}>
            <p><strong>Patient ID:</strong> {appointment.patientId}</p>
            <p><strong>Appointment:</strong> {appointment.appointmentDate}</p>
          </div>

          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Medication *</label>
              <input type="text" name="medication" value={formData.medication} onChange={handleChange} style={styles.input} required />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Dosage *</label>
              <input type="text" name="dosage" value={formData.dosage} onChange={handleChange} style={styles.input} placeholder="e.g. 500mg" required />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Frequency</label>
              <input type="text" name="frequency" value={formData.frequency} onChange={handleChange} style={styles.input} placeholder="e.g. Twice a day" />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Duration</label>
              <input type="text" name="duration" value={formData.duration} onChange={handleChange} style={styles.input} placeholder="e.g. 5 days" />
            </div>
            
            <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
              <label style={styles.label}>Instructions</label>
              <input type="text" name="instructions" value={formData.instructions} onChange={handleChange} style={styles.input} placeholder="e.g. Take after meals" />
            </div>
            
            <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
              <label style={styles.label}>Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} style={{ ...styles.input, minHeight: '60px' }}></textarea>
            </div>
          </div>

          <div style={styles.fileUploadBox}>
            <label style={styles.label}>Attach Prescription PDF (Optional)</label>
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handleFileChange} 
              style={{ marginTop: '8px', fontSize: '0.9rem' }} 
            />
            {file && <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '4px' }}>Selected: {file.name} ({(file.size/1024/1024).toFixed(2)}MB)</p>}
          </div>

          <div style={styles.actions}>
            <button type="button" className="flat-btn-outline" onClick={onClose} disabled={uploading}>Cancel</button>
            <button type="submit" className="flat-btn" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Save Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  modal: {
    background: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    overflow: 'hidden'
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border-light)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f8fafc'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: 'var(--text-muted)'
  },
  form: {
    padding: '24px'
  },
  patientInfo: {
    background: 'var(--bg-main)',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '0.9rem',
    display: 'flex',
    gap: '24px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '6px'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid var(--border-light)',
    borderRadius: '6px',
    fontSize: '0.95rem'
  },
  fileUploadBox: {
    marginTop: '20px',
    padding: '16px',
    border: '1px dashed var(--border-light)',
    borderRadius: '8px',
    background: '#fafafa'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-light)'
  }
};

export default PrescriptionModal;
