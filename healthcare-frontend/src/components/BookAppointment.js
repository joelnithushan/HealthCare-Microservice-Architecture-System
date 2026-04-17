import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { validateAppointmentTime } from '../utils/validations';
import Select from 'react-select';

const validateForm = (data) => {
  const errors = {};
  if (!data.doctorId) errors.doctorId = 'Please select a doctor.';
  if (!data.appointmentDate) errors.appointmentDate = 'Date is required.';
  else {
    const selected = new Date(data.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) errors.appointmentDate = 'Date cannot be in the past.';
  }
  if (!data.appointmentTime) {
    errors.appointmentTime = 'Time is required.';
  } else {
    const timeErr = validateAppointmentTime(data.appointmentDate, data.appointmentTime);
    if (timeErr) errors.appointmentTime = timeErr;
  }
  if (data.notes && data.notes.length > 500) errors.notes = 'Notes must be under 500 characters.';
  return errors;
};

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  });
// Remove message and error states
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/doctors/verified');
        setDoctors(response.data);
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      }
    };
    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleDoctorSelect = (selectedOption) => {
    setFormData({ ...formData, doctorId: selectedOption ? selectedOption.value : '' });
    setFieldErrors(p => ({ ...p, doctorId: '' }));
  };

  const doctorOptions = doctors.map(doctor => ({
    value: doctor.id || doctor.userId,
    label: `Dr. ${doctor.name} — ${doctor.specialization}`
  }));

  const handleBook = async (e) => {
    e.preventDefault();
    const errs = validateForm(formData);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = {
        ...formData,
        patientId: user.id,
        status: 'PENDING'
      };
      await api.post('/appointments', payload);
      toast.success('Appointment booked successfully!');
      setFormData({ doctorId: '', appointmentDate: '', appointmentTime: '', notes: '' });
      setFieldErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={styles.wrapper}>
      <div className="flat-card">
        <div style={styles.cardHeader}>
          <span style={{ fontSize: 32 }}></span>
          <div>
            <h2 style={styles.title}>Schedule Appointment</h2>
            <p style={styles.subtitle}>Choose your doctor and preferred time</p>
          </div>
        </div>

        <form onSubmit={handleBook} noValidate>
          <div className="form-group">
            <label className="flat-label">Select Doctor</label>
            <Select
              options={doctorOptions}
              value={doctorOptions.find(opt => opt.value === formData.doctorId) || null}
              onChange={handleDoctorSelect}
              placeholder="— Search or Choose a Doctor —"
              isClearable
              isSearchable
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: '44px',
                  borderRadius: '8px',
                  borderColor: fieldErrors.doctorId ? 'red' : state.isFocused ? 'var(--primary)' : 'var(--border-light)',
                  boxShadow: state.isFocused ? '0 0 0 1px var(--primary)' : 'none',
                  backgroundColor: 'var(--bg-main)',
                  '&:hover': {
                    borderColor: fieldErrors.doctorId ? 'red' : (state.isFocused ? 'var(--primary)' : 'var(--border-light)')
                  }
                })
              }}
            />
            {fieldErrors.doctorId && <span style={styles.fieldError}>{fieldErrors.doctorId}</span>}
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="flat-label">Date</label>
              <input
                type="date"
                name="appointmentDate"
                className="flat-input"
                value={formData.appointmentDate}
                onChange={handleChange}
                min={todayStr}
                style={fieldErrors.appointmentDate ? { borderColor: 'red' } : {}}
              />
              {fieldErrors.appointmentDate && <span style={styles.fieldError}>{fieldErrors.appointmentDate}</span>}
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="flat-label">Time</label>
              <input
                type="time"
                name="appointmentTime"
                className="flat-input"
                value={formData.appointmentTime}
                onChange={handleChange}
                style={fieldErrors.appointmentTime ? { borderColor: 'red' } : {}}
              />
              {fieldErrors.appointmentTime && <span style={styles.fieldError}>{fieldErrors.appointmentTime}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="flat-label">
              Notes <span style={{ fontWeight: 400 }}>(optional · {formData.notes.length}/500)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="flat-input"
              rows="3"
              maxLength={500}
              placeholder="Describe your symptoms or reason for visit…"
              style={fieldErrors.notes ? { borderColor: 'red' } : {}}
            />
            {fieldErrors.notes && <span style={styles.fieldError}>{fieldErrors.notes}</span>}
          </div>

          <button type="submit" className="flat-btn" disabled={loading}>
            {loading ? 'Booking…' : ' Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    maxWidth: 600,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
    paddingBottom: 20,
    borderBottom: '1px solid var(--border-light)',
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    color: 'var(--text-main)',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: 'var(--text-muted)',
  },
  row: {
    display: 'flex',
    gap: 20,
  },
  fieldError: {
    display: 'block',
    color: '#ef4444',
    fontSize: 12,
    marginTop: 5,
    fontWeight: 500,
  },
};

export default BookAppointment;
