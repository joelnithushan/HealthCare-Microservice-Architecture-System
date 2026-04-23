import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  UserCheck,
  ShieldCheck,
  CreditCard,
  BadgeCheck,
  CalendarDays,
  ArrowRight,
  Clock3,
  CircleDashed,
  CalendarClock,
  TrendingUp,
} from "lucide-react";

import "./AdminOverview.css";

const AdminOverview = () => {
  const [summary, setSummary] = useState({
    total: 0,
    patients: 0,
    doctors: 0,
    admins: 0,
    incomplete: 0,
    pendingDoctors: 0,
    appointments: 0,
    appointmentsToday: 0,
    appointmentsThisMonth: 0,
    revenueThisMonth: 0,
  });
  const [paymentStats, setPaymentStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, payStatsRes, aptsRes, trxsRes] =
          await Promise.allSettled([
            api.get("/admin/users"),
            api.get("/admin/payments/stats"),
            api.get("/admin/appointments"),
            api.get("/admin/payments"),
          ]);

        const users =
          usersRes.status === "fulfilled" ? usersRes.value.data : [];
        const patients = users.filter((u) => u.role === "PATIENT");
        const doctors = users.filter((u) => u.role === "DOCTOR");
        const admins = users.filter((u) => u.role === "ADMIN");
        const incomplete = users.filter((u) => u.profileComplete === false);
        const pendingDoctorList = users.filter(
          (u) => u.role === "DOCTOR" && !u.approved,
        );

        // Compute appointment stats
        const allAppointments =
          aptsRes.status === "fulfilled" ? aptsRes.value.data : [];
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const appointmentsToday = allAppointments.filter((a) => {
          const d = a.appointmentDate;
          if (!d) return false;
          return d === todayStr || d.startsWith(todayStr);
        }).length;

        const appointmentsThisMonth = allAppointments.filter((a) => {
          if (!a.appointmentDate) return false;
          const d = new Date(a.appointmentDate);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        // Compute revenue this month from payment records
        const allPayments =
          trxsRes.status === "fulfilled" ? trxsRes.value.data : [];
        const revenueThisMonth = allPayments
          .filter((p) => {
            if (
              p.status !== "SUCCESS" &&
              p.status !== "COMPLETED"
            )
              return false;
            if (!p.paymentDate) return false;
            const d = new Date(p.paymentDate);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);

        setSummary({
          total: users.length,
          patients: patients.length,
          doctors: doctors.length,
          admins: admins.length,
          incomplete: incomplete.length,
          pendingDoctors: pendingDoctorList.length,
          appointments: allAppointments.length,
          appointmentsToday,
          appointmentsThisMonth,
          revenueThisMonth,
        });
        setPendingDoctors(pendingDoctorList.slice(0, 4));

        if (payStatsRes.status === "fulfilled")
          setPaymentStats(payStatsRes.value.data);
        if (aptsRes.status === "fulfilled")
          setRecentAppointments(aptsRes.value.data.slice(0, 5));
        if (trxsRes.status === "fulfilled")
          setRecentTransactions(trxsRes.value.data.slice(0, 5));
      } catch (err) {
        setSummary({
          total: 0,
          patients: 0,
          doctors: 0,
          admins: 0,
          incomplete: 0,
          pendingDoctors: 0,
          appointments: 0,
          appointmentsToday: 0,
          appointmentsThisMonth: 0,
          revenueThisMonth: 0,
        });
        setPendingDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="admin-overview">
        <div className="admin-overview__stats">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="admin-metric-card skeleton"
              style={{ height: 132 }}
            />
          ))}
        </div>
      </div>
    );

  const revenueValue = paymentStats
    ? Number(paymentStats.totalRevenue || 0).toLocaleString()
    : "0";
  const topTransactions = recentTransactions.slice(0, 4);
  const topAppointments = recentAppointments.slice(0, 4);

  return (
    <div className="admin-overview">
      <section className="admin-overview__stats">
        <StatCard
          title="Total Patients"
          value={summary.patients}
          caption="Registered patients"
          icon={UserCheck}
          tone="emerald"
        />
        <StatCard
          title="Total Doctors"
          value={summary.doctors}
          caption="Medical providers"
          icon={ShieldCheck}
          tone="blue"
        />
        <StatCard
          title="Appointments Today"
          value={summary.appointmentsToday}
          caption={new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          icon={CalendarDays}
          tone="amber"
        />
        <StatCard
          title="This Month"
          value={summary.appointmentsThisMonth}
          caption={`Appointments in ${new Date().toLocaleDateString("en-US", { month: "long" })}`}
          icon={CalendarClock}
          tone="teal"
        />
        <StatCard
          title="Revenue (Month)"
          value={`LKR ${summary.revenueThisMonth.toLocaleString()}`}
          caption={`${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}
          icon={TrendingUp}
          tone="green"
        />
        <StatCard
          title="Pending Doctors"
          value={summary.pendingDoctors}
          caption="Awaiting verification"
          icon={CircleDashed}
          tone="rose"
        />
      </section>

      <section className="admin-overview__actions">
        <Link to="/admin/dashboard/manage-users" className="admin-action-card">
          <div>
            <span>User management</span>
            <strong>Review accounts</strong>
          </div>
          <ArrowRight size={18} />
        </Link>
        <Link
          to="/admin/dashboard/manage-doctors"
          className="admin-action-card"
        >
          <div>
            <span>Doctor verification</span>
            <strong>Approve practitioners</strong>
          </div>
          <ArrowRight size={18} />
        </Link>
        <Link to="/admin/dashboard/transactions" className="admin-action-card">
          <div>
            <span>Payments & revenue</span>
            <strong>Inspect cash flow</strong>
          </div>
          <ArrowRight size={18} />
        </Link>
        <Link to="/admin/dashboard/system-logs" className="admin-action-card">
          <div>
            <span>Reports & logs</span>
            <strong>Audit system activity</strong>
          </div>
          <ArrowRight size={18} />
        </Link>
      </section>

      <div className="admin-overview__grid">
        <section className="admin-panel-card">
          <div className="admin-panel-card__header">
            <div>
              <h2>Pending Doctor Verifications</h2>
              <p>New practitioners waiting for approval and activation.</p>
            </div>
            <Link
              to="/admin/dashboard/manage-doctors"
              className="admin-panel-card__link"
            >
              View all
            </Link>
          </div>

          {summary.pendingDoctors > 0 ? (
            <div className="admin-list">
              {pendingDoctors.length > 0 ? (
                pendingDoctors.map((doctor) => (
                  <article key={doctor.id} className="admin-list-item">
                    <div className="admin-list-item__avatar">
                      {(doctor.name || "D").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="admin-list-item__body">
                      <div className="admin-list-item__title">
                        Dr. {doctor.name}
                      </div>
                      <div className="admin-list-item__meta">
                        {doctor.specialization || "Specialization pending"}
                        {doctor.hospitalAttached
                          ? ` • ${doctor.hospitalAttached}`
                          : ""}
                      </div>
                    </div>
                    <div className="admin-list-item__actions">
                      <span className="status-badge pending">Pending</span>
                      <Link
                        to="/admin/dashboard/manage-doctors"
                        className="admin-mini-link"
                      >
                        Review
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <div className="admin-empty-state">
                  <BadgeCheck size={34} />
                  <p>No pending doctor details available yet.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="admin-empty-state">
              <BadgeCheck size={34} />
              <p>No pending verifications</p>
            </div>
          )}
        </section>

        <section className="admin-panel-card admin-panel-card--compact">
          <div className="admin-panel-card__header">
            <div>
              <h2>System Health</h2>
              <p>Core activity from the last sync window.</p>
            </div>
          </div>

          <div className="admin-health-list">
            <div className="admin-health-item">
              <span>Total Users</span>
              <strong>{summary.total}</strong>
            </div>
            <div className="admin-health-item">
              <span>Admins</span>
              <strong>{summary.admins}</strong>
            </div>
            <div className="admin-health-item">
              <span>All Appointments</span>
              <strong>{summary.appointments}</strong>
            </div>
            <div className="admin-health-item">
              <span>Total Revenue</span>
              <strong>LKR {revenueValue}</strong>
            </div>
          </div>
        </section>
      </div>

      <div className="admin-overview__grid admin-overview__grid--two">
        <section className="admin-panel-card">
          <div className="admin-panel-card__header">
            <div>
              <h2>Recent Appointments</h2>
              <p>Latest scheduling activity across the platform.</p>
            </div>
          </div>

          {topAppointments.length > 0 ? (
            <div className="admin-list admin-list--dense">
              {topAppointments.map((appointment) => (
                <article
                  key={appointment.id}
                  className="admin-timeline-item"
                >
                  <div className="admin-timeline-item__icon">
                    <Clock3 size={16} />
                  </div>
                  <div className="admin-timeline-item__body">
                    <div className="admin-timeline-item__title">
                      Appointment #{appointment.id}
                    </div>
                    <div className="admin-timeline-item__meta">
                      {appointment.patientName || `Patient ${appointment.patientId}`} • {appointment.doctorName ? `Dr. ${appointment.doctorName}` : `Doctor ${appointment.doctorId}`}
                    </div>
                  </div>
                  <div className="admin-timeline-item__side">
                    <span
                      className={`status-badge ${appointment.status?.toLowerCase() === "completed" || appointment.status?.toLowerCase() === "confirmed" || appointment.status?.toLowerCase() === "accepted" ? "success" : "pending"}`}
                    >
                      {appointment.status || "PENDING"}
                    </span>
                    <span className="admin-timeline-item__date">
                      {appointment.appointmentDate || "N/A"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <CalendarDays size={34} />
              <p>No recent appointments found</p>
            </div>
          )}
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-card__header">
            <div>
              <h2>Recent Transactions</h2>
              <p>Latest revenue entries processed by the gateway.</p>
            </div>
            <Link
              to="/admin/dashboard/transactions"
              className="admin-panel-card__link"
            >
              View all
            </Link>
          </div>

          {topTransactions.length > 0 ? (
            <div className="admin-list admin-list--dense">
              {topTransactions.map((transaction) => (
                <article
                  key={transaction.paymentId}
                  className="admin-timeline-item"
                >
                  <div className="admin-timeline-item__icon admin-timeline-item__icon--money">
                    <CreditCard size={16} />
                  </div>
                  <div className="admin-timeline-item__body">
                    <div className="admin-timeline-item__title">
                      LKR {Number(transaction.amount || 0).toLocaleString()}
                    </div>
                    <div className="admin-timeline-item__meta">
                      {transaction.paymentMethod || "CARD"} •{" "}
                      {transaction.paymentDate
                        ? new Date(transaction.paymentDate).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                  <div className="admin-timeline-item__side">
                    <span
                      className={`status-badge ${transaction.status?.toLowerCase() === "completed" || transaction.status?.toLowerCase() === "success" ? "success" : transaction.status?.toLowerCase() === "failed" ? "failed" : "pending"}`}
                    >
                      {transaction.status || "PENDING"}
                    </span>
                    <span className="admin-timeline-item__date">
                      #{transaction.paymentId}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <CreditCard size={34} />
              <p>No recent transactions found</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, caption, icon: Icon, tone }) => (
  <article className={`admin-metric-card admin-metric-card--${tone}`}>
    <div className="admin-metric-card__icon">
      <Icon size={20} />
    </div>
    <div className="admin-metric-card__value">{value}</div>
    <div className="admin-metric-card__label">{title}</div>
    <div className="admin-metric-card__caption">{caption}</div>
  </article>
);

export default AdminOverview;
