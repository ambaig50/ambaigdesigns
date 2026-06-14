export default function Analytics() {
  const PLATFORMS = [
    { label: "Pinterest", icon: "📌", color: "var(--pinterest)" },
    { label: "Facebook",  icon: "📘", color: "var(--facebook)"  },
    { label: "Instagram", icon: "📷", color: "var(--instagram)" },
    { label: "Threads",   icon: "🧵", color: "#aaa"             },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Track engagement once your social accounts are connected.</p>
      </div>

      <div style={{ padding: "0 24px 32px", display: "grid", gap: 20 }}>

        {/* Empty state */}
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "2rem", marginBottom: 12 }}>📊</p>
          <p style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>No data yet</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", maxWidth: 380, margin: "0 auto", lineHeight: 1.6 }}>
            Analytics will appear here once you connect your social accounts in Settings and start posting. 
            We'll show likes, shares, saves, and comments per platform.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 20, display: "inline-flex" }}
            onClick={() => window.location.href = "/settings"}
          >
            ⚙️ Go to Settings
          </button>
        </div>

        {/* What will be tracked */}
        <div>
          <p style={{ fontWeight: 700, color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Metrics we'll track
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {PLATFORMS.map(({ label, icon, color }) => (
              <div key={label} className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span>{icon}</span>
                  <span style={{ fontWeight: 700, color }}>{label}</span>
                </div>
                {["Impressions", "Saves / Repins", "Clicks", "Comments"].map(m => (
                  <div key={m} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: "0.8rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>{m}</span>
                    <span className="badge badge-muted">—</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
