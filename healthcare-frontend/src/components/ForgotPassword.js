import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    
    setLoading(true);

    try {
      // Assuming the api Gateway maps /auth paths to user-service
      await api.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
      toast.success('If an account exists, a reset link has been sent to your email.');
    } catch (err) {
      toast.error('Could not send reset link. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.cardContainer}>
        <div style={styles.brandPanel}>
          <img src={logo} alt="Medi Connect" style={styles.brandLogo} />
          <h2 style={styles.brandTitle}>Password Recovery</h2>
          <p style={styles.brandSub}>
            Enter your registered email address and we'll send you an encrypted link to safely regain access to your account.
          </p>
        </div>

        <div style={styles.formPanel}>
          <h2 style={styles.formTitle}>Forgot Password?</h2>
          <p style={styles.formSub}>Secure account recovery via Email SMTP</p>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                className="flat-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nimal.p@gmail.com"
                style={styles.input}
                disabled={loading}
              />
            </div>

            <button type="submit" className="flat-btn" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Sending Mail...' : 'Send Reset Link'}
            </button>
          </form>

          <p style={styles.switchText}>
            Remembered your password?{' '}
            <Link to="/login" style={styles.switchLink}>Back to Login</Link>
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
};

export default ForgotPassword;
