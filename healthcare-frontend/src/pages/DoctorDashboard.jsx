import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../services/api";
import "./DoctorDashboard.css";
import "../pages/PatientDashboard.css";

const DoctorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const stored = localStorage.getItem("user");
  const user = useMemo(() => {
    if (!stored || stored === "undefined") return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }, [stored]);

  const fetchProfile = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/doctors/email/${user.email}`);
      setProfile(res.data);
    } catch (err) {
      // Auto-Sync for legacy/seeded doctors missing a clinical profile
      if (err.response?.status === 404) {
        try {
          const createRes = await api.post("/doctors", {
            name: user.name,
            email: user.email,
            specialization: user.specialization || "General Physician",
            phone: user.mobileNumber,
            availability: "Clinical schedule pending",
          });
          setProfile(createRes.data);
          console.log("Medical profile auto-synchronized successfully");
        } catch (syncErr) {
          console.error("Auto-sync failed:", syncErr);
          setProfile(user);
        }
      } else {
        console.warn("Could not fetch doctor profile:", err);
        setProfile(user);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.profileComplete === false)
    return <Navigate to="/complete-profile" replace />;

  return (
    <div className="premium-dashboard">
      {profile && !profile.verified && (
        <div className="premium-error" style={{ marginBottom: "20px" }}>
          <AlertTriangle size={20} style={{ marginRight: "10px" }} />
          <span>
            Account Pending Approval: Your medical credentials are currently
            being verified by the administrator. Some features may be
            restricted.
          </span>
        </div>
      )}

      {loading ? (
        <div className="skeleton" style={{ height: "80vh" }} />
      ) : (
        <Outlet context={{ profile, setProfile }} />
      )}
    </div>
  );
};

export default DoctorDashboard;
