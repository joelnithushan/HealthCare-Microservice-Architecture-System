import React from 'react';
import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.col}>
          <img src={logo} alt="Clinexa" style={{ height: 140, objectFit: 'contain', marginBottom: 16, marginLeft: -90 }} />
          <p style={styles.text}>
            Your trusted healthcare & telemedicine booking platform.
          </p>
        </div>

        <div style={styles.col}>
          <h4 style={styles.title}>Services</h4>
          <a href="#" style={styles.link}>Channel Your Doctor</a>
          <a href="#" style={styles.link}>Video Consultations</a>
          <a href="#" style={styles.link}>AI Symptom Checker</a>
        </div>

        <div style={styles.col}>
          <h4 style={styles.title}>Legal</h4>
          <a href="#" style={styles.link}>Terms of Service</a>
          <a href="#" style={styles.link}>Privacy Policy</a>
          <a href="#" style={styles.link}>Refund Policy</a>
        </div>

        <div style={styles.col}>
          <h4 style={styles.title}>Contact</h4>
          <p style={styles.text}>Hotline: 011 2 123 456</p>
          <p style={styles.text}>Email: info@clinexa.com</p>
        </div>
      </div>
      <div style={styles.bottom}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--bg-white)', opacity: 0.7 }}>
          &copy; {new Date().getFullYear()} Clinexa. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: 'var(--navy)',
    color: 'var(--bg-white)',
    paddingTop: '60px',
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
    marginBottom: '40px',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '20px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--accent)',
  },
  text: {
    color: '#cbd5e1',
    fontSize: '14px',
    lineHeight: 1.6,
    margin: '0 0 10px 0',
  },
  link: {
    color: '#cbd5e1',
    textDecoration: 'none',
    fontSize: '14px',
    marginBottom: '10px',
    transition: 'color 0.2s',
  },
  bottom: {
    background: '#0a1d2e',
    padding: '20px',
    textAlign: 'center',
    borderTop: '1px solid #1a3c5a',
  }
};
