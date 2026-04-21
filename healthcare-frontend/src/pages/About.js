import React from "react";

export default function About() {
  return (
    <div className="about-page marketing-page">
      <header className="static-header static-header--modern">
        <h1>The Future of Care</h1>
        <p>
          Sri Lanka's leading clinical routing engine, designed for
          high-precision healthcare delivery.
        </p>
      </header>

      <main className="marketing-content about-content">
        <section className="about-intro-grid">
          <article className="about-intro-card">
            <span className="home-features__badge">Our Mission</span>
            <h2 className="about-intro-card__title">Orchestrating Wellness</h2>
            <p className="about-intro-card__text">
              To revolutionize the patient experience by orchestrating a
              seamless, data-driven healthcare ecosystem. We bridge the distance
              between top-tier medical specialists and the communities that need
              them.
            </p>
          </article>

          <article className="about-intro-card">
            <span className="home-features__badge">Clinical Excellence</span>
            <h2 className="about-intro-card__title">Precision Architecture</h2>
            <p className="about-intro-card__text">
              Clinexa is a resilient microservices architecture built for 99.9%
              uptime and bank-grade security. By partnering with the island's
              premier hospital groups, we ensure that specialized care is always
              reachable.
            </p>
          </article>
        </section>

        <section className="about-values">
          <div className="marketing-section__head">
            <span className="home-features__badge">Foundation</span>
            <h2 className="home-features__heading">Our Core Values</h2>
          </div>

          <div className="about-values__grid">
            <article className="about-value-card">
              <div className="about-value-card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4M7.835 4.697a.742.742 0 00-1.051-.183l-1.44 1.14a.742.742 0 01-1.127-.453l-.53-1.803a.742.742 0 00-.91-.527l-1.803.53a.742.742 0 01-.892-.816l.183-1.803a.742.742 0 00-.527-.91l-1.803-.53a.742.742 0 01-.453-1.127l1.14-1.44a.742.742 0 00-.183-1.051l-1.44-1.14a.742.742 0 01.183-1.051z" />
                </svg>
              </div>
              <h3 className="about-value-card__title">Clinical Integrity</h3>
              <p className="about-value-card__text">
                Every specialist is strictly verified against national medical
                councils.
              </p>
            </article>
            <article className="about-value-card">
              <div className="about-value-card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="about-value-card__title">Data Sovereignty</h3>
              <p className="about-value-card__text">
                Patient records are end-to-end encrypted with zero-knowledge
                architecture.
              </p>
            </article>
            <article className="about-value-card">
              <div className="about-value-card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="about-value-card__title">Instant Access</h3>
              <p className="about-value-card__text">
                Reducing the wait-time for specialized care through AI slot
                optimization.
              </p>
            </article>
            <article className="about-value-card">
              <div className="about-value-card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="about-value-card__title">Patient Empathy</h3>
              <p className="about-value-card__text">
                Humanizing digital interfaces to ensure a supportive clinical
                journey.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
