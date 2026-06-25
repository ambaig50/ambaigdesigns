import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function MyDesigns() {
  const router = useRouter();
  const [designs, setDesigns] = useState([]);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ambaig_designs") || "[]");
      setDesigns(saved);
    } catch (e) {}
  }, []);

  const openDesign = (design) => {
    // Restore canvas state and go to Studio
    try {
      localStorage.setItem("ambaig_canvas_state", JSON.stringify(design.state));
    } catch (e) {}
    router.push("/home");
  };

  const deleteDesign = (id) => {
    const updated = designs.filter(d => d.id !== id);
    setDesigns(updated);
    localStorage.setItem("ambaig_designs", JSON.stringify(updated));
    setDeleting(null);
  };

  const clearAll = () => {
    if (!confirm("Delete all saved designs? This cannot be undone.")) return;
    setDesigns([]);
    localStorage.removeItem("ambaig_designs");
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
  };

  return (
    <div>
      <Head>
        <title>My Designs — AmbaigDesigns</title>
        <meta name="description" content="View and reopen your saved pin designs." />
      </Head>
      <div className="page-header">
        <h1>My Designs</h1>
        <p>Tap any design to reopen it in the Studio.</p>
      </div>

      <div style={{ padding: "0 16px 80px" }}>

        {/* Action row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => router.push("/home")}>
            + New Design
          </button>
          {designs.length > 0 && (
            <button className="btn btn-ghost" onClick={clearAll} style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>
              🗑 Clear All
            </button>
          )}
        </div>

        {/* Empty state */}
        {designs.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎨</p>
            <p style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>No saved designs yet</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 20, lineHeight: 1.6 }}>
              Create a design in the Studio and click "📁 Save to My Designs" to save it here.
            </p>
            <button className="btn btn-primary" onClick={() => router.push("/home")}>
              Open Design Studio
            </button>
          </div>
        )}

        {/* Design grid */}
        {designs.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
            {designs.map((design) => (
              <div key={design.id} style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", cursor: "pointer", transition: "border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                {/* Thumbnail */}
                <div onClick={() => openDesign(design)} style={{ aspectRatio: design.state?.canvasSize === "landscape" ? "16/9" : design.state?.canvasSize === "square" ? "1/1" : "2/3", overflow: "hidden", background: "#1a1a24", position: "relative" }}>
                  {design.thumb ? (
                    <img src={design.thumb} alt={design.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>🎨</div>
                  )}
                  {/* Canvas size badge */}
                  <span style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", color: "white", fontSize: "0.6rem", fontWeight: 700, padding: "2px 6px", borderRadius: 10, textTransform: "capitalize" }}>
                    {design.state?.canvasSize || "portrait"}
                  </span>
                </div>

                {/* Info */}
                <div style={{ padding: "10px 12px" }}>
                  <p style={{ fontWeight: 600, fontSize: "0.82rem", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={design.name}>
                    {design.name}
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginBottom: 10 }}>
                    {formatDate(design.savedAt)}
                  </p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", fontSize: "0.72rem", padding: "5px" }} onClick={() => openDesign(design)}>
                      ✏️ Open
                    </button>
                    {deleting === design.id ? (
                      <button onClick={() => deleteDesign(design.id)} style={{ flex: 1, padding: "5px", borderRadius: 7, border: "1px solid var(--danger)", background: "transparent", color: "var(--danger)", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600 }}>
                        Confirm
                      </button>
                    ) : (
                      <button onClick={() => setDeleting(design.id)} style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--text-dim)", cursor: "pointer", fontSize: "0.72rem" }}>
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {designs.length > 0 && (
          <p style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: 16, textAlign: "center" }}>
            {designs.length} of 20 design slots used · Stored in this browser only
          </p>
        )}
      </div>
    </div>
  );
}

