import React from 'react';

export default function About() {
  return (
    <div className="about-page">
      <header className="static-header">
        <h1>The Future of Care</h1>
        <p>Sri Lanka's leading clinical routing engine, designed for high-precision healthcare delivery.</p>
      </header>

      <div className="home-features__inner" style={{ padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px', marginBottom: '80px' }}>
          <div className="flat-card">
            <span className="home-features__badge" style={{ marginBottom: '16px' }}>Our Mission</span>
            <h2 className="path-step__title" style={{ fontSize: '1.75rem' }}>Orchestrating Wellness</h2>
            <p className="path-step__text">
              To revolutionize the patient experience by orchestrating a seamless, 
              data-driven healthcare ecosystem. We bridge the distance between top-tier medical 
              specialists and the communities that need them.
            </p>
          </div>

          <div className="flat-card">
            <span className="home-features__badge" style={{ marginBottom: '16px' }}>Clinical Excellence</span>
            <h2 className="path-step__title" style={{ fontSize: '1.75rem' }}>Precision Architecture</h2>
            <p className="path-step__text">
              Clinexa is a resilient microservices architecture built for 99.9% uptime and bank-grade security. 
              By partnering with the island's premier hospital groups, we ensure that specialized care is always reachable.
            </p>
          </div>
        </div>

        <section className="section-light" style={{ borderRadius: 'var(--radius-md)', padding: '60px 40px', marginBottom: '100px' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="home-features__badge">Foundation</span>
            <h2 className="home-features__heading">Our Core Values</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
            <div className="path-step">
              <div className="path-step__number">
                <svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4M7.835 4.697a.742.742 0 00-1.051-.183l-1.44 1.14a.742.742 0 01-1.127-.453l-.53-1.803a.742.742 0 00-.91-.527l-1.803.53a.742.742 0 01-.892-.816l.183-1.803a.742.742 0 00-.527-.91l-1.803-.53a.742.742 0 01-.453-1.127l1.14-1.44a.742.742 0 00-.183-1.051l-1.44-1.14a.742.742 0 01.183-1.051z" /></svg>
              </div>
              <h3 className="path-step__title">Clinical Integrity</h3>
              <p className="path-step__text">Every specialist is strictly verified against national medical councils.</p>
            </div>
            <div className="path-step">
              <div className="path-step__number">
                <svg viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="path-step__title">Data Sovereignty</h3>
              <p className="path-step__text">Patient records are end-to-end encrypted with zero-knowledge architecture.</p>
            </div>
            <div className="path-step">
              <div className="path-step__number">
                <svg viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="path-step__title">Instant Access</h3>
              <p className="path-step__text">Reducing the wait-time for specialized care through AI slot optimization.</p>
            </div>
            <div className="path-step">
              <div className="path-step__number">
                <svg viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </div>
              <h3 className="path-step__title">Patient Empathy</h3>
              <p className="path-step__text">Humanizing digital interfaces to ensure a supportive clinical journey.</p>
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
    lineHeight: '1.6',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '30px',
  },
  card: {
    background: 'var(--bg-white)',
    border: '1px solid var(--border-light)',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
  },
  cardTitle: {
    fontSize: '22px',
    color: 'var(--primary)',
    marginBottom: '20px',
    fontWeight: '600',
  },
  text: {
    fontSize: '15px',
    color: 'var(--text-main)',
    lineHeight: '1.8',
  }
};
