import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import logo from "../assets/logo.png";

export default function Home() {
  const [searchParams, setSearchParams] = useState({
    name: "",
    specialization: "",
    hospital: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [allDoctors, setAllDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctors/verified");
        setAllDoctors(res.data);
      } catch (err) {
        console.error("Failed to fetch doctors on mount", err);
      }
    };
    fetchDoctors();
  }, []);

  // Real-time filtering logic
  useEffect(() => {
    const hasActiveFilters =
      searchParams.name || searchParams.specialization || searchParams.hospital;

    if (!hasActiveFilters) {
      setSearched(false);
      setSearchResults([]);
      return;
    }

    setSearched(true);
    let filtered = allDoctors;

    if (searchParams.name) {
      filtered = filtered.filter((d) =>
        d.name.toLowerCase().includes(searchParams.name.toLowerCase()),
      );
    }
    if (searchParams.specialization) {
      filtered = filtered.filter(
        (d) => d.specialization === searchParams.specialization,
      );
    }
    if (searchParams.hospital) {
      filtered = filtered.filter((d) => {
        const hospital =
          d.hospitalAttached || d.hospitalName || d.hospital || d.clinic || "";
        return hospital
          .toLowerCase()
          .includes(searchParams.hospital.toLowerCase());
      });
    }

    setSearchResults(filtered);
  }, [searchParams, allDoctors]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="home-page">
      {/* ════════════════════════════════════════════ */}
      {/*  HERO SECTION                                */}
      {/* ════════════════════════════════════════════ */}
      {/*  HERO SECTION                                */}
      {/* ════════════════════════════════════════════ */}
      <section className="home-hero">
        {/* Content */}
        <div className="home-hero__content">
          <h1 className="home-hero__tagline">
            Experience the Future <br />
            of Digital Healthcare
          </h1>
          <div className="home-hero__actions">
            <Link
              to="/register/patient"
              className="home-hero__btn home-hero__btn--primary"
            >
              Book Appointment
            </Link>
            <Link
              to="/login"
              className="home-hero__btn home-hero__btn--outline"
            >
              Member Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  TICKER SECTION                              */}
      {/* ════════════════════════════════════════════ */}
      <div className="home-ticker">
        <div className="home-ticker__track">
          <span className="home-ticker__item">
            Direct Channelling to 50+ Specialists
          </span>
          <span className="home-ticker__item">
            Secure Telemedicine 2.0 Interface
          </span>
          <span className="home-ticker__item">
            Island-wide Hospital Integration
          </span>
          <span className="home-ticker__item">
            End-to-End Encrypted Consultations
          </span>
          <span className="home-ticker__item">
            Resilient Microservices Architecture
          </span>
          <span className="home-ticker__item">
            AI Symptoms Diagnostics Active
          </span>

          {/* Duplicate set for seamless scrolling */}
          <span className="home-ticker__item">
            Direct Channelling to 50+ Specialists
          </span>
          <span className="home-ticker__item">
            Secure Telemedicine 2.0 Interface
          </span>
          <span className="home-ticker__item">
            Island-wide Hospital Integration
          </span>
          <span className="home-ticker__item">
            End-to-End Encrypted Consultations
          </span>
          <span className="home-ticker__item">
            Resilient Microservices Architecture
          </span>
          <span className="home-ticker__item">
            AI Symptoms Diagnostics Active
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/*  HOW IT WORKS                                */}
      {/* ════════════════════════════════════════════ */}
      <section className="section-light home-journey-section">
        <div className="home-features__inner">
          <span className="home-features__badge">Your Journey</span>
          <h2 className="home-features__heading">The Direct Path to Care</h2>
          <div className="path-container">
            <div className="path-step">
              <div className="path-step__number">
                <svg viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="path-step__title">Search Specialists</h3>
              <p className="path-step__text">
                Browse verified clinical experts by name, specialization, or
                preferred hospital facility.
              </p>
            </div>
            <div className="path-step">
              <div className="path-step__number">
                <svg viewBox="0 0 24 24">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="path-step__title">Instant Booking</h3>
              <h4 className="path-step__note">Real-time synchronization</h4>
              <p className="path-step__text">
                Select your preferred slot and confirm your channelling with
                Stripe-verified security.
              </p>
            </div>
            <div className="path-step">
              <div className="path-step__number">
                <svg viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="path-step__title">Expert Consultation</h3>
              <p className="path-step__text">
                Visit in-person or connect via our HD telemedicine suite for
                personalized clinical guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  CORE FEATURES                               */}
      {/* ════════════════════════════════════════════ */}
      <section className="home-features">
        <div
          className="home-visual-blob"
          style={{ top: "-100px", left: "-100px" }}
        ></div>
        <div
          className="home-visual-blob home-visual-blob--secondary"
          style={{ bottom: "-100px", right: "-100px" }}
        ></div>
        <div className="home-features__inner">
          <span className="home-features__badge">Integrations</span>
          <h2 className="home-features__heading">
            Integrated Hospital Network
          </h2>
          <p className="home-features__desc home-features__desc--integrations">
            Direct digital channelling active for Sri Lanka's leading medical
            institutions. Experience zero double-bookings through our
            centralized microservices bridge.
          </p>

          <div className="home-hospital-strip">
            <span className="home-hospital-strip__item">Asiri Hospitals</span>
            <span className="home-hospital-strip__item">Lanka Hospitals</span>
            <span className="home-hospital-strip__item">Nawaloka Hospital</span>
            <span className="home-hospital-strip__item">Hemas Hospital</span>
            <span className="home-hospital-strip__item">Kings Hospital</span>
          </div>

          <span className="home-features__badge">Platform Capabilities</span>
          <h2 className="home-features__heading">Precision Care Simplified</h2>
          <div className="home-features__grid">
            {/* Card 1 — Doctor Channelling */}
            <div className="home-feature-card">
              <div
                className="home-feature-card__icon home-feature-card__icon--teal"
                style={{ background: "#e0f2fe" }}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="home-feature-card__title">Unified Channelling</h3>
              <p className="home-feature-card__text">
                Browse and book verified specialists across Sri Lanka's leading
                hospitals. Experience real-time slot synchronization and
                immediate booking confirmation.
              </p>
            </div>

            {/* Card 2 — Video Consultations */}
            <div className="home-feature-card">
              <div
                className="home-feature-card__icon home-feature-card__icon--green"
                style={{ background: "#dcfce7" }}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="home-feature-card__title">Telemedicine 2.0</h3>
              <p className="home-feature-card__text">
                Consult with your doctor from any location via our HD video
                suite. Secured by bank-grade encryption and integrated with
                instant digital prescriptions.
              </p>
              <span className="home-feature-card__tag home-feature-card__tag--new">
                High Definition
              </span>
            </div>

            {/* Card 3 — AI Symptom Checker */}
            <div className="home-feature-card">
              <div
                className="home-feature-card__icon home-feature-card__icon--blue"
                style={{ background: "#ede9fe" }}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="home-feature-card__title">AI Diagnostics</h3>
              <p className="home-feature-card__text">
                Leverage Google Gemini AI for initial symptom assessments. Our
                intelligent engine helps you find the right specialist faster
                based on clinical reporting.
              </p>
              <span className="home-feature-card__tag home-feature-card__tag--ai">
                powered by Gemini
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  DOCTOR SEARCH                               */}
      {/* ════════════════════════════════════════════ */}
      <section className="home-search">
        <div className="home-search__inner">
          <h2 className="home-search__heading">Find Your Specialist</h2>

          <div className="home-search__glass-box">
            <form onSubmit={handleSearchSubmit} className="home-search__form">
              <div className="home-search__field">
                <label>Doctor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Anil Peiris"
                  value={searchParams.name}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, name: e.target.value })
                  }
                />
              </div>

              <div className="home-search__field">
                <label>Specialization</label>
                <select
                  value={searchParams.specialization}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      specialization: e.target.value,
                    })
                  }
                >
                  <option value="">Any Specialization</option>
                  <option value="Cardiologist">Cardiologist (Heart)</option>
                  <option value="Pediatrician">Pediatrician (Children)</option>
                  <option value="Neurologist">Neurologist (Brain)</option>
                  <option value="Dermatologist">Dermatologist (Skin)</option>
                  <option value="Orthopedic Surgeon">
                    Orthopedic Surgeon (Bones)
                  </option>
                  <option value="ENT Surgeon">
                    ENT Surgeon (Ear/Nose/Throat)
                  </option>
                  <option value="Psychiatrist">
                    Psychiatrist (Mental Health)
                  </option>
                  <option value="General Practitioner">
                    General Practitioner (GP)
                  </option>
                  <option value="Ophthalmologist">
                    Ophthalmologist (Eye Surgeon)
                  </option>
                  <option value="Obstetrician & Gynecologist">
                    Obstetrician & Gynecologist (VOG)
                  </option>
                </select>
              </div>

              <div className="home-search__field">
                <label>Hospital</label>
                <select
                  value={searchParams.hospital}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      hospital: e.target.value,
                    })
                  }
                >
                  <option value="">Any Hospital</option>
                  <option value="Asiri">Asiri Hospital</option>
                  <option value="Lanka">Lanka Hospitals</option>
                  <option value="Nawaloka">Nawaloka Hospital</option>
                  <option value="Hemas">Hemas Hospital</option>
                  <option value="Kings">Kings Hospital</option>
                </select>
              </div>

              <button
                type="button"
                className="home-search__reset-btn"
                onClick={() =>
                  setSearchParams({
                    name: "",
                    specialization: "",
                    hospital: "",
                  })
                }
              >
                Reset
              </button>
            </form>
          </div>

          {/* Search Results */}
          {searched && (
            <div className="home-results">
              <div className="home-results__header">
                <h3 className="home-results__title">
                  {`${searchResults.length} Doctor${searchResults.length !== 1 ? "s" : ""} Found`}
                </h3>
                <button
                  className="home-results__clear"
                  onClick={() => {
                    setSearched(false);
                    setSearchResults([]);
                    setSearchParams({
                      name: "",
                      specialization: "",
                      hospital: "",
                    });
                  }}
                >
                  Clear Results
                </button>
              </div>

              {searchResults.length > 0 ? (
                <div className="home-results__grid">
                  {searchResults.map((doctor, index) => (
                    <div
                      key={doctor.id}
                      className="home-doctor-card"
                      style={{
                        animationDelay: `${index * 0.08}s`,
                        animation: "homeFadeUp 0.5s ease-out both",
                      }}
                    >
                      <div className="home-doctor-card__header">
                        <div className="home-doctor-card__avatar">
                          {doctor.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="home-doctor-card__name">
                            {doctor.name}
                          </h4>
                          <p className="home-doctor-card__spec">
                            {doctor.specialization}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="home-doctor-card__detail">
                          <span className="home-doctor-card__detail-icon"></span>
                          <span className="home-doctor-card__detail-text">
                            {doctor.availability ||
                              "Availability info not provided"}
                          </span>
                        </div>
                        <div className="home-doctor-card__detail">
                          <span className="home-doctor-card__detail-icon"></span>
                          <span className="home-doctor-card__detail-text">
                            {
                              [
                                "Asiri Hospital",
                                "Lanka Hospitals",
                                "Nawaloka Hospital",
                                "Hemas Hospital",
                                "Kings Hospital",
                              ][doctor.id % 5]
                            }
                          </span>
                        </div>
                      </div>
                      <Link to="/login" className="home-doctor-card__book-btn">
                        Book Appointment
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="home-results__empty">
                  <p>
                    No doctors found matching your criteria. Try adjusting your
                    filters.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  WHY CHOOSE US                               */}
      {/* ════════════════════════════════════════════ */}
      <section className="home-why">
        <div className="home-why__inner">
          <h2 className="home-why__heading">Built Different. Built Better.</h2>

          <div className="home-why__grid">
            <div className="home-why-card">
              <div className="home-why-card__icon"></div>
              <h3 className="home-why-card__title">Island-wide Coverage</h3>
              <p className="home-why-card__text">
                Channel doctors from top hospitals across Sri Lanka with a
                single click. Real-time slot management ensures zero
                double-bookings.
              </p>
            </div>

            <div className="home-why-card">
              <div className="home-why-card__icon"></div>
              <h3 className="home-why-card__title">Bank-grade Security</h3>
              <p className="home-why-card__text">
                JWT authentication, role-based access control, and
                Stripe-verified payment intents protect every transaction
                end-to-end.
              </p>
            </div>

            <div className="home-why-card">
              <div className="home-why-card__icon"></div>
              <h3 className="home-why-card__title">Instant Notifications</h3>
              <p className="home-why-card__text">
                Real-time email and in-app notifications keep patients and
                doctors synchronized on appointments, prescriptions, and
                updates.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
