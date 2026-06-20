import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const PLATFORMS = [
  { key: "pinterest", icon: "📌", label: "Pinterest", color: "#e60023" },
  { key: "facebook",  icon: "📘", label: "Facebook",  color: "#1877f2" },
  { key: "instagram", icon: "📷", label: "Instagram", color: "#e1306c" },
  { key: "threads",   icon: "🧵", label: "Threads",   color: "#aaa"    },
];

export default function Captions() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [canvasState, setCanvasState] = useState(null);

  // Wait for router.query to be populated
  useEffect(() => {
    if (router.isReady) setReady(true);
  }, [router.isReady]);

  // Load canvas state for preview
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ambaig_canvas_state");
      if (saved) setCanvasState(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const { title, description } = router.query;
  const [captions, setCaptions]         = useState({ pinterest: "", facebook: "", instagram: "", threads: "" });
  const [loading, setLoading]           = useState(false);
  const [generated, setGenerated]       = useState(false);
  const [copied, setCopied]             = useState({});
  const [addedToCanvas, setAddedToCanvas] = useState({});
  const [toast, setToast]               = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

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
      // Fallback captions when API unavailable
      setCaptions({
        pinterest: `✨ ${title || "Design"} — ${description || ""} Save this for later! #Inspiration #Design #Creative`,
        facebook:  `Check out this ${title || "design"}! ${description || ""} What do you think? 👇`,
        instagram: `${title || "Design"} ✨ ${description || ""} #Design #Creative #Inspiration #Style`,
        threads:   `${title || "Design"} — ${description || ""}`,
      });
      setGenerated(true);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (ready && (title || description)) generate(); }, [ready, title, description]);

  const copyCaption = async (key) => {
    const text = captions[key];
    if (!text) return;
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(el);
      el.focus(); el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
    showToast("Caption copied to clipboard!");
  };

  // Save caption to localStorage AND immediately navigate back to Studio
  const addToCanvas = (key) => {
    const text = captions[key];
    if (!text) return;

    // Save all pending captions that user clicked "Add to Canvas" on
    const pending = JSON.parse(localStorage.getItem("ambaig_pending_text") || "[]");
    pending.push({ text, color: "#ffffff", fontSize: 16, id: Date.now() });
    localStorage.setItem("ambaig_pending_text", JSON.stringify(pending));

    setAddedToCanvas(prev => ({ ...prev, [key]: true }));
    showToast("Caption saved — click 'Back to Studio' to see it on canvas");
  };

  const goBackToStudio = () => {
    // Navigate to home — the useEffect there will pick up pending text
    router.push("/home");
  };

  const goToPost = () => {
    try {
      localStorage.setItem("ambaig_last_captions", JSON.stringify({ ...captions, title }));
    } catch (e) {}
    router.push("/post");
  };

  return (
    <div>
      <div className="page-header">
        <h1>AI Captions</h1>
        <p>Edit, copy, or add captions directly onto your canvas.</p>
      </div>

      <div style={{ padding: "0 14px 90px", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* ── Left: preview + actions ── */}
        <div style={{ width: 185, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Mini canvas preview — shows actual design from canvas state */}
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Design Preview</p>
          {(() => {
            const SIZES = {
              portrait:  { w: 600, h: 900 },
              square:    { w: 600, h: 600 },
              landscape: { w: 800, h: 450 },
            };
            const sz = SIZES[canvasState?.canvasSize] || SIZES.portrait;
            const previewW = 185;
            const scale = previewW / sz.w;
            const previewH = sz.h * scale;

            return (
              <div style={{ width: previewW, height: previewH, overflow: "hidden", borderRadius: 10, border: "1px solid var(--border)", background: "#fff", position: "relative", flexShrink: 0 }}>
                <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: sz.w, height: sz.h, pointerEvents: "none", position: "relative" }}>
                  {/* Background image */}
                  {canvasState?.bg?.type === "photo" && canvasState.bg.src && (
                    <img src={canvasState.bg.src} alt="bg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${canvasState.bg.ox ?? 50}% ${canvasState.bg.oy ?? 50}%`, opacity: canvasState.bgOpacity ?? 1 }} />
                  )}
                  {canvasState?.bg?.type === "color" && (
                    <div style={{ position: "absolute", inset: 0, background: canvasState.bg.color }} />
                  )}
                  {canvasState?.bg?.type === "gradient" && (
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${canvasState.bg.angle}deg, ${canvasState.bg.from}, ${canvasState.bg.to})` }} />
                  )}
                  {/* Overlay images */}
                  {canvasState?.images?.map(img => (
                    <img key={img.id} src={img.src} alt="" style={{ position: "absolute", left: img.x, top: img.y, width: img.w, height: img.h, objectFit: "cover", objectPosition: `${img.ox ?? 50}% ${img.oy ?? 50}%`, borderRadius: 4 }} />
                  ))}
                  {/* Text boxes */}
                  {canvasState?.textBoxes?.map(box => (
                    <div key={box.id} style={{ position: "absolute", left: box.x, top: box.y, color: box.color || "#fff", fontSize: box.fontSize || 18, fontWeight: box.bold ? 700 : 400, textAlign: box.align || "left", textShadow: "0 2px 8px rgba(0,0,0,0.9)", padding: "4px 8px", whiteSpace: "pre-wrap", maxWidth: "90%" }}>{box.text}</div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Action buttons always visible */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            <button className="btn btn-ghost" onClick={goBackToStudio} style={{ justifyContent: "center", fontSize: "0.82rem" }}>
              🎨 Back to Studio
            </button>
            <button
              className="btn btn-primary"
              disabled={!generated || loading}
              style={{ justifyContent: "center", fontSize: "0.82rem" }}
              onClick={goToPost}
            >
              📤 Go to Post →
            </button>
          </div>

          {/* Added to canvas summary */}
          {Object.values(addedToCanvas).some(Boolean) && (
            <div style={{ background: "var(--accent-glow)", border: "1px solid var(--accent)", borderRadius: 8, padding: "10px 12px" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 600 }}>
                ✅ Caption queued for canvas
              </p>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 4 }}>
                Click "Back to Studio" to see it placed on your design.
              </p>
            </div>
          )}
        </div>

        {/* ── Right: caption cards ── */}
        <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 12 }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontWeight: 600, fontSize: "0.875rem", color: loading ? "var(--text-muted)" : "var(--text)" }}>
              {loading ? "✨ Generating captions…" : generated ? "Captions ready — edit if needed" : "Enter a title in Studio first"}
            </p>
            <button className="btn btn-ghost" onClick={generate} disabled={loading} style={{ padding: "5px 10px", fontSize: "0.75rem" }}>
              {loading ? "…" : "🔄 Regenerate"}
            </button>
          </div>

          {PLATFORMS.map(({ key, icon, label, color }) => (
            <div key={key} className="card">
              {/* Platform header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap", rowGap: 6 }}>
                <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                <span style={{ fontWeight: 700, color, flex: 1 }}>{label}</span>
                <span style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>
                  {captions[key]?.length || 0} chars
                </span>

                {/* Copy */}
                <button
                  onClick={() => copyCaption(key)}
                  disabled={!captions[key]}
                  style={{
                    padding: "4px 10px", borderRadius: 7,
                    border: "1px solid var(--border)",
                    background: copied[key] ? "#34d39920" : "transparent",
                    color: copied[key] ? "#34d399" : "var(--text-muted)",
                    fontSize: "0.73rem", fontWeight: 600, cursor: "pointer",
                    transition: "all 0.2s", whiteSpace: "nowrap",
                  }}
                >
                  {copied[key] ? "✅ Copied!" : "📋 Copy"}
                </button>

                {/* Add to canvas */}
                <button
                  onClick={() => addToCanvas(key)}
                  disabled={!captions[key]}
                  style={{
                    padding: "4px 10px", borderRadius: 7,
                    border: `1px solid ${addedToCanvas[key] ? "#34d399" : "var(--accent)"}`,
                    background: addedToCanvas[key] ? "#34d39920" : "var(--accent-glow)",
                    color: addedToCanvas[key] ? "#34d399" : "var(--accent)",
                    fontSize: "0.73rem", fontWeight: 600, cursor: "pointer",
                    transition: "all 0.2s", whiteSpace: "nowrap",
                  }}
                >
                  {addedToCanvas[key] ? "✅ Queued!" : "🖼 Add to Canvas"}
                </button>
              </div>

              {/* Editable caption */}
              <textarea
                value={loading ? "Generating…" : (captions[key] || "")}
                onChange={e => setCaptions(prev => ({ ...prev, [key]: e.target.value }))}
                disabled={loading}
                placeholder={`${label} caption will appear here…`}
                style={{ minHeight: 90, fontSize: "0.875rem", lineHeight: 1.6, width: "100%" }}
              />
            </div>
          ))}

          {/* Bottom nav buttons — repeated for convenience on mobile */}
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button className="btn btn-ghost" onClick={goBackToStudio} style={{ flex: 1, justifyContent: "center" }}>
              🎨 Back to Studio
            </button>
            <button
              className="btn btn-primary"
              disabled={!generated || loading}
              style={{ flex: 1, justifyContent: "center" }}
              onClick={goToPost}
            >
              📤 Go to Post →
            </button>
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
