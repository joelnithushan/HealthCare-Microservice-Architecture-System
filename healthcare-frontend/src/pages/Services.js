import React from "react";
import { Link } from "react-router-dom";

export default function Services() {
  return (
    <div className="services-page marketing-page">
      <header className="static-header static-header--modern">
        <h1>Clinical Pillars</h1>
        <p>
          Our ecosystem is driven by dedicated microservices, each optimized for
          specialized patient care.
        </p>
      </header>

      <main className="marketing-content services-content">
        <section className="marketing-section">
          <div className="marketing-section__head">
            <span className="home-features__badge">Patient Services</span>
            <h2 className="home-features__heading">Direct Care Solutions</h2>
          </div>

          <div className="service-grid">
            <article className="service-card">
              <h3 className="service-card__title">Unified Channelling</h3>
              <p className="service-card__desc">
                Real-time clinical scheduling across Sri Lanka's leading
                hospital networks.
              </p>
              <ul className="service-list">
                <li className="service-list__item">
                  <svg viewBox="0 0 24 24" className="service-list__icon">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Verified Specialist DB
                </li>
                <li className="service-list__item">
                  <svg viewBox="0 0 24 24" className="service-list__icon">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Instant SMS/Email Confirmation
                </li>
                <li className="service-list__item">
                  <svg viewBox="0 0 24 24" className="service-list__icon">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Zero-wait Virtual Queing
                </li>
              </ul>
              <Link to="/register/patient" className="service-card__action">
                Book Now
              </Link>
            </article>

            <article className="service-card">
              <h3 className="service-card__title">Telemedicine 2.0</h3>
              <p className="service-card__desc">
                High-definition, end-to-end encrypted video suite for remote
                consultations.
              </p>
              <ul className="service-list">
                <li className="service-list__item">
                  <svg viewBox="0 0 24 24" className="service-list__icon">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Browser-based HD Video
                </li>
                <li className="service-list__item">
                  <svg viewBox="0 0 24 24" className="service-list__icon">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Secure File Exchange
                </li>
                <li className="service-list__item">
                  <svg viewBox="0 0 24 24" className="service-list__icon">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Screen Share Diagnostics
                </li>
              </ul>
              <Link to="/login" className="service-card__action">
                Launch Portal
              </Link>
            </article>
          </div>
        </section>

        <section className="marketing-section">
          <div className="marketing-section__head">
            <span className="home-features__badge">Infrastructure</span>
            <h2 className="home-features__heading">Clinical Intelligence</h2>
          </div>

          <div className="service-grid">
            <article className="service-card">
              <h3 className="service-card__title">AI Diagnostics</h3>
              <p className="service-card__desc">
                Google Gemini-powered preliminary symptom assessments and
                clinical routing.
              </p>
              <ul className="service-list">
                <li className="service-list__item">
                  <svg viewBox="0 0 24 24" className="service-list__icon">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Natural Language Analysis
                </li>
                <li className="service-list__item">
                  <svg viewBox="0 0 24 24" className="service-list__icon">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Specialist Matching Engine
                </li>
                <li className="service-list__item">
                  <svg viewBox="0 0 24 24" className="service-list__icon">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Early-warning Triage
                </li>
              </ul>
              <Link to="/login" className="service-card__action">
                Try AI Checker
              </Link>
            </article>

            <article className="service-card">
              <h3 className="service-card__title">Secure Health-Pay</h3>
              <p className="service-card__desc">
                Transparent billing and instant receipts via Stripe-integrated
                gateway.
              </p>
              <ul className="service-list">
                <li className="service-list__item">
                  <svg viewBox="0 0 24 24" className="service-list__icon">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  PCI-DSS Compliance
                </li>
                <li className="service-list__item">
                  <svg viewBox="0 0 24 24" className="service-list__icon">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Instant Digital Invoicing
                </li>
                <li className="service-list__item">
                  <svg viewBox="0 0 24 24" className="service-list__icon">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Multi-currency Support
                </li>
              </ul>
              <Link to="/login" className="service-card__action">
                Payment Portal
              </Link>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
