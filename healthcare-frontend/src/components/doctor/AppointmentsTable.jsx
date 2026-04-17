import React from 'react';
import PropTypes from 'prop-types';

const statusClass = {
  PENDING: 'doc-badge--pending',
  ACCEPTED: 'doc-badge--confirmed',
  REJECTED: 'doc-badge--cancelled',
  COMPLETED: 'doc-badge--completed',
  CANCELLED: 'doc-badge--cancelled',
};

const AppointmentsTable = ({ appointments, onView, onStartVideo, onStatusUpdate, loading }) => {
  if (loading) {
    return (
      <div className="doc-appt-section">
        <div className="doc-appt-section__header">
          <div className="skeleton skeleton-title" style={{ width: '35%', margin: 0 }} />
        </div>
        <div className="doc-appt-section__body">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="doc-skel-table-row">
              <div className="skeleton" style={{ width: '20%', height: 14 }} />
              <div className="skeleton" style={{ width: '12%', height: 14 }} />
              <div className="skeleton" style={{ width: '14%', height: 14 }} />
              <div className="skeleton" style={{ width: '10%', height: 20 }} />
              <div className="skeleton" style={{ width: '18%', height: 24 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="doc-appt-section">
      <div className="doc-appt-section__header">
        <h3 className="doc-appt-section__title">Today's Appointments</h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="doc-appt-section__body">
        {appointments.length === 0 ? (
          <div className="doc-empty">
            <div className="doc-empty__icon"></div>
            <div className="doc-empty__title">No appointments today</div>
            <div className="doc-empty__text">
              Your schedule is clear for today. Upcoming appointments will appear here.
            </div>
          </div>
        ) : (
          <table className="doc-appt-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id}>
                  <td style={{ fontWeight: 600 }}>
                    {apt.patientName || `Patient #${apt.patientId || 'N/A'}`}
                  </td>
                  <td>{apt.appointmentTime || '--:--'}</td>
                  <td>
                    <span
                      className={`doc-upcoming__type ${
                        apt.appointmentType === 'VIDEO'
                          ? 'doc-upcoming__type--video'
                          : 'doc-upcoming__type--inperson'
                      }`}
                    >
                      {apt.appointmentType === 'VIDEO' ? ' Video' : ' In-Person'}
                    </span>
                  </td>
                  <td>
                    <span className={`doc-badge ${statusClass[apt.status] || 'doc-badge--pending'}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    <div className="doc-table-actions">
                      <button className="doc-table-btn" onClick={() => onView && onView(apt)}>
                        View
                      </button>
                      {(apt.appointmentType === 'VIDEO' || !apt.appointmentType) &&
                        (apt.status === 'ACCEPTED') && (
                          <button
                            className="doc-table-btn doc-table-btn--accent"
                            onClick={() => onStartVideo && onStartVideo(apt)}
                          >
                            Start Video
                          </button>
                        )}
                      {apt.status === 'PENDING' && (
                        <>
                          <button
                            className="doc-table-btn"
                            onClick={() => onStatusUpdate && onStatusUpdate(apt.id, 'ACCEPTED')}
                          >
                            Accept
                          </button>
                          <button
                            className="doc-table-btn doc-table-btn--danger"
                            onClick={() => onStatusUpdate && onStatusUpdate(apt.id, 'REJECTED')}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {apt.status === 'ACCEPTED' && (
                        <button
                          className="doc-table-btn"
                          onClick={() => onStatusUpdate && onStatusUpdate(apt.id, 'COMPLETED')}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

AppointmentsTable.propTypes = {
  appointments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      patientName: PropTypes.string,
      patientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      appointmentTime: PropTypes.string,
      appointmentType: PropTypes.string,
      status: PropTypes.string,
    })
  ).isRequired,
  onView: PropTypes.func,
  onStartVideo: PropTypes.func,
  onStatusUpdate: PropTypes.func,
  loading: PropTypes.bool,
};

AppointmentsTable.defaultProps = {
  loading: false,
};

export default AppointmentsTable;
