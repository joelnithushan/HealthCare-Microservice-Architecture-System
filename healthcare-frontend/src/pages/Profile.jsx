import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  User, Mail, Phone, MapPin, Briefcase,
  Shield, IdCard, Calendar,
  Fingerprint, MapIcon, Camera, Upload
} from "lucide-react";
import "../components/DashboardShared.css";
import toast from "react-hot-toast";
import { validateNIC, validateLankanMobile, validateDOB } from "../utils/validations";
import { resolveProfileImageUrl } from "../utils/profileImage";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    nic: "",
    gender: "",
    dob: "",
    district: "",
    slmcNumber: "",
    specialization: "",
    hospitalAttached: "",
    age: null,
    availability: "",
    profilePicUrl: null,
    profileComplete: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [picTimestamp, setPicTimestamp] = useState(Date.now());


  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${user.id}`);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // 1. Mobile Number (Supports 07... and +947...)
    const mobileErr = validateLankanMobile(profile.mobileNumber);
    if (mobileErr) {
      toast.error(mobileErr);
      return false;
    }

    // 2. NIC (9 digits + V/X or 12 digits)
    const nicErr = validateNIC(profile.nic);
    if (nicErr) {
      toast.error(nicErr);
      return false;
    }

    // 3. DOB (Not in future, realistic age)
    const dobErr = validateDOB(profile.dob);
    if (dobErr) {
      toast.error(dobErr);
      return false;
    }

    // 4. Required fields for Doctor
    if (user.role === 'DOCTOR') {
      if (!profile.slmcNumber) { toast.error("SLMC Number is required for doctors."); return false; }
      if (!profile.specialization) { toast.error("Specialization is required for doctors."); return false; }
      if (!profile.hospitalAttached) { toast.error("Hospital attachment is required."); return false; }
    }

    return true;
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Map frontend fields to backend DTO
      const payload = {
        name: profile.name,
        mobileNumber: profile.mobileNumber,
        nic: profile.nic,
        gender: profile.gender,
        dob: profile.dob,
        district: profile.district,
        slmcNumber: profile.slmcNumber,
        specialization: profile.specialization,
        hospitalAttached: profile.hospitalAttached,
        availability: profile.availability
      };

      const res = await api.put(`/users/${user.id}`, payload);
      setProfile(res.data);
      
      // Update local storage for sidebar/header persistence
      const updatedUser = { ...user, name: res.data.name };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userUpdated"));

      // Synchronize with clinical Doctor Service if user is a DOCTOR
      if (user.role === 'DOCTOR') {
        try {
          const docRes = await api.get(`/doctors/email/${user.email}`);
          const doctorId = docRes.data.id;
          await api.put(`/doctors/${doctorId}`, {
            name: profile.name,
            email: user.email,
            specialization: profile.specialization,
            phone: profile.mobileNumber,
            availability: profile.availability,
            hospital: profile.hospitalAttached
          });
          console.log("Clinical profile synchronized.");
        } catch (syncErr) {
          console.warn("Clinical profile sync failed:", syncErr);
          // Non-critical error, don't block the user
        }
      }
      
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };
  
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return toast.error("Please select a valid image file (JPG, PNG).");
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File size should not exceed 5MB.");
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadingPic(true);
    try {
      const res = await api.post(`/users/${user.id}/upload-profile-pic`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProfile(prev => ({ ...prev, profilePicUrl: res.data.profilePicUrl }));
      setPicTimestamp(Date.now());
      
      // Update local storage for sidebar/header persistence
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...storedUser, profilePicUrl: res.data.profilePicUrl }));
      window.dispatchEvent(new Event("userUpdated"));
      
      toast.success("Profile picture updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload profile picture.");
    } finally {
      setUploadingPic(false);
    }
  };



  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="skeleton" style={{ height: "400px", width: '100%' }}></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Account Settings</h1>
        <p>Update your personal information and professional credentials.</p>
      </div>

      <form onSubmit={saveProfile} className="dash-grid-main">
        {/* Left Column: Extensive Profile Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title"><IdCard size={20} /> Basic Information</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={iconStyle} />
                  <input type="text" className="form-input" style={{ paddingLeft: '38px' }} name="name" 
                    value={profile.name || ''} onChange={handleProfileChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email (Identifier)</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={iconStyle} />
                  <input type="email" className="form-input" style={{ paddingLeft: '38px', backgroundColor: '#F8FAFC', opacity: 0.8 }} 
                    value={profile.email || ''} readOnly />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={iconStyle} />
                  <input type="tel" className="form-input" style={{ paddingLeft: '38px' }} name="mobileNumber" 
                    value={profile.mobileNumber || ''} onChange={handleProfileChange} placeholder="07... or +947..." />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">NIC Number</label>
                <div style={{ position: 'relative' }}>
                  <Fingerprint size={16} style={iconStyle} />
                  <input type="text" className="form-input" style={{ paddingLeft: '38px' }} name="nic" 
                    value={profile.nic || ''} onChange={handleProfileChange} placeholder="OLD or NEW NIC" />
                </div>
              </div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title"><Calendar size={20} /> Personal Details</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-input" name="dob" 
                  value={profile.dob || ''} onChange={handleProfileChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Age (Auto-calculated)</label>
                <input type="text" className="form-input" style={{ backgroundColor: '#F8FAFC' }} 
                  value={profile.age ? `${profile.age} years` : 'N/A'} readOnly />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-input" name="gender" value={profile.gender || ''} onChange={handleProfileChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">District</label>
                <div style={{ position: 'relative' }}>
                  <MapIcon size={16} style={iconStyle} />
                  <input type="text" className="form-input" style={{ paddingLeft: '38px' }} name="district" 
                    value={profile.district || ''} onChange={handleProfileChange} placeholder="Colombo, Kandy, etc." />
                </div>
              </div>
            </div>
          </div>

          {user.role === 'DOCTOR' && (
            <div className="dash-card">
              <div className="dash-card-header">
                <h2 className="dash-card-title"><Briefcase size={20} /> Professional Credentials</h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">SLMC Number</label>
                  <input type="text" className="form-input" name="slmcNumber" 
                    value={profile.slmcNumber || ''} onChange={handleProfileChange} placeholder="SLMC/XXXXX" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input type="text" className="form-input" name="specialization" 
                    value={profile.specialization || ''} onChange={handleProfileChange} placeholder="e.g. Cardiologist" required />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Hospital / Clinic Attachment</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={iconStyle} />
                    <input type="text" className="form-input" style={{ paddingLeft: '38px' }} name="hospitalAttached" 
                      value={profile.hospitalAttached || ''} onChange={handleProfileChange} placeholder="Name of Hospital" required />
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Availability (Working Hours)</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={iconStyle} />
                    <input type="text" className="form-input" style={{ paddingLeft: '38px' }} name="availability" 
                      value={profile.availability || ''} onChange={handleProfileChange} placeholder="e.g. Mon, Wed, Fri (9 AM - 5 PM)" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-outline" onClick={fetchProfile}>Discard Changes</button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '160px' }} disabled={saving}>
              {saving ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        </div>

        {/* Right Column: Profile Picture, Security & Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title"><Camera size={20} /> Profile Picture</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '10px 0' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                overflow: 'hidden', 
                border: '4px solid #f1f5f9',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                position: 'relative',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {profile.profilePicUrl ? (
                  <img 
                    src={resolveProfileImageUrl(profile.profilePicUrl, picTimestamp)} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(profile.name || "User") + "&background=random";
                    }}
                  />
                ) : (
                  <User size={60} color="#cbd5e1" />
                )}
                
                {uploadingPic && (
                  <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    backgroundColor: 'rgba(255,255,255,0.7)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <div className="spinner-small" style={{ borderTopColor: 'var(--primary)' }}></div>
                  </div>
                )}
              </div>
              
              <div style={{ width: '100%' }}>
                <input
                  type="file"
                  id="profile-pic-upload"
                  hidden
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  disabled={uploadingPic}
                />
                <label 
                  htmlFor="profile-pic-upload" 
                  className="btn btn-outline" 
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    cursor: uploadingPic ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Upload size={16} />
                  {uploadingPic ? "Uploading..." : "Upload New Photo"}
                </label>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Allowed: JPG, PNG. Max 5MB.
              </p>
            </div>
          </div>



          <div className="dash-card" style={{ backgroundColor: profile.profileComplete ? 'var(--success-bg)' : '#FEF2F2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield size={24} color={profile.profileComplete ? 'var(--success)' : 'var(--danger)'} />
              <div>
                <h4 style={{ margin: 0 }}>Profile Status</h4>
                <p style={{ margin: 0, fontSize: '0.8rem' }}>
                  {profile.profileComplete ? "Information Complete" : "Incomplete Profile"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

const iconStyle = { 
  position: 'absolute', 
  left: '12px', 
  top: '12px', 
  color: 'var(--text-muted)',
  pointerEvents: 'none'
};
