import { useState, useEffect } from "react";

const PLATFORMS = [
  { key: "pinterest", label: "Pinterest", icon: "📌", color: "#e60023" },
  { key: "facebook",  label: "Facebook",  icon: "📘", color: "#1877f2" },
  { key: "instagram", label: "Instagram", icon: "📷", color: "#e1306c" },
  { key: "threads",   label: "Threads",   icon: "🧵", color: "#aaa"    },
];

export default function Settings() {
  const [prefs, setPrefs] = useState({
    defaultCategory: "minimalist",
    defaultSize: "portrait",
    displayName: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("ambaig_prefs") || "{}");
    setPrefs(prev => ({ ...prev, ...stored }));
  }, []);

  const savePrefs = () => {
    localStorage.setItem("ambaig_prefs", JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearAll = () => {
    if (!confirm("Clear all saved designs and history? This cannot be undone.")) return;
    localStorage.removeItem("ambaig_designs");
    localStorage.removeItem("ambaig_post_history");
    localStorage.removeItem("ambaig_prefs");
    alert("Cleared.");
  };

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Your preferences are saved in your browser.</p>
      </div>

      <div style={{ padding: "0 20px 40px", display: "grid", gap: 16, maxWidth: 600 }}>

        {/* User preferences */}
        <div className="card">
          <p style={{ fontWeight: 700, marginBottom: 16 }}>Your Preferences</p>

          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Display Name</label>
            <input
              type="text"
              placeholder="e.g. Sarah's Designs"
              value={prefs.displayName}
              onChange={e => setPrefs(p => ({ ...p, displayName: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Default Template Category</label>
            <select value={prefs.defaultCategory} onChange={e => setPrefs(p => ({ ...p, defaultCategory: e.target.value }))}>
              {["minimalist", "nature", "food", "business", "lifestyle"].map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label className="field-label">Default Canvas Size</label>
            <select value={prefs.defaultSize} onChange={e => setPrefs(p => ({ ...p, defaultSize: e.target.value }))}>
              <option value="portrait">Portrait — Pinterest (2:3)</option>
              <option value="square">Square — Instagram (1:1)</option>
              <option value="landscape">Landscape — Facebook (16:9)</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={savePrefs}>
            {saved ? "✅ Saved!" : "Save Preferences"}
          </button>
        </div>

        {/* How posting works */}
        <div className="card">
          <p style={{ fontWeight: 700, marginBottom: 14 }}>How Posting Works</p>
          <div style={{ display: "grid", gap: 12 }}>
            {PLATFORMS.map(({ key, label, icon, color }) => (
              <div key={key} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px", background: "var(--surface2)", borderRadius: 10 }}>
                <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{icon}</span>
                <div>
                  <p style={{ fontWeight: 700, color, fontSize: "0.875rem", marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                    {key === "pinterest" && "Caption is copied + Pinterest pin creation page opens. Upload your design image there."}
                    {key === "facebook"  && "Caption is copied + Facebook opens. Create a post and paste your caption."}
                    {key === "instagram" && "Caption is copied. Open Instagram on your phone and paste when creating a post."}
                    {key === "threads"   && "Caption is pre-filled in the Threads post composer via a share link."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="card">
          <p style={{ fontWeight: 700, marginBottom: 8 }}>Data & Privacy</p>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
            AmbaigDesigns stores your designs and history only in <strong>your browser</strong> (localStorage). 
            No account is needed. Nothing is sent to any server. 
            Clearing your browser data or switching devices will remove saved designs.
          </p>
          <button
            onClick={clearAll}
            style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: "1px solid var(--danger)", color: "var(--danger)", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}
          >
            🗑️ Clear All Saved Data
          </button>
        </div>
      </div>
    </div>
  );
}
