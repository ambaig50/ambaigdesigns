import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const PLATFORMS = [
  {
    key: "pinterest",
    icon: "📌",
    label: "Pinterest",
    color: "#e60023",
    openUrl: (caption) => `https://www.pinterest.com/pin/create/button/?description=${encodeURIComponent(caption)}`,
    hint: "Opens Pinterest — paste your caption and upload your image.",
  },
  {
    key: "facebook",
    icon: "📘",
    label: "Facebook",
    color: "#1877f2",
    openUrl: () => `https://www.facebook.com/`,
    hint: "Opens Facebook — create a post and paste your caption.",
  },
  {
    key: "instagram",
    icon: "📷",
    label: "Instagram",
    color: "#e1306c",
    openUrl: () => `https://www.instagram.com/`,
    hint: "Open Instagram on your phone — captions are copied to clipboard.",
  },
  {
    key: "threads",
    icon: "🧵",
    label: "Threads",
    color: "#aaa",
    openUrl: (caption) => `https://www.threads.net/intent/post?text=${encodeURIComponent(caption)}`,
    hint: "Opens Threads with caption pre-filled.",
  },
];

export default function PostManager() {
  const router = useRouter();
  const { pinterest, facebook, instagram, threads, title } = router.query;
  const captions = { pinterest, facebook, instagram, threads };

  const [checked, setChecked]   = useState({});
  const [history, setHistory]   = useState([]);
  const [copied, setCopied]     = useState({});
  const [toast, setToast]       = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("ambaig_post_history") || "[]");
    setHistory(saved);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const copyText = async (key) => {
    const text = captions[key];
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
    showToast(`${key.charAt(0).toUpperCase() + key.slice(1)} caption copied!`);
  };

  const openPlatform = (platform) => {
    const caption = captions[platform.key] || "";
    // Open window FIRST and synchronously — mobile browsers block window.open
    // if it's not called directly inside the click handler (e.g. after a delay or async copy)
    const win = window.open(platform.openUrl(caption), "_blank");
    if (!win) {
      showToast("⚠️ Pop-up blocked — allow pop-ups for this site, then try again.");
      return;
    }
    // Copy caption after opening (doesn't need to block the navigation)
    copyText(platform.key);
  };

  const postSelected = () => {
    const selected = PLATFORMS.filter(p => checked[p.key]);
    if (!selected.length) return showToast("Select at least one platform.");

    let blockedCount = 0;
    selected.forEach(p => {
      const caption = captions[p.key] || "";
      const win = window.open(p.openUrl(caption), "_blank");
      if (!win) blockedCount++;
    });

    if (blockedCount > 0) {
      showToast(`⚠️ ${blockedCount} pop-up(s) blocked. Allow pop-ups and try again, or open platforms one at a time.`);
      return;
    }

    const entry = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      title: title || "Untitled",
      platforms: selected.map(p => p.label),
    };
    const updated = [entry, ...history];
    setHistory(updated);
    localStorage.setItem("ambaig_post_history", JSON.stringify(updated.slice(0, 50)));
    showToast("Opened all selected platforms! 🚀");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("ambaig_post_history");
  };

  return (
    <div>
      <div className="page-header">
        <h1>Post Manager</h1>
        <p>Copy captions and open each platform to post your design.</p>
      </div>

      <div style={{ padding: "0 20px 40px", display: "grid", gap: 16, maxWidth: 700 }}>

        {/* Info notice */}
        <div style={{ background: "rgba(192,132,252,0.07)", border: "1px solid rgba(192,132,252,0.2)", borderRadius: 12, padding: "14px 18px" }}>
          <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--accent)", marginBottom: 4 }}>How to post</p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
            Tap <strong>Open &amp; Post</strong> on any platform — it copies your caption to the clipboard and opens that platform in a new tab. 
            Paste the caption there and upload your downloaded design image. 
            Check the platforms you want, then use <strong>Post to All Selected</strong> to open them all at once.
          </p>
        </div>

        {/* Platform cards */}
        {PLATFORMS.map((p) => (
          <div key={p.key} className="card" style={{
            border: checked[p.key] ? "1px solid var(--accent)" : "1px solid var(--border)",
            background: checked[p.key] ? "var(--accent-glow)" : "var(--surface)",
          }}>
            {/* Top row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: captions[p.key] ? 10 : 0 }}>
              <input
                type="checkbox"
                checked={!!checked[p.key]}
                onChange={() => setChecked(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                style={{ width: 17, height: 17, cursor: "pointer", accentColor: "var(--accent)" }}
              />
              <span style={{ fontSize: "1.1rem" }}>{p.icon}</span>
              <span style={{ fontWeight: 700, color: p.color, flex: 1 }}>{p.label}</span>

              {/* Open & Post button — copies caption + opens platform in one tap */}
              <button
                onClick={() => openPlatform(p)}
                disabled={!captions[p.key]}
                style={{
                  padding: "6px 14px", borderRadius: 7,
                  background: p.color,
                  border: "none",
                  color: "white",
                  fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
                  whiteSpace: "nowrap",
                  opacity: captions[p.key] ? 1 : 0.4,
                }}
              >
                {copied[p.key] ? "✅ Opened" : "Open & Post ↗"}
              </button>
            </div>

            {/* Caption preview */}
            {captions[p.key] && (
              <p style={{
                fontSize: "0.82rem", color: "var(--text-muted)",
                lineHeight: 1.6, paddingTop: 10,
                borderTop: "1px solid var(--border)",
                whiteSpace: "pre-wrap",
              }}>
                {captions[p.key]}
              </p>
            )}
            {captions[p.key] && (
              <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: 6 }}>{p.hint}</p>
            )}
          </div>
        ))}

        {/* Post all button */}
        <button
          className="btn btn-primary"
          style={{ justifyContent: "center", padding: "12px" }}
          onClick={postSelected}
        >
          🚀 Post to All Selected Platforms
        </button>

        <button className="btn btn-ghost" style={{ justifyContent: "center" }} onClick={() => router.back()}>
          ← Back to Captions
        </button>

        {/* History */}
        {history.length > 0 && (
          <div className="card" style={{ marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ fontWeight: 700 }}>Post History</p>
              <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: "0.75rem" }} onClick={clearHistory}>Clear</button>
            </div>
            {history.map(h => (
              <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{h.title}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{h.platforms.join(" · ")}</p>
                </div>
                <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", whiteSpace: "nowrap", marginLeft: 10 }}>{h.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <div className="toast">✅ {toast}</div>}
    </div>
  );
}
