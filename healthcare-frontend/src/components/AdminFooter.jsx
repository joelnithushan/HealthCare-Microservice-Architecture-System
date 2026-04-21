import React from "react";

export default function AdminFooter() {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <span style={styles.brand}>Clinexa Admin Console</span>
        <span style={styles.copy}>
          © {new Date().getFullYear()} Clinexa. Secure Operations Portal.
        </span>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    marginTop: "auto",
    borderTop: "1px solid var(--admin-border)",
    background: "#ffffff",
  },
  inner: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "12px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    color: "var(--admin-muted)",
    fontSize: "12px",
  },
  brand: {
    fontWeight: 700,
    color: "var(--admin-text)",
    letterSpacing: "0.02em",
  },
  copy: {
    opacity: 0.9,
  },
};
