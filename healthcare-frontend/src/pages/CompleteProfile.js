import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';
import { validateNIC, validateLankanMobile, validateDOB, validateSLMC } from '../utils/validations';

const SPECIALIZATIONS = [
  'Cardiology', 'Dermatology', 'ENT', 'General Medicine',
  'Gynecology', 'Neurology', 'Oncology', 'Ophthalmology',
  'Orthopedics', 'Pediatrics', 'Psychiatry', 'Urology',
];

const validatePatientFields = (d) => {
  const e = {};
  const nicErr = validateNIC(d.nic);
  if (nicErr) e.nic = nicErr;
  
  const mobErr = validateLankanMobile(d.mobileNumber);
  if (mobErr) e.mobileNumber = mobErr;
  
  const dobErr = validateDOB(d.dob);
  if (dobErr) e.dob = dobErr;
  
  if (!d.gender) e.gender = 'Gender is required.';
  return e;
};

const validateDoctorFields = (d) => {
  const e = {};
  const nicErr = validateNIC(d.nic);
  if (nicErr) e.nic = nicErr;
  
  const mobErr = validateLankanMobile(d.mobileNumber);
  if (mobErr) e.mobileNumber = mobErr;
  
  const slmcErr = validateSLMC(d.slmcNumber);
  if (slmcErr) e.slmcNumber = slmcErr;
  
  if (!d.specialization || !d.specialization.trim()) e.specialization = 'Please select a specialization.';
  if (!d.hospitalAttached || !d.hospitalAttached.trim()) e.hospitalAttached = 'Please specify your primary hospital.';
  return e;
};

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    nic: '', mobileNumber: '', dob: '', gender: '',
    slmcNumber: '', specialization: '', hospitalAttached: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored && stored !== 'undefined') {
      const u = JSON.parse(stored);
      setUser(u);
      // Pre-fill any fields that already exist
      setFormData(prev => ({
        ...prev,
        nic: u.nic || '',
        mobileNumber: u.mobileNumber || '',
        dob: u.dob || '',
        gender: u.gender || '',
        slmcNumber: u.slmcNumber || '',
        specialization: u.specialization || '',
        hospitalAttached: u.hospitalAttached || '',
      }));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!user) return;

    const isDoctor = user.role === 'DOCTOR';
    const errs = isDoctor ? validateDoctorFields(formData) : validatePatientFields(formData);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await api.put(`/users/${user.id}`, formData);
      // Update the local user object with the complete profile
      const updatedUser = { ...user, ...res.data, profileComplete: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Role-based redirect
      if (updatedUser.role === 'ADMIN') navigate('/admin/dashboard');
      else if (updatedUser.role === 'DOCTOR') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const isDoctor = user.role === 'DOCTOR';

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.cardContainer}>
        {/* Left branding panel */}
        <div style={styles.brandPanel}>
          <img src={logo} alt="Clinexa" style={styles.brandLogo} />
          <h2 style={styles.brandTitle}>Complete Your Profile</h2>
          <p style={styles.brandSub}>
            Before you can access your dashboard, we need a few more details to ensure a secure and personalized healthcare experience.
          </p>
          <div style={styles.stepList}>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>1</div>
              <span>Account Created</span>
            </div>
            <div style={{...styles.stepItem, ...styles.stepActive}}>
              <div style={{...styles.stepNumber, ...styles.stepNumberActive}}>2</div>
              <span>Complete Profile</span>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>3</div>
              <span>Access Dashboard</span>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div style={styles.formPanel}>
          <h2 style={styles.formTitle}>
            {isDoctor ? 'Doctor Profile Details' : 'Patient Profile Details'}
          </h2>
          <p style={styles.formSub}>
            Fields marked with * are mandatory for {isDoctor ? 'doctors' : 'patients'} in Sri Lanka.
          </p>

          <form onSubmit={handleComplete} noValidate>
            {/* NIC — common */}
            <div style={styles.formGroup}>
              <label style={styles.label}>National Identity Card (NIC) *</label>
              <input type="text" name="nic" className="flat-input" value={formData.nic} onChange={handleChange}
                placeholder="e.g. 961234567V" style={{...styles.input, ...(fieldErrors.nic ? {borderColor:'red'} : {})}} />
              {fieldErrors.nic && <span style={styles.fieldError}>{fieldErrors.nic}</span>}
            </div>

            {/* Mobile — common */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Mobile Number *</label>
              <input type="text" name="mobileNumber" className="flat-input" value={formData.mobileNumber} onChange={handleChange}
                placeholder="e.g. +94771234567" style={{...styles.input, ...(fieldErrors.mobileNumber ? {borderColor:'red'} : {})}} />
              {fieldErrors.mobileNumber && <span style={styles.fieldError}>{fieldErrors.mobileNumber}</span>}
            </div>

            {/* Patient-specific fields */}
            {!isDoctor && (
              <>
                <div style={styles.row}>
                  <div style={{...styles.formGroup, flex: 1}}>
                    <label style={styles.label}>Date of Birth *</label>
                    <input 
                      type="date" 
                      name="dob" 
                      className="flat-input" 
                      value={formData.dob} 
                      onChange={handleChange}
                      max={new Date().toISOString().split("T")[0]}
                      style={{...styles.input, ...(fieldErrors.dob ? {borderColor:'red'} : {})}} 
                    />
                    {fieldErrors.dob && <span style={styles.fieldError}>{fieldErrors.dob}</span>}
                  </div>
                  <div style={{...styles.formGroup, flex: 1}}>
                    <label style={styles.label}>Gender *</label>
                    <select name="gender" className="flat-input" value={formData.gender} onChange={handleChange}
                      style={{...styles.input, ...(fieldErrors.gender ? {borderColor:'red'} : {})}}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {fieldErrors.gender && <span style={styles.fieldError}>{fieldErrors.gender}</span>}
                  </div>
                </div>
              </>
            )}

            {/* Doctor-specific fields */}
            {isDoctor && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>SLMC Registration No. *</label>
                  <input type="text" name="slmcNumber" className="flat-input" value={formData.slmcNumber} onChange={handleChange}
                    placeholder="e.g. 23456" style={{...styles.input, ...(fieldErrors.slmcNumber ? {borderColor:'red'} : {})}} />
                  {fieldErrors.slmcNumber && <span style={styles.fieldError}>{fieldErrors.slmcNumber}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Specialization *</label>
                  <select name="specialization" className="flat-input" value={formData.specialization} onChange={handleChange}
                    style={{...styles.input, ...(fieldErrors.specialization ? {borderColor:'red'} : {})}}>
                    <option value="">Select Specialization</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {fieldErrors.specialization && <span style={styles.fieldError}>{fieldErrors.specialization}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Primary Hospital / Clinic *</label>
                  <input type="text" name="hospitalAttached" className="flat-input" value={formData.hospitalAttached} onChange={handleChange}
                    placeholder="e.g. Nawaloka Hospital" style={{...styles.input, ...(fieldErrors.hospitalAttached ? {borderColor:'red'} : {})}} />
                  {fieldErrors.hospitalAttached && <span style={styles.fieldError}>{fieldErrors.hospitalAttached}</span>}
                </div>
              </>
            )}

            <button type="submit" className="flat-btn" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Saving...' : 'Complete Profile & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '40px 20px',
    minHeight: '80vh',
  },
  cardContainer: {
    display: 'flex',
    maxWidth: 920,
    width: '100%',
    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
    borderRadius: '24px',
    overflow: 'hidden',
  },
  brandPanel: {
    flex: '0 0 40%',
    background: 'var(--primary)',
    color: '#fff',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brandLogo: {
    height: 80,
    objectFit: 'contain',
    marginBottom: 24,
    alignSelf: 'flex-start',
    filter: 'brightness(0) invert(1)',
  },
  brandTitle: {
    fontSize: '1.4rem',
    fontWeight: 700,
    marginBottom: 12,
    color: '#fff',
  },
  brandSub: {
    fontSize: '0.85rem',
    lineHeight: 1.6,
    opacity: 0.9,
    color: '#fff',
    marginBottom: 32,
  },
  stepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    opacity: 0.6,
    fontSize: '0.85rem',
  },
  stepActive: {
    opacity: 1,
    fontWeight: 700,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  stepNumberActive: {
    background: '#fff',
    color: 'var(--primary)',
    border: '2px solid #fff',
  },
  formPanel: {
    flex: 1,
    background: '#fff',
    padding: '36px 40px',
    overflowY: 'auto',
    maxHeight: '85vh',
  },
  formTitle: {
    fontSize: '1.35rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: 6,
  },
  formSub: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'var(--text-muted)',
    marginBottom: 6,
  },
  input: {
    borderRadius: '8px',
  },
  row: {
    display: 'flex',
    gap: 16,
  },
  fieldError: {
    display: 'block',
    color: '#ef4444',
    fontSize: '0.75rem',
    marginTop: 4,
    fontWeight: 500,
  },
  submitBtn: {
    width: '100%',
    marginTop: 12,
    padding: '14px',
    fontSize: '1rem',
    borderRadius: '8px',
  },
};
