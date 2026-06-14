import { useState, useRef, useCallback, useEffect } from "react";
import { getTemplateRegistry } from "../utils/loadTemplates";
import { getTemplateComponent } from "../utils/templateComponents";
import { useRouter } from "next/router";

// ── Draggable + Resizable + Crop image layer ─────────────────────
function CanvasImage({ img, onUpdate, onRemove, canvasRef, selected, onSelect }) {
  const dragOffset = useRef(null);
  const resizeStart = useRef(null);
  const cropStart = useRef(null);
  const [mode, setMode] = useState("move"); // move | crop

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const getCanvasRect = () => canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0, width: 600, height: 900 };

  // ── Drag ──
  const startDrag = (e) => {
    if (mode === "crop") return;
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragOffset.current = { dx: clientX - img.x, dy: clientY - img.y };

    const move = (ev) => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const rect = getCanvasRect();
      onUpdate({
        x: clamp(cx - dragOffset.current.dx, 0, rect.width - img.w),
        y: clamp(cy - dragOffset.current.dy, 0, rect.height - img.h),
      });
    };
    const up = () => {
      dragOffset.current = null;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
  };

  // ── Resize ──
  const startResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    resizeStart.current = { cx, cy, w: img.w, h: img.h };

    const move = (ev) => {
      const mx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const my = ev.touches ? ev.touches[0].clientY : ev.clientY;
      onUpdate({
        w: Math.max(50, resizeStart.current.w + (mx - resizeStart.current.cx)),
        h: Math.max(50, resizeStart.current.h + (my - resizeStart.current.cy)),
      });
    };
    const up = () => {
      resizeStart.current = null;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
  };

  // ── Crop (adjusts objectPosition offset) ──
  const startCrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    cropStart.current = { cx, cy, ox: img.ox || 50, oy: img.oy || 50 };

    const move = (ev) => {
      const mx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const my = ev.touches ? ev.touches[0].clientY : ev.clientY;
      onUpdate({
        ox: clamp((cropStart.current.ox) - (mx - cropStart.current.cx) * 0.3, 0, 100),
        oy: clamp((cropStart.current.oy) - (my - cropStart.current.cy) * 0.3, 0, 100),
      });
    };
    const up = () => {
      cropStart.current = null;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
  };

  const ox = img.ox ?? 50;
  const oy = img.oy ?? 50;

  return (
    <div
      style={{
        position: "absolute",
        left: img.x, top: img.y,
        width: img.w, height: img.h,
        cursor: mode === "crop" ? "crosshair" : "move",
        outline: selected ? "2px solid #c084fc" : "2px solid transparent",
        outlineOffset: 1,
        userSelect: "none",
        touchAction: "none",
        overflow: "hidden",
        borderRadius: 4,
      }}
      onMouseDown={mode === "crop" ? startCrop : startDrag}
      onTouchStart={mode === "crop" ? startCrop : startDrag}
    >
      <img
        src={img.src}
        alt=""
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${ox}% ${oy}%`,
          display: "block",
          pointerEvents: "none",
        }}
      />

      {selected && (
        <>
          {/* Delete */}
          <button
            onMouseDown={(e) => { e.stopPropagation(); onRemove(); }}
            style={{ position: "absolute", top: -10, left: -10, width: 22, height: 22, borderRadius: "50%", background: "#f87171", border: "none", color: "white", fontSize: 13, cursor: "pointer", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
          >×</button>

          {/* Mode toggle */}
          <button
            onMouseDown={(e) => { e.stopPropagation(); setMode(m => m === "move" ? "crop" : "move"); }}
            title={mode === "move" ? "Switch to crop/pan mode" : "Switch to move mode"}
            style={{ position: "absolute", top: -10, right: -10, width: 22, height: 22, borderRadius: "50%", background: mode === "crop" ? "#f472b6" : "#c084fc", border: "none", color: "white", fontSize: 11, cursor: "pointer", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
          >{mode === "move" ? "✂️" : "↔"}</button>

          {/* Resize handle — bottom right */}
          <div
            onMouseDown={startResize}
            onTouchStart={startResize}
            style={{ position: "absolute", bottom: -6, right: -6, width: 18, height: 18, background: "#c084fc", borderRadius: 3, cursor: "nwse-resize", zIndex: 10 }}
          />

          {/* Mode hint */}
          <div style={{ position: "absolute", bottom: 4, left: 4, background: "rgba(0,0,0,0.55)", color: "white", fontSize: 9, padding: "2px 5px", borderRadius: 3, pointerEvents: "none" }}>
            {mode === "move" ? "drag to move" : "drag to pan/crop"}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────
export default function Home() {
  const [title, setTitle]         = useState("");
  const [description, setDesc]    = useState("");
  const [selected, setSelected]   = useState({ category: "minimalist", id: "boldcentered" });
  const [images, setImages]       = useState([]);
  const [activeImg, setActiveImg] = useState(null);
  const [canvasSize, setCanvasSize] = useState("portrait");
  const canvasRef = useRef(null);
  const fileRef   = useRef(null);
  const router    = useRouter();

  const registry = getTemplateRegistry();
  const TemplateComponent = getTemplateComponent(selected.category, selected.id);

  const SIZES = {
    portrait:  { w: 600, h: 900, label: "Pinterest 2:3" },
    square:    { w: 600, h: 600, label: "Instagram 1:1" },
    landscape: { w: 800, h: 450, label: "Facebook 16:9" },
  };
  const sz = SIZES[canvasSize];

  const addImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImages(prev => [...prev, { id: Date.now(), src: ev.target.result, x: 60, y: 60, w: 220, h: 220, ox: 50, oy: 50 }]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const updateImage = (id, patch) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...patch } : img));
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setActiveImg(null);
  };

  const showToast = (msg) => {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  };

  const saveDesign = () => {
    const data = { title, description, template: selected, canvasSize, savedAt: new Date().toISOString(), id: Date.now() };
    const saved = JSON.parse(localStorage.getItem("ambaig_designs") || "[]");
    saved.unshift(data);
    localStorage.setItem("ambaig_designs", JSON.stringify(saved.slice(0, 20)));
    showToast("✅ Design saved locally");
  };

  const goToCaptions = () => {
    router.push({ pathname: "/captions", query: { title, description, category: selected.category, id: selected.id } });
  };

  // Deselect on canvas background click
  const onCanvasClick = (e) => {
    if (e.target === canvasRef.current || e.target.tagName === "DIV" && e.target === canvasRef.current?.firstChild) {
      setActiveImg(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Design Studio</h1>
        <p>Pick a template, add images, then generate captions and post.</p>
      </div>

      <div style={{ display: "flex", gap: 20, padding: "0 20px 40px", flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* ── Left panel ── */}
        <div style={{ width: 230, minWidth: 200, display: "flex", flexDirection: "column", gap: 14 }}>

          <div className="card">
            <p className="panel-label">Canvas Size</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.entries(SIZES).map(([key, val]) => (
                <button key={key} onClick={() => setCanvasSize(key)} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "7px 10px", borderRadius: 8,
                  border: canvasSize === key ? "1px solid var(--accent)" : "1px solid var(--border)",
                  background: canvasSize === key ? "var(--accent-glow)" : "transparent",
                  color: canvasSize === key ? "var(--accent)" : "var(--text-muted)",
                  cursor: "pointer", fontSize: "0.78rem", fontWeight: 500,
                }}>
                  <span style={{ textTransform: "capitalize" }}>{key}</span>
                  <span style={{ opacity: 0.7 }}>{val.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <p className="panel-label">Template</p>
            <div style={{ marginBottom: 8 }}>
              <label className="field-label">Category</label>
              <select value={selected.category} onChange={e => setSelected({ category: e.target.value, id: registry[e.target.value][0].id })}>
                {Object.keys(registry).map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Style</label>
              <select value={selected.id} onChange={e => setSelected(s => ({ ...s, id: e.target.value }))}>
                {registry[selected.category].map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="card">
            <p className="panel-label">Content</p>
            <div style={{ marginBottom: 8 }}>
              <label className="field-label">Title</label>
              <input type="text" placeholder="Your pin title…" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Description</label>
              <textarea placeholder="What is this about?" value={description} onChange={e => setDesc(e.target.value)} style={{ minHeight: 72 }} />
            </div>
          </div>

          <div className="card">
            <p className="panel-label">Images</p>
            <input type="file" accept="image/*" ref={fileRef} style={{ display: "none" }} onChange={addImage} />
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => fileRef.current?.click()}>
              + Upload Image
            </button>
            {images.length > 0 && (
              <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: 8, lineHeight: 1.5 }}>
                {images.length} image{images.length > 1 ? "s" : ""}. Click to select → drag to move → ✂️ to pan/crop → corner to resize.
              </p>
            )}
          </div>

          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={saveDesign}>💾 Save Design</button>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={goToCaptions}>✨ Generate Captions →</button>
        </div>

        {/* ── Canvas ── */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 10 }}>
            Canvas — {sz.w}×{sz.h}px · Click an uploaded image to select it
          </p>
          <div style={{ overflowX: "auto", overflowY: "auto", maxWidth: "100%", maxHeight: "80vh" }}>
            <div
              ref={canvasRef}
              onClick={onCanvasClick}
              style={{ position: "relative", width: sz.w, height: sz.h, overflow: "hidden", borderRadius: 12, border: "1px solid var(--border)", flexShrink: 0 }}
            >
              {/* Template background */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                {TemplateComponent
                  ? <TemplateComponent title={title} description={description} />
                  : <div style={{ padding: 20, color: "#999" }}>Template not found</div>}
              </div>

              {/* Uploaded images (draggable) */}
              {images.map(img => (
                <CanvasImage
                  key={img.id}
                  img={img}
                  canvasRef={canvasRef}
                  selected={activeImg === img.id}
                  onSelect={() => setActiveImg(img.id)}
                  onUpdate={(patch) => updateImage(img.id, patch)}
                  onRemove={() => removeImage(img.id)}
                />
              ))}
            </div>
          </div>
          <p style={{ marginTop: 8, fontSize: "0.7rem", color: "var(--text-dim)" }}>
            💡 Templates use their own layout. Uploaded images sit on top — fully moveable, resizable, and croppable.
          </p>
        </div>
      </div>

      <style jsx>{`
        .panel-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}
