import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const PLATFORMS = [
  { key: "pinterest", icon: "📌", label: "Pinterest", color: "var(--pinterest)" },
  { key: "facebook",  icon: "📘", label: "Facebook",  color: "var(--facebook)"  },
  { key: "instagram", icon: "📷", label: "Instagram", color: "var(--instagram)" },
  { key: "threads",   icon: "🧵", label: "Threads",   color: "#aaa"             },
];

export default function Captions() {
  const router = useRouter();
  const { title, description, category, id } = router.query;
  const [captions, setCaptions] = useState({ pinterest: "", facebook: "", instagram: "", threads: "" });
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    if (!title && !description) return;
    setLoading(true);
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
      alert("Caption generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (title || description) generate();
  }, [title, description]);

  const charCount = (text) => text.length;

  return (
    <div>
      <div className="page-header">
        <h1>AI Captions</h1>
        <p>Edit any caption before posting — changes are saved automatically.</p>
      </div>

      <div style={{ padding: "0 24px 32px" }}>
        {/* Context summary */}
        {title && (
          <div className="card" style={{ marginBottom: 20, display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 2 }}>Designing for</p>
              <p style={{ fontWeight: 600 }}>{title}</p>
              {description && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>{description.slice(0, 80)}{description.length > 80 ? "…" : ""}</p>}
            </div>
            <button
              className="btn btn-ghost"
              onClick={generate}
              disabled={loading}
            >
              {loading ? "Generating…" : "🔄 Regenerate"}
            </button>
          </div>
        )}

        {/* Caption cards */}
        <div style={{ display: "grid", gap: 16 }}>
          {PLATFORMS.map(({ key, icon, label, color }) => (
            <div key={key} className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                  <span style={{ fontWeight: 700, color }}>{label}</span>
                </div>
                <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                  {charCount(captions[key])} chars
                </span>
              </div>
              <textarea
                value={loading ? "Generating…" : captions[key]}
                onChange={(e) => setCaptions({ ...captions, [key]: e.target.value })}
                disabled={loading}
                placeholder={`${label} caption will appear here…`}
                style={{
                  minHeight: 100,
                  borderColor: captions[key] ? "var(--border)" : "var(--surface2)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button className="btn btn-ghost" onClick={() => router.back()}>
            ← Back to Studio
          </button>
          <button
            className="btn btn-primary"
            disabled={!generated || loading}
            onClick={() =>
              router.push({
                pathname: "/post",
                query: { ...captions, category, id, title, description },
              })
            }
          >
            Continue to Post Manager →
          </button>
        </div>
      </div>
    </div>
  );
}
