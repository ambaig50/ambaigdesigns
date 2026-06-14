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
  const [addedToCanvas, setAddedToCanvas] = useState({});

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
    } finally { setLoading(false); }
  };

  useEffect(() => { if (title || description) generate(); }, [title, description]);

  const copyCaption = async (key) => {
    const text = captions[key]; if (!text) return;
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = document.createElement("textarea");
      el.value = text; el.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
  };

  // Store caption as a pending canvas text layer in localStorage, then go back to studio
  const addToCanvas = (key) => {
    const text = captions[key]; if (!text) return;
    const pending = JSON.parse(localStorage.getItem("ambaig_pending_text") || "[]");
    pending.push({ text, color: "#ffffff", fontSize: 16, id: Date.now() });
    localStorage.setItem("ambaig_pending_text", JSON.stringify(pending));
    setAddedToCanvas(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setAddedToCanvas(prev => ({ ...prev, [key]: false })), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <h1>AI Captions</h1>
        <p>Edit captions, copy them, or place them directly on your canvas.</p>
      </div>

      <div style={{ padding: "0 16px 40px", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* Preview */}
        <div style={{ width: 190, flexShrink: 0 }}>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Preview</p>
          <div style={{ width: 190, height: 285, overflow: "hidden", borderRadius: 10, border: "1px solid var(--border)", background: "#fff", position: "relative" }}>
            {TemplateComponent && (
              <div style={{ transform: "scale(0.316)", transformOrigin: "top left", width: 600, height: 900, pointerEvents: "none" }}>
                <TemplateComponent title={title || "Your Title"} description={description || ""} />
              </div>
            )}
          </div>
          <p style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: 5 }}>{category} · {id}</p>
          <button className="btn btn-ghost" onClick={() => router.back()} style={{ width: "100%", justifyContent: "center", marginTop: 10, fontSize: "0.78rem" }}>← Edit Design</button>
        </div>

        {/* Captions */}
        <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>
              {loading ? "Generating…" : generated ? "Edit if needed, then copy or add to canvas" : "Add a title in Studio first"}
            </p>
            <button className="btn btn-ghost" onClick={generate} disabled={loading} style={{ padding: "5px 10px", fontSize: "0.75rem" }}>
              {loading ? "…" : "🔄 Regenerate"}
            </button>
          </div>

          {PLATFORMS.map(({ key, icon, label, color }) => (
            <div key={key} className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                <span style={{ fontWeight: 700, color, flex: 1 }}>{label}</span>
                <span style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>{captions[key]?.length || 0} chars</span>

                {/* Copy button */}
                <button onClick={() => copyCaption(key)} disabled={!captions[key]} style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid var(--border)", background: copied[key] ? "#34d39920" : "transparent", color: copied[key] ? "#34d399" : "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                  {copied[key] ? "✅ Copied" : "📋 Copy"}
                </button>

                {/* Add to Canvas button */}
                <button onClick={() => addToCanvas(key)} disabled={!captions[key]} style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid var(--accent)", background: addedToCanvas[key] ? "var(--accent-glow)" : "transparent", color: addedToCanvas[key] ? "var(--accent)" : "var(--accent)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                  {addedToCanvas[key] ? "✅ Added!" : "🖼 Add to Canvas"}
                </button>
              </div>

              <textarea
                value={loading ? "Generating…" : captions[key]}
                onChange={e => setCaptions(prev => ({ ...prev, [key]: e.target.value }))}
                disabled={loading}
                placeholder={`${label} caption will appear here…`}
                style={{ minHeight: 88, fontSize: "0.875rem", lineHeight: 1.6 }}
              />
            </div>
          ))}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => router.push({ pathname: "/home", query: { pendingText: "1" } })} style={{ flex: 1, justifyContent: "center" }}>
              🎨 Back to Studio
            </button>
            <button className="btn btn-primary" disabled={!generated || loading} style={{ flex: 1, justifyContent: "center" }}
              onClick={() => router.push({ pathname: "/post", query: { ...captions, category, id, title, description } })}>
              Continue to Post →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
