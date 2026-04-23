import React from "react";
import SymptomCheckerPanel from "../../components/patient/SymptomCheckerPanel";
import "../../components/DashboardShared.css";

export default function SymptomCheckerPage() {
  return (
    <div className="dashboard-container" style={{ padding: '32px 24px', background: '#f8fafc', minHeight: '100vh' }}>
      <SymptomCheckerPanel fullPage={true} />
    </div>
  );
}
