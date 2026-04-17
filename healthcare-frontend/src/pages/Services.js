import React from 'react';
import { Link } from 'react-router-dom';

export default function Services() {
  const services = [
    {
      title: "Unified Channelling",
      desc: "Experience real-time clinical scheduling. Browse and book verified specialists across Sri Lanka's leading hospital networks with immediate slot synchronization.",
      actionText: "Book Now",
      path: "/register/patient"
    },
    {
      title: "Telemedicine 2.0",
      desc: "Consult with medical professionals via our high-definition, end-to-end encrypted video suite. Secure, remote care from the comfort of your home.",
      actionText: "View Schedule",
      path: "/login"
    },
    {
      title: "AI Diagnostics",
      desc: "Leverage the power of Google Gemini AI for preliminary symptom assessments. Our engine directs you to the most appropriate specialist based on your reported clinical data.",
      actionText: "Check Symptoms",
      path: "/login" 
    },
    {
      title: "Secure Health-Pay",
      desc: "Manage all clinical costs through our Stripe-integrated payment gateway. Experience transparent billing, instant receipts, and secure transaction history.",
      actionText: "Payment Info",
      path: "/login" 
    }
  ];

  return (
    <div className="services-page">
      <header className="static-header">
        <h1>Clinical Pillars</h1>
        <p>Our ecosystem is driven by dedicated microservices, each optimized for specialized patient care.</p>
      </header>

      <div className="home-features__inner" style={{ padding: '0 20px' }}>
        {/* Category: For Patients */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="home-features__badge">Patient Services</span>
            <h2 className="home-features__heading">Direct Care Solutions</h2>
          </div>
          <div className="home-features__grid">
            <div className="flat-card">
              <h3 className="path-step__title">Unified Channelling</h3>
              <p className="path-step__text" style={{ marginBottom: '16px' }}>Real-time clinical scheduling across Sri Lanka's leading hospital networks.</p>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                <li style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <svg viewBox="0 0 24 24" style={{ width: '16px', stroke: 'var(--primary)', strokeWidth: 3, fill: 'none' }}><path d="M5 13l4 4L19 7" /></svg>
                  Verified Specialist DB
                </li>
                <li style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <svg viewBox="0 0 24 24" style={{ width: '16px', stroke: 'var(--primary)', strokeWidth: 3, fill: 'none' }}><path d="M5 13l4 4L19 7" /></svg>
                  Instant SMS/Email Confirmation
                </li>
                <li style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <svg viewBox="0 0 24 24" style={{ width: '16px', stroke: 'var(--primary)', strokeWidth: 3, fill: 'none' }}><path d="M5 13l4 4L19 7" /></svg>
                  Zero-wait Virtual Queing
                </li>
              </ul>
              <Link to="/register/patient" className="home-doctor-card__book-btn" style={{ textAlign: 'center' }}>Book Now</Link>
            </div>

            <div className="flat-card">
              <h3 className="path-step__title">Telemedicine 2.0</h3>
              <p className="path-step__text" style={{ marginBottom: '16px' }}>High-definition, end-to-end encrypted video suite for remote consultations.</p>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                <li style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <svg viewBox="0 0 24 24" style={{ width: '16px', stroke: 'var(--primary)', strokeWidth: 3, fill: 'none' }}><path d="M5 13l4 4L19 7" /></svg>
                  Browser-based HD Video
                </li>
                <li style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <svg viewBox="0 0 24 24" style={{ width: '16px', stroke: 'var(--primary)', strokeWidth: 3, fill: 'none' }}><path d="M5 13l4 4L19 7" /></svg>
                  Secure File Exchange
                </li>
                <li style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <svg viewBox="0 0 24 24" style={{ width: '16px', stroke: 'var(--primary)', strokeWidth: 3, fill: 'none' }}><path d="M5 13l4 4L19 7" /></svg>
                  Screen Share Diagnostics
                </li>
              </ul>
              <Link to="/login" className="home-doctor-card__book-btn" style={{ textAlign: 'center' }}>Launch Portal</Link>
            </div>
          </div>
        </div>

        {/* Category: Infrastructure */}
        <div style={{ marginBottom: '100px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="home-features__badge">Infrastructure</span>
            <h2 className="home-features__heading">Clinical Intelligence</h2>
          </div>
          <div className="home-features__grid">
            <div className="flat-card">
              <h3 className="path-step__title">AI Diagnostics</h3>
              <p className="path-step__text" style={{ marginBottom: '16px' }}>Google Gemini-powered preliminary symptom assessments and clinical routing.</p>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                <li style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <svg viewBox="0 0 24 24" style={{ width: '16px', stroke: 'var(--primary)', strokeWidth: 3, fill: 'none' }}><path d="M5 13l4 4L19 7" /></svg>
                  Natural Language Analysis
                </li>
                <li style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <svg viewBox="0 0 24 24" style={{ width: '16px', stroke: 'var(--primary)', strokeWidth: 3, fill: 'none' }}><path d="M5 13l4 4L19 7" /></svg>
                  Specialist Matching Engine
                </li>
                <li style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <svg viewBox="0 0 24 24" style={{ width: '16px', stroke: 'var(--primary)', strokeWidth: 3, fill: 'none' }}><path d="M5 13l4 4L19 7" /></svg>
                  Early-warning Triage
                </li>
              </ul>
              <Link to="/login" className="home-doctor-card__book-btn" style={{ textAlign: 'center' }}>Try AI Checker</Link>
            </div>

            <div className="flat-card">
              <h3 className="path-step__title">Secure Health-Pay</h3>
              <p className="path-step__text" style={{ marginBottom: '16px' }}>Transparent billing and instant receipts via Stripe-integrated gateway.</p>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                <li style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <svg viewBox="0 0 24 24" style={{ width: '16px', stroke: 'var(--primary)', strokeWidth: 3, fill: 'none' }}><path d="M5 13l4 4L19 7" /></svg>
                  PCI-DSS Compliance
                </li>
                <li style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <svg viewBox="0 0 24 24" style={{ width: '16px', stroke: 'var(--primary)', strokeWidth: 3, fill: 'none' }}><path d="M5 13l4 4L19 7" /></svg>
                  Instant Digital Invoicing
                </li>
                <li style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <svg viewBox="0 0 24 24" style={{ width: '16px', stroke: 'var(--primary)', strokeWidth: 3, fill: 'none' }}><path d="M5 13l4 4L19 7" /></svg>
                  Multi-currency Support
                </li>
              </ul>
              <Link to="/login" className="home-doctor-card__book-btn" style={{ textAlign: 'center' }}>Payment Portal</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--navy)',
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--text-muted)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
  },
  serviceCard: {
    background: 'var(--bg-white)',
    border: '1px solid var(--border-light)',
    borderRadius: '16px',
    padding: '30px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--primary)',
    marginBottom: '16px',
  },
  cardText: {
    fontSize: '14px',
    color: 'var(--text-main)',
    lineHeight: '1.6',
    flexGrow: 1,
  },
  actionContainer: {
    marginTop: '24px',
  },
  btn: {
    width: '100%',
  }
};
