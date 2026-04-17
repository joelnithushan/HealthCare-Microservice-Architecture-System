import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { DEFAULT_AVATAR } from '../utils/constants';

const ProfilePicUpload = ({ user, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [timestamp, setTimestamp] = useState(Date.now());

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB");
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error("Invalid file format. Please upload an image.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Determine endpoint based on role
      const endpoint = user.role === 'DOCTOR' 
          ? `/doctors/${user.id}/upload-profile-pic` 
          : `/users/${user.id}/upload-profile-pic`;

      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newPicUrl = response.data.profilePicUrl;
      const t = Date.now();
      setTimestamp(t);
      toast.success('Profile picture updated!');
      
      if (onUploadSuccess) {
        onUploadSuccess(`${newPicUrl}?t=${t}`);
      }
    } catch (err) {
      console.error("Upload error", err);
      toast.error('Failed to upload picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.avatarWrapper}>
      <img 
        src={
          (user.profilePicUrl || user.profilePictureUrl)
            ? ( (user.profilePicUrl || user.profilePictureUrl).startsWith('http') 
                ? (user.profilePicUrl || user.profilePictureUrl) 
                : `http://localhost:8080${user.profilePicUrl || user.profilePictureUrl}${ (user.profilePicUrl || user.profilePictureUrl).includes('?') ? '&' : '?' }t=${timestamp}` )
            : DEFAULT_AVATAR
        } 
        alt="Avatar" 
        style={styles.avatar} 
      />
      {uploading && (
        <div style={styles.uploadingOverlay}>
          <span style={styles.spinner}></span>
        </div>
      )}
      <label style={styles.uploadBtn} title="Upload new profile picture">
        {uploading ? '...' : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        )}
        <input 
          type="file" 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={handleImageChange} 
          disabled={uploading} 
        />
      </label>
    </div>
  );
};

const styles = {
  avatarWrapper: {
    position: 'relative',
    width: '80px',
    height: '80px'
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid var(--primary)'
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid var(--primary)',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  uploadBtn: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    background: 'var(--primary)',
    color: '#fff',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  }
};

export default ProfilePicUpload;
