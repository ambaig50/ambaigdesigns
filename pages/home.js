import { useState, useRef, useEffect, useCallback } from "react";
import { getTemplateRegistry } from "../utils/loadTemplates";
import { getTemplateComponent } from "../utils/templateComponents";
import { useRouter } from "next/router";

// ── Draggable text box ───────────────────────────────────────────
function TextBox({ box, onUpdate, onRemove, canvasRef, selected, onSelect }) {
  const dragRef = useRef(null);

  const startDrag = (e) => {
    e.stopPropagation();
    onSelect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const startX = clientX - box.x;
    const startY = clientY - box.y;
    const rect = canvasRef.current?.getBoundingClientRect() || { width: 600, height: 900 };

    const move = (ev) => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      onUpdate({
        x: Math.max(0, Math.min(cx - startX, rect.width - box.w)),
        y: Math.max(0, Math.min(cy - startY, rect.height - 30)),
      });
    };
    const up = () => {
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

  return (
    <div
      ref={dragRef}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      style={{
        position: "absolute",
        left: box.x, top: box.y,
        width: box.w,
        cursor: "move",
        outline: selected ? "2px dashed #c084fc" : "2px dashed transparent",
        borderRadius: 4,
        userSelect: "none",
        touchAction: "none",
        zIndex: 20,
      }}
    >
      {selected && (
        <button
          onMouseDown={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ position: "absolute", top: -10, right: -10, width: 20, height: 20, borderRadius: "50%", background: "#f87171", border: "none", color: "white", fontSize: 12, cursor: "pointer", zIndex: 30, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
        >×</button>
      )}
      <div
        contentEditable={selected}
        suppressContentEditableWarning
        onBlur={(e) => onUpdate({ text: e.target.innerText })}
        onMouseDown={(e) => { if (selected) e.stopPropagation(); }}
        style={{
          color: box.color || "#ffffff",
          fontSize: box.fontSize || 18,
          fontWeight: box.bold ? 700 : 400,
          textAlign: box.align || "center",
          textShadow: "0 1px 4px rgba(0,0,0,0.7)",
          padding: "4px 8px",
          minHeight: 28,
          outline: "none",
          lineHeight: 1.4,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          cursor: selected ? "text" : "move",
          fontFamily: "DM Sans, sans-serif",
        }}
      >{box.text}</div>

      {/* Resize width handle */}
      {selected && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            const startX = e.clientX;
            const startW = box.w;
            const move = (ev) => onUpdate({ w: Math.max(80, startW + (ev.clientX - startX)) });
            const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
            window.addEventListener("mousemove", move);
            window.addEventListener("mouseup", up);
          }}
          style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, background: "#c084fc", borderRadius: 3, cursor: "ew-resize", zIndex: 30 }}
        />
      )}
    </div>
  );
}

// ── Draggable + resizable + crop image ──────────────────────────
function CanvasImage({ img, onUpdate, onRemove, canvasRef, selected, onSelect }) {
  const [mode, setMode] = useState("move");

  const startDrag = (e) => {
    if (mode === "crop") return startCrop(e);
    e.preventDefault(); e.stopPropagation(); onSelect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = cx - img.x, dy = cy - img.y;
    const rect = canvasRef.current?.getBoundingClientRect() || { width: 600, height: 900 };
    const move = (ev) => {
      const mx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const my = ev.touches ? ev.touches[0].clientY : ev.clientY;
      onUpdate({ x: Math.max(0, Math.min(mx - dx, rect.width - img.w)), y: Math.max(0, Math.min(my - dy, rect.height - img.h)) });
    };
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };

  const startCrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const startOx = img.ox ?? 50, startOy = img.oy ?? 50;
    const move = (ev) => {
      const mx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const my = ev.touches ? ev.touches[0].clientY : ev.clientY;
      onUpdate({ ox: Math.max(0, Math.min(startOx - (mx - cx) * 0.3, 100)), oy: Math.max(0, Math.min(startOy - (my - cy) * 0.3, 100)) });
    };
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };

  const startResize = (e) => {
    e.preventDefault(); e.stopPropagation();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const sw = img.w, sh = img.h;
    const move = (ev) => {
      const mx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const my = ev.touches ? ev.touches[0].clientY : ev.clientY;
      onUpdate({ w: Math.max(50, sw + mx - cx), h: Math.max(50, sh + my - cy) });
    };
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };

  return (
    <div
      onMouseDown={startDrag} onTouchStart={startDrag}
      style={{ position: "absolute", left: img.x, top: img.y, width: img.w, height: img.h, cursor: mode === "crop" ? "crosshair" : "move", outline: selected ? "2px solid #c084fc" : "2px solid transparent", userSelect: "none", touchAction: "none", overflow: "hidden", borderRadius: 4, zIndex: 15 }}
    >
      <img src={img.src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${img.ox ?? 50}% ${img.oy ?? 50}%`, display: "block", pointerEvents: "none" }} />
      {selected && (
        <>
          <button onMouseDown={(e) => { e.stopPropagation(); onRemove(); }} style={{ position: "absolute", top: -10, left: -10, width: 22, height: 22, borderRadius: "50%", background: "#f87171", border: "none", color: "white", fontSize: 13, cursor: "pointer", zIndex: 25, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>×</button>
          <button onMouseDown={(e) => { e.stopPropagation(); setMode(m => m === "move" ? "crop" : "move"); }} title={mode === "move" ? "Crop/pan mode" : "Move mode"} style={{ position: "absolute", top: -10, right: -10, width: 22, height: 22, borderRadius: "50%", background: mode === "crop" ? "#f472b6" : "#c084fc", border: "none", color: "white", fontSize: 11, cursor: "pointer", zIndex: 25, display: "flex", alignItems: "center", justifyContent: "center" }}>{mode === "move" ? "✂" : "↔"}</button>
          <div onMouseDown={startResize} onTouchStart={startResize} style={{ position: "absolute", bottom: -6, right: -6, width: 18, height: 18, background: "#c084fc", borderRadius: 3, cursor: "nwse-resize", zIndex: 25 }} />
          <div style={{ position: "absolute", bottom: 4, left: 4, background: "rgba(0,0,0,0.55)", color: "white", fontSize: 9, padding: "2px 5px", borderRadius: 3, pointerEvents: "none" }}>{mode === "move" ? "move" : "pan/crop"}</div>
        </>
      )}
    </div>
  );
}

// ── Background image (full canvas, pannable) ────────────────────
function BgImage({ src, ox, oy, onPan, onRemove }) {
  const startPan = (e) => {
    e.preventDefault();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const startOx = ox, startOy = oy;
    const move = (ev) => {
      const mx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const my = ev.touches ? ev.touches[0].clientY : ev.clientY;
      onPan(Math.max(0, Math.min(startOx - (mx - cx) * 0.2, 100)), Math.max(0, Math.min(startOy - (my - cy) * 0.2, 100)));
    };
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 1, cursor: "crosshair", overflow: "hidden" }} onMouseDown={startPan} onTouchStart={startPan}>
      <img src={src} alt="background" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${ox}% ${oy}%`, display: "block", pointerEvents: "none" }} />
      <button onMouseDown={(e) => { e.stopPropagation(); onRemove(); }} style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: "50%", background: "#f87171", border: "none", color: "white", fontSize: 14, cursor: "pointer", zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>×</button>
      <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.55)", color: "white", fontSize: 9, padding: "2px 6px", borderRadius: 3, pointerEvents: "none" }}>drag to pan background</div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────
const SIZES = {
  portrait:  { w: 600, h: 900, label: "Pinterest 2:3" },
  square:    { w: 600, h: 600, label: "Instagram 1:1" },
  landscape: { w: 800, h: 450, label: "Facebook 16:9" },
};

export default function Home() {
  const [title, setTitle]       = useState("");
  const [description, setDesc]  = useState("");
  const [selected, setSelected] = useState({ category: "minimalist", id: "boldcentered" });
  const [showTemplate, setShowTemplate] = useState(true);
  const [canvasSize, setCanvasSize]     = useState("portrait");
  const [bg, setBg]             = useState(null); // { src, ox, oy }
  const [images, setImages]     = useState([]);
  const [textBoxes, setTextBoxes] = useState([]);
  const [activeEl, setActiveEl] = useState(null); // { type: "img"|"text", id }
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize]   = useState(22);
  const [textBold, setTextBold]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const canvasRef  = useRef(null);
  const imgFileRef = useRef(null);
  const bgFileRef  = useRef(null);
  const router     = useRouter();

  const registry = getTemplateRegistry();
  const TemplateComponent = getTemplateComponent(selected.category, selected.id);
  const sz = SIZES[canvasSize];

  // Pick up any captions queued from the captions page
  useEffect(() => {
    const pending = JSON.parse(localStorage.getItem("ambaig_pending_text") || "[]");
    if (pending.length > 0) {
      setTextBoxes(prev => [
        ...prev,
        ...pending.map((p, i) => ({
          ...p,
          id: Date.now() + i,
          x: 60,
          y: sz.h / 2 + i * 60,
          w: sz.w - 120,
          align: "center",
        })),
      ]);
      localStorage.removeItem("ambaig_pending_text");
    }
  }, []);

  // ── File loaders ──
  const loadFile = (file, cb) => {
    const reader = new FileReader();
    reader.onload = (e) => cb(e.target.result);
    reader.readAsDataURL(file);
  };

  const addBg = (e) => {
    const file = e.target.files[0]; if (!file) return;
    loadFile(file, src => setBg({ src, ox: 50, oy: 50 }));
    e.target.value = "";
  };

  const addImage = (e) => {
    const file = e.target.files[0]; if (!file) return;
    loadFile(file, src => setImages(prev => [...prev, { id: Date.now(), src, x: 60, y: 60, w: 200, h: 200, ox: 50, oy: 50 }]));
    e.target.value = "";
  };

  const addTextBox = (text = "Your text here", color = textColor, size = fontSize) => {
    const id = Date.now();
    setTextBoxes(prev => [...prev, { id, text, x: 60, y: sz.h / 2 - 20, w: 300, color, fontSize: size, bold: textBold, align: "center" }]);
    setActiveEl({ type: "text", id });
  };

  const addCaptionLayer = (caption) => {
    addTextBox(caption, "#ffffff", 16);
  };

  // ── Download as PNG ──
  const downloadPNG = async () => {
    setSaving(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(canvasRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        width: sz.w,
        height: sz.h,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `ambaigdesigns-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      // Also store the dataURL in localStorage for post manager
      localStorage.setItem("ambaig_last_image", canvas.toDataURL("image/jpeg", 0.85));
    } catch (err) {
      alert("Could not export image. Try on desktop browser for best results.");
    }
    setSaving(false);
  };

  // ── Save design ──
  const saveDesign = async () => {
    await downloadPNG();
    const data = { title, description, template: selected, canvasSize, savedAt: new Date().toISOString(), id: Date.now() };
    const saved = JSON.parse(localStorage.getItem("ambaig_designs") || "[]");
    saved.unshift(data);
    localStorage.setItem("ambaig_designs", JSON.stringify(saved.slice(0, 20)));
  };

  const goToCaptions = () => {
    router.push({ pathname: "/captions", query: { title, description, category: selected.category, id: selected.id } });
  };

  const onCanvasBgClick = (e) => {
    if (e.target === canvasRef.current) setActiveEl(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Design Studio</h1>
        <p>Build your pin — add background, images, and text layers directly on canvas.</p>
      </div>

      <div style={{ display: "flex", gap: 16, padding: "0 16px 40px", flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* ── Left panel ── */}
        <div style={{ width: 220, minWidth: 200, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Canvas size */}
          <div className="card">
            <p className="panel-label">Canvas Size</p>
            {Object.entries(SIZES).map(([key, val]) => (
              <button key={key} onClick={() => setCanvasSize(key)} style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "6px 10px", borderRadius: 7, marginBottom: 5, border: canvasSize === key ? "1px solid var(--accent)" : "1px solid var(--border)", background: canvasSize === key ? "var(--accent-glow)" : "transparent", color: canvasSize === key ? "var(--accent)" : "var(--text-muted)", cursor: "pointer", fontSize: "0.77rem", fontWeight: 500 }}>
                <span style={{ textTransform: "capitalize" }}>{key}</span>
                <span style={{ opacity: 0.7 }}>{val.label}</span>
              </button>
            ))}
          </div>

          {/* Template */}
          <div className="card">
            <p className="panel-label">Template</p>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <input type="checkbox" checked={showTemplate} onChange={e => setShowTemplate(e.target.checked)} style={{ accentColor: "var(--accent)" }} />
              Show template
            </label>
            {showTemplate && (
              <>
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
                <div style={{ marginTop: 10 }}>
                  <label className="field-label">Title</label>
                  <input type="text" placeholder="Pin title…" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <label className="field-label">Description</label>
                  <textarea placeholder="Description…" value={description} onChange={e => setDesc(e.target.value)} style={{ minHeight: 60 }} />
                </div>
              </>
            )}
          </div>

          {/* Background image */}
          <div className="card">
            <p className="panel-label">Background Photo</p>
            <input type="file" accept="image/*" ref={bgFileRef} style={{ display: "none" }} onChange={addBg} />
            {bg
              ? <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => setBg(null)}>🗑 Remove Background</button>
              : <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => bgFileRef.current?.click()}>🖼 Set Background Photo</button>
            }
            {bg && <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: 6 }}>Drag on canvas to pan/reposition.</p>}
          </div>

          {/* Overlay image */}
          <div className="card">
            <p className="panel-label">Overlay Image</p>
            <input type="file" accept="image/*" ref={imgFileRef} style={{ display: "none" }} onChange={addImage} />
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => imgFileRef.current?.click()}>+ Add Image Layer</button>
            {images.length > 0 && <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: 6 }}>{images.length} image{images.length > 1 ? "s" : ""}. Click to select → drag/resize/crop.</p>}
          </div>

          {/* Text layers */}
          <div className="card">
            <p className="panel-label">Text Layers</p>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <label className="field-label">Color</label>
                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: "100%", height: 34, padding: 2, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface2)", cursor: "pointer" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="field-label">Size</label>
                <input type="number" value={fontSize} min={10} max={80} onChange={e => setFontSize(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, cursor: "pointer", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <input type="checkbox" checked={textBold} onChange={e => setTextBold(e.target.checked)} style={{ accentColor: "var(--accent)" }} /> Bold
            </label>
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => addTextBox()}>+ Add Text</button>
            {textBoxes.length > 0 && <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: 6 }}>Click text on canvas to select → drag to move → click to edit → × to delete.</p>}
          </div>

          {/* Actions */}
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={saveDesign} disabled={saving}>
            {saving ? "Saving…" : "💾 Save & Download PNG"}
          </button>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={goToCaptions}>
            ✨ Generate Captions →
          </button>
        </div>

        {/* ── Canvas ── */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 8 }}>
            Canvas — {sz.w}×{sz.h}px · Click elements to select
          </p>
          <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "82vh" }}>
            <div
              ref={canvasRef}
              onClick={onCanvasBgClick}
              style={{ position: "relative", width: sz.w, height: sz.h, overflow: "hidden", borderRadius: 12, border: "1px solid var(--border)", background: "#fff", flexShrink: 0 }}
            >
              {/* 1. Background photo */}
              {bg && <BgImage src={bg.src} ox={bg.ox} oy={bg.oy} onPan={(ox, oy) => setBg(b => ({ ...b, ox, oy }))} onRemove={() => setBg(null)} />}

              {/* 2. Template layer */}
              {showTemplate && TemplateComponent && (
                <div style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none" }}>
                  <TemplateComponent title={title} description={description} />
                </div>
              )}

              {/* 3. Overlay images */}
              {images.map(img => (
                <CanvasImage
                  key={img.id} img={img} canvasRef={canvasRef}
                  selected={activeEl?.type === "img" && activeEl.id === img.id}
                  onSelect={() => setActiveEl({ type: "img", id: img.id })}
                  onUpdate={patch => setImages(prev => prev.map(i => i.id === img.id ? { ...i, ...patch } : i))}
                  onRemove={() => { setImages(prev => prev.filter(i => i.id !== img.id)); setActiveEl(null); }}
                />
              ))}

              {/* 4. Text layers */}
              {textBoxes.map(box => (
                <TextBox
                  key={box.id} box={box} canvasRef={canvasRef}
                  selected={activeEl?.type === "text" && activeEl.id === box.id}
                  onSelect={() => setActiveEl({ type: "text", id: box.id })}
                  onUpdate={patch => setTextBoxes(prev => prev.map(b => b.id === box.id ? { ...b, ...patch } : b))}
                  onRemove={() => { setTextBoxes(prev => prev.filter(b => b.id !== box.id)); setActiveEl(null); }}
                />
              ))}
            </div>
          </div>
          <p style={{ marginTop: 8, fontSize: "0.7rem", color: "var(--text-dim)" }}>
            💡 Layer order: Background photo → Template → Overlay images → Text. 
            Set background to go full-photo mode, hide template checkbox to remove it.
          </p>
        </div>
      </div>

      <style jsx>{`
        .panel-label { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }
      `}</style>
    </div>
  );
}
