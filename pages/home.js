import { useState, useRef, useCallback, useEffect } from "react";
import { getTemplateRegistry } from "../utils/loadTemplates";
import { getTemplateComponent } from "../utils/templateComponents";
import { useRouter } from "next/router";

// ── drag/resize helpers ──────────────────────────────────────────
function useDraggable(pos, setPos, canvasRef) {
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const onTouchStart = (e) => {
    dragging.current = true;
    const t = e.touches[0];
    offset.current = { x: t.clientX - pos.x, y: t.clientY - pos.y };
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onMouseUp);
  };

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const onMouseMove = useCallback((e) => {
    if (!dragging.current) return;
    const canvas = canvasRef.current?.getBoundingClientRect();
    if (!canvas) return;
    setPos(p => ({
      ...p,
      x: clamp(e.clientX - offset.current.x, 0, canvas.width - (p.w || 100)),
      y: clamp(e.clientY - canvas.top - offset.current.y, 0, canvas.height - (p.h || 100)),
    }));
  }, [setPos, canvasRef]);

  const onTouchMove = useCallback((e) => {
    e.preventDefault();
    if (!dragging.current) return;
    const t = e.touches[0];
    const canvas = canvasRef.current?.getBoundingClientRect();
    if (!canvas) return;
    setPos(p => ({
      ...p,
      x: clamp(t.clientX - offset.current.x, 0, canvas.width - (p.w || 100)),
      y: clamp(t.clientY - canvas.top - offset.current.y, 0, canvas.height - (p.h || 100)),
    }));
  }, [setPos, canvasRef]);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onMouseUp);
  }, [onMouseMove, onTouchMove]);

  return { onMouseDown, onTouchStart };
}

// ── CanvasImage component ────────────────────────────────────────
function CanvasImage({ img, onUpdate, onRemove, canvasRef, selected, onSelect }) {
  const [pos, setPos] = useState({ x: img.x, y: img.y, w: img.w, h: img.h });
  const { onMouseDown, onTouchStart } = useDraggable(pos, setPos, canvasRef);
  const resizing = useRef(false);
  const resizeStart = useRef({});

  useEffect(() => { onUpdate({ ...img, ...pos }); }, [pos]);

  const startResize = (e) => {
    e.stopPropagation();
    resizing.current = true;
    resizeStart.current = { x: e.clientX, y: e.clientY, w: pos.w, h: pos.h };
    const onMove = (ev) => {
      if (!resizing.current) return;
      const dx = ev.clientX - resizeStart.current.x;
      const dy = ev.clientY - resizeStart.current.y;
      setPos(p => ({ ...p, w: Math.max(40, resizeStart.current.w + dx), h: Math.max(40, resizeStart.current.h + dy) }));
    };
    const onUp = () => {
      resizing.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      onMouseDown={(e) => { onSelect(); onMouseDown(e); }}
      onTouchStart={(e) => { onSelect(); onTouchStart(e); }}
      style={{
        position: "absolute",
        left: pos.x, top: pos.y,
        width: pos.w, height: pos.h,
        cursor: "move",
        outline: selected ? "2px solid #c084fc" : "none",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <img
        src={img.src}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: 4 }}
        draggable={false}
      />
      {selected && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            style={{ position: "absolute", top: -10, right: -10, width: 22, height: 22, borderRadius: "50%", background: "#f87171", border: "none", color: "white", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >×</button>
          <div
            onMouseDown={startResize}
            style={{ position: "absolute", bottom: -6, right: -6, width: 16, height: 16, background: "#c084fc", borderRadius: 3, cursor: "nwse-resize" }}
          />
        </>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function Home() {
  const [title, setTitle]       = useState("");
  const [description, setDesc]  = useState("");
  const [selected, setSelected] = useState({ category: "minimalist", id: "boldcentered" });
  const [images, setImages]     = useState([]);
  const [activeImg, setActiveImg] = useState(null);
  const [canvasSize, setCanvasSize] = useState("portrait"); // portrait | square | landscape
  const canvasRef  = useRef(null);
  const fileRef    = useRef(null);
  const router     = useRouter();

  const registry = getTemplateRegistry();
  const TemplateComponent = getTemplateComponent(selected.category, selected.id);

  const SIZES = {
    portrait:  { w: 600, h: 900,  label: "Pinterest (2:3)" },
    square:    { w: 600, h: 600,  label: "Instagram (1:1)" },
    landscape: { w: 800, h: 450,  label: "Facebook (16:9)" },
  };

  const addImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImages(prev => [...prev, {
        id: Date.now(),
        src: ev.target.result,
        x: 40, y: 40, w: 200, h: 200,
      }]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const updateImage = (id, data) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...data } : img));
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setActiveImg(null);
  };

  const saveDesign = () => {
    const data = { title, description, template: selected, images, canvasSize };
    const saved = JSON.parse(localStorage.getItem("ambaig_designs") || "[]");
    saved.push({ ...data, savedAt: new Date().toISOString(), id: Date.now() });
    localStorage.setItem("ambaig_designs", JSON.stringify(saved));
    // Show toast
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = "✅ Design saved locally";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  };

  const goToCaptions = () => {
    router.push({
      pathname: "/captions",
      query: { title, description, category: selected.category, id: selected.id }
    });
  };

  const sz = SIZES[canvasSize];

  return (
    <div>
      <div className="page-header">
        <h1>Design Studio</h1>
        <p>Build your pin or mockup, then generate AI captions and post.</p>
      </div>

      <div style={{ display: "flex", gap: 20, padding: "0 24px 32px", flexWrap: "wrap" }}>

        {/* ── Left panel ── */}
        <div style={{ width: 240, minWidth: 220, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Template picker */}
          <div className="card">
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Template</p>
            <div style={{ marginBottom: 10 }}>
              <label className="field-label">Category</label>
              <select
                value={selected.category}
                onChange={(e) => setSelected({ category: e.target.value, id: registry[e.target.value][0].id })}
              >
                {Object.keys(registry).map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Style</label>
              <select value={selected.id} onChange={(e) => setSelected(s => ({ ...s, id: e.target.value }))}>
                {registry[selected.category].map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Canvas size */}
          <div className="card">
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Canvas Size</p>
            {Object.entries(SIZES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setCanvasSize(key)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "8px 12px", borderRadius: 8, marginBottom: 6,
                  border: canvasSize === key ? "1px solid var(--accent)" : "1px solid var(--border)",
                  background: canvasSize === key ? "var(--accent-glow)" : "transparent",
                  color: canvasSize === key ? "var(--accent)" : "var(--text-muted)",
                  cursor: "pointer", fontSize: "0.8rem", fontWeight: 500,
                }}
              >
                <span style={{ textTransform: "capitalize" }}>{key}</span>
                <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>{val.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="card">
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Content</p>
            <div style={{ marginBottom: 10 }}>
              <label className="field-label">Title</label>
              <input type="text" placeholder="Your pin title…" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Description</label>
              <textarea placeholder="What is this about?" value={description} onChange={e => setDesc(e.target.value)} style={{ minHeight: 80 }} />
            </div>
          </div>

          {/* Image uploads */}
          <div className="card">
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Images</p>
            <input type="file" accept="image/*" ref={fileRef} style={{ display: "none" }} onChange={addImage} />
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => fileRef.current?.click()}>
              + Add Image
            </button>
            {images.length > 0 && (
              <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: 8 }}>
                {images.length} image{images.length > 1 ? "s" : ""} on canvas. Click to select, drag to move, resize via corner.
              </p>
            )}
          </div>

          {/* Actions */}
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={saveDesign}>
            💾 Save Design
          </button>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={goToCaptions}>
            ✨ Generate Captions →
          </button>
        </div>

        {/* ── Canvas area ── */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Canvas — {sz.w}×{sz.h}px
            </p>
            {activeImg !== null && (
              <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: "0.75rem" }} onClick={() => setActiveImg(null)}>
                Deselect
              </button>
            )}
          </div>

          {/* Responsive canvas wrapper */}
          <div style={{ overflow: "auto", maxWidth: "100%" }}>
            <div
              ref={canvasRef}
              onClick={(e) => { if (e.target === canvasRef.current) setActiveImg(null); }}
              style={{
                position: "relative",
                width: sz.w,
                height: sz.h,
                overflow: "hidden",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "#fff",
              }}
            >
              {/* Template layer */}
              {TemplateComponent
                ? <TemplateComponent title={title} description={description} />
                : <div style={{ padding: 20, color: "#999" }}>Template not found</div>
              }

              {/* Images layer */}
              {images.map((img) => (
                <CanvasImage
                  key={img.id}
                  img={img}
                  canvasRef={canvasRef}
                  selected={activeImg === img.id}
                  onSelect={() => setActiveImg(img.id)}
                  onUpdate={(data) => updateImage(img.id, data)}
                  onRemove={() => removeImage(img.id)}
                />
              ))}
            </div>
          </div>

          <p style={{ marginTop: 10, fontSize: "0.72rem", color: "var(--text-dim)" }}>
            💡 Tip: drag images anywhere, use the purple handle to resize, × to remove.
          </p>
        </div>
      </div>
    </div>
  );
}
