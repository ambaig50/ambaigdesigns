import { useState, useEffect } from "react";
import Head from "next/head";

const PLATFORMS = [
  { key: "pinterest", label: "Pinterest", icon: "📌", color: "#e60023" },
  { key: "facebook",  label: "Facebook",  icon: "📘", color: "#1877f2" },
  { key: "instagram", label: "Instagram", icon: "📷", color: "#e1306c" },
  { key: "threads",   label: "Threads",   icon: "🧵", color: "#888"    },
];

const STORAGE_KEYS = [
  "ambaig_canvas_state",
  "ambaig_last_captions",
  "ambaig_post_history",
  "ambaig_designs",
  "ambaig_prefs",
  "ambaig_pending_text",
  "ambaig_last_image",
];

export default function Settings() {
  const [prefs, setPrefs] = useState({
    displayName: "",
    defaultSize: "portrait",
  });
  const [saved, setSaved] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ hasDesign: false, hasCaptions: false, postCount: 0 });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("ambaig_prefs") || "{}");
      setPrefs(prev => ({ ...prev, ...stored }));
    } catch (e) {}

    // Check what's actually saved right now
    try {
      const canvasState = JSON.parse(localStorage.getItem("ambaig_canvas_state") || "null");
      const captions = JSON.parse(localStorage.getItem("ambaig_last_captions") || "null");
      const history = JSON.parse(localStorage.getItem("ambaig_post_history") || "[]");
      const designs = JSON.parse(localStorage.getItem("ambaig_designs") || "[]");
      setStorageInfo({
        hasDesign: !!(canvasState?.layers?.length || canvasState?.bg),
        hasCaptions: !!(captions && Object.values(captions).some(v => v && typeof v === "string")),
        postCount: history.length,
        designCount: designs.length,
      });
    } catch (e) {}
  }, []);

  const savePrefs = () => {
    localStorage.setItem("ambaig_prefs", JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearAll = () => {
    if (!confirm("Clear your current design, captions, and post history? This cannot be undone.")) return;
    STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    setStorageInfo({ hasDesign: false, hasCaptions: false, postCount: 0 });
    alert("Cleared. Your canvas and history are now empty.");
  };

  return (
    <div>
      <Head>
        <title>Settings — AmbaigDesigns</title>
        <meta name="description" content="Manage your AmbaigDesigns preferences and saved data." />
      </Head>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Your preferences and data are saved in this browser only.</p>
      </div>

      <div style={{ padding: "0 20px 40px", display: "grid", gap: 16, maxWidth: 600 }}>

        {/* Current status */}
        <div className="card">
          <p style={{ fontWeight: 700, marginBottom: 12 }}>What's Currently Saved</p>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Saved designs (gallery)</span>
              <span className="badge badge-muted">{storageInfo.designCount || 0} / 20</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Active design on canvas</span>
              <span className={`badge ${storageInfo.hasDesign ? "badge-success" : "badge-muted"}`}>
                {storageInfo.hasDesign ? "Yes" : "Empty"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Generated captions</span>
              <span className={`badge ${storageInfo.hasCaptions ? "badge-success" : "badge-muted"}`}>
                {storageInfo.hasCaptions ? "Saved" : "None"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Posts logged in history</span>
              <span className="badge badge-muted">{storageInfo.postCount}</span>
            </div>
          </div>
        </div>

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
                    {key === "pinterest" && "Caption is copied and Pinterest's pin creator opens. Upload your downloaded design image there."}
                    {key === "facebook"  && "Caption is copied and Facebook opens. Create a post and paste your caption."}
                    {key === "instagram" && "Caption is copied. Open Instagram on your phone and paste it when creating a post."}
                    {key === "threads"   && "Caption is pre-filled in the Threads post composer automatically."}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: 12, lineHeight: 1.5 }}>
            Posting is manual for now — none of these platforms are connected via API, so you paste your caption and image yourself after the app opens each site.
          </p>
        </div>

        {/* Data & Privacy */}
        <div className="card">
          <p style={{ fontWeight: 700, marginBottom: 8 }}>Data & Privacy</p>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
            AmbaigDesigns stores your current design, captions, and post history only in <strong>this browser</strong> (localStorage). 
            No account or sign-in is required. Nothing is sent to or stored on any server. 
            Clearing your browser data, using a different browser, or switching devices will lose this saved state.
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
