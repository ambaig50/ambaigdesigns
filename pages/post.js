import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";

const PLATFORMS = [
  {
    key: "pinterest",
    icon: "📌",
    label: "Pinterest",
    color: "#e60023",
    openUrl: (caption) => `https://www.pinterest.com/pin/create/button/?description=${encodeURIComponent(caption)}`,
    hint: "Opens Pinterest pin creator — paste caption & upload your image.",
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
    hint: "Opens Instagram — caption is copied, paste when creating a post.",
  },
  {
    key: "threads",
    icon: "🧵",
    label: "Threads",
    color: "#888",
    openUrl: (caption) => `https://www.threads.net/intent/post?text=${encodeURIComponent(caption)}`,
    hint: "Opens Threads with your caption pre-filled.",
  },
];

export default function PostManager() {
  const router = useRouter();
  const [captions, setCaptions] = useState({
    pinterest: "",
    facebook: "",
    instagram: "",
    threads: "",
  });
  const [title, setTitle] = useState("");
  const [history, setHistory] = useState([]);
  const [opened, setOpened] = useState({});
  const [toast, setToast] = useState("");

  // Load saved captions and history on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ambaig_last_captions") || "null");
      if (saved) {
        setCaptions({
          pinterest: saved.pinterest || "",
          facebook:  saved.facebook  || "",
          instagram: saved.instagram || "",
          threads:   saved.threads   || "",
        });
        setTitle(saved.title || "");
      }
    } catch (e) {}

    try {
      const hist = JSON.parse(localStorage.getItem("ambaig_post_history") || "[]");
      setHistory(hist);
    } catch (e) {}
  }, []);

  // Auto-save captions whenever user edits them
  const updateCaption = (key, value) => {
    const updated = { ...captions, [key]: value };
    setCaptions(updated);
    try {
      localStorage.setItem("ambaig_last_captions", JSON.stringify({ ...updated, title }));
    } catch (e) {}
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;top:-9999px;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  };

  const openPlatform = (platform) => {
    const caption = captions[platform.key] || "";

    // Open synchronously — required for mobile popup permission
    const win = window.open(platform.openUrl(caption), "_blank");
    if (!win) {
      showToast("⚠️ Pop-up blocked — please allow pop-ups for this site.");
      return;
    }

    // Copy caption to clipboard after opening
    if (caption) copyToClipboard(caption);

    // Mark as opened
    setOpened(prev => ({ ...prev, [platform.key]: true }));
    setTimeout(() => setOpened(prev => ({ ...prev, [platform.key]: false })), 3000);

    // Log to history
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      title: title || "Untitled",
      platform: platform.label,
    };
    const updated = [entry, ...history];
    setHistory(updated);
    try { localStorage.setItem("ambaig_post_history", JSON.stringify(updated.slice(0, 50))); } catch (e) {}

    showToast(`${platform.label} opened! Paste your caption there.`);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("ambaig_post_history");
  };

  const hasSomeCaption = Object.values(captions).some(Boolean);

  return (
    <div>
      <Head>
        <title>Post Manager — AmbaigDesigns</title>
        <meta name="description" content="Post your design to Pinterest, Facebook, Instagram, or Threads." />
      </Head>
      <div className="page-header">
        <h1>Post Manager</h1>
        <p>Write or edit captions below, then tap Open & Post for each platform.</p>
      </div>

      <div style={{ padding: "0 16px 80px", maxWidth: 720, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Nav row */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-ghost" style={{ fontSize: "0.8rem" }} onClick={() => router.push("/home")}>
            🎨 Design Studio
          </button>
          <button className="btn btn-ghost" style={{ fontSize: "0.8rem" }} onClick={() => router.push("/captions")}>
            ✨ Generate Captions
          </button>
        </div>

        {/* Helper tip */}
        <div style={{ background: "rgba(192,132,252,0.07)", border: "1px solid rgba(192,132,252,0.2)", borderRadius: 12, padding: "12px 16px" }}>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
            <strong style={{ color: "var(--accent)" }}>How it works:</strong> Type or paste a caption in each box below — or use <strong>✨ Generate Captions</strong> to let AI write them. 
            Then tap <strong>Open & Post ↗</strong> to open that platform with your caption copied to clipboard.
          </p>
        </div>

        {/* Platform cards */}
        {PLATFORMS.map((p) => (
          <div key={p.key} className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.2rem" }}>{p.icon}</span>
              <span style={{ fontWeight: 700, color: p.color, flex: 1, fontSize: "0.95rem" }}>{p.label}</span>
              <button
                onClick={() => openPlatform(p)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: opened[p.key] ? "#34d399" : p.color,
                  border: "none",
                  color: "white",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background 0.2s",
                  flexShrink: 0,
                }}
              >
                {opened[p.key] ? "✅ Opened!" : "Open & Post ↗"}
              </button>
            </div>

            {/* Editable caption textarea — always enabled */}
            <textarea
              value={captions[p.key]}
              onChange={e => updateCaption(p.key, e.target.value)}
              placeholder={`Write your ${p.label} caption here… (optional — you can also paste directly in ${p.label})`}
              style={{
                minHeight: 80,
                fontSize: "0.875rem",
                lineHeight: 1.6,
                resize: "vertical",
                color: captions[p.key] ? "var(--text)" : "var(--text-dim)",
              }}
            />

            <p style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>{p.hint}</p>
          </div>
        ))}

        {/* Post history */}
        {history.length > 0 && (
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontWeight: 700 }}>Post History</p>
              <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: "0.75rem" }} onClick={clearHistory}>
                Clear
              </button>
            </div>
            {history.map(h => (
              <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{h.title}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{h.platform}</p>
                </div>
                <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", whiteSpace: "nowrap", marginLeft: 10 }}>{h.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
