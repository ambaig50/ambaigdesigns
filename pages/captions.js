import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getTemplateComponent } from "../utils/templateComponents";

const PLATFORMS = [
  { key: "pinterest", icon: "📌", label: "Pinterest", color: "#e60023" },
  { key: "facebook",  icon: "📘", label: "Facebook",  color: "#1877f2" },
  { key: "instagram", icon: "📷", label: "Instagram", color: "#e1306c" },
  { key: "threads",   icon: "🧵", label: "Threads",   color: "#aaa"    },
];

export default function Captions() {
  const router = useRouter();
  const { title, description, category, id } = router.query;
  const [captions, setCaptions] = useState({ pinterest: "", facebook: "", instagram: "", threads: "" });
  const [loading, setLoading]   = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied]     = useState({});

  const TemplateComponent = category && id ? getTemplateComponent(category, id) : null;

  const generate = async () => {
    if (!title && !description) return;
    setLoading(true);
    setCaptions({ pinterest: "", facebook: "", instagram: "", threads: "" });
    try {
      const res = await fetch("/api/generateCaptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      setCaptions(data);
      setGenerated(true);
    } catch {
      setCaptions({
        pinterest: `✨ ${title} — ${description} #Inspiration #Design`,
        facebook:  `Check out ${title}! ${description}`,
        instagram: `${title} ✨ ${description} #Design #Creative`,
        threads:   `${title} — ${description}`,
      });
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (title || description) generate(); }, [title, description]);

  const copyCaption = async (key) => {
    const text = captions[key];
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for mobile browsers that block clipboard
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <h1>AI Captions</h1>
        <p>Edit any caption below, then continue to post.</p>
      </div>

      <div style={{ padding: "0 20px 40px", display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* ── Canvas mini preview ── */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Preview</p>
          <div style={{ width: 200, height: 300, overflow: "hidden", borderRadius: 10, border: "1px solid var(--border)", position: "relative", background: "#fff" }}>
            {TemplateComponent && (
              <div style={{ transform: "scale(0.333)", transformOrigin: "top left", width: 600, height: 900, pointerEvents: "none" }}>
                <TemplateComponent title={title || "Your Title"} description={description || "Your description"} />
              </div>
            )}
          </div>
          <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: 6 }}>
            {category} · {id}
          </p>
          <button className="btn btn-ghost" onClick={() => router.back()} style={{ width: "100%", justifyContent: "center", marginTop: 10, fontSize: "0.8rem" }}>
            ← Edit Design
          </button>
        </div>

        {/* ── Caption cards ── */}
        <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>
              {loading ? "Generating captions…" : generated ? "Captions ready — edit if needed" : "Enter a title in Design Studio first"}
            </p>
            <button className="btn btn-ghost" onClick={generate} disabled={loading} style={{ padding: "6px 12px", fontSize: "0.78rem" }}>
              {loading ? "…" : "🔄 Regenerate"}
            </button>
          </div>

          {PLATFORMS.map(({ key, icon, label, color }) => (
            <div key={key} className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                <span style={{ fontWeight: 700, color, flex: 1 }}>{label}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                  {captions[key]?.length || 0} chars
                </span>
                <button
                  onClick={() => copyCaption(key)}
                  disabled={!captions[key]}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: copied[key] ? "#34d39920" : "transparent",
                    color: copied[key] ? "#34d399" : "var(--text-muted)",
                    cursor: captions[key] ? "pointer" : "not-allowed",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {copied[key] ? "✅ Copied!" : "📋 Copy"}
                </button>
              </div>
              <textarea
                value={loading ? "Generating…" : captions[key]}
                onChange={e => setCaptions(prev => ({ ...prev, [key]: e.target.value }))}
                disabled={loading}
                placeholder={`${label} caption will appear here…`}
                style={{ minHeight: 90, fontSize: "0.875rem", lineHeight: 1.6 }}
              />
            </div>
          ))}

          <button
            className="btn btn-primary"
            style={{ justifyContent: "center" }}
            disabled={!generated || loading}
            onClick={() => router.push({
              pathname: "/post",
              query: { ...captions, category, id, title, description },
            })}
          >
            Continue to Post Manager →
          </button>
        </div>
      </div>
    </div>
  );
}
