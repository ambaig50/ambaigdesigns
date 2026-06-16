import { useState, useRef, useEffect } from "react";
import { getTemplateRegistry } from "../utils/loadTemplates";
import { getTemplateComponent } from "../utils/templateComponents";
import { useRouter } from "next/router";

// ── Text styles ──────────────────────────────────────────────────
const TEXT_STYLES = {
  shadow:   { textShadow: "0 2px 8px rgba(0,0,0,0.9)", background: "transparent" },
  outline:  { textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000", background: "transparent" },
  pill:     { textShadow: "none", background: "rgba(0,0,0,0.55)", borderRadius: 6, padding: "4px 12px" },
  plain:    { textShadow: "none", background: "transparent" },
};

// ── Draggable text box ───────────────────────────────────────────
function TextBox({ box, onUpdate, onRemove, canvasRef, selected, onSelect }) {
  const [editing, setEditing] = useState(false);
  const editRef  = useRef(null);
  const wrapRef  = useRef(null);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setEditing(true);
    setTimeout(() => {
      editRef.current?.focus();
      const el = editRef.current;
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      }
    }, 50);
  };

  const handleBlur = (e) => {
    setEditing(false);
    const newText = e.target.innerText || box.text;
    onUpdate({ text: newText });
  };

  useEffect(() => { if (!selected) setEditing(false); }, [selected]);

  const startDrag = (e) => {
    if (editing) return;
    e.stopPropagation();
    onSelect();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const offsetX = cx - rect.left - box.x;
    const offsetY = cy - rect.top - box.y;
    const move = (ev) => {
      ev.preventDefault();
      const mx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const my = ev.touches ? ev.touches[0].clientY : ev.clientY;
      onUpdate({
        x: Math.max(0, Math.min(mx - rect.left - offsetX, rect.width - 20)),
        y: Math.max(0, Math.min(my - rect.top - offsetY, rect.height - 20)),
      });
    };
    const up = () => {
      window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };

  const style = TEXT_STYLES[box.style || "shadow"];

  return (
    <div
      ref={wrapRef}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      onDoubleClick={handleDoubleClick}
      data-canvas-el="text"
      style={{
        position: "absolute",
        left: box.x, top: box.y,
        // Fixed width from box.x to canvas right edge (568 = 600 - 16 - 16)
        width: Math.min(568 - box.x, 568),
        cursor: editing ? "text" : "move",
        outline: selected ? (editing ? "2px solid #f472b6" : "2px dashed #c084fc") : "2px dashed transparent",
        borderRadius: 4,
        userSelect: editing ? "text" : "none",
        touchAction: editing ? "auto" : "none",
        zIndex: 20,
      }}
    >
      {selected && !editing && (
        <button onMouseDown={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ position: "absolute", top: -12, right: -12, width: 22, height: 22, borderRadius: "50%", background: "#f87171", border: "2px solid white", color: "white", fontSize: 13, cursor: "pointer", zIndex: 30, fontWeight: 700 }}>×</button>
      )}
      <div
        ref={editRef}
        contentEditable={editing}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onMouseDown={(e) => { if (editing) e.stopPropagation(); }}
        onTouchStart={(e) => { if (editing) e.stopPropagation(); }}
        style={{
          color: box.color || "#ffffff",
          fontSize: box.fontSize || 18,
          fontWeight: box.bold ? 700 : 400,
          textAlign: box.align || "left",
          padding: "4px 0",        // no horizontal padding — left edge = box.x exactly
          minHeight: 28,
          outline: "none",
          lineHeight: 1.4,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontFamily: "DM Sans, sans-serif",
          display: "block",        // block so textAlign works on full width
          width: "100%",
          ...style,
        }}
      >{box.text}</div>
      {selected && !editing && (
        <div style={{ position: "absolute", bottom: -16, left: 0, fontSize: 9, color: "#c084fc", whiteSpace: "nowrap", pointerEvents: "none" }}>
          double-tap to edit
        </div>
      )}
    </div>
  );
}

// ── Draggable + pinch-resize + crop image ───────────────────────
function CanvasImage({ img, onUpdate, onRemove, canvasRef, selected, onSelect, scale }) {
  const [mode, setMode] = useState("move");

  // Convert screen coords to canvas coords accounting for CSS scale
  const toCanvas = (screenX, screenY) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: screenX, y: screenY };
    return {
      x: (screenX - rect.left) / scale,
      y: (screenY - rect.top) / scale,
    };
  };

  const startDrag = (e) => {
    if (mode === "crop") { startCrop(e); return; }
    e.preventDefault(); e.stopPropagation(); onSelect();

    // Two finger pinch = resize
    if (e.touches && e.touches.length === 2) { startPinch(e); return; }

    const pt = e.touches ? e.touches[0] : e;
    const start = toCanvas(pt.clientX, pt.clientY);
    const origX = img.x, origY = img.y;

    const move = (ev) => {
      ev.preventDefault();
      // Switch to pinch if second finger added
      if (ev.touches && ev.touches.length === 2) return;
      const p = ev.touches ? ev.touches[0] : ev;
      const cur = toCanvas(p.clientX, p.clientY);
      const canvasW = canvasRef.current?.offsetWidth || 600;
      const canvasH = canvasRef.current?.offsetHeight || 900;
      onUpdate({
        x: Math.max(0, Math.min(origX + cur.x - start.x, canvasW - img.w)),
        y: Math.max(0, Math.min(origY + cur.y - start.y, canvasH - img.h)),
      });
    };
    const up = () => {
      window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };

  // Pinch-to-resize with two fingers
  const startPinch = (e) => {
    e.preventDefault();
    const t0 = e.touches[0], t1 = e.touches[1];
    const startDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY) / scale;
    const startW = img.w, startH = img.h;

    const move = (ev) => {
      if (ev.touches.length < 2) return;
      ev.preventDefault();
      const d = Math.hypot(ev.touches[1].clientX - ev.touches[0].clientX, ev.touches[1].clientY - ev.touches[0].clientY) / scale;
      const ratio = d / startDist;
      onUpdate({
        w: Math.max(50, Math.round(startW * ratio)),
        h: Math.max(50, Math.round(startH * ratio)),
      });
    };
    const up = () => {
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
  };

  const startCrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    const pt = e.touches ? e.touches[0] : e;
    const startX = pt.clientX, startY = pt.clientY;
    const sox = img.ox ?? 50, soy = img.oy ?? 50;
    const move = (ev) => {
      ev.preventDefault();
      const p = ev.touches ? ev.touches[0] : ev;
      onUpdate({
        ox: Math.max(0, Math.min(sox - (p.clientX - startX) * 0.3, 100)),
        oy: Math.max(0, Math.min(soy - (p.clientY - startY) * 0.3, 100)),
      });
    };
    const up = () => {
      window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };

  // Desktop resize from corner
  const startResize = (e) => {
    e.preventDefault(); e.stopPropagation();
    const pt = e.touches ? e.touches[0] : e;
    const start = toCanvas(pt.clientX, pt.clientY);
    const sw = img.w, sh = img.h;
    const canvasW = canvasRef.current?.offsetWidth || 600;
    const canvasH = canvasRef.current?.offsetHeight || 900;
    const move = (ev) => {
      ev.preventDefault();
      const p = ev.touches ? ev.touches[0] : ev;
      const cur = toCanvas(p.clientX, p.clientY);
      onUpdate({
        w: Math.max(50, Math.min(sw + cur.x - start.x, canvasW - img.x)),
        h: Math.max(50, Math.min(sh + cur.y - start.y, canvasH - img.y)),
      });
    };
    const up = () => {
      window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };

  return (
    <div
      onMouseDown={startDrag}
      onTouchStart={(e) => {
        if (e.touches.length === 2) { onSelect(); startPinch(e); }
        else startDrag(e);
      }}
      data-canvas-el="img"
      style={{
        position: "absolute", left: img.x, top: img.y, width: img.w, height: img.h,
        cursor: mode === "crop" ? "crosshair" : "move",
        outline: selected ? "2px solid #c084fc" : "2px solid transparent",
        userSelect: "none", touchAction: "none", overflow: "hidden", borderRadius: 4, zIndex: 15,
      }}
    >
      <img src={img.src} alt="" draggable={false}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${img.ox ?? 50}% ${img.oy ?? 50}%`, display: "block", pointerEvents: "none" }} />

      {selected && (
        <>
          {/* Delete — top left */}
          <button onMouseDown={(e) => { e.stopPropagation(); onRemove(); }}
            style={{ position: "absolute", top: 4, left: 4, width: 26, height: 26, borderRadius: "50%", background: "#f87171", border: "2px solid white", color: "white", fontSize: 14, cursor: "pointer", zIndex: 25, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>

          {/* Crop toggle — top right */}
          <button onMouseDown={(e) => { e.stopPropagation(); setMode(m => m === "move" ? "crop" : "move"); }}
            style={{ position: "absolute", top: 4, right: 4, width: 26, height: 26, borderRadius: "50%", background: mode === "crop" ? "#f472b6" : "#c084fc", border: "2px solid white", color: "white", fontSize: 11, cursor: "pointer", zIndex: 25, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {mode === "move" ? "✂" : "↔"}
          </button>

          {/* Resize handle — bottom right INSIDE the image */}
          <div onMouseDown={startResize} onTouchStart={startResize}
            style={{ position: "absolute", bottom: 4, right: 4, width: 22, height: 22, background: "#c084fc", borderRadius: 4, cursor: "nwse-resize", zIndex: 25, border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 10, color: "white", pointerEvents: "none" }}>⤡</span>
          </div>

          {/* Pinch hint on mobile */}
          <div style={{ position: "absolute", bottom: 4, left: 34, background: "rgba(0,0,0,0.6)", color: "white", fontSize: 8, padding: "2px 5px", borderRadius: 3, pointerEvents: "none", whiteSpace: "nowrap" }}>
            {mode === "crop" ? "drag to pan" : "pinch to resize"}
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

  // Compute CSS scale so canvas fits mobile screen
  const [canvasScale, setCanvasScale] = useState(1);
  useEffect(() => {
    const compute = () => {
      const available = Math.min(window.innerWidth - 28, sz.w);
      setCanvasScale(available / sz.w);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [sz.w]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // ── Persist canvas state so it survives navigation ──
  useEffect(() => {
    const saved = localStorage.getItem("ambaig_canvas_state");
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.textBoxes?.length) setTextBoxes(state.textBoxes);
        if (state.images?.length) setImages(state.images);
        if (state.bg) setBg(state.bg);
        if (state.bgOpacity) setBgOpacity(state.bgOpacity);
        if (state.canvasSize) setCanvasSize(state.canvasSize);
        if (state.showTemplate !== undefined) setShowTemplate(state.showTemplate);
        if (state.selected) setSelected(state.selected);
      } catch (e) {}
    }
  }, []);

  // Auto-save canvas state whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("ambaig_canvas_state", JSON.stringify({
        textBoxes, images, bg, bgOpacity, canvasSize, showTemplate, selected,
      }));
    } catch (e) {}
  }, [textBoxes, images, bg, bgOpacity, canvasSize, showTemplate, selected]);
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
              x: 16,
              y: Math.min(820, 500 + i * 90),
              color: "#ffffff",
              fontSize: 15,
              bold: false,
              align: "left",
              style: "shadow",
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
        // Place at 1/3 of canvas width, centered — always in canvas coordinate space
        const imgW = Math.round(sz.w * 0.5);
        const imgH = imgW;
        setImages(prev => [...prev, {
          id: Date.now(), src,
          x: Math.round((sz.w - imgW) / 2),
          y: Math.round((sz.h - imgH) / 4),
          w: imgW, h: imgH,
          ox: 50, oy: 50,
        }]);
      }
      e.target.value = "";
    };
    reader.onerror = () => { e.target.value = ""; };
    reader.readAsDataURL(file);
  };

  const addTextBox = (text = "Your text here", color = textColor, size = fontSize, bold = textBold) => {
    const id = Date.now();
    // Always use canvas coordinate space (sz.w/sz.h), never offsetWidth
    setTextBoxes(prev => [...prev, {
      id, text,
      x: 16,
      y: Math.max(30, Math.round(sz.h / 2) - 60),
      color, fontSize: size, bold,
      align: "left",
    }]);
    setActiveEl({ type: "text", id });
  };

  // ── Download PNG using native Canvas API (works on mobile) ──
  const downloadPNG = async () => {
    setSaving(true);

    // Flush any contentEditable text that hasn't been saved via blur yet
    const editables = canvasRef.current?.querySelectorAll("[contenteditable=true]");
    if (editables?.length) {
      editables.forEach(el => el.blur());
      await new Promise(r => setTimeout(r, 80));
    }

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
        if (!box.text?.trim()) continue;
        ctx.save();
        ctx.font = `${box.bold ? "700" : "400"} ${box.fontSize || 18}px sans-serif`;
        ctx.fillStyle = box.color || "#ffffff";
        const align = box.align || "left";
        const boxW = Math.min(568 - box.x, 568); // matches DOM width
        ctx.textAlign = align;
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = (box.style === "plain" || box.style === "pill") ? 0 : 8;

        // Pill background
        if (box.style === "pill") {
          const lines = box.text.split("\n");
          const lh = (box.fontSize || 18) * 1.4;
          const boxH = lines.length * lh + 12;
          ctx.fillStyle = "rgba(0,0,0,0.55)";
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.roundRect(box.x, box.y, boxW, boxH, 6);
          ctx.fill();
          ctx.fillStyle = box.color || "#ffffff";
        }

        const lines = box.text.split("\n");
        const lineH = (box.fontSize || 18) * 1.4;
        // x anchor: left=box.x, center=box.x+boxW/2, right=box.x+boxW
        const drawX = align === "left" ? box.x
          : align === "center" ? box.x + boxW / 2
          : box.x + boxW;

        lines.forEach((line, i) => {
          ctx.fillText(line, drawX, box.y + (box.fontSize || 18) + i * lineH, boxW);
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

            {/* If a text box is selected — show its controls */}
            {activeEl?.type === "text" && (() => {
              const box = textBoxes.find(b => b.id === activeEl.id);
              if (!box) return null;
              const update = (patch) => setTextBoxes(prev => prev.map(b => b.id === box.id ? { ...b, ...patch } : b));
              return (
                <div style={{ marginBottom: 12, padding: "10px 12px", background: "var(--accent-glow)", border: "1px solid var(--accent)", borderRadius: 10 }}>
                  <p style={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 700, marginBottom: 8 }}>✏️ Selected text</p>

                  {/* Color + Size */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <label className="field-label">Color</label>
                      <input type="color" value={box.color || "#ffffff"}
                        onChange={e => update({ color: e.target.value })}
                        style={{ width: "100%", height: 32, padding: 2, borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface2)", cursor: "pointer" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="field-label">Size</label>
                      <input type="number" value={box.fontSize || 22} min={10} max={80}
                        onChange={e => update({ fontSize: Number(e.target.value) })} />
                    </div>
                  </div>

                  {/* Alignment */}
                  <label className="field-label">Alignment</label>
                  <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                    {["left","center","right"].map(a => (
                      <button key={a} onClick={() => update({ align: a })} style={{
                        flex: 1, padding: "5px 0", borderRadius: 6, fontSize: "0.75rem",
                        border: box.align === a ? "1px solid var(--accent)" : "1px solid var(--border)",
                        background: box.align === a ? "var(--accent-glow)" : "transparent",
                        color: box.align === a ? "var(--accent)" : "var(--text-muted)",
                        cursor: "pointer",
                      }}>{a === "left" ? "⬅" : a === "center" ? "⬛" : "➡"}</button>
                    ))}
                  </div>

                  {/* Style */}
                  <label className="field-label">Style</label>
                  <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                    {Object.keys(TEXT_STYLES).map(s => (
                      <button key={s} onClick={() => update({ style: s })} style={{
                        flex: 1, padding: "4px 0", borderRadius: 6, fontSize: "0.65rem", fontWeight: 600,
                        border: (box.style || "shadow") === s ? "1px solid var(--accent)" : "1px solid var(--border)",
                        background: (box.style || "shadow") === s ? "var(--accent-glow)" : "transparent",
                        color: (box.style || "shadow") === s ? "var(--accent)" : "var(--text-muted)",
                        cursor: "pointer", textTransform: "capitalize",
                      }}>{s}</button>
                    ))}
                  </div>

                  {/* Bold */}
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <input type="checkbox" checked={!!box.bold} onChange={e => update({ bold: e.target.checked })} style={{ accentColor: "var(--accent)" }} /> Bold
                  </label>
                </div>
              );
            })()}

            {/* New text defaults */}
            <p style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginBottom: 8 }}>
              {activeEl?.type === "text" ? "Add another:" : "Add text to canvas:"}
            </p>
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 8 }}>
            Canvas — {sz.w}×{sz.h}px
            {activeEl && <span style={{ color: "var(--accent)", marginLeft: 8 }}>· tap canvas to deselect</span>}
          </p>
          <div style={{ width: "100%", overflowX: "hidden" }}
            onClick={(e) => { if (e.target === e.currentTarget) setActiveEl(null); }}>
            <div style={{
              transformOrigin: "top left",
              transform: `scale(${canvasScale})`,
              width: sz.w,
              height: sz.h * canvasScale, // collapse extra height after scaling
              marginBottom: sz.h * canvasScale - sz.h, // compensate
            }}>
              <div
                ref={canvasRef}
                onClick={(e) => {
                  const isElement = e.target.closest("[data-canvas-el]");
                  if (!isElement) setActiveEl(null);
                }}
                style={{ position: "relative", width: sz.w, height: sz.h, overflow: "hidden", borderRadius: 10, border: "1px solid var(--border)", background: "#fff" }}
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
                  scale={canvasScale}
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
            </div>{/* end canvasRef */}
            </div>{/* end scale div */}
          </div>{/* end outer wrapper */}
          <p style={{ marginTop: 6, fontSize: "0.68rem", color: "var(--text-dim)" }}>
            💡 Single tap to select & move · Double tap to edit text · Tap canvas to deselect
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
