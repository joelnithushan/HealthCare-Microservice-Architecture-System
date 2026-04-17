import React from 'react';

export default function Contact() {
  return (
    <div className="contact-page">
      <header className="static-header">
        <h1>Direct Support Channels</h1>
        <p>Our dedicated clinical and technical support teams are available to assist you 24/7.</p>
      </header>

      <div className="home-features__inner" style={{ padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', marginBottom: '80px' }}>
          
          <div className="flat-card">
            <div className="path-step__number" style={{ background: '#e0f2fe', color: 'var(--primary)', marginBottom: '16px' }}>
              <svg viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <span className="home-features__badge" style={{ marginBottom: '16px' }}>Clinical Hotline</span>
            <h2 className="path-step__title" style={{ fontSize: '1.75rem' }}>+94 (11) 2123 456</h2>
            <p className="path-step__text">Emergency Medical & Technical Routing Available 24/7</p>
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Average routing time: <strong>45 seconds</strong></p>
            </div>
          </div>

          <div className="flat-card">
            <div className="path-step__number" style={{ background: '#ede9fe', color: 'var(--secondary)', marginBottom: '16px' }}>
              <svg viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <span className="home-features__badge" style={{ marginBottom: '16px' }}>Technical Operations</span>
            <h2 className="path-step__title" style={{ fontSize: '1.75rem' }}>support@clinexa.com</h2>
            <p className="path-step__text">Case-based responses within 12-24 hours for platform issues.</p>
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>24/7 Ticketing System Active</p>
            </div>
          </div>

        </div>

        <section className="section-light" style={{ borderRadius: 'var(--radius-md)', padding: '60px 40px', marginBottom: '100px' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="home-features__badge">Global Presence</span>
            <h2 className="home-features__heading">Regional Headquarters</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
               <div style={{ width: '40px', height: '40px', background: 'var(--navy)', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                 <svg style={{ width: '20px', stroke: 'currentColor', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
               </div>
               <div>
                  <h3 className="path-step__title" style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Colombo, Sri Lanka</h3>
                  <p className="path-step__text">
                    123 Digital Health Corridor,<br />
                    Colombo 03, Sri Lanka
                  </p>
               </div>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
               <div style={{ width: '40px', height: '40px', background: 'var(--navy)', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                 <svg style={{ width: '20px', stroke: 'currentColor', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <div>
                  <h3 className="path-step__title" style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Operational Hours</h3>
                  <p className="path-step__text">
                    Clinical Routing: 24/7<br />
                    Admin Support: 8:00 AM - 6:00 PM (IST)
                  </p>
               </div>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
               <div style={{ width: '40px', height: '40px', background: 'var(--navy)', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                 <svg style={{ width: '20px', stroke: 'currentColor', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
               </div>
               <div>
                  <h3 className="path-step__title" style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Media & Partnerships</h3>
                  <p className="path-step__text">
                    partners@clinexa.com<br />
                    media@clinexa.com
                  </p>
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 20px',
    animation: 'fadeIn 0.5s ease',
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    color: 'var(--navy)',
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '18px',
    color: 'var(--text-muted)',
    maxWidth: '600px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
  },
  card: {
    background: 'var(--bg-white)',
    border: '1px solid var(--border-light)',
    borderRadius: '16px',
    padding: '40px 20px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
  },
  icon: {
    fontSize: '40px',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '20px',
    color: 'var(--primary)',
    marginBottom: '10px',
    fontWeight: '600',
  },
  text: {
    fontSize: '16px',
    color: 'var(--text-main)',
    fontWeight: '500',
    margin: '4px 0',
  },
  textLight: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginTop: '10px',
  }
};
