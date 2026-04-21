import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Doctors.css";

const normalizeText = (value) => (value || "").toString().trim();
const normalizeKey = (value) => normalizeText(value).toLowerCase();

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [hospitalFilter, setHospitalFilter] = useState("ALL");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        const doctorRes = await api.get("/doctors/verified");

        const verifiedDoctors = Array.isArray(doctorRes.data)
          ? doctorRes.data
          : [];

        const merged = verifiedDoctors.map((doctor) => ({
          ...doctor,
          name: normalizeText(doctor.name),
          specialization: normalizeText(
            doctor.specialization || "General Practitioner",
          ),
          hospitalAttached:
            normalizeText(
              doctor.hospitalAttached ||
                doctor.hospitalName ||
                doctor.clinic ||
                "",
            ) || "Not specified",
          profilePicUrl: doctor.profilePicUrl || "",
          approved: doctor.verified !== false,
          suspended: false,
        }));

        const filteredForPatient = merged.filter((doctor) => {
          if (doctor.suspended === true) return false;
          if (doctor.approved === false) return false;
          return true;
        });

        setDoctors(filteredForPatient);
      } catch (err) {
        setError("Failed to fetch doctors at the moment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const specializationOptions = useMemo(() => {
    const options = [
      ...new Set(doctors.map((d) => d.specialization).filter(Boolean)),
    ];
    return options.sort((a, b) => a.localeCompare(b));
  }, [doctors]);

  const hospitalOptions = useMemo(() => {
    const options = [
      ...new Set(doctors.map((d) => d.hospitalAttached).filter(Boolean)),
    ];
    return options.sort((a, b) => a.localeCompare(b));
  }, [doctors]);

  const visibleDoctors = useMemo(() => {
    const term = normalizeKey(searchText);

    return doctors.filter((doctor) => {
      const matchesSearch =
        !term ||
        normalizeKey(doctor.name).includes(term) ||
        normalizeKey(doctor.specialization).includes(term) ||
        normalizeKey(doctor.hospitalAttached).includes(term);

      const matchesCategory =
        categoryFilter === "ALL" || doctor.specialization === categoryFilter;

      const matchesHospital =
        hospitalFilter === "ALL" || doctor.hospitalAttached === hospitalFilter;

      return matchesSearch && matchesCategory && matchesHospital;
    });
  }, [doctors, searchText, categoryFilter, hospitalFilter]);

  if (loading) {
    return (
      <div className="doctors-loading-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flat-card doctors-skeleton-card">
            <div className="skeleton doctors-skeleton-avatar" />
            <div className="skeleton doctors-skeleton-line doctors-skeleton-line-lg" />
            <div className="skeleton doctors-skeleton-line doctors-skeleton-line-md" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="doctors-error-box">{error}</div>;
  }

  return (
    <div className="doctors-discovery">
      <div className="doctors-toolbar flat-card">
        <div className="doctors-toolbar-grid">
          <div className="doctors-filter-group doctors-filter-group-wide">
            <label htmlFor="doctor-search" className="doctors-filter-label">
              Search
            </label>
            <input
              id="doctor-search"
              type="text"
              className="flat-input doctors-filter-input"
              placeholder="Search by doctor name, category, or hospital"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="doctors-filter-group">
            <label htmlFor="doctor-category" className="doctors-filter-label">
              Category
            </label>
            <select
              id="doctor-category"
              className="flat-input doctors-filter-input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All categories</option>
              {specializationOptions.map((specialization) => (
                <option key={specialization} value={specialization}>
                  {specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="doctors-filter-group">
            <label htmlFor="doctor-hospital" className="doctors-filter-label">
              Hospital
            </label>
            <select
              id="doctor-hospital"
              className="flat-input doctors-filter-input"
              value={hospitalFilter}
              onChange={(e) => setHospitalFilter(e.target.value)}
            >
              <option value="ALL">All hospitals</option>
              {hospitalOptions.map((hospital) => (
                <option key={hospital} value={hospital}>
                  {hospital}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="doctors-toolbar-meta">
          <span>
            {visibleDoctors.length} doctor
            {visibleDoctors.length === 1 ? "" : "s"} found
          </span>
          {(searchText ||
            categoryFilter !== "ALL" ||
            hospitalFilter !== "ALL") && (
            <button
              type="button"
              className="pat-btn pat-btn--ghost"
              onClick={() => {
                setSearchText("");
                setCategoryFilter("ALL");
                setHospitalFilter("ALL");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {visibleDoctors.length === 0 ? (
        <div className="flat-card doctors-empty-state">
          <div className="doctors-empty-title">
            No doctors match your filters
          </div>
          <div className="doctors-empty-subtitle">
            Try broadening your search, choosing a different category, or
            selecting another hospital.
          </div>
        </div>
      ) : (
        <div className="doctors-grid">
          {visibleDoctors.map((doctor, i) => {
            const displayName = doctor.name || "Doctor";
            const initials = displayName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0].toUpperCase())
              .join("");

            return (
              <article
                key={doctor.id || doctor.email || i}
                className="flat-card doctors-card"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div className="doctors-card-head">
                  <div className="doctors-avatar">{initials || "DR"}</div>
                  <div
                    className="doctors-presence-dot"
                    title={
                      doctor.availability
                        ? "Available schedule added"
                        : "Availability not set"
                    }
                  />
                </div>

                <h3 className="doctors-name">{displayName}</h3>
                <div className="doctors-chip doctors-chip-specialization">
                  {doctor.specialization || "General Practitioner"}
                </div>
                <div className="doctors-hospital">
                  {doctor.hospitalAttached || "Not specified"}
                </div>

                <div className="doctors-availability-wrap">
                  <span
                    className={`doctors-chip ${doctor.availability ? "doctors-chip-available" : "doctors-chip-muted"}`}
                  >
                    {doctor.availability || "Availability not shared yet"}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Doctors;
