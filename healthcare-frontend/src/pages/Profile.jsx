import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { validateNIC, validateLankanMobile, validateDOB, validateSLMC } from '../utils/validations';
import { DEFAULT_AVATAR } from '../utils/constants';
import toast from 'react-hot-toast';
import ProfilePicUpload from '../components/ProfilePicUpload';

const SPECIALIZATIONS = [
  'Cardiology', 'Dermatology', 'ENT', 'General Medicine',
  'Gynecology', 'Neurology', 'Oncology', 'Ophthalmology',
  'Orthopedics', 'Pediatrics', 'Psychiatry', 'Urology',
];

const SRI_LANKAN_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', nic: '', mobileNumber: '', dob: '', gender: '',
    slmcNumber: '', specialization: '', hospitalAttached: '', profilePictureUrl: '',
    district: '', age: ''
  });
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const stored = localStorage.getItem('user');
      if (!stored || stored === 'undefined') {
        navigate('/login');
        return;
      }
      
      const parsedUser = JSON.parse(stored);
      try {
        const res = await api.get(`/users/${parsedUser.id}`);
        const userData = res.data;
        
        // Ensure the profile picture URL has a timestamp if it's an internal one
        if (userData.profilePicUrl && !userData.profilePicUrl.includes('?t=')) {
          userData.profilePicUrl = `${userData.profilePicUrl}?t=${Date.now()}`;
        }
        
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          nic: userData.nic || '',
          mobileNumber: userData.mobileNumber || '',
          dob: userData.dob || '',
          gender: userData.gender || '',
          slmcNumber: userData.slmcNumber || '',
          specialization: userData.specialization || '',
          hospitalAttached: userData.hospitalAttached || '',
          profilePictureUrl: userData.profilePicUrl || userData.profilePictureUrl || '',
          district: userData.district || '',
          age: userData.age || ''
        });
      } catch (err) {
        toast.error('Failed to load profile.');
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const validateFields = () => {
    const isDoctor = user.role === 'DOCTOR';
    const e = {};
    if (!formData.name.trim()) e.name = "Name is required.";
    
    const nicErr = validateNIC(formData.nic);
    if (nicErr) e.nic = nicErr;
    
    const mobErr = validateLankanMobile(formData.mobileNumber);
    if (mobErr) e.mobileNumber = mobErr;
    
    if (!isDoctor) {
      const dobErr = validateDOB(formData.dob);
      if (dobErr) e.dob = dobErr;
      if (!formData.gender) e.gender = 'Gender is required.';
    } else {
      const slmcErr = validateSLMC(formData.slmcNumber);
      if (slmcErr) e.slmcNumber = slmcErr;
      if (!formData.specialization.trim()) e.specialization = 'Please select a specialization.';
      if (!formData.hospitalAttached.trim()) e.hospitalAttached = 'Please specify your primary hospital.';
    }
    
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleUploadSuccess = (url) => {
    setFormData(prev => ({ ...prev, profilePictureUrl: url }));
    // Immediately update user in local state so the header updates
    const updatedUser = { ...user, profilePicUrl: url, profilePictureUrl: url };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('userUpdated'));
    setUser(updatedUser);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateFields()) {
      toast.error('Please fix the validation errors.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put(`/users/${user.id}`, formData);
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };



  if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;

  const isAdmin = user.role === 'ADMIN';
  const isDoctor = user.role === 'DOCTOR';

  if (isAdmin) {
    return (
      <div style={adminStyles.pageWrapper}>
        <div style={adminStyles.sidebarDeco}>
          <div style={adminStyles.decoCircle}></div>
          <div style={adminStyles.decoLine}></div>
        </div>

        <div style={adminStyles.mainContent}>
          <header style={adminStyles.premiumHeader}>
            <div style={adminStyles.headerContent}>
              <div style={adminStyles.identityGroup}>
                <div style={adminStyles.avatarWrapper}>
                   <ProfilePicUpload user={user} onUploadSuccess={handleUploadSuccess} />
                </div>
                <div>
                  <h1 style={adminStyles.adminTitle}>{formData.name || 'System Administrator'}</h1>
                  <div style={adminStyles.badgeRow}>
                    <span style={adminStyles.masterBadge}>System Root</span>
                    <span style={adminStyles.identityId}>{user.email}</span>
                  </div>
                </div>
              </div>
              <div style={adminStyles.systemStatus}>
                <div style={adminStyles.pulseContainer}>
                  <div style={adminStyles.pulse}></div>
                  <span style={adminStyles.statusText}>Admin Session Secure</span>
                </div>
              </div>
            </div>
          </header>

          <div style={adminStyles.layoutBody}>
            <div style={adminStyles.formColumn}>
              <div style={adminStyles.sectionCard}>
                <h3 style={adminStyles.sectionTitle}>Identity & Verification</h3>
                <form onSubmit={handleSave} style={adminStyles.adminForm}>
                  <div style={adminStyles.inputGrid}>
                    <div style={adminStyles.adminGroup}>
                      <label style={adminStyles.adminLabel}>Legal Name</label>
                      <input type="text" name="name" style={adminStyles.adminInput} value={formData.name} onChange={handleChange} />
                      {fieldErrors.name && <span style={styles.fieldError}>{fieldErrors.name}</span>}
                    </div>
                    <div style={adminStyles.adminGroup}>
                      <label style={adminStyles.adminLabel}>System Authority level</label>
                      <input type="text" style={adminStyles.readonlyInput} value="Master Access" disabled />
                    </div>
                    <div style={adminStyles.adminGroup}>
                      <label style={adminStyles.adminLabel}>NIC Designation</label>
                      <input type="text" name="nic" style={adminStyles.adminInput} value={formData.nic} onChange={handleChange} />
                      {fieldErrors.nic && <span style={styles.fieldError}>{fieldErrors.nic}</span>}
                    </div>
                    <div style={adminStyles.adminGroup}>
                      <label style={adminStyles.adminLabel}>Secure Mobile</label>
                      <input type="text" name="mobileNumber" style={adminStyles.adminInput} value={formData.mobileNumber} onChange={handleChange} />
                      {fieldErrors.mobileNumber && <span style={styles.fieldError}>{fieldErrors.mobileNumber}</span>}
                    </div>
                  </div>
                  
                  <div style={adminStyles.btnRow}>
                    <button type="submit" style={adminStyles.premiumSaveBtn} disabled={loading}>
                      {loading ? 'Processing...' : 'Sync Profile Data'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <aside style={adminStyles.infoColumn}>
              <div style={adminStyles.glassCard}>
                <h4 style={adminStyles.infoCardTitle}>Security Overview</h4>
                <div style={adminStyles.infoItem}>
                  <span style={adminStyles.infoLabel}>Account Status:</span>
                  <span style={adminStyles.infoValActive}>Verified Authority</span>
                </div>
                <div style={adminStyles.infoItem}>
                  <span style={adminStyles.infoLabel}>Last Integrity Check:</span>
                  <span style={adminStyles.infoVal}>Today, 10:45 AM</span>
                </div>
                <div style={adminStyles.infoItem}>
                  <span style={adminStyles.infoLabel}>System Privileges:</span>
                  <span style={adminStyles.infoVal}>Full Console Control</span>
                </div>
              </div>

              <div style={adminStyles.actionHint}>
                <p>Profile changes are logged in the system audit trail for security compliance.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.cardContainer}>
        
        <div style={styles.headerArea}>
          <div style={styles.avatarGroup}>
            <div style={styles.avatarInner}>
              <ProfilePicUpload user={user} onUploadSuccess={handleUploadSuccess} />
            </div>
            <div>
              <h2 style={styles.title}>{formData.name || 'Personal Account'}</h2>
              <div style={styles.badgeSection}>
                <span style={styles.roleBadge}>{user.role}</span>
                <span style={styles.emailBadge}>{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} style={styles.formPanel}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
               <label style={styles.label}>Full Name *</label>
               <input type="text" name="name" className="flat-input" value={formData.name} onChange={handleChange} style={styles.input} />
               {fieldErrors.name && <span style={styles.fieldError}>{fieldErrors.name}</span>}
            </div>

            <div style={styles.formGroup}>
               <label style={styles.label}>Email Address (Read Only)</label>
               <input type="email" name="email" className="flat-input" value={formData.email} disabled style={{...styles.input, backgroundColor: '#f1f5f9', cursor: 'not-allowed'}} />
            </div>

            <div style={styles.formGroup}>
               <label style={styles.label}>Calculated Age (Read Only)</label>
               <input type="text" name="age" className="flat-input" value={formData.age ? `${formData.age} Years` : 'N/A'} disabled style={{...styles.input, backgroundColor: '#f1f5f9', cursor: 'not-allowed'}} />
            </div>

            <div style={styles.formGroup}>
               <label style={styles.label}>National Identity Card (NIC) *</label>
               <input type="text" name="nic" className="flat-input" value={formData.nic} onChange={handleChange} style={styles.input} />
               {fieldErrors.nic && <span style={styles.fieldError}>{fieldErrors.nic}</span>}
            </div>

            <div style={styles.formGroup}>
               <label style={styles.label}>Mobile Number *</label>
               <input type="text" name="mobileNumber" className="flat-input" value={formData.mobileNumber} onChange={handleChange} style={styles.input} />
               {fieldErrors.mobileNumber && <span style={styles.fieldError}>{fieldErrors.mobileNumber}</span>}
            </div>

            {!isDoctor && (
              <>
                <div style={styles.formGroup}>
                   <label style={styles.label}>Date of Birth *</label>
                   <input 
                    type="date" 
                    name="dob" 
                    className="flat-input" 
                    value={formData.dob} 
                    onChange={handleChange} 
                    max={new Date().toISOString().split("T")[0]}
                    style={styles.input} 
                   />
                   {fieldErrors.dob && <span style={styles.fieldError}>{fieldErrors.dob}</span>}
                </div>
                <div style={styles.formGroup}>
                   <label style={styles.label}>Gender *</label>
                   <select name="gender" className="flat-input" value={formData.gender} onChange={handleChange} style={styles.input}>
                     <option value="">Select Gender</option>
                     <option value="Male">Male</option>
                     <option value="Female">Female</option>
                     <option value="Other">Other</option>
                   </select>
                   {fieldErrors.gender && <span style={styles.fieldError}>{fieldErrors.gender}</span>}
                </div>
                <div style={styles.formGroup}>
                   <label style={styles.label}>District *</label>
                   <select name="district" className="flat-input" value={formData.district} onChange={handleChange} style={styles.input}>
                     <option value="">Select District</option>
                     {SRI_LANKAN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                   </select>
                   {fieldErrors.district && <span style={styles.fieldError}>{fieldErrors.district}</span>}
                </div>
              </>
            )}

            {isDoctor && (
              <>
                <div style={styles.formGroup}>
                   <label style={styles.label}>SLMC Registration No. *</label>
                   <input type="text" name="slmcNumber" className="flat-input" value={formData.slmcNumber} onChange={handleChange} style={styles.input} />
                   {fieldErrors.slmcNumber && <span style={styles.fieldError}>{fieldErrors.slmcNumber}</span>}
                </div>
                <div style={styles.formGroup}>
                   <label style={styles.label}>Specialization *</label>
                   <select name="specialization" className="flat-input" value={formData.specialization} onChange={handleChange} style={styles.input}>
                     <option value="">Select Specialization</option>
                     {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                   {fieldErrors.specialization && <span style={styles.fieldError}>{fieldErrors.specialization}</span>}
                </div>
                <div style={{...styles.formGroup, gridColumn: 'span 2'}}>
                   <label style={styles.label}>Primary Hospital / Clinic *</label>
                   <input type="text" name="hospitalAttached" className="flat-input" value={formData.hospitalAttached} onChange={handleChange} style={styles.input} />
                   {fieldErrors.hospitalAttached && <span style={styles.fieldError}>{fieldErrors.hospitalAttached}</span>}
                </div>
              </>
            )}
          </div>

          <div style={styles.actionsBox}>
            <button type="submit" className="flat-btn" style={styles.saveBtn} disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
        


      </div>
    </div>
  );
}

const adminStyles = {
  pageWrapper: {
    minHeight: 'calc(100vh - 64px)',
    background: '#0f172a', // Deep slate navy
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
  },
  sidebarDeco: {
    width: '120px',
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '40px',
    position: 'relative',
  },
  decoCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
    marginBottom: '20px'
  },
  decoLine: {
    width: '1px',
    flex: 1,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)'
  },
  mainContent: {
    flex: 1,
    padding: '40px 60px',
    zIndex: 1
  },
  premiumHeader: {
    marginBottom: '50px',
    paddingBottom: '30px',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  identityGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px'
  },
  avatarWrapper: {
    width: '120px',
    height: '120px',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '3px solid rgba(16, 185, 129, 0.4)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    background: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  adminTitle: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: '#f8fafc',
    margin: 0,
    letterSpacing: '-0.03em'
  },
  badgeRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
    alignItems: 'center'
  },
  masterBadge: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  identityId: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    fontWeight: 500
  },
  systemStatus: {
    background: 'rgba(255,255,255,0.03)',
    padding: '12px 20px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  pulseContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  pulse: {
    width: '8px',
    height: '8px',
    background: '#10b981',
    borderRadius: '50%',
    boxShadow: '0 0 10px #10b981',
    animation: 'adminPulse 2s infinite'
  },
  statusText: {
    color: '#e2e8f0',
    fontSize: '0.8rem',
    fontWeight: 600
  },
  layoutBody: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 350px',
    gap: '40px'
  },
  formColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  sectionCard: {
    background: 'rgba(30, 41, 59, 0.5)',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '40px',
    backdropFilter: 'blur(20px)'
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '30px'
  },
  adminForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  inputGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px'
  },
  adminGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  adminLabel: {
    color: '#cbd5e1',
    fontSize: '0.8rem',
    fontWeight: 600
  },
  adminInput: {
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '14px 18px',
    color: '#f8fafc',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
  },
  readonlyInput: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '14px 18px',
    color: '#64748b',
    fontSize: '1rem',
    cursor: 'not-allowed'
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '20px'
  },
  premiumSaveBtn: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    border: 'none',
    padding: '16px 40px',
    borderRadius: '14px',
    fontSize: '1.05rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.25)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  infoColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  glassCard: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '30px',
  },
  infoCardTitle: {
    margin: '0 0 20px 0',
    color: '#f8fafc',
    fontSize: '1.1rem',
    fontWeight: 700
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.03)'
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: '0.85rem'
  },
  infoVal: {
    color: '#e2e8f0',
    fontSize: '0.85rem',
    fontWeight: 600
  },
  infoValActive: {
    color: '#10b981',
    fontSize: '0.85rem',
    fontWeight: 700,
    textTransform: 'uppercase'
  },
  actionHint: {
    padding: '20px',
    background: 'rgba(245, 158, 11, 0.05)',
    border: '1px solid rgba(245, 158, 11, 0.1)',
    borderRadius: '16px',
    color: '#f59e0b',
    fontSize: '0.75rem',
    lineHeight: '1.5',
    textAlign: 'center'
  }
};

const styles = {
  pageWrapper: {
    padding: '60px 20px',
    display: 'flex',
    justifyContent: 'center',
    background: 'var(--bg-main)',
    minHeight: 'calc(100vh - 64px)'
  },
  cardContainer: {
    background: '#fff',
    maxWidth: '900px',
    width: '100%',
    boxShadow: 'var(--shadow-premium)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    border: '1px solid var(--border-light)',
  },
  headerArea: {
    padding: '40px',
    borderBottom: '1px solid var(--border-light)',
    background: 'linear-gradient(to right, #f8fafc, #ffffff)'
  },
  avatarGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  avatarInner: {
    padding: '4px',
    background: '#fff',
    borderRadius: '50%',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border-light)',
  },
  badgeSection: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginTop: '8px',
  },
  roleBadge: {
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '3px 10px',
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    borderRadius: 'var(--radius-pill)',
  },
  emailBadge: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  title: {
    margin: '0',
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--navy)',
    letterSpacing: '-0.02em',
  },
  formPanel: {
    padding: '40px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  input: {
    background: '#fff',
    border: '1px solid var(--border-light)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
  },
  fieldError: {
    color: 'var(--danger)',
    fontSize: '0.75rem',
    marginTop: '6px',
    fontWeight: 500
  },
  actionsBox: {
    marginTop: '40px',
    paddingTop: '32px',
    borderTop: '1px solid var(--border-light)',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  saveBtn: {
    padding: '12px 32px',
    fontSize: '1rem',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.2s',
  }
};
