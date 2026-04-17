import React from 'react';
import PropTypes from 'prop-types';

const DoctorCard = ({ doctor, onBook }) => {
  // Extract initials for the placeholder photo
  const initials = doctor.name ? doctor.name.substring(0, 2).toUpperCase() : 'DR';

  return (
    <div className="pat-doctor-card">
      <div className="pat-doctor-photo">{initials}</div>
      <div className="pat-doctor-name">Dr. {doctor.name || [doctor.firstName, doctor.lastName].filter(Boolean).join(' ') || 'Unknown'}</div>
      <div className="pat-doctor-spec">{doctor.specialization || 'General Practitioner'}</div>
      
      <button 
        className="pat-doctor-btn" 
        onClick={() => onBook(doctor)}
      >
        Book Appointment
      </button>
    </div>
  );
};

DoctorCard.propTypes = {
  doctor: PropTypes.object.isRequired,
  onBook: PropTypes.func.isRequired
};

export default DoctorCard;
