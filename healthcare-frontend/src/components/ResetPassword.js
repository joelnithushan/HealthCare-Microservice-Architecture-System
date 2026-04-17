import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid or missing reset token.');
      return;
    }
    if (!password) {
      toast.error('Password is required.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (!/(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
      toast.error('Password needs at least 1 uppercase and 1 number.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    
    setLoading(true);

    try {
      await api.post(`/auth/reset-password?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(password)}`);
      toast.success('Password successfully reset! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Token expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.cardContainer}>
        <div style={styles.brandPanel}>
          <img src={logo} alt="Clinexa" style={styles.brandLogo} />
          <h2 style={styles.brandTitle}>Set New Password</h2>
          <p style={styles.brandSub}>
            Please create a strong new password that you haven't used before.
          </p>
        </div>

        <div style={styles.formPanel}>
          <h2 style={styles.formTitle}>Reset Password</h2>
          
          {!token ? (
            <div style={styles.errorBox}>
              Authentication token missing from URL. <Link to="/forgot-password" style={styles.switchLink}>Request a new link</Link>
            </div>
          ) : (
            <>
              <p style={styles.formSub}>Enter your new credentials below</p>

              <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="flat-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      style={{...styles.input, paddingRight: '40px'}}
                      disabled={loading}
                    />
                    <div onClick={togglePasswordVisibility} style={styles.eyeIconContainer}>
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="flat-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      style={{...styles.input, paddingRight: '40px'}}
                      disabled={loading}
                    />
                    <div onClick={togglePasswordVisibility} style={styles.eyeIconContainer}>
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                <button type="submit" className="flat-btn" style={styles.submitBtn} disabled={loading}>
                  {loading ? 'Reseting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          <p style={styles.switchText}>
            <Link to="/login" style={styles.switchLink}>Return to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    minHeight: '80vh',
    animation: 'fadeIn 0.5s ease',
  },
  cardContainer: {
    display: 'flex',
    maxWidth: 900,
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
    height: 100,
    objectFit: 'contain',
    marginBottom: 20,
    alignSelf: 'center',
    filter: 'brightness(0) invert(1)',
  },
  brandTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: 12,
    color: '#fff',
    textAlign: 'center',
  },
  brandSub: {
    fontSize: '0.9rem',
    lineHeight: 1.6,
    opacity: 0.9,
    color: '#fff',
    textAlign: 'center',
  },
  formPanel: {
    flex: 1,
    background: '#fff',
    padding: '40px 50px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: 8,
  },
  formSub: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    marginBottom: 28,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--text-muted)',
    marginBottom: 8,
  },
  input: {
    borderRadius: '8px',
  },
  input: {
    borderRadius: '8px',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '1rem',
    borderRadius: '8px',
    marginTop: 10,
  },
  switchText: {
    textAlign: 'center',
    marginTop: 24,
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  switchLink: {
    color: 'var(--primary)',
    fontWeight: 600,
    textDecoration: 'none',
  },
  eyeIconContainer: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};

export default ResetPassword;
