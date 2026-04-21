import React from "react";

export default function Contact() {
  return (
    <div className="contact-page marketing-page">
      <header className="static-header static-header--modern">
        <h1>Direct Support Channels</h1>
        <p>
          Our dedicated clinical and technical support teams are available to
          assist you 24/7.
        </p>
      </header>

      <main className="marketing-content contact-content">
        <section className="contact-channel-grid">
          <article className="contact-channel-card">
            <div className="contact-channel-card__icon">
              <svg viewBox="0 0 24 24">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <span className="home-features__badge">Clinical Hotline</span>
            <h2 className="contact-channel-card__title">+94 (11) 2123 456</h2>
            <p className="contact-channel-card__text">
              Emergency Medical & Technical Routing Available 24/7
            </p>
            <div className="contact-channel-card__meta">
              Average routing time: <strong>45 seconds</strong>
            </div>
          </article>

          <article className="contact-channel-card">
            <div className="contact-channel-card__icon contact-channel-card__icon--alt">
              <svg viewBox="0 0 24 24">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="home-features__badge">Technical Operations</span>
            <h2 className="contact-channel-card__title">support@clinexa.com</h2>
            <p className="contact-channel-card__text">
              Case-based responses within 12-24 hours for platform issues.
            </p>
            <div className="contact-channel-card__meta">
              24/7 Ticketing System Active
            </div>
          </article>
        </section>

        <section className="contact-region">
          <div className="marketing-section__head">
            <span className="home-features__badge">Global Presence</span>
            <h2 className="home-features__heading">Regional Headquarters</h2>
          </div>

          <div className="contact-region__grid">
            <article className="contact-region__item">
              <div className="contact-region__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="contact-region__title">Colombo, Sri Lanka</h3>
                <p className="contact-region__text">
                  123 Digital Health Corridor,
                  <br />
                  Colombo 03, Sri Lanka
                </p>
              </div>
            </article>
            <article className="contact-region__item">
              <div className="contact-region__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="contact-region__title">Operational Hours</h3>
                <p className="contact-region__text">
                  Clinical Routing: 24/7
                  <br />
                  Admin Support: 8:00 AM - 6:00 PM (IST)
                </p>
              </div>
            </article>
            <article className="contact-region__item">
              <div className="contact-region__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="contact-region__title">Media & Partnerships</h3>
                <p className="contact-region__text">
                  partners@clinexa.com
                  <br />
                  media@clinexa.com
                </p>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
