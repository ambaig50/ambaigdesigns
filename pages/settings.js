import { useState } from "react";

const PLATFORMS = [
  {
    key: "pinterest",
    label: "Pinterest",
    icon: "📌",
    color: "var(--pinterest)",
    envKey: "PINTEREST_CLIENT_ID",
    docsUrl: "https://developers.pinterest.com/",
    steps: [
      "Go to developers.pinterest.com and create an app",
      "Add PINTEREST_CLIENT_ID and PINTEREST_CLIENT_SECRET to Vercel env vars",
      "Set redirect URI to: https://ambaigdesigns.vercel.app/api/pinterestCallback",
    ],
  },
  {
    key: "facebook",
    label: "Facebook / Instagram",
    icon: "📘",
    color: "var(--facebook)",
    envKey: "FACEBOOK_APP_ID",
    docsUrl: "https://developers.facebook.com/",
    steps: [
      "Create a Meta Developer app at developers.facebook.com",
      "Add Facebook Login + Instagram Graph API products",
      "Add FACEBOOK_APP_ID and FACEBOOK_APP_SECRET to Vercel env vars",
    ],
  },
  {
    key: "threads",
    label: "Threads",
    icon: "🧵",
    color: "#aaa",
    envKey: "THREADS_APP_ID",
    docsUrl: "https://developers.facebook.com/docs/threads",
    steps: [
      "Threads uses the same Meta Developer platform",
      "Enable Threads API in your Meta app",
      "Add THREADS_APP_ID and THREADS_APP_SECRET to Vercel env vars",
    ],
  },
];

export default function Settings() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Connect social accounts once you have API credentials.</p>
      </div>

      <div style={{ padding: "0 24px 32px", display: "grid", gap: 16 }}>

        {/* Status overview */}
        <div className="card">
          <p style={{ fontWeight: 700, marginBottom: 12 }}>Connection Status</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {PLATFORMS.map(({ key, label, icon, color }) => (
              <div key={key} style={{ padding: "12px 14px", background: "var(--surface2)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", gap: 8 }}>
                <span>{icon}</span>
                <div>
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, color }}>{label}</p>
                  <span className="badge badge-muted" style={{ marginTop: 4 }}>Not connected</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Setup guides */}
        <p style={{ fontWeight: 700, color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Setup Guides
        </p>

        {PLATFORMS.map(({ key, label, icon, color, docsUrl, steps }) => (
          <div key={key} className="card">
            <button
              onClick={() => setExpanded(expanded === key ? null : key)}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "none", border: "none", cursor: "pointer", color: "var(--text)", padding: 0 }}
            >
              <span style={{ fontSize: "1.2rem" }}>{icon}</span>
              <span style={{ fontWeight: 700, color, flex: 1, textAlign: "left" }}>{label}</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{expanded === key ? "▲" : "▼"}</span>
            </button>

            {expanded === key && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                <ol style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                  {steps.map((step, i) => (
                    <li key={i} style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                      {step}
                    </li>
                  ))}
                </ol>
                <a
                  href={docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ marginTop: 14, display: "inline-flex" }}
                >
                  Open Developer Docs ↗
                </a>
              </div>
            )}
          </div>
        ))}

        {/* Vercel env var reminder */}
        <div style={{ background: "rgba(192,132,252,0.07)", border: "1px solid rgba(192,132,252,0.2)", borderRadius: "var(--radius)", padding: "14px 18px" }}>
          <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--accent)", marginBottom: 6 }}>
            💡 How to add environment variables on Vercel
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
            Go to your Vercel project → <strong>Settings → Environment Variables</strong> → add each key/value pair there. 
            Redeploy after adding them. Never commit API keys to GitHub.
          </p>
        </div>
      </div>
    </div>
  );
}
