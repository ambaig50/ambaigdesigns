import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const PLATFORMS = [
  { key: "pinterest", icon: "📌", label: "Pinterest", color: "var(--pinterest)", requiresApi: true },
  { key: "facebook",  icon: "📘", label: "Facebook",  color: "var(--facebook)",  requiresApi: true },
  { key: "instagram", icon: "📷", label: "Instagram", color: "var(--instagram)", requiresApi: true },
  { key: "threads",   icon: "🧵", label: "Threads",   color: "#aaa",             requiresApi: true },
];

export default function PostManager() {
  const router = useRouter();
  const { pinterest, facebook, instagram, threads, title } = router.query;
  const captions = { pinterest, facebook, instagram, threads };

  const [checked, setChecked]   = useState({});
  const [history, setHistory]   = useState([]);
  const [posting, setPosting]   = useState(false);
  const [toast, setToast]       = useState(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("ambaig_post_history") || "[]");
    setHistory(saved);
  }, []);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggle = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  const copyCaption = (key) => {
    navigator.clipboard.writeText(captions[key] || "");
    showToast(`${key.charAt(0).toUpperCase() + key.slice(1)} caption copied!`);
  };

  const postNow = async () => {
    const selected = PLATFORMS.filter(p => checked[p.key]);
    if (selected.length === 0) return showToast("Select at least one platform.", "warning");

    setPosting(true);

    // We don't actually post (no API keys connected yet)
    // This records intent in history so user can manually post
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      title: title || "Untitled",
      platforms: selected.map(p => p.label),
      status: "Copied — manual post needed",
    };

    const updated = [entry, ...history];
    setHistory(updated);
    localStorage.setItem("ambaig_post_history", JSON.stringify(updated));

    // Copy each selected platform caption to clipboard sequentially
    for (const p of selected) {
      if (captions[p.key]) navigator.clipboard.writeText(captions[p.key]);
    }

    setPosting(false);
    showToast("Captions copied! Go paste them in each app. 🚀");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("ambaig_post_history");
  };

  return (
    <div>
      <div className="page-header">
        <h1>Post Manager</h1>
        <p>Select platforms, copy captions, and post directly in each app.</p>
      </div>

      <div style={{ padding: "0 24px 32px", display: "grid", gap: 20 }}>

        {/* API notice */}
        <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: "var(--radius)", padding: "14px 18px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span>⚠️</span>
          <div>
            <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--warning)", marginBottom: 4 }}>Direct API posting not yet connected</p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Pinterest, Facebook, Instagram and Threads all require OAuth app approval. 
              For now, use <strong>"Copy Caption"</strong> to copy your caption, then paste it directly into each app. 
              Connect your accounts in <strong>Settings</strong> once you have API keys.
            </p>
          </div>
        </div>

        {/* Platform cards */}
        <div style={{ display: "grid", gap: 12 }}>
          {PLATFORMS.map(({ key, icon, label, color }) => (
            <div
              key={key}
              className="card"
              style={{
                border: checked[key] ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: checked[key] ? "var(--accent-glow)" : "var(--surface)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="checkbox"
                  checked={!!checked[key]}
                  onChange={() => toggle(key)}
                  style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--accent)" }}
                />
                <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                <span style={{ fontWeight: 700, color, flex: 1 }}>{label}</span>
                <button
                  className="btn btn-ghost"
                  style={{ padding: "5px 12px", fontSize: "0.75rem" }}
                  onClick={() => copyCaption(key)}
                >
                  📋 Copy
                </button>
              </div>
              {captions[key] && (
                <p style={{
                  marginTop: 10, paddingTop: 10,
                  borderTop: "1px solid var(--border)",
                  fontSize: "0.82rem", color: "var(--text-muted)",
                  lineHeight: 1.6, whiteSpace: "pre-wrap",
                }}>
                  {captions[key]}
                </p>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => router.back()}>← Back</button>
          <button
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={postNow}
            disabled={posting}
          >
            {posting ? "Preparing…" : "📋 Copy Captions for Selected Platforms"}
          </button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <p style={{ fontWeight: 700 }}>Post History</p>
              <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: "0.75rem" }} onClick={clearHistory}>
                Clear
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {history.map((h) => (
                <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{h.title}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{h.platforms.join(" · ")}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="badge badge-warning">{h.status}</span>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: 4 }}>{h.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="toast">
          {toast.type === "warning" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}
    </div>
  );
}
