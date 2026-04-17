import React, { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { validateAppointmentTime } from '../../utils/validations';

const BookingModal = ({ isOpen, onClose, doctor, patientId, patientName, onBookSuccess }) => {
  const [form, setForm] = useState({
    date: '',
    time: '',
    type: 'IN_PERSON' // IN_PERSON or VIDEO
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !doctor) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.date || !form.time) {
      toast.error('Please select both date and time');
      return;
    }

    const timeErr = validateAppointmentTime(form.date, form.time);
    if (timeErr) {
      toast.error(timeErr);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        doctorId: doctor.id,
        doctorName: doctor.name || [doctor.firstName, doctor.lastName].filter(Boolean).join(' '),
        patientId,
        patientName,
        appointmentDate: form.date,
        appointmentTime: form.time,
        appointmentType: form.type,
        status: 'PENDING'
      };

      const res = await api.post('/appointments', payload);
      toast.success('Appointment booked successfully!');
      onBookSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="pat-modal-overlay" onClick={onClose}>
      <div className="pat-modal" onClick={e => e.stopPropagation()}>
        <div className="pat-modal__header">
          <h3 className="pat-modal__title">Book Appointment</h3>
          <button className="pat-modal__close" onClick={onClose}></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="pat-modal__body">
            <div style={{ marginBottom: '20px', padding: '14px 16px', background: 'var(--primary-light)', border: '1px solid rgba(15,76,129,0.1)', borderRadius: '10px' }}>
              <strong style={{ color: 'var(--navy)' }}>Doctor:</strong> Dr. {doctor.name || [doctor.firstName, doctor.lastName].filter(Boolean).join(' ')} <br/>
              <strong style={{ color: 'var(--navy)' }}>Specialization:</strong> {doctor.specialization}
            </div>

            <div className="pat-form-group">
              <label className="pat-form-label">Consultation Type</label>
              <select 
                name="type" 
                value={form.type} 
                onChange={handleChange}
                className="pat-form-select"
              >
                <option value="IN_PERSON">In-Person Consultation</option>
                <option value="VIDEO">Video Consultation</option>
              </select>
            </div>

            <div className="pat-grid-2-col" style={{ gap: '16px', marginBottom: '0' }}>
              <div className="pat-form-group">
                <label className="pat-form-label">Date</label>
                <input 
                  type="date" 
                  name="date" 
                  value={form.date} 
                  onChange={handleChange}
                  min={today}
                  className="pat-form-input"
                  required
                />
              </div>

              <div className="pat-form-group">
                <label className="pat-form-label">Time</label>
                <input 
                  type="time" 
                  name="time" 
                  value={form.time} 
                  onChange={handleChange}
                  className="pat-form-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pat-modal__footer">
            <button type="button" className="pat-btn pat-btn--danger" onClick={onClose}>Cancel</button>
            <button type="submit" className="pat-btn pat-btn--primary" disabled={submitting}>
              {submitting ? 'Booking...' : 'Confirm Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

BookingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  doctor: PropTypes.object,
  patientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  patientName: PropTypes.string.isRequired,
  onBookSuccess: PropTypes.func.isRequired
};

export default BookingModal;
