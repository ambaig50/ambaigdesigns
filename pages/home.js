import { useState, useRef, useEffect } from "react";
import { getTemplateRegistry } from "../utils/loadTemplates";
import { getTemplateComponent } from "../utils/templateComponents";
import { useRouter } from "next/router";

// ── Draggable text box ───────────────────────────────────────────
function TextBox({ box, onUpdate, onRemove, canvasRef, selected, onSelect }) {
  const startDrag = (e) => {
    if (e.target.getAttribute("contenteditable") === "true") return;
    e.stopPropagation();
    onSelect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const sx = cx - box.x, sy = cy - box.y;
    const rect = canvasRef.current?.getBoundingClientRect() || { width: 600, height: 900 };
    const move = (ev) => {
      const mx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const my = ev.touches ? ev.touches[0].clientY : ev.clientY;
      onUpdate({ x: Math.max(0, Math.min(mx - sx, rect.width - box.w)), y: Math.max(0, Math.min(my - sy, rect.height - 30)) });
    };
    const up = () => {
      window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };

  const startResizeW = (e) => {
    e.stopPropagation();
    const sx = e.clientX, sw = box.w;
    const move = (ev) => onUpdate({ w: Math.max(80, sw + ev.clientX - sx) });
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
  };

  return (
    <div
      onMouseDown={startDrag} onTouchStart={startDrag}
      style={{ position: "absolute", left: box.x, top: box.y, width: box.w, cursor: "move",
        outline: selected ? "2px dashed #c084fc" : "2px dashed transparent",
        borderRadius: 4, userSelect: "none", touchAction: "none", zIndex: 20 }}
    >
      {selected && (
        <>
          <button onMouseDown={(e) => { e.stopPropagation(); onRemove(); }}
            style={{ position: "absolute", top: -11, right: -11, width: 22, height: 22, borderRadius: "50%", background: "#f87171", border: "none", color: "white", fontSize: 13, cursor: "pointer", zIndex: 30, fontWeight: 700 }}>×</button>
          <div onMouseDown={startResizeW}
            style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, background: "#c084fc", borderRadius: 3, cursor: "ew-resize", zIndex: 30 }} />
        </>
      )}
      <div
        contentEditable={selected} suppressContentEditableWarning
        onBlur={(e) => onUpdate({ text: e.target.innerText })}
        onMouseDown={(e) => { if (selected) e.stopPropagation(); }}
        style={{
          color: box.color || "#ffffff", fontSize: box.fontSize || 18,
          fontWeight: box.bold ? 700 : 400, textAlign: box.align || "center",
          textShadow: "0 1px 6px rgba(0,0,0,0.8)", padding: "4px 8px",
          minHeight: 28, outline: "none", lineHeight: 1.4,
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          cursor: selected ? "text" : "move", fontFamily: "DM Sans, sans-serif",
        }}
      >{box.text}</div>
    </div>
  );
}

// ── Draggable + resizable + crop image ──────────────────────────
function CanvasImage({ img, onUpdate, onRemove, canvasRef, selected, onSelect }) {
  const [mode, setMode] = useState("move");

  const startDrag = (e) => {
    if (mode === "crop") { startCrop(e); return; }
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
    const sox = img.ox ?? 50, soy = img.oy ?? 50;
    const move = (ev) => {
      const mx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const my = ev.touches ? ev.touches[0].clientY : ev.clientY;
      onUpdate({ ox: Math.max(0, Math.min(sox - (mx - cx) * 0.3, 100)), oy: Math.max(0, Math.min(soy - (my - cy) * 0.3, 100)) });
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
    <div onMouseDown={startDrag} onTouchStart={startDrag}
      style={{ position: "absolute", left: img.x, top: img.y, width: img.w, height: img.h,
        cursor: mode === "crop" ? "crosshair" : "move",
        outline: selected ? "2px solid #c084fc" : "2px solid transparent",
        userSelect: "none", touchAction: "none", overflow: "hidden", borderRadius: 4, zIndex: 15 }}
    >
      <img src={img.src} alt="" draggable={false}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${img.ox ?? 50}% ${img.oy ?? 50}%`, display: "block", pointerEvents: "none" }} />
      {selected && (
        <>
          <button onMouseDown={(e) => { e.stopPropagation(); onRemove(); }}
            style={{ position: "absolute", top: -10, left: -10, width: 22, height: 22, borderRadius: "50%", background: "#f87171", border: "none", color: "white", fontSize: 13, cursor: "pointer", zIndex: 25, fontWeight: 700 }}>×</button>
          <button onMouseDown={(e) => { e.stopPropagation(); setMode(m => m === "move" ? "crop" : "move"); }}
            style={{ position: "absolute", top: -10, right: -10, width: 22, height: 22, borderRadius: "50%", background: mode === "crop" ? "#f472b6" : "#c084fc", border: "none", color: "white", fontSize: 11, cursor: "pointer", zIndex: 25 }}>
            {mode === "move" ? "✂" : "↔"}
          </button>
          <div onMouseDown={startResize} onTouchStart={startResize}
            style={{ position: "absolute", bottom: -6, right: -6, width: 18, height: 18, background: "#c084fc", borderRadius: 3, cursor: "nwse-resize", zIndex: 25 }} />
          <div style={{ position: "absolute", bottom: 4, left: 4, background: "rgba(0,0,0,0.55)", color: "white", fontSize: 9, padding: "2px 5px", borderRadius: 3, pointerEvents: "none" }}>
            {mode === "move" ? "move" : "pan/crop"}
          </div>
        </>
      )}
    </div>
  );
}

// ── Background image ─────────────────────────────────────────────
function BgImage({ src, ox, oy, opacity, onPan }) {
  const startPan = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const sox = ox, soy = oy;
    const move = (ev) => {
      ev.preventDefault();
      const mx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const my = ev.touches ? ev.touches[0].clientY : ev.clientY;
      onPan(
        Math.max(0, Math.min(sox - (mx - cx) * 0.2, 100)),
        Math.max(0, Math.min(soy - (my - cy) * 0.2, 100))
      );
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

  if (!src) return null;

  return (
    <div
      onMouseDown={startPan}
      onTouchStart={startPan}
      style={{
        position: "absolute", inset: 0, zIndex: 1,
        cursor: "grab", overflow: "hidden",
        opacity: opacity ?? 1,
      }}
    >
      <img
        src={src}
        alt="background"
        draggable={false}
        style={{
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition: `${ox ?? 50}% ${oy ?? 50}%`,
          display: "block",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
      <div style={{
        position: "absolute", bottom: 6, left: 6,
        background: "rgba(0,0,0,0.5)", color: "white",
        fontSize: 9, padding: "2px 6px", borderRadius: 3,
        pointerEvents: "none",
      }}>
        drag to pan
      </div>
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast" style={{ zIndex: 999 }}>{msg}</div>;
}

// ── Main page ────────────────────────────────────────────────────
const SIZES = {
  portrait:  { w: 600, h: 900, label: "Pinterest 2:3" },
  square:    { w: 600, h: 600, label: "Instagram 1:1" },
  landscape: { w: 800, h: 450, label: "Facebook 16:9" },
};

export default function Home() {
  const [title, setTitle]           = useState("");
  const [description, setDesc]      = useState("");
  const [selected, setSelected]     = useState({ category: "minimalist", id: "boldcentered" });
  const [showTemplate, setShowTemplate] = useState(true);
  const [canvasSize, setCanvasSize] = useState("portrait");
  const [bg, setBg]                 = useState(null);
  const [bgOpacity, setBgOpacity]   = useState(1);
  const [images, setImages]         = useState([]);
  const [textBoxes, setTextBoxes]   = useState([]);
  const [activeEl, setActiveEl]     = useState(null);
  const [textColor, setTextColor]   = useState("#ffffff");
  const [fontSize, setFontSize]     = useState(22);
  const [textBold, setTextBold]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState("");
  const canvasRef  = useRef(null);
  const imgFileRef = useRef(null);
  const bgFileRef  = useRef(null);
  const router     = useRouter();

  const registry = getTemplateRegistry();
  const TemplateComponent = getTemplateComponent(selected.category, selected.id);
  const sz = SIZES[canvasSize];

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // ── Load pending caption text layers when page mounts ──
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const pending = JSON.parse(localStorage.getItem("ambaig_pending_text") || "[]");
        if (pending.length > 0) {
          setTextBoxes(prev => [
            ...prev,
            ...pending.map((p, i) => ({
              id: Date.now() + i,
              text: p.text,
              x: 30,
              y: Math.min(800, 480 + i * 90),
              w: 540,
              color: "#ffffff",
              fontSize: 15,
              bold: false,
              align: "center",
            })),
          ]);
          localStorage.removeItem("ambaig_pending_text");
          setToast("✅ Caption placed on canvas — drag to reposition");
          setTimeout(() => setToast(""), 3500);
        }
      } catch (e) {}
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const loadFile = (file, cb) => {
    const reader = new FileReader();
    reader.onload = (e) => cb(e.target.result);
    reader.readAsDataURL(file);
  };

  const addBg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      if (src) {
        setBg({ src, ox: 50, oy: 50 });
      } else {
        setToast("⚠️ Could not load image. Try a different file.");
        setTimeout(() => setToast(""), 3000);
      }
      e.target.value = "";
    };
    reader.onerror = () => {
      setToast("⚠️ Image read failed. Try again.");
      setTimeout(() => setToast(""), 3000);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const addImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      if (src) {
        setImages(prev => [...prev, { id: Date.now(), src, x: 60, y: 60, w: 200, h: 200, ox: 50, oy: 50 }]);
      }
      e.target.value = "";
    };
    reader.onerror = () => { e.target.value = ""; };
    reader.readAsDataURL(file);
  };

  const addTextBox = (text = "Your text here", color = textColor, size = fontSize, bold = textBold) => {
    const id = Date.now();
    setTextBoxes(prev => [...prev, {
      id, text,
      x: 30,
      y: Math.max(30, sz.h / 2 - 60),
      w: sz.w - 60,
      color, fontSize: size, bold, align: "center",
    }]);
    setActiveEl({ type: "text", id });
  };

  // ── Download PNG using native Canvas API (works on mobile) ──
  const downloadPNG = async () => {
    setSaving(true);
    setActiveEl(null);
    await new Promise(r => setTimeout(r, 150));

    try {
      const canvas = document.createElement("canvas");
      canvas.width  = sz.w * 2;  // 2x for retina
      canvas.height = sz.h * 2;
      const ctx = canvas.getContext("2d");
      ctx.scale(2, 2);

      // 1. White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, sz.w, sz.h);

      // 2. Draw background image if set
      if (bg?.src) {
        await new Promise((res) => {
          const img = new window.Image();
          img.onload = () => {
            ctx.save();
            ctx.globalAlpha = bgOpacity ?? 1;
            const scale = Math.max(sz.w / img.width, sz.h / img.height);
            const dw = img.width * scale, dh = img.height * scale;
            const dx = (sz.w - dw) * (bg.ox / 100);
            const dy = (sz.h - dh) * (bg.oy / 100);
            ctx.drawImage(img, dx, dy, dw, dh);
            ctx.globalAlpha = 1;
            ctx.restore();
            res();
          };
          img.onerror = res;
          img.src = bg.src;
        });
      }

      // 3. Draw overlay images
      for (const imgData of images) {
        await new Promise((res) => {
          const img = new window.Image();
          img.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.rect(imgData.x, imgData.y, imgData.w, imgData.h);
            ctx.clip();
            const scale = Math.max(imgData.w / img.width, imgData.h / img.height);
            const dw = img.width * scale, dh = img.height * scale;
            const dx = imgData.x + (imgData.w - dw) * ((imgData.ox ?? 50) / 100);
            const dy = imgData.y + (imgData.h - dh) * ((imgData.oy ?? 50) / 100);
            ctx.drawImage(img, dx, dy, dw, dh);
            ctx.restore();
            res();
          };
          img.onerror = res;
          img.src = imgData.src;
        });
      }

      // 4. Draw text boxes
      for (const box of textBoxes) {
        ctx.save();
        ctx.font = `${box.bold ? "700" : "400"} ${box.fontSize || 18}px DM Sans, sans-serif`;
        ctx.fillStyle = box.color || "#ffffff";
        ctx.textAlign = box.align || "center";
        ctx.shadowColor = "rgba(0,0,0,0.7)";
        ctx.shadowBlur = 6;
        const lines = box.text.split("\n");
        const lineH = (box.fontSize || 18) * 1.4;
        const startX = box.align === "center" ? box.x + box.w / 2 : box.x + 8;
        lines.forEach((line, i) => {
          ctx.fillText(line, startX, box.y + (box.fontSize || 18) + i * lineH, box.w);
        });
        ctx.restore();
      }

      const dataUrl = canvas.toDataURL("image/png");

      // Store compressed version for post manager
      const jpgUrl = canvas.toDataURL("image/jpeg", 0.85);
      try { localStorage.setItem("ambaig_last_image", jpgUrl); } catch (e) {}

      // Trigger download
      const link = document.createElement("a");
      link.download = `ambaigdesigns-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToast("✅ Image saved! Check your Downloads folder.");
      setTimeout(() => setToast(""), 3500);
    } catch (err) {
      console.error(err);
      setToast("⚠️ Could not export. Screenshot the canvas manually.");
      setTimeout(() => setToast(""), 4000);
    }
    setSaving(false);
  };

  const goToCaptions = () => {
    // Use first text box content as title for caption generation
    const firstText = textBoxes[0]?.text || "";
    const secondText = textBoxes[1]?.text || "";
    router.push({
      pathname: "/captions",
      query: { title: firstText, description: secondText, category: selected.category, id: selected.id }
    });
  };

  const goToPost = () => {
    router.push("/post");
  };

  return (
    <div>
      <div className="page-header">
        <h1>Design Studio</h1>
        <p>Build your pin — background, images, text — then caption and post.</p>
      </div>

      <div style={{ display: "flex", gap: 14, padding: "0 14px 80px", flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* ── Left panel ── */}
        <div style={{ width: 215, minWidth: 200, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Canvas size */}
          <div className="card">
            <p className="plabel">Canvas Size</p>
            {Object.entries(SIZES).map(([key, val]) => (
              <button key={key} onClick={() => setCanvasSize(key)} style={{
                display: "flex", justifyContent: "space-between", width: "100%",
                padding: "6px 10px", borderRadius: 7, marginBottom: 5,
                border: canvasSize === key ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: canvasSize === key ? "var(--accent-glow)" : "transparent",
                color: canvasSize === key ? "var(--accent)" : "var(--text-muted)",
                cursor: "pointer", fontSize: "0.76rem", fontWeight: 500,
              }}>
                <span style={{ textTransform: "capitalize" }}>{key}</span>
                <span style={{ opacity: 0.7, fontSize: "0.7rem" }}>{val.label}</span>
              </button>
            ))}
          </div>

          {/* Template */}
          <div className="card">
            <p className="plabel">Template</p>
            <label style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10, cursor: "pointer", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <input type="checkbox" checked={showTemplate} onChange={e => setShowTemplate(e.target.checked)} style={{ accentColor: "var(--accent)" }} /> Show template
            </label>
            {showTemplate && <>
              <div style={{ marginBottom: 7 }}>
                <label className="field-label">Category</label>
                <select value={selected.category} onChange={e => setSelected({ category: e.target.value, id: registry[e.target.value][0].id })}>
                  {Object.keys(registry).map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 4 }}>
                <label className="field-label">Style</label>
                <select value={selected.id} onChange={e => setSelected(s => ({ ...s, id: e.target.value }))}>
                  {registry[selected.category].map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </>}
          </div>

          {/* Text on canvas */}
          <div className="card">
            <p className="plabel">Text on Canvas</p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginBottom: 10, lineHeight: 1.5 }}>
              Text is placed as a moveable layer — drag it anywhere on canvas.
            </p>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <label className="field-label">Color</label>
                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                  style={{ width: "100%", height: 34, padding: 2, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface2)", cursor: "pointer" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="field-label">Size</label>
                <input type="number" value={fontSize} min={10} max={80} onChange={e => setFontSize(Number(e.target.value))} />
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, cursor: "pointer", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <input type="checkbox" checked={textBold} onChange={e => setTextBold(e.target.checked)} style={{ accentColor: "var(--accent)" }} /> Bold
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button className="btn btn-ghost" style={{ justifyContent: "center" }}
                onClick={() => addTextBox("Title text", textColor, Math.max(fontSize, 28), true)}>
                + Add Title
              </button>
              <button className="btn btn-ghost" style={{ justifyContent: "center" }}
                onClick={() => addTextBox("Description text", textColor, Math.min(fontSize, 16), false)}>
                + Add Description
              </button>
              <button className="btn btn-ghost" style={{ justifyContent: "center" }}
                onClick={() => addTextBox("Your text here", textColor, fontSize, textBold)}>
                + Add Text Box
              </button>
            </div>
          </div>

          {/* Background */}
          <div className="card">
            <p className="plabel">Background Photo</p>
            <input type="file" accept="image/*" ref={bgFileRef} style={{ display: "none" }} onChange={addBg} />
            {bg ? (
              <div>
                {/* Thumbnail */}
                <div style={{ width: "100%", height: 80, borderRadius: 8, overflow: "hidden", marginBottom: 10, border: "1px solid var(--border)" }}>
                  <img src={bg.src} alt="bg preview" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: bgOpacity }} />
                </div>

                {/* Opacity slider */}
                <label className="field-label">Opacity — {Math.round(bgOpacity * 100)}%</label>
                <input
                  type="range" min="0.1" max="1" step="0.05"
                  value={bgOpacity}
                  onChange={e => setBgOpacity(Number(e.target.value))}
                  style={{ width: "100%", marginBottom: 10, accentColor: "var(--accent)" }}
                />

                {/* Single button - Change Photo (also acts as remove via new selection) */}
                <button
                  className="btn btn-ghost"
                  style={{ width: "100%", justifyContent: "center", fontSize: "0.78rem" }}
                  onClick={() => bgFileRef.current?.click()}
                >
                  🖼 Change Photo
                </button>
                <button
                  onClick={() => { setBg(null); setBgOpacity(1); }}
                  style={{ width: "100%", marginTop: 6, padding: "6px", borderRadius: 8, border: "none", background: "transparent", color: "var(--text-dim)", cursor: "pointer", fontSize: "0.72rem", textAlign: "center" }}
                >
                  Remove background
                </button>
                <p style={{ fontSize: "0.65rem", color: "var(--text-dim)", marginTop: 6 }}>Drag image on canvas to pan.</p>
              </div>
            ) : (
              <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}
                onClick={() => bgFileRef.current?.click()}>
                🖼 Set Background Photo
              </button>
            )}
          </div>

          {/* Overlay image */}
          <div className="card">
            <p className="plabel">Overlay Image</p>
            <input type="file" accept="image/*" ref={imgFileRef} style={{ display: "none" }} onChange={addImage} />
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => imgFileRef.current?.click()}>+ Add Image Layer</button>
            {images.length > 0 && <p style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: 5 }}>{images.length} image(s) on canvas</p>}
          </div>

          {/* Actions */}
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={downloadPNG} disabled={saving}>
            {saving ? "⏳ Exporting…" : "💾 Save & Download PNG"}
          </button>

          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", borderColor: "var(--success)", color: "var(--success)" }} onClick={goToPost}>
            📤 Go to Post Manager →
          </button>

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={goToCaptions}>
            ✨ Generate Captions →
          </button>
        </div>

        {/* ── Canvas ── */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 8 }}>
            Canvas — {sz.w}×{sz.h}px
            {activeEl && <span style={{ color: "var(--accent)", marginLeft: 8 }}>· element selected</span>}
          </p>
          <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "78vh" }}>
            <div
              ref={canvasRef}
              onClick={(e) => { if (e.target === canvasRef.current) setActiveEl(null); }}
              style={{ position: "relative", width: sz.w, height: sz.h, overflow: "hidden", borderRadius: 10, border: "1px solid var(--border)", background: "#fff", flexShrink: 0 }}
            >
              {/* 1. Background */}
              {bg && bg.src && (
                <BgImage
                  src={bg.src}
                  ox={bg.ox} oy={bg.oy}
                  opacity={bgOpacity}
                  onPan={(ox, oy) => setBg(b => ({ ...b, ox, oy }))}
                />
              )}

              {/* 2. Template — mix-blend-mode strips white bg when photo is set */}
              {showTemplate && TemplateComponent && (
                <div style={{
                  position: "absolute", inset: 0, zIndex: 5,
                  pointerEvents: "none",
                  mixBlendMode: bg ? "multiply" : "normal",
                }}>
                  <TemplateComponent title="" description="" />
                </div>
              )}

              {/* 3. Overlay images */}
              {images.map(img => (
                <CanvasImage key={img.id} img={img} canvasRef={canvasRef}
                  selected={activeEl?.type === "img" && activeEl.id === img.id}
                  onSelect={() => setActiveEl({ type: "img", id: img.id })}
                  onUpdate={patch => setImages(prev => prev.map(i => i.id === img.id ? { ...i, ...patch } : i))}
                  onRemove={() => { setImages(prev => prev.filter(i => i.id !== img.id)); setActiveEl(null); }}
                />
              ))}

              {/* 4. Text boxes */}
              {textBoxes.map(box => (
                <TextBox key={box.id} box={box} canvasRef={canvasRef}
                  selected={activeEl?.type === "text" && activeEl.id === box.id}
                  onSelect={() => setActiveEl({ type: "text", id: box.id })}
                  onUpdate={patch => setTextBoxes(prev => prev.map(b => b.id === box.id ? { ...b, ...patch } : b))}
                  onRemove={() => { setTextBoxes(prev => prev.filter(b => b.id !== box.id)); setActiveEl(null); }}
                />
              ))}
            </div>
          </div>
          <p style={{ marginTop: 6, fontSize: "0.68rem", color: "var(--text-dim)" }}>
            💡 Layers: Background → Template → Images → Text. Captions from AI appear here when you click "Add to Canvas".
          </p>
        </div>
      </div>

      <Toast msg={toast} />

      <style jsx>{`
        .plabel { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 9px; }
      `}</style>
    </div>
  );
}
