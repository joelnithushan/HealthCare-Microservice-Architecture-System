import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { Search, MapPin, Calendar, Clock, CreditCard, X, BriefcaseMedical, CheckCircle2, Video, Hospital } from "lucide-react";
import "../../components/DashboardShared.css";

const DEFAULT_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30"
];

const parseModes = (value) => {
  if (!value) return ["PHYSICAL", "VIDEO"];
  return value.split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
};

export default function PatientDoctorsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [bookingModal, setBookingModal] = useState({ isOpen: false, doctor: null });
  const [bookingData, setBookingData] = useState({ date: "", time: "", notes: "", appointmentType: "PHYSICAL" });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors/verified');
        setDoctors(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load doctors list.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const qSpec = searchParams.get("specialty");
    if (qSpec && doctors.length > 0) {
      const match = doctors.find(d => (d.specialization || "").toLowerCase() === qSpec.toLowerCase());
      if (match) setSpecialtyFilter(match.specialization);
      else setSpecialtyFilter(qSpec);
    }
  }, [searchParams, doctors]);

  const specialties = [...new Set(doctors.map(d => d.specialization).filter(Boolean))].sort();
  const hospitals = [...new Set(doctors.map(d => d.hospital).filter(Boolean))].sort();

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialtyFilter ? doc.specialization === specialtyFilter : true;
    const matchesHospital = hospitalFilter ? doc.hospital === hospitalFilter : true;
    const matchesType = typeFilter ? parseModes(doc.consultationModes).includes(typeFilter) : true;
    return matchesSearch && matchesSpecialty && matchesHospital && matchesType;
  });

  const fetchBookedSlots = useCallback(async (doctorId, date) => {
    if (!doctorId || !date) { setBookedSlots([]); return; }
    setSlotsLoading(true);
    try {
      const res = await api.get('/appointments/booked-slots', { params: { doctorId, date } });
      const raw = Array.isArray(res.data) ? res.data : [];
      // Normalize times like "09:00:00" -> "09:00"
      const normalized = raw.map(t => typeof t === 'string' ? t.substring(0, 5) : t);
      setBookedSlots(normalized);
    } catch (err) {
      console.error('Failed to load booked slots', err);
      setBookedSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (bookingModal.isOpen && bookingModal.doctor && bookingData.date) {
      fetchBookedSlots(bookingModal.doctor.id, bookingData.date);
    } else {
      setBookedSlots([]);
    }
  }, [bookingModal.isOpen, bookingModal.doctor, bookingData.date, fetchBookedSlots]);

  const handleBookClick = (doctor) => {
    setBookingError(null);
    setConfirmation(null);
    const supported = parseModes(doctor.consultationModes);
    const defaultType = typeFilter && supported.includes(typeFilter)
      ? typeFilter
      : (supported.includes("PHYSICAL") ? "PHYSICAL" : supported[0] || "PHYSICAL");
    setBookingData({ date: "", time: "", notes: "", appointmentType: defaultType });
    setBookedSlots([]);
    setBookingModal({ isOpen: true, doctor });
  };

  const closeModal = () => {
    setBookingModal({ isOpen: false, doctor: null });
    setConfirmation(null);
    setBookingError(null);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingData.date || !bookingData.time) {
      setBookingError("Please choose a date and an available time slot.");
      return;
    }
    if (bookedSlots.includes(bookingData.time)) {
      setBookingError("That slot was just taken. Please pick another time.");
      return;
    }
    if (!user || !user.id) {
      setBookingError("Your session has expired. Please log in again.");
      return;
    }

    setBookingLoading(true);
    setBookingError(null);
    try {
      const payload = {
        patientId: user.id,
        doctorId: bookingModal.doctor.id,
        appointmentDate: bookingData.date,
        appointmentTime: bookingData.time + ":00",
        notes: bookingData.notes,
        appointmentType: bookingData.appointmentType,
        status: "PENDING"
      };

      const res = await api.post('/appointments', payload);
      setConfirmation({ ...res.data, doctor: bookingModal.doctor });
    } catch (err) {
      console.error(err);
      const serverMsg = err?.response?.data?.message || err?.response?.data;
      setBookingError(typeof serverMsg === 'string' && serverMsg
        ? serverMsg
        : "Failed to book appointment. The slot may no longer be available.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!confirmation) return;
    const apptId = confirmation.id;
    closeModal();
    navigate(`/patient/dashboard/pay/${apptId}`);
  };

  const handleViewAppointments = () => {
    closeModal();
    navigate('/patient/dashboard/appointments');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Book an Appointment</h1>
        <p>Search verified doctors and schedule your consultation.</p>
      </div>

      <div className="dash-card" style={{ marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "250px", position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search doctor by name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
        </div>
        <div style={{ minWidth: "200px" }}>
          <select
            className="form-input"
            value={specialtyFilter}
            onChange={e => setSpecialtyFilter(e.target.value)}
          >
            <option value="">All Specialties</option>
            {specialties.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: "200px" }}>
          <select
            className="form-input"
            value={hospitalFilter}
            onChange={e => setHospitalFilter(e.target.value)}
          >
            <option value="">All Hospitals</option>
            {hospitals.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: "200px" }}>
          <select
            className="form-input"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">Any Consultation Type</option>
            <option value="PHYSICAL">Physical Visit</option>
            <option value="VIDEO">Video Consultation</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="dash-card" style={{ borderColor: "var(--danger)", backgroundColor: "var(--danger-bg)", color: "var(--danger)" }}>
          {error}
        </div>
      ) : loading ? (
         <div className="dash-grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {[1,2,3,4].map(i => <div key={i} className="dash-card skeleton" style={{ height: "180px" }}></div>)}
         </div>
      ) : filteredDoctors.length === 0 ? (
         <div className="dash-card empty-state">
           <Search size={32} />
           <p>No doctors found matching your criteria.</p>
         </div>
      ) : (
        <div className="dash-grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {filteredDoctors.map(doctor => {
            const modes = parseModes(doctor.consultationModes);
            return (
            <div key={doctor.id} className="dash-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)'
                }}>
                  {doctor.name ? doctor.name.substring(0,2).toUpperCase() : 'DR'}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', color: 'var(--text-main)', fontSize: '1.1rem' }}>Dr. {doctor.name}</h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <BriefcaseMedical size={14} /> {doctor.specialization || 'General Practitioner'}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <Hospital size={14} /> {doctor.hospital || 'MediConnect Central'}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {modes.includes("PHYSICAL") && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={12} /> Physical
                      </span>
                    )}
                    {modes.includes("VIDEO") && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Video size={12} /> Video
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CreditCard size={14} />
                  Rs. {doctor.consultationFee ? doctor.consultationFee.toLocaleString() : '2,500'}
                </span>
                <button className="btn btn-primary" onClick={() => handleBookClick(doctor)}>Book Now</button>
              </div>
            </div>
          );})}
        </div>
      )}

      {/* Booking Modal inline */}
      {bookingModal.isOpen && bookingModal.doctor && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="dash-card" style={{ width: '100%', maxWidth: '520px', margin: '20px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={closeModal}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>

            {!confirmation ? (
              <>
                <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '4px', color: 'var(--text-main)' }}>
                  Book with Dr. {bookingModal.doctor.name}
                </h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <BriefcaseMedical size={14} /> {bookingModal.doctor.specialization}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Hospital size={14} /> {bookingModal.doctor.hospital || 'MediConnect Central'}
                  </span>
                </div>

                {bookingError && (
                  <div style={{ padding: '10px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem' }}>
                    {bookingError}
                  </div>
                )}

                <form onSubmit={handleBookingSubmit}>
                  <div className="form-group">
                    <label className="form-label">Consultation Type</label>
                    <select
                      className="form-input"
                      required
                      value={bookingData.appointmentType}
                      onChange={e => setBookingData({ ...bookingData, appointmentType: e.target.value })}
                    >
                      {parseModes(bookingModal.doctor.consultationModes).includes("PHYSICAL") && (
                        <option value="PHYSICAL">Physical Visit</option>
                      )}
                      {parseModes(bookingModal.doctor.consultationModes).includes("VIDEO") && (
                        <option value="VIDEO">Video Consultation</option>
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      Date
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingData.date}
                      onChange={e => setBookingData({ ...bookingData, date: e.target.value, time: "" })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      Available Time Slots
                    </label>
                    {!bookingData.date ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '8px 0' }}>
                        Select a date to see available slots.
                      </div>
                    ) : slotsLoading ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '8px 0' }}>
                        Loading slots...
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '8px' }}>
                        {DEFAULT_SLOTS.map(slot => {
                          const isBooked = bookedSlots.includes(slot);
                          
                          // Check if slot is in the past for today
                          const isToday = bookingData.date === new Date().toISOString().split('T')[0];
                          const now = new Date();
                          const [hour, minute] = slot.split(':').map(Number);
                          const slotDate = new Date();
                          slotDate.setHours(hour, minute, 0, 0);
                          const isPast = isToday && slotDate < now;
                          
                          const isDisabled = isBooked || isPast;
                          const isSelected = bookingData.time === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => setBookingData({ ...bookingData, time: slot })}
                              className={isSelected ? 'btn btn-primary' : 'btn btn-outline'}
                              style={{
                                padding: '8px 4px',
                                fontSize: '0.85rem',
                                opacity: isDisabled ? 0.45 : 1,
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                textDecoration: isBooked ? 'line-through' : 'none'
                              }}
                              title={isBooked ? 'Already booked' : isPast ? 'Past time' : 'Available'}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Additional Notes</label>
                    <textarea
                      className="form-input"
                      rows="3"
                      placeholder="Briefly describe your symptoms..."
                      value={bookingData.notes}
                      onChange={e => setBookingData({ ...bookingData, notes: e.target.value })}
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <button type="button" className="btn btn-outline" disabled={bookingLoading} onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={bookingLoading || !bookingData.date || !bookingData.time}>
                      {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <CheckCircle2 size={48} color="var(--success, #16a34a)" />
                  <h2 style={{ fontSize: '1.25rem', marginTop: '8px', marginBottom: '4px', color: 'var(--text-main)' }}>
                    Booking Confirmed
                  </h2>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Your appointment has been submitted and is pending doctor confirmation.
                  </div>
                </div>

                <div className="dash-card" style={{ padding: '16px', marginBottom: '16px', backgroundColor: 'var(--bg-subtle, #f8fafc)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: '8px', fontSize: '0.92rem' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Appointment ID</div>
                    <div style={{ fontWeight: 600 }}>#{confirmation.id}</div>

                    <div style={{ color: 'var(--text-muted)' }}>Doctor</div>
                    <div>Dr. {confirmation.doctor?.name}</div>

                    <div style={{ color: 'var(--text-muted)' }}>Specialization</div>
                    <div>{confirmation.doctor?.specialization}</div>

                    <div style={{ color: 'var(--text-muted)' }}>Hospital</div>
                    <div>{confirmation.doctor?.hospital || 'MediConnect Central'}</div>

                    <div style={{ color: 'var(--text-muted)' }}>Date</div>
                    <div>{confirmation.appointmentDate}</div>

                    <div style={{ color: 'var(--text-muted)' }}>Time</div>
                    <div>{typeof confirmation.appointmentTime === 'string' ? confirmation.appointmentTime.substring(0,5) : confirmation.appointmentTime}</div>

                    <div style={{ color: 'var(--text-muted)' }}>Type</div>
                    <div>{confirmation.appointmentType === 'VIDEO' ? 'Video Consultation' : 'Physical Visit'}</div>

                    <div style={{ color: 'var(--text-muted)' }}>Status</div>
                    <div style={{ fontWeight: 600, color: 'var(--warning, #b45309)' }}>{confirmation.status}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn btn-outline" onClick={handleViewAppointments}>
                    View My Appointments
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleProceedToPayment}>
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
