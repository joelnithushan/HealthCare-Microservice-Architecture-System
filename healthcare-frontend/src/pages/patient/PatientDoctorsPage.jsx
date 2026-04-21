import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Search, MapPin, Calendar, Clock, CreditCard, X, BriefcaseMedical } from "lucide-react";
import "../../components/DashboardShared.css";

export default function PatientDoctorsPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");

  const [bookingModal, setBookingModal] = useState({ isOpen: false, doctor: null });
  const [bookingData, setBookingData] = useState({ date: "", time: "", notes: "", appointmentType: "PHYSICAL" });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors/verified');
        setDoctors(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load doctors list.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const specialties = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialtyFilter ? doc.specialization === specialtyFilter : true;
    return matchesSearch && matchesSpecialty;
  });

  const handleBookClick = (doctor) => {
    setBookingError(null);
    setBookingData({ date: "", time: "", notes: "", appointmentType: "PHYSICAL" });
    setBookingModal({ isOpen: true, doctor });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
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
      const newAppt = res.data;
      
      // Close modal
      setBookingModal({ isOpen: false, doctor: null });
      
      // Redirect to payment flow if needed based on our simulated system
      navigate(`/patient/dashboard/pay/${newAppt.id}`);
      
    } catch (err) {
      console.error(err);
      setBookingError("Failed to book appointment. Please check availability.");
    } finally {
      setBookingLoading(false);
    }
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
          {filteredDoctors.map(doctor => (
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
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} /> {doctor.hospital || 'MediConnect Central'}
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
          ))}
        </div>
      )}

      {/* Booking Modal inline */}
      {bookingModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="dash-card" style={{ width: '100%', maxWidth: '500px', margin: '20px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setBookingModal({ isOpen: false, doctor: null })}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '20px', color: 'var(--text-main)' }}>
              Book with Dr. {bookingModal.doctor.name}
            </h2>
            
            {bookingError && (
              <div style={{ padding: '10px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem' }}>
                {bookingError}
              </div>
            )}

            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label className="form-label">Consultation Type</label>
                <select className="form-input" required value={bookingData.appointmentType} onChange={e => setBookingData({...bookingData, appointmentType: e.target.value})}>
                  <option value="PHYSICAL">Physical Visit</option>
                  <option value="VIDEO">Video Consultation</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" required min={new Date().toISOString().split('T')[0]} 
                    value={bookingData.date} onChange={e => setBookingData({...bookingData, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input type="time" className="form-input" required 
                    value={bookingData.time} onChange={e => setBookingData({...bookingData, time: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea className="form-input" rows="3" placeholder="Briefly describe your symptoms..."
                  value={bookingData.notes} onChange={e => setBookingData({...bookingData, notes: e.target.value})}></textarea>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-outline" disabled={bookingLoading} onClick={() => setBookingModal({ isOpen: false, doctor: null })}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={bookingLoading}>
                  {bookingLoading ? 'Processing...' : 'Confirm & Pay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
