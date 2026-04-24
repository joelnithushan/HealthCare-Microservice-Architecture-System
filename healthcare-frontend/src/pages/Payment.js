import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { CreditCard, CheckCircle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import "../components/DashboardShared.css";

export default function Payment() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("PENDING"); // PENDING, PROCESSING, SUCCESS
  const [amount, setAmount] = useState(2500);

  const user = React.useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  }, []);

  useEffect(() => {
    // Check if we are returning from PayHere success
    const params = new URLSearchParams(location.search);
    const isSuccess = params.get("status") === "success";
    const returnedPaymentId = params.get("paymentId");

    const fetchDetails = async () => {
      try {
        const apptRes = await api.get(`/appointments/${appointmentId}`);
        setAppointment(apptRes.data);

        if (apptRes.data?.doctorId) {
          try {
            const dRes = await api.get(`/doctors/${apptRes.data.doctorId}`);
            if (dRes.data?.consultationFee) setAmount(Number(dRes.data.consultationFee));
          } catch (e) { /* keep default */ }
        }

        // Handle PayHere Callback
        if (isSuccess && returnedPaymentId) {
          setPaymentStatus("PROCESSING");
          try {
            await api.put(`/payments/${returnedPaymentId}/status`, { status: "SUCCESS" });
            await api.put(`/appointments/${appointmentId}/status`, { status: "PENDING" });
            setPaymentStatus("SUCCESS");
            toast.success("Payment successful — awaiting doctor confirmation");
            setTimeout(() => navigate("/patient/dashboard/appointments"), 3000);
            return; // Skip checking existing payments
          } catch (err) {
            console.error("Failed to verify payment via PayHere callback", err);
          }
        }

        try {
          const payRes = await api.get(`/payments/user/${user.id}`);
          const existing = payRes.data.find(
            (p) => String(p.appointmentId) === String(appointmentId)
          );
          if (existing && existing.status === "SUCCESS") {
            setPaymentStatus("SUCCESS");
          }
        } catch (e) { /* ignore */ }
      } catch (err) {
        console.error(err);
        setError("Failed to load appointment details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [appointmentId, user.id, location.search, navigate]);

  const handlePayHereCheckout = async () => {
    setPaymentStatus("PROCESSING");
    setError(null);
    try {
      // 1. Create Payment Record locally as PENDING
      const payload = {
        appointmentId: Number(appointmentId),
        userId: user.id,
        doctorId: appointment.doctorId,
        amount: amount,
        currency: "LKR",
        paymentMethod: "CARD",
      };

      const res = await api.post("/payments", payload);
      const data = res.data || {};
      const paymentId = data.paymentId || new Date().getTime();

      // 2. Generate secure hash from backend
      const hashRes = await api.post("/payments/payhere/hash", {
        order_id: String(paymentId),
        amount: String(amount),
        currency: "LKR",
      });
      const { hash, merchant_id } = hashRes.data;

      // 3. Prepare PayHere Form
      const returnUrl = `${window.location.origin}/patient/dashboard/pay/${appointmentId}?status=success&paymentId=${paymentId}`;
      const cancelUrl = `${window.location.origin}/patient/dashboard/pay/${appointmentId}?status=cancel`;
      const notifyUrl = `https://healthcare.sandbox.notify/api/payments/notify`;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://sandbox.payhere.lk/pay/checkout";

      const inputs = {
        merchant_id: merchant_id,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        notify_url: notifyUrl,
        order_id: String(paymentId),
        items: `Consultation with Dr. ${appointment?.doctorName}`,
        currency: "LKR",
        amount: Number(amount).toFixed(2),
        first_name: user?.name?.split(" ")[0] || "Patient",
        last_name: user?.name?.split(" ")[1] || "Name",
        email: user?.email || "patient@example.com",
        phone: user?.mobileNumber || "0771234567",
        address: "No. 1, Health Avenue",
        city: "Colombo",
        country: "Sri Lanka",
        hash: hash,
      };

      console.log("PayHere Checkout Inputs:", inputs);

      for (const key in inputs) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = inputs[key];
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();

    } catch (err) {
      console.error(err);
      setError("Failed to initialize PayHere gateway. Please try again.");
      setPaymentStatus("PENDING");
      toast.error("Initialization failed");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="skeleton" style={{ width: "400px", height: "400px" }}></div>
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="dashboard-container">
        <div className="dash-card" style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger)" }}>
          {error}
          <div style={{ marginTop: "16px" }}>
            <button className="btn btn-outline" onClick={() => navigate("/patient/dashboard/appointments")}>Back to Appointments</button>
          </div>
        </div>
      </div>
    );
  }

  const formattedAmount = Number(amount).toLocaleString();

  return (
    <div className="dashboard-container" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="dash-card" style={{ maxWidth: "500px", width: "100%" }}>

        {paymentStatus === "SUCCESS" ? (
          <div className="empty-state" style={{ padding: "40px 20px" }}>
            <CheckCircle size={64} color="var(--success)" style={{ opacity: 1, marginBottom: "24px" }} />
            <h2 style={{ margin: "0 0 12px", color: "var(--text-main)" }}>Payment Successful!</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontSize: "0.95rem" }}>
              Your appointment with Dr. {appointment?.doctorName} is confirmed.
              Redirecting to appointments...
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/patient/dashboard/appointments")}>
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
                <span style={{ fontWeight: "600", color: "var(--text-main)" }}>LKR {formattedAmount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Platform Fee</span>
                <span style={{ fontWeight: "600", color: "var(--text-main)" }}>LKR 0</span>
              </div>
              <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem" }}>
                <span style={{ fontWeight: "600", color: "var(--text-main)" }}>Total</span>
                <span style={{ fontWeight: "bold", color: "var(--primary)" }}>LKR {formattedAmount}</span>
              </div>
            </div>

            {error && <div style={{ color: "var(--danger)", marginBottom: "16px", fontSize: "0.9rem" }}>{error}</div>}

            <div style={{ textAlign: "center", margin: "24px 0" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
                You will be securely redirected to PayHere (Sri Lanka) to complete your payment.
              </p>
              <button 
                onClick={handlePayHereCheckout} 
                className="btn btn-primary" 
                style={{ width: "100%", padding: "12px", fontSize: "1rem", backgroundColor: "#0284c7", borderColor: "#0284c7" }} 
                disabled={paymentStatus === "PROCESSING"}
              >
                {paymentStatus === "PROCESSING" ? "Processing..." : `Pay LKR ${formattedAmount} via PayHere`}
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <button type="button" className="btn btn-outline" style={{ border: "none", color: "var(--text-muted)" }} onClick={() => navigate(-1)}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
