import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { CreditCard, CheckCircle, ShieldCheck } from "lucide-react";
import "../components/DashboardShared.css";

export default function Payment() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("PENDING"); // PENDING, PROCESSING, SUCCESS

  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const apptRes = await api.get(`/appointments/${appointmentId}`);
        setAppointment(apptRes.data);
        
        // Also check if payment already made
        const payRes = await api.get(`/payments/user/${user.id}`);
        const existingPayment = payRes.data.find(p => p.appointmentId === appointmentId);
        
        if (existingPayment && existingPayment.status === 'COMPLETED') {
          setPaymentStatus('SUCCESS');
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load appointment details block.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [appointmentId, user.id]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaymentStatus("PROCESSING");
    setError(null);
    try {
      const payload = {
        appointmentId: appointmentId,
        patientId: user.id,
        doctorId: appointment.doctorId,
        amount: 2500, // Using default simulated fee
        currency: "LKR",
        paymentMethod: "CARD",
        status: "COMPLETED"
      };

      await api.post('/payments/process', payload);
      
      // Update appointment status to ACCEPTED since payment done
      await api.put(`/appointments/${appointmentId}/status`, { status: "ACCEPTED" });

      setPaymentStatus("SUCCESS");
      
      // Create a notification for the patient automatically
      await api.post('/notifications', {
        userId: user.id,
        message: `Payment of LKR 2500 successful for appointment with Dr. ${appointment.doctorName}.`,
        type: "PAYMENT",
        read: false
      });
      
    } catch (err) {
      console.error(err);
      setError("Payment processing failed. Please try again.");
      setPaymentStatus("PENDING");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="skeleton" style={{ width: '400px', height: '400px' }}></div>
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="dashboard-container">
        <div className="dash-card" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
          {error}
          <div style={{ marginTop: '16px' }}>
            <button className="btn btn-outline" onClick={() => navigate('/patient/dashboard/appointments')}>Back to Appointments</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="dash-card" style={{ maxWidth: "500px", width: "100%" }}>
        
        {paymentStatus === "SUCCESS" ? (
          <div className="empty-state" style={{ padding: "40px 20px" }}>
            <CheckCircle size={64} color="var(--success)" style={{ opacity: 1, marginBottom: '24px' }} />
            <h2 style={{ margin: "0 0 12px", color: "var(--text-main)" }}>Payment Successful!</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontSize: "0.95rem" }}>
              Your appointment with Dr. {appointment?.doctorName} is confirmed.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/patient/dashboard/appointments')}>
              Back to Appointments
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.4rem" }}>Checkout</h2>
              <ShieldCheck size={24} color="var(--success)" />
            </div>

            <div style={{ backgroundColor: "#F8FAFC", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "16px", marginBottom: "24px" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "1rem", color: "var(--text-main)" }}>Order Summary</h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Consultation - Dr. {appointment?.doctorName}</span>
                <span style={{ fontWeight: "600", color: "var(--text-main)" }}>LKR 2,500</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Platform Fee</span>
                <span style={{ fontWeight: "600", color: "var(--text-main)" }}>LKR 0</span>
              </div>
              <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem" }}>
                <span style={{ fontWeight: "600", color: "var(--text-main)" }}>Total</span>
                <span style={{ fontWeight: "bold", color: "var(--primary)" }}>LKR 2,500</span>
              </div>
            </div>

            {error && <div style={{ color: "var(--danger)", marginBottom: "16px", fontSize: "0.9rem" }}>{error}</div>}

            <form onSubmit={handlePayment}>
              <div className="form-group">
                <label className="form-label">Name on Card</label>
                <input type="text" className="form-input" required placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label className="form-label">Card Number</label>
                <div style={{ position: "relative" }}>
                   <CreditCard size={18} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--text-muted)" }} />
                   <input type="text" className="form-input" required placeholder="0000 0000 0000 0000" style={{ paddingLeft: "38px" }} maxLength={19} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <div>
                  <label className="form-label">Expiry</label>
                  <input type="text" className="form-input" required placeholder="MM/YY" maxLength={5} />
                </div>
                <div>
                  <label className="form-label">CVC</label>
                  <input type="password" className="form-input" required placeholder="123" maxLength={4} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", fontSize: "1rem" }} disabled={paymentStatus === "PROCESSING"}>
                {paymentStatus === "PROCESSING" ? "Processing..." : `Pay LKR 2,500`}
              </button>
              
              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <button type="button" className="btn btn-outline" style={{ border: "none", color: "var(--text-muted)" }} onClick={() => navigate(-1)}>
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
