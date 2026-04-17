import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.png';

const roles = [
  { value: 'PATIENT', label: 'Patient' },
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'ADMIN', label: 'Admin' },
];

const validateForm = (data) => {
  const errors = {};
  if (!data.name.trim()) errors.name = 'Full name is required.';
  else if (data.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
  else if (data.name.trim().length > 100) errors.name = 'Name must be under 100 characters.';

  if (!data.email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Please enter a valid email address.';

  if (!data.password) errors.password = 'Password is required.';
  else if (data.password.length < 6) errors.password = 'Password must be at least 6 characters.';
  else if (data.password.length > 128) errors.password = 'Password must be under 128 characters.';
  else if (!/[A-Z]/.test(data.password)) errors.password = 'Password must contain at least one uppercase letter.';
  else if (!/[0-9]/.test(data.password)) errors.password = 'Password must contain at least one number.';

  if (!data.role) errors.role = 'Please select a role.';
  return errors;
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PATIENT'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = validateForm(formData);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', formData);
      setSuccess('Account created successfully! Redirecting to login…');
      setError('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Registration failed. Please try again.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return { width: '0%', color: 'transparent', label: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { width: '20%', color: '#ef4444', label: 'Weak' };
    if (score <= 2) return { width: '40%', color: '#f59e0b', label: 'Fair' };
    if (score <= 3) return { width: '60%', color: '#f59e0b', label: 'Good' };
    if (score <= 4) return { width: '80%', color: 'var(--primary)', label: 'Strong' };
    return { width: '100%', color: 'var(--primary)', label: 'Very Strong' };
  };

  const strength = getPasswordStrength();

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.cardContainer}>
        {/* Left blue branding panel */}
        <div style={styles.brandPanel}>
          <img src={logo} alt="Clinexa" style={styles.brandLogo} />
          <h2 style={styles.brandTitle}>Welcome to Clinexa</h2>
          <p style={styles.brandSub}>
            Join thousands of patients and doctors on our integrated healthcare platform.
          </p>
        </div>

        {/* Right white form panel */}
        <div style={styles.formPanel}>
          <h2 style={styles.formTitle}>Create Account</h2>
          <p style={styles.formSub}>Fill in your details to get started</p>

          {error && <div style={styles.errorBox}>{error}</div>}
          {success && <div style={styles.successBox}>{success}</div>}

          <form onSubmit={handleRegister} noValidate>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                className="flat-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                style={{ ...styles.input, ...(fieldErrors.name ? { borderColor: 'red' } : {}) }}
              />
              {fieldErrors.name && <span style={styles.fieldError}>{fieldErrors.name}</span>}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                className="flat-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{ ...styles.input, ...(fieldErrors.email ? { borderColor: 'red' } : {}) }}
              />
              {fieldErrors.email && <span style={styles.fieldError}>{fieldErrors.email}</span>}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                className="flat-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{ ...styles.input, ...(fieldErrors.password ? { borderColor: 'red' } : {}) }}
              />
              {formData.password && (
                <div style={styles.strengthWrapper}>
                  <div style={styles.strengthTrack}>
                    <div style={{ ...styles.strengthBar, width: strength.width, background: strength.color }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: strength.color, whiteSpace: 'nowrap' }}>{strength.label}</span>
                </div>
              )}
              {fieldErrors.password && <span style={styles.fieldError}>{fieldErrors.password}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>I am a…</label>
              <div style={styles.rolePills}>
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => { setFormData({ ...formData, role: r.value }); setFieldErrors(p => ({ ...p, role: '' })); }}
                    style={{
                      ...styles.rolePill,
                      ...(formData.role === r.value ? styles.rolePillActive : {}),
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              {fieldErrors.role && <span style={styles.fieldError}>{fieldErrors.role}</span>}
            </div>

            <button type="submit" className="flat-btn" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.switchLink}>Sign in</Link>
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
    padding: '20px',
    minHeight: 'calc(100vh - 80px)',
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
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brandLogo: {
    height: 80,
    objectFit: 'contain',
    marginBottom: 16,
    alignSelf: 'flex-start',
    filter: 'brightness(0) invert(1)',
  },
  brandTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: 12,
    color: '#fff',
  },
  brandSub: {
    fontSize: '0.9rem',
    lineHeight: 1.6,
    opacity: 0.9,
    color: '#fff',
  },
  formPanel: {
    flex: 1,
    background: '#fff',
    padding: '25px 35px',
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: 8,
  },
  formSub: {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 12,
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
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '10px 14px',
    fontSize: '0.85rem',
    border: '1px solid #f87171',
    marginBottom: 16,
  },
  successBox: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '10px 14px',
    fontSize: '0.85rem',
    border: '1px solid #86efac',
    marginBottom: 16,
  },
  fieldError: {
    display: 'block',
    color: '#ef4444',
    fontSize: '0.75rem',
    marginTop: 4,
    fontWeight: 500,
  },
  strengthWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  strengthTrack: {
    flex: 1,
    height: 4,
    background: '#e2e8f0',
    overflow: 'hidden',
    borderRadius: '4px',
  },
  strengthBar: {
    height: '100%',
    transition: 'width 300ms, background 300ms',
    borderRadius: '8px',
  },
  rolePills: {
    display: 'flex',
    gap: 10,
  },
  rolePill: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '10px 16px',
    background: 'white',
    border: '1px solid var(--border-light)',
    color: 'var(--text-muted)',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'var(--font-base)',
    cursor: 'pointer',
    transition: 'all 150ms',
    borderRadius: '8px',
  },
  rolePillActive: {
    background: 'var(--primary-light)',
    borderColor: 'var(--primary)',
    color: 'var(--primary)',
  },
  submitBtn: {
    width: '100%',
    marginTop: 4,
    padding: '12px',
    fontSize: '1rem',
    borderRadius: '8px',
  },
  switchText: {
    textAlign: 'center',
    marginTop: 16,
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
  },
  switchLink: {
    color: 'var(--primary)',
    fontWeight: 600,
    textDecoration: 'underline',
  },
};

export default Register;
