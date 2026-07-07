import { useState, useReducer, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

// ── Constants ────────────────────────────────────────────────────
const TEXT_STYLES = {
  shadow:  { textShadow: "0 2px 8px rgba(0,0,0,0.9)", background: "transparent" },
  outline: { textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000", background: "transparent" },
  pill:    { textShadow: "none", background: "rgba(0,0,0,0.55)", borderRadius: 6, padding: "4px 12px" },
  plain:   { textShadow: "none", background: "transparent" },
};

const FONT_OPTIONS = {
  sans:       { label: "Sans",       family: "'DM Sans', sans-serif" },
  serif:      { label: "Serif",      family: "'Merriweather', serif" },
  script:     { label: "Script",     family: "'Pacifico', cursive" },
  display:    { label: "Display",    family: "'Bebas Neue', sans-serif" },
  playfair:   { label: "Playfair",   family: "'Playfair Display', serif" },
  montserrat: { label: "Montserrat", family: "'Montserrat', sans-serif" },
  lato:       { label: "Lato",       family: "'Lato', sans-serif" },
  dancing:    { label: "Dancing",    family: "'Dancing Script', cursive" },
  amiri:      { label: "امیری",      family: "'Amiri', serif" },
  scheherazade: { label: "شہرزاد",  family: "'Scheherazade New', serif" },
  noto_arabic:  { label: "نوٹو",     family: "'Noto Nastaliq Urdu', serif" },
  reem:       { label: "ریم",        family: "'Reem Kufi', sans-serif" },
};

const SIZES = {
  portrait:  { w: 600, h: 900, label: "Pinterest 2:3" },
  square:    { w: 600, h: 600, label: "Instagram 1:1" },
  landscape: { w: 800, h: 450, label: "Facebook 16:9" },
};

const STICKER_SETS = {
  "⭐ Stars":       ["⭐","🌟","✨","💫","🌙","☀️","🌈","❄️"],
  "❤️ Hearts":      ["❤️","🧡","💛","💚","💙","💜","🖤","🤍"],
  "🎉 Party":       ["🎉","🎊","🎈","🥳","🎁","🎀","🏆","🥇"],
  "📌 Markers":     ["📌","🔖","📍","🏷️","💡","🔥","⚡","❗"],
  "😊 Faces":       ["😊","😍","🥰","😎","🤩","😂","🙌","👏"],
  "🌸 Nature":      ["🌸","🌺","🌻","🌹","🍃","🌿","🦋","🌊"],
  "◆ Shapes":       ["⬛","🔴","🟡","🟢","🔵","🟣","🟠","⬜"],
  "➡️ Arrows":      ["➡️","⬅️","⬆️","⬇️","↗️","↘️","🔄","↩️"],
  "🕌 Islamic":     ["🕌","🕋","☪️","📿","🌙","⭐","🤲","📖"],
  "🎊 Eid":         ["🎊","🌙","⭐","🕌","🎁","🥰","✨","🤲"],
  "🇵🇰 Pakistan":  ["🇵🇰","🏏","🎵","🌹","🍛","🫖","🌴","💚"],
  "🌿 Cultural":    ["🌿","🌺","🪔","🎋","🏵️","🌾","🪷","🫶"],
  "🌙 Ramazan":     ["🌙","⭐","🕌","🪔","📿","🤲","🥮","🌟"],
  "🎆 New Year":    ["🎆","🎇","✨","🥂","🎉","🎊","🕛","🌟"],
  "🍕 Food":        ["🍕","🍔","🍜","🍣","🎂","🧁","☕","🍓"],
  "🫖 Pakistani Food": ["🫖","🍛","🥘","🫓","🍚","🌮","🥗","🍱"],
  "💼 Business":    ["💼","📊","💡","🎯","🚀","📈","🤝","⭐"],
  "💬 Quotes":      ["💬","💭","🗣️","✍️","📝","🖊️","📢","🔔"],
};

// ── Canvas state shape ───────────────────────────────────────────
const INIT_CANVAS = {
  canvasSize: "portrait",
  bg: null,
  bgOpacity: 1,
  layers: [],   // unified: { type:"image"|"text"|"sticker", id, ...props, visible, locked }
};

// ── Undo/redo reducer ────────────────────────────────────────────
const MAX_HISTORY = 20;

function historyReducer(state, action) {
  const { past, present, future } = state;

  switch (action.type) {
    case "SET": {
      // Full history commit — used for discrete actions (add layer, delete, etc.)
      const next = { ...present, ...action.payload };
      return { past: [...past.slice(-MAX_HISTORY), present], present: next, future: [] };
    }
    case "SILENT": {
      // Update present WITHOUT adding to history — used during drag/resize moves
      const next = { ...present, ...action.payload };
      return { past, present: next, future };
    }
    case "COMMIT": {
      // Commit current present to history (called on mouseup after drag)
      return { past: [...past.slice(-MAX_HISTORY), action.snapshot], present, future: [] };
    }
    case "UNDO": {
      if (!past.length) return state;
      const prev = past[past.length - 1];
      return { past: past.slice(0, -1), present: prev, future: [present, ...future] };
    }
    case "REDO": {
      if (!future.length) return state;
      const next = future[0];
      return { past: [...past, present], present: next, future: future.slice(1) };
    }
    case "RESET": {
      return { past: [], present: { ...INIT_CANVAS, ...action.payload }, future: [] };
    }
    default: return state;
  }
}

// ── Drag helper ──────────────────────────────────────────────────
function useDragLayer({ layer, onUpdate, onCommit, canvasRef, scale }) {
  const startDrag = (e) => {
    e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = scale || 1;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const offsetX = (cx - rect.left) / s - layer.x;
    const offsetY = (cy - rect.top) / s - layer.y;
    const canvasW = rect.width / s;
    const canvasH = rect.height / s;

    const move = (ev) => {
      ev.preventDefault();
      const mx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const my = ev.touches ? ev.touches[0].clientY : ev.clientY;
      onUpdate({
        x: Math.max(0, Math.min((mx - rect.left) / s - offsetX, canvasW - 20)),
        y: Math.max(0, Math.min((my - rect.top) / s - offsetY, canvasH - 20)),
      });
    };
    const up = () => {
      onCommit?.();
      window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };
  return startDrag;
}

// ── Rotate helper ────────────────────────────────────────────────
function useRotate({ layer, onUpdate, onCommit }) {
  const startRotate = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const cx = layer.x + (layer.w || layer.size || 60) / 2;
    const cy = layer.y + (layer.h || layer.size || 60) / 2;
    const startAngle = layer.rotation || 0;
    const pt = e.touches ? e.touches[0] : e;
    const startMouseAngle = Math.atan2(pt.clientY - cy, pt.clientX - cx) * (180 / Math.PI);

    const move = (ev) => {
      ev.preventDefault();
      const p = ev.touches ? ev.touches[0] : ev;
      const currentAngle = Math.atan2(p.clientY - cy, p.clientX - cx) * (180 / Math.PI);
      let rotation = startAngle + (currentAngle - startMouseAngle);
      // Snap to 15° increments when holding shift (or close to 0/90/180/270)
      if (ev.shiftKey) rotation = Math.round(rotation / 15) * 15;
      onUpdate({ rotation: rotation % 360 });
    };
    const up = () => {
      onCommit?.();
      window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };
  return startRotate;
}

function RotateHandle({ onMouseDown, onTouchStart }) {
  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      title="Drag to rotate (Shift = snap to 15°)"
      style={{
        position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)",
        width: 18, height: 18, background: "#f59e0b", borderRadius: "50%",
        cursor: "grab", zIndex: 30, border: "2px solid white",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9,
      }}
    >🔄</div>
  );
}

// ── Sticker layer ────────────────────────────────────────────────
function StickerLayer({ layer, onUpdate, onCommit, onRemove, onDuplicate, canvasRef, selected, onSelect, scale }) {
  const startDrag = useDragLayer({ layer, onUpdate, onCommit, canvasRef, scale });
  const startRotate = useRotate({ layer, onUpdate, onCommit });

  const startResize = (e) => {
    e.stopPropagation();
    const s = scale || 1;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const startSize = layer.size || 60;
    const move = (ev) => {
      ev.preventDefault();
      const mx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      onUpdate({ size: Math.max(24, startSize + (mx - cx) / s) });
    };
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };

  const rotation = layer.rotation || 0;

  return (
    <div
      onMouseDown={(e) => { onSelect(); startDrag(e); }}
      onTouchStart={(e) => { onSelect(); startDrag(e); }}
      data-canvas-el="sticker"
      style={{
        position: "absolute", left: layer.x, top: layer.y,
        width: layer.size || 60, height: layer.size || 60,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "move", userSelect: "none", touchAction: "none",
        outline: selected ? "2px dashed #c084fc" : "2px dashed transparent",
        borderRadius: 4, zIndex: 18,
        opacity: layer.visible === false ? 0 : 1,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
      }}
    >
      <span style={{ fontSize: (layer.size || 60) * 0.75, lineHeight: 1, pointerEvents: "none", filter: layer.shadow ? "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" : "none" }}>
        {layer.emoji}
      </span>
      {selected && (
        <>
          <button onMouseDown={(e) => { e.stopPropagation(); onRemove(); }}
            style={{ position: "absolute", top: -10, left: -10, width: 20, height: 20, borderRadius: "50%", background: "#f87171", border: "2px solid white", color: "white", fontSize: 11, cursor: "pointer", zIndex: 30, fontWeight: 700 }}>×</button>
          <button onMouseDown={(e) => { e.stopPropagation(); onDuplicate(); }}
            title="Duplicate" style={{ position: "absolute", top: -10, right: -10, width: 20, height: 20, borderRadius: "50%", background: "#a78bfa", border: "2px solid white", color: "white", fontSize: 10, cursor: "pointer", zIndex: 30, fontWeight: 700 }}>⧉</button>
          <RotateHandle onMouseDown={startRotate} onTouchStart={startRotate} />
          <div onMouseDown={startResize} onTouchStart={startResize}
            style={{ position: "absolute", bottom: -6, right: -6, width: 16, height: 16, background: "#c084fc", borderRadius: 3, cursor: "nwse-resize", zIndex: 30, border: "2px solid white" }} />
        </>
      )}
    </div>
  );
}

// ── Text layer ───────────────────────────────────────────────────
function TextLayer({ layer, onUpdate, onCommit, onRemove, onDuplicate, canvasRef, selected, onSelect, scale }) {
  const [editing, setEditing] = useState(false);
  const [toolbar, setToolbar] = useState(null); // { top, left } or null
  const editRef = useRef(null);
  const startDrag = useDragLayer({ layer, onUpdate, onCommit, canvasRef, scale });

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setEditing(true);
    setTimeout(() => {
      editRef.current?.focus();
      const el = editRef.current;
      if (el) { const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); window.getSelection()?.removeAllRanges(); window.getSelection()?.addRange(r); }
    }, 50);
  };

  // Show/hide formatting toolbar based on text selection
  const handleSelect = () => {
    if (!editing) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) { setToolbar(null); return; }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    const s = scale || 1;
    setToolbar({
      left: Math.max(0, (rect.left - canvasRect.left) / s),
      top: Math.max(0, (rect.top - canvasRect.top) / s - 44),
    });
  };

  const applyFormat = (command, value) => {
    editRef.current?.focus();
    document.execCommand(command, false, value || null);
    // Save innerHTML after formatting
    setTimeout(() => {
      if (editRef.current) onUpdate({ html: editRef.current.innerHTML, text: editRef.current.innerText });
    }, 10);
  };

  const handleBlur = (e) => {
    // Delay so toolbar button clicks register before blur hides them
    setTimeout(() => {
      setEditing(false);
      setToolbar(null);
      if (editRef.current) onUpdate({ html: editRef.current.innerHTML, text: editRef.current.innerText });
    }, 150);
  };

  useEffect(() => { if (!selected) { setEditing(false); setToolbar(null); } }, [selected]);

  const style = TEXT_STYLES[layer.style || "shadow"];
  const fontFamily = FONT_OPTIONS[layer.font || "sans"].family;
  const startRotate = useRotate({ layer, onUpdate, onCommit });
  const rotation = layer.rotation || 0;

  // Sync innerHTML when layer.html changes externally (e.g. on mount from saved state)
  useEffect(() => {
    if (!editing && editRef.current && layer.html && editRef.current.innerHTML !== layer.html) {
      editRef.current.innerHTML = layer.html;
    }
  }, [layer.html, editing]);

  return (
    <div
      onMouseDown={(e) => { if (!editing) { onSelect(); startDrag(e); } }}
      onTouchStart={(e) => { if (!editing) { onSelect(); startDrag(e); } }}
      onDoubleClick={handleDoubleClick}
      data-canvas-el="text" data-textbox-id={layer.id}
      style={{
        position: "absolute", left: layer.x, top: layer.y,
        display: "inline-block",
        maxWidth: Math.max(80, 600 - layer.x - 16),
        cursor: editing ? "text" : "move",
        outline: selected ? (editing ? "2px solid #f472b6" : "2px dashed #c084fc") : "2px dashed transparent",
        borderRadius: 4, userSelect: editing ? "text" : "none", touchAction: editing ? "auto" : "none",
        zIndex: 20, opacity: layer.visible === false ? 0 : 1,
        transform: `rotate(${rotation}deg)`, transformOrigin: "center center",
      }}
    >
      {/* Floating format toolbar — appears when text is selected */}
      {editing && toolbar && (
        <div onMouseDown={(e) => e.preventDefault()} style={{
          position: "absolute", left: toolbar.left, top: toolbar.top,
          display: "flex", gap: 3, alignItems: "center",
          background: "#1a1a24", border: "1px solid var(--accent)", borderRadius: 8,
          padding: "4px 6px", zIndex: 50, boxShadow: "0 4px 16px rgba(0,0,0,0.7)",
          whiteSpace: "nowrap",
        }}>
          <button onMouseDown={() => applyFormat("bold")} title="Bold"
            style={{ background: "none", border: "none", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", padding: "2px 5px", borderRadius: 4 }}>B</button>
          <button onMouseDown={() => applyFormat("italic")} title="Italic"
            style={{ background: "none", border: "none", color: "white", fontStyle: "italic", fontSize: 13, cursor: "pointer", padding: "2px 5px", borderRadius: 4 }}>I</button>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.2)" }} />
          {["#ffffff","#f87171","#fb923c","#facc15","#4ade80","#60a5fa","#c084fc","#f472b6","#000000"].map(c => (
            <button key={c} onMouseDown={() => applyFormat("foreColor", c)} title={c}
              style={{ width: 16, height: 16, borderRadius: "50%", background: c, border: "2px solid rgba(255,255,255,0.3)", cursor: "pointer", padding: 0, flexShrink: 0 }} />
          ))}
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.2)" }} />
          <button onMouseDown={() => applyFormat("removeFormat")} title="Clear formatting"
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 11, cursor: "pointer", padding: "2px 4px" }}>✕</button>
        </div>
      )}

      {selected && !editing && (
        <>
          <button onMouseDown={(e) => { e.stopPropagation(); onRemove(); }}
            style={{ position: "absolute", top: 2, left: 2, width: 20, height: 20, borderRadius: "50%", background: "#f87171", border: "2px solid white", color: "white", fontSize: 11, cursor: "pointer", zIndex: 30, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          <button onMouseDown={(e) => { e.stopPropagation(); onDuplicate(); }}
            title="Duplicate" style={{ position: "absolute", top: 2, right: 2, width: 20, height: 20, borderRadius: "50%", background: "#a78bfa", border: "2px solid white", color: "white", fontSize: 10, cursor: "pointer", zIndex: 30, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>⧉</button>
          <RotateHandle onMouseDown={startRotate} onTouchStart={startRotate} />
          <div style={{ position: "absolute", bottom: -14, left: 0, fontSize: 9, color: "#c084fc", whiteSpace: "nowrap", pointerEvents: "none" }}>double-tap to edit · select text to style</div>
        </>
      )}
      <div ref={editRef} data-text-content contentEditable={editing} suppressContentEditableWarning
        onBlur={handleBlur}
        onSelect={handleSelect}
        onKeyUp={handleSelect}
        onMouseUp={handleSelect}
        onKeyDown={(e) => {
          if (editing) e.stopPropagation();
          if (e.key === "Enter") {
            e.preventDefault();
            document.execCommand("insertLineBreak", false, null);
          }
          // Hide toolbar on Escape
          if (e.key === "Escape") setToolbar(null);
        }}
        onMouseDown={(e) => { if (editing) e.stopPropagation(); }}
        onTouchStart={(e) => { if (editing) e.stopPropagation(); }}
        style={{ color: layer.color || "#fff", fontSize: layer.fontSize || 18, fontWeight: layer.bold ? 700 : 400, textAlign: layer.align || "left", padding: "4px 4px 4px 26px", minHeight: 28, outline: "none", lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "break-word", fontFamily, display: "inline-block", boxSizing: "border-box", ...style }}
        dangerouslySetInnerHTML={!editing && layer.html ? { __html: layer.html } : undefined}
      >
        {(!layer.html || editing) ? layer.text : undefined}
      </div>
    </div>
  );
}

// ── Image layer ──────────────────────────────────────────────────
function ImageLayer({ layer, onUpdate, onCommit, onRemove, onDuplicate, canvasRef, selected, onSelect, scale }) {
  const [mode, setMode] = useState("move");
  const toCanvas = (sx, sy) => { const r = canvasRef.current?.getBoundingClientRect(); if (!r) return { x: sx, y: sy }; return { x: (sx - r.left) / scale, y: (sy - r.top) / scale }; };

  const startDrag = (e) => {
    if (mode === "crop") { startCrop(e); return; }
    e.preventDefault(); e.stopPropagation(); onSelect();
    if (e.touches?.length === 2) { startPinch(e); return; }
    const r = canvasRef.current?.getBoundingClientRect(); if (!r) return;
    const s = scale || 1;
    const pt = e.touches ? e.touches[0] : e;
    const ox = (pt.clientX - r.left) / s - layer.x, oy = (pt.clientY - r.top) / s - layer.y;
    const cw = r.width / s, ch = r.height / s;
    const move = (ev) => {
      ev.preventDefault();
      const p = ev.touches ? ev.touches[0] : ev;
      onUpdate({ x: Math.max(0, Math.min((p.clientX - r.left) / s - ox, cw - layer.w)), y: Math.max(0, Math.min((p.clientY - r.top) / s - oy, ch - layer.h)) });
    };
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };

  const startPinch = (e) => {
    e.preventDefault();
    const d0 = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY) / scale;
    const sw = layer.w, sh = layer.h;
    const move = (ev) => { if (ev.touches.length < 2) return; ev.preventDefault(); const d = Math.hypot(ev.touches[1].clientX - ev.touches[0].clientX, ev.touches[1].clientY - ev.touches[0].clientY) / scale; const ratio = d / d0; onUpdate({ w: Math.max(50, Math.round(sw * ratio)), h: Math.max(50, Math.round(sh * ratio)) }); };
    const up = () => { onCommit?.(); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up); };
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };

  const startCrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    const pt = e.touches ? e.touches[0] : e;
    const sx = pt.clientX, sy = pt.clientY, sox = layer.ox ?? 50, soy = layer.oy ?? 50;
    const move = (ev) => { ev.preventDefault(); const p = ev.touches ? ev.touches[0] : ev; onUpdate({ ox: Math.max(0, Math.min(sox - (p.clientX - sx) * 0.3, 100)), oy: Math.max(0, Math.min(soy - (p.clientY - sy) * 0.3, 100)) }); };
    const up = () => { onCommit?.(); window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };

  const startResize = (e) => {
    e.preventDefault(); e.stopPropagation();
    const start = toCanvas(e.touches ? e.touches[0].clientX : e.clientX, e.touches ? e.touches[0].clientY : e.clientY);
    const sw = layer.w, sh = layer.h, cw = canvasRef.current?.offsetWidth || 600, ch = canvasRef.current?.offsetHeight || 900;
    const move = (ev) => { ev.preventDefault(); const p = ev.touches ? ev.touches[0] : ev; const cur = toCanvas(p.clientX, p.clientY); onUpdate({ w: Math.max(50, Math.min(sw + cur.x - start.x, cw - layer.x)), h: Math.max(50, Math.min(sh + cur.y - start.y, ch - layer.y)) }); };
    const up = () => { onCommit?.(); window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };

  const startRotate = useRotate({ layer, onUpdate, onCommit });
  const rotation = layer.rotation || 0;

  return (
    <div onMouseDown={startDrag} onTouchStart={(e) => { if (e.touches.length === 2) { onSelect(); startPinch(e); } else startDrag(e); }} data-canvas-el="img"
      style={{ position: "absolute", left: layer.x, top: layer.y, width: layer.w, height: layer.h, cursor: mode === "crop" ? "crosshair" : "move", outline: selected ? "2px solid #c084fc" : "2px solid transparent", userSelect: "none", touchAction: "none", borderRadius: 4, zIndex: 15, opacity: layer.visible === false ? 0 : 1, transform: `rotate(${rotation}deg)`, transformOrigin: "center center" }}
    >
      {/* Inner wrapper clips the image only — outer div stays unclipped so handles can extend beyond bounds */}
      <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: 4 }}>
        <img src={layer.src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${layer.ox ?? 50}% ${layer.oy ?? 50}%`, display: "block", pointerEvents: "none" }} />
      </div>
      {selected && (
        <>
          <button onMouseDown={(e) => { e.stopPropagation(); onRemove(); }} style={{ position: "absolute", top: 4, left: 4, width: 26, height: 26, borderRadius: "50%", background: "#f87171", border: "2px solid white", color: "white", fontSize: 14, cursor: "pointer", zIndex: 25, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          <button onMouseDown={(e) => { e.stopPropagation(); onDuplicate(); }} title="Duplicate" style={{ position: "absolute", top: 4, left: 34, width: 26, height: 26, borderRadius: "50%", background: "#a78bfa", border: "2px solid white", color: "white", fontSize: 11, cursor: "pointer", zIndex: 25, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>⧉</button>
          <button onMouseDown={(e) => { e.stopPropagation(); setMode(m => m === "move" ? "crop" : "move"); }} style={{ position: "absolute", top: 4, right: 4, width: 26, height: 26, borderRadius: "50%", background: mode === "crop" ? "#f472b6" : "#c084fc", border: "2px solid white", color: "white", fontSize: 11, cursor: "pointer", zIndex: 25, display: "flex", alignItems: "center", justifyContent: "center" }}>{mode === "move" ? "✂" : "↔"}</button>
          <RotateHandle onMouseDown={startRotate} onTouchStart={startRotate} />
          <div onMouseDown={startResize} onTouchStart={startResize} style={{ position: "absolute", bottom: 4, right: 4, width: 22, height: 22, background: "#c084fc", borderRadius: 4, cursor: "nwse-resize", zIndex: 25, border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 10, color: "white", pointerEvents: "none" }}>⤡</span></div>
          <div style={{ position: "absolute", bottom: 4, left: 34, background: "rgba(0,0,0,0.6)", color: "white", fontSize: 8, padding: "2px 5px", borderRadius: 3, pointerEvents: "none", whiteSpace: "nowrap" }}>{mode === "crop" ? "drag to pan" : "pinch/⤡ to resize"}</div>
        </>
      )}
    </div>
  );
}

// ── Background photo ─────────────────────────────────────────────
function BgImage({ src, ox, oy, opacity, onPan }) {
  const startPan = (e) => {
    e.preventDefault(); e.stopPropagation();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const sox = ox, soy = oy;
    const move = (ev) => { ev.preventDefault(); const mx = ev.touches ? ev.touches[0].clientX : ev.clientX; const my = ev.touches ? ev.touches[0].clientY : ev.clientY; onPan(Math.max(0, Math.min(sox - (mx - cx) * 0.2, 100)), Math.max(0, Math.min(soy - (my - cy) * 0.2, 100))); };
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  };
  if (!src) return null;
  return (
    <div onMouseDown={startPan} onTouchStart={startPan} style={{ position: "absolute", inset: 0, zIndex: 1, cursor: "grab", overflow: "hidden", opacity: opacity ?? 1 }}>
      <img src={src} alt="bg" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${ox ?? 50}% ${oy ?? 50}%`, display: "block", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,0,0,0.5)", color: "white", fontSize: 9, padding: "2px 6px", borderRadius: 3, pointerEvents: "none" }}>drag to pan</div>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast" style={{ zIndex: 999 }}>{msg}</div>;
}

// ────────────────────────────────────────────────────────────────
// ── Main component ───────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();

  // ── Canvas state with undo/redo ──
  const [{ past, present, future }, dispatch] = useReducer(historyReducer, {
    past: [], present: { ...INIT_CANVAS }, future: [],
  });
  const { canvasSize, bg, bgOpacity, layers } = present;
  const sz = SIZES[canvasSize];

  const set    = (payload) => dispatch({ type: "SET", payload });
  const silent = (payload) => dispatch({ type: "SILENT", payload });
  const commit = (snapshot) => dispatch({ type: "COMMIT", snapshot });
  const undo   = () => dispatch({ type: "UNDO" });
  const redo   = () => dispatch({ type: "REDO" });

  // ── UI-only state (not undoable) ──
  const [bgTab, setBgTab]           = useState("photo");
  const [activeEl, setActiveEl]     = useState(null);
  const [textColor, setTextColor]   = useState("#ffffff");
  const [fontSize, setFontSize]     = useState(22);
  const [textBold, setTextBold]     = useState(false);
  const [textAlign, setTextAlign]   = useState("left");
  const [textStyle, setTextStyle]   = useState("shadow");
  const [textFont, setTextFont]     = useState("sans");
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState("");
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [activeStickerSet, setActiveStickerSet] = useState("⭐ Stars");

  const canvasRef    = useRef(null);
  const imgFileRef   = useRef(null);
  const bgFileRef    = useRef(null);
  const canvasWrapRef = useRef(null);

  // ── Canvas scale ──
  const [canvasScale, setCanvasScale] = useState(1);
  useEffect(() => {
    const compute = () => {
      const w = canvasWrapRef.current?.offsetWidth;
      const available = w ? w - 4 : window.innerWidth - 20;
      setCanvasScale(Math.min(1, available / sz.w));
    };
    compute();
    const t = setTimeout(compute, 100);
    window.addEventListener("resize", compute);
    return () => { window.removeEventListener("resize", compute); clearTimeout(t); };
  }, [sz.w]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const onKey = (e) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if (meta && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Persist canvas state ──
  useEffect(() => {
    const saved = localStorage.getItem("ambaig_canvas_state");
    if (saved) {
      try {
        const state = JSON.parse(saved);
        dispatch({ type: "RESET", payload: { canvasSize: state.canvasSize || "portrait", bg: state.bg || null, bgOpacity: state.bgOpacity ?? 1, layers: state.layers || [] } });
      } catch (e) {}
    } else {
      try { const prefs = JSON.parse(localStorage.getItem("ambaig_prefs") || "{}"); if (prefs.defaultSize) set({ canvasSize: prefs.defaultSize }); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem("ambaig_canvas_state", JSON.stringify({ canvasSize, bg, bgOpacity, layers })); } catch (e) {}
  }, [present]); // watch present so SILENT (drag) updates also save

  // ── Load pending captions from captions page ──
  // Use refs for everything to avoid ANY stale closure issues
  const layersRef = useRef(layers);
  const dispatchRef = useRef(dispatch);
  const showToastRef = useRef(showToast);
  useEffect(() => { layersRef.current = layers; }, [layers]);
  useEffect(() => { dispatchRef.current = dispatch; }, [dispatch]);
  useEffect(() => { showToastRef.current = showToast; }, [showToast]);

  // Fire when navigating back from Captions with ?addCaption= param
  useEffect(() => {
    if (!router.query.addCaption) return;
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem("ambaig_pending_text");
        if (!raw) return;
        const pending = JSON.parse(raw);
        if (!pending?.length) return;

        // Read canvas size FRESH from localStorage — sz from closure would be stale
        const savedState = JSON.parse(localStorage.getItem("ambaig_canvas_state") || "{}");
        const currentSize = savedState.canvasSize || "portrait";
        const SIZES_LOCAL = { portrait: { w: 600, h: 900 }, square: { w: 600, h: 600 }, landscape: { w: 800, h: 450 } };
        const currentSz = SIZES_LOCAL[currentSize] || SIZES_LOCAL.portrait;

        const newLayers = pending.map((p, i) => ({
          id: Date.now() + i, type: "text", text: p.text,
          x: 16, y: Math.min(currentSz.h - 60, Math.round(currentSz.h * 0.6) + i * 60),
          color: p.color || "#ffffff",
          fontSize: p.fontSize ? Number(p.fontSize) : 22,
          bold: false, align: "left", style: "shadow", font: "sans",
          visible: true, locked: false,
        }));
        dispatchRef.current({
          type: "SET",
          payload: { layers: [...layersRef.current, ...newLayers] }
        });
        localStorage.removeItem("ambaig_pending_text");
        showToastRef.current("✅ Caption added to canvas — drag to reposition");
      } catch (e) { console.error("pending text error:", e); }
    }, 200);
    return () => clearTimeout(timer);
  }, [router.query.addCaption]);

  // ── Layer helpers ──
  // Discrete update — commits to undo history (add, delete, style change, etc.)
  const updateLayer = (id, patch) => set({ layers: layers.map(l => l.id === id ? { ...l, ...patch } : l) });
  // Silent update — used during drag/resize moves (no history spam)
  const silentUpdateLayer = (id, patch) => silent({ layers: layers.map(l => l.id === id ? { ...l, ...patch } : l) });
  // Commit snapshot — called on mouseup after a drag to add one history entry
  const commitLayer = () => commit(present);
  const removeLayer = (id) => { set({ layers: layers.filter(l => l.id !== id) }); if (activeEl?.id === id) setActiveEl(null); };
  const duplicateLayer = (id) => {
    const original = layers.find(l => l.id === id);
    if (!original) return;
    const newId = Date.now();
    const dupe = { ...original, id: newId, x: (original.x || 0) + 20, y: (original.y || 0) + 20 };
    const idx = layers.findIndex(l => l.id === id);
    const newLayers = [...layers];
    newLayers.splice(idx + 1, 0, dupe);
    set({ layers: newLayers });
    setActiveEl({ type: dupe.type, id: newId });
  };
  const moveLayerUp = (id) => { const i = layers.findIndex(l => l.id === id); if (i < layers.length - 1) { const arr = [...layers]; [arr[i], arr[i+1]] = [arr[i+1], arr[i]]; set({ layers: arr }); } };
  const moveLayerDown = (id) => { const i = layers.findIndex(l => l.id === id); if (i > 0) { const arr = [...layers]; [arr[i], arr[i-1]] = [arr[i-1], arr[i]]; set({ layers: arr }); } };

  // ── Add layers ──
  const addTextBox = (text = "Your text here", color = textColor, size = fontSize, bold = textBold, align = textAlign, style = textStyle, font = textFont) => {
    const id = Date.now();
    const layer = { id, type: "text", text, x: 16, y: Math.max(30, Math.round(sz.h / 2) - 60), color, fontSize: size, bold, align, style, font, visible: true, locked: false };
    set({ layers: [...layers, layer] });
    setActiveEl({ type: "text", id });
  };

  const addSticker = (emoji) => {
    const id = Date.now();
    const layer = { id, type: "sticker", emoji, x: Math.round(sz.w / 2 - 30), y: Math.round(sz.h / 2 - 30), size: 60, shadow: true, visible: true, locked: false };
    set({ layers: [...layers, layer] });
    setActiveEl({ type: "sticker", id });
  };

  const addBg = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target.result) { set({ bg: { type: "photo", src: ev.target.result, ox: 50, oy: 50 } }); setBgTab("photo"); }
      else showToast("⚠️ Could not load image.");
      e.target.value = "";
    };
    reader.onerror = () => { e.target.value = ""; };
    reader.readAsDataURL(file);
  };

  const addImageLayer = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target.result) {
        const id = Date.now();
        const w = Math.round(sz.w * 0.5), h = w;
        set({ layers: [...layers, { id, type: "image", src: ev.target.result, x: Math.round((sz.w - w) / 2), y: Math.round((sz.h - h) / 4), w, h, ox: 50, oy: 50, visible: true, locked: false }] });
      }
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  // ── Flush text edits ──
  const flushTextEdits = useCallback(() => {
    const flushed = layers.map(l => {
      if (l.type !== "text") return l;
      const domEl = canvasRef.current?.querySelector(`[data-textbox-id="${l.id}"] [data-text-content]`);
      if (!domEl) return l;
      const liveText = domEl.innerText;
      const liveHtml = domEl.innerHTML;
      return (liveText !== l.text || liveHtml !== l.html)
        ? { ...l, text: liveText, html: liveHtml }
        : l;
    });
    setActiveEl(null);
    set({ layers: flushed });
    return flushed;
  }, [layers]);

  // ── Navigation ──
  const goToCaptions = () => {
    const flushed = flushTextEdits();
    const firstText = flushed.find(l => l.type === "text")?.text || "";
    const secondText = flushed.filter(l => l.type === "text")[1]?.text || "";
    // Explicitly save latest state before navigating so captions preview is accurate
    try {
      localStorage.setItem("ambaig_canvas_state", JSON.stringify({ canvasSize, bg, bgOpacity, layers: flushed }));
    } catch (e) {}
    setTimeout(() => router.push({ pathname: "/captions", query: { title: firstText, description: secondText } }), 80);
  };

  const goToPost = () => {
    flushTextEdits();
    setTimeout(() => router.push("/post"), 50);
  };

  // ── Download PNG ──
  const downloadPNG = async () => {
    setSaving(true);
    const liveTextLayers = flushTextEdits();
    await new Promise(r => setTimeout(r, 150));
    try { if (document.fonts?.ready) await document.fonts.ready; } catch (e) {}

    try {
      const canvas = document.createElement("canvas");
      canvas.width = sz.w * 2; canvas.height = sz.h * 2;
      const ctx = canvas.getContext("2d");
      ctx.scale(2, 2);

      // White base
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, sz.w, sz.h);

      // Background
      if (bg?.type === "photo" && bg.src) {
        await new Promise(res => { const img = new window.Image(); img.onload = () => { ctx.save(); ctx.globalAlpha = bgOpacity ?? 1; const sc = Math.max(sz.w / img.width, sz.h / img.height); const dw = img.width * sc, dh = img.height * sc; ctx.drawImage(img, (sz.w - dw) * (bg.ox / 100), (sz.h - dh) * (bg.oy / 100), dw, dh); ctx.globalAlpha = 1; ctx.restore(); res(); }; img.onerror = res; img.src = bg.src; });
      } else if (bg?.type === "color") {
        ctx.fillStyle = bg.color; ctx.fillRect(0, 0, sz.w, sz.h);
      } else if (bg?.type === "gradient") {
        const ar = ((bg.angle - 90) * Math.PI) / 180, cx = sz.w / 2, cy = sz.h / 2, len = Math.sqrt(sz.w * sz.w + sz.h * sz.h) / 2;
        const g = ctx.createLinearGradient(cx - Math.cos(ar) * len, cy - Math.sin(ar) * len, cx + Math.cos(ar) * len, cy + Math.sin(ar) * len);
        g.addColorStop(0, bg.from); g.addColorStop(1, bg.to); ctx.fillStyle = g; ctx.fillRect(0, 0, sz.w, sz.h);
      }

      // Helper: apply rotation transform around layer center
      const withRotation = (layer, w, h, fn) => {
        const rot = (layer.rotation || 0) * Math.PI / 180;
        if (rot === 0) { fn(); return; }
        const cx = layer.x + w / 2, cy = layer.y + h / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.translate(-cx, -cy);
        fn();
        ctx.restore();
      };

      // Draw layers in order
      for (const layer of liveTextLayers) {
        if (layer.visible === false) continue;

        if (layer.type === "image") {
          await new Promise(res => {
            const img = new window.Image();
            img.onload = () => {
              withRotation(layer, layer.w, layer.h, () => {
                ctx.save();
                ctx.beginPath(); ctx.rect(layer.x, layer.y, layer.w, layer.h); ctx.clip();
                const sc = Math.max(layer.w / img.width, layer.h / img.height);
                const dw = img.width * sc, dh = img.height * sc;
                ctx.drawImage(img, layer.x + (layer.w - dw) * ((layer.ox ?? 50) / 100), layer.y + (layer.h - dh) * ((layer.oy ?? 50) / 100), dw, dh);
                ctx.restore();
              });
              res();
            };
            img.onerror = res; img.src = layer.src;
          });
        }

        if (layer.type === "sticker") {
          withRotation(layer, layer.size || 60, layer.size || 60, () => {
            ctx.save();
            // Use a larger font for better emoji rendering
            const emojiSize = Math.round((layer.size || 60) * 0.75);
            ctx.font = `${emojiSize}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            if (layer.shadow) { ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 6; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1; }
            ctx.fillStyle = "black"; // required for some browsers to render color emoji
            ctx.fillText(layer.emoji, layer.x + (layer.size || 60) / 2, layer.y + (layer.size || 60) / 2);
            ctx.restore();
          });
        }

        if (layer.type === "text" && layer.text?.trim()) {
          const boxW = Math.max(80, 600 - layer.x - 16);
          const estimatedH = (layer.fontSize || 18) * 1.5 * (layer.text.split("\n").length + 2);
          withRotation(layer, boxW, estimatedH, () => {
            ctx.save();
            const fontFamily = FONT_OPTIONS[layer.font || "sans"].family.replace(/'/g, "");
            const baseFontSize = layer.fontSize || 18;
            const padLeft = 26, wrapW = boxW - padLeft - 4;
            const baseX = (layer.align === "left") ? layer.x + padLeft : (layer.align === "center") ? layer.x + padLeft + wrapW / 2 : layer.x + padLeft + wrapW;

            ctx.shadowColor = "rgba(0,0,0,0.8)";
            ctx.shadowBlur = (layer.style === "plain" || layer.style === "pill") ? 0 : 8;
            ctx.textAlign = layer.align || "left";

            if (layer.style === "pill") {
              const lh = baseFontSize * 1.4;
              const lines = layer.text.split("\n").length;
              ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 0;
              ctx.beginPath(); ctx.roundRect(layer.x, layer.y, boxW, lines * lh + 12, 6); ctx.fill();
              ctx.shadowBlur = 0;
            }

            // Parse HTML into styled text runs
            const parseHtmlRuns = (html) => {
              if (!html) return [{ text: layer.text, bold: layer.bold, color: layer.color || "#fff" }];
              const div = document.createElement("div");
              div.innerHTML = html;
              const runs = [];
              const walk = (node, bold, color) => {
                if (node.nodeType === 3) { // text node
                  if (node.textContent) runs.push({ text: node.textContent, bold, color });
                } else if (node.nodeType === 1) {
                  let b = bold || node.tagName === "B" || node.tagName === "STRONG" || node.style?.fontWeight === "bold" || node.style?.fontWeight === "700";
                  let c = node.style?.color || color;
                  if (node.tagName === "BR") { runs.push({ text: "\n", bold, color }); return; }
                  node.childNodes.forEach(child => walk(child, b, c));
                }
              };
              div.childNodes.forEach(n => walk(n, layer.bold || false, layer.color || "#fff"));
              return runs.length > 0 ? runs : [{ text: layer.text, bold: layer.bold, color: layer.color || "#fff" }];
            };

            const runs = parseHtmlRuns(layer.html);

            // Rebuild runs into wrapped lines, preserving per-run styling
            const buildLines = () => {
              const lines = [[]]; // array of arrays of {text, bold, color}
              let currentLine = lines[0];
              for (const run of runs) {
                const parts = run.text.split("\n");
                parts.forEach((part, pi) => {
                  if (pi > 0) { const newLine = []; lines.push(newLine); currentLine = newLine; }
                  if (!part) return;
                  // Word-wrap within this run
                  const words = part.split(" ");
                  words.forEach((word, wi) => {
                    const testWord = wi === 0 ? word : " " + word;
                    currentLine.push({ text: testWord, bold: run.bold, color: run.color });
                  });
                });
              }
              return lines;
            };

            const lines = buildLines();
            lines.forEach((lineRuns, lineIdx) => {
              let curX = baseX;
              const y = layer.y + baseFontSize + lineIdx * baseFontSize * 1.5;
              if (layer.align !== "left") {
                // Measure total line width to position center/right
                let totalW = 0;
                lineRuns.forEach(r => {
                  const f = `${r.bold ? "700" : "400"} ${baseFontSize}px ${fontFamily}`;
                  ctx.font = f;
                  totalW += ctx.measureText(r.text).width;
                });
                curX = layer.align === "center" ? baseX - totalW / 2 : baseX - totalW;
              }
              lineRuns.forEach(r => {
                const f = `${r.bold ? "700" : "400"} ${baseFontSize}px ${fontFamily}`;
                ctx.font = f;
                ctx.fillStyle = r.color || "#fff";
                ctx.textAlign = "left"; // always left for run-by-run drawing
                ctx.fillText(r.text, curX, y);
                curX += ctx.measureText(r.text).width;
              });
            });

            ctx.restore();
          });
        }
      }

      const dataUrl = canvas.toDataURL("image/png");
      try { localStorage.setItem("ambaig_last_image", canvas.toDataURL("image/jpeg", 0.85)); } catch (e) {}
      const link = document.createElement("a");
      link.download = `ambaigdesigns-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      showToast("✅ Image saved! Check Downloads.");
    } catch (err) {
      console.error(err);
      showToast("⚠️ Export failed. Try Chrome.");
    }
    setSaving(false);
  };

  // ── Save to gallery ──
  const saveToGallery = async () => {
    const flushed = flushTextEdits();
    await new Promise(r => setTimeout(r, 150));
    try { if (document.fonts?.ready) await document.fonts.ready; } catch (e) {}

    try {
      // ── Render thumbnail ──────────────────────────────────────────
      const thumbW = 200; // smaller = less storage
      const thumbH = Math.round(thumbW * (sz.h / sz.w));
      const c = document.createElement("canvas");
      c.width = thumbW; c.height = thumbH;
      const ctx = c.getContext("2d");
      ctx.scale(thumbW / sz.w, thumbH / sz.h);

      ctx.fillStyle = "#1a1a24"; ctx.fillRect(0, 0, sz.w, sz.h);

      if (bg?.type === "photo" && bg.src) {
        await new Promise(res => {
          const img = new window.Image();
          img.onload = () => {
            const sc = Math.max(sz.w / img.width, sz.h / img.height);
            const dw = img.width * sc, dh = img.height * sc;
            ctx.drawImage(img, (sz.w - dw) * ((bg.ox || 50) / 100), (sz.h - dh) * ((bg.oy || 50) / 100), dw, dh);
            res();
          };
          img.onerror = res; img.src = bg.src;
        });
      } else if (bg?.type === "color") {
        ctx.fillStyle = bg.color; ctx.fillRect(0, 0, sz.w, sz.h);
      } else if (bg?.type === "gradient") {
        const ar = ((bg.angle - 90) * Math.PI) / 180;
        const cx2 = sz.w / 2, cy2 = sz.h / 2, len = Math.sqrt(sz.w * sz.w + sz.h * sz.h) / 2;
        const g = ctx.createLinearGradient(cx2 - Math.cos(ar) * len, cy2 - Math.sin(ar) * len, cx2 + Math.cos(ar) * len, cy2 + Math.sin(ar) * len);
        g.addColorStop(0, bg.from); g.addColorStop(1, bg.to);
        ctx.fillStyle = g; ctx.fillRect(0, 0, sz.w, sz.h);
      }

      for (const layer of flushed) {
        if (layer.visible === false) continue;
        if (layer.type === "image" && layer.src) {
          await new Promise(res => {
            const img = new window.Image();
            img.onload = () => {
              ctx.save();
              if (layer.rotation) { const lcx = layer.x + layer.w/2, lcy = layer.y + layer.h/2; ctx.translate(lcx, lcy); ctx.rotate(layer.rotation * Math.PI / 180); ctx.translate(-lcx, -lcy); }
              ctx.beginPath(); ctx.rect(layer.x, layer.y, layer.w, layer.h); ctx.clip();
              const sc = Math.max(layer.w / img.width, layer.h / img.height), dw = img.width * sc, dh = img.height * sc;
              ctx.drawImage(img, layer.x + (layer.w - dw) * ((layer.ox ?? 50) / 100), layer.y + (layer.h - dh) * ((layer.oy ?? 50) / 100), dw, dh);
              ctx.restore(); res();
            };
            img.onerror = res; img.src = layer.src;
          });
        }
        if (layer.type === "sticker") {
          ctx.save();
          if (layer.rotation) { const lcx = layer.x + (layer.size||60)/2, lcy = layer.y + (layer.size||60)/2; ctx.translate(lcx, lcy); ctx.rotate(layer.rotation * Math.PI / 180); ctx.translate(-lcx, -lcy); }
          ctx.font = `${Math.round((layer.size||60)*0.75)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "black";
          ctx.fillText(layer.emoji, layer.x + (layer.size||60)/2, layer.y + (layer.size||60)/2);
          ctx.restore();
        }
        if (layer.type === "text" && layer.text?.trim()) {
          ctx.save();
          if (layer.rotation) { const tw = Math.max(80, 600 - layer.x - 16); const lcx = layer.x + tw/2, lcy = layer.y + (layer.fontSize||18); ctx.translate(lcx, lcy); ctx.rotate(layer.rotation * Math.PI / 180); ctx.translate(-lcx, -lcy); }
          ctx.font = `${layer.bold ? "700" : "400"} ${layer.fontSize||18}px sans-serif`;
          ctx.fillStyle = layer.color || "#fff"; ctx.textAlign = layer.align || "left";
          ctx.shadowColor = "rgba(0,0,0,0.8)"; ctx.shadowBlur = 6;
          const drawX = layer.x + 26;
          layer.text.split("\n").forEach((line, i) => ctx.fillText(line, drawX, layer.y + (layer.fontSize||18) + i * (layer.fontSize||18) * 1.5));
          ctx.restore();
        }
      }

      // Compress thumbnail aggressively — max ~30KB
      const thumb = c.toDataURL("image/jpeg", 0.5);

      // ── Strip base64 src from layers for storage (keep everything else) ──
      // Image src data can be 500KB–2MB each — far too large for localStorage
      // We store layers without src; when reopened, images show as placeholders
      const strippedLayers = flushed.map(l => {
        if (l.type === "image") return { ...l, src: "" }; // strip large base64
        return l;
      });
      const strippedBg = bg?.type === "photo" ? { ...bg, src: "" } : bg;

      const designs = JSON.parse(localStorage.getItem("ambaig_designs") || "[]");
      const design = {
        id: Date.now(),
        savedAt: new Date().toISOString(),
        name: flushed.find(l => l.type === "text")?.text?.slice(0, 30) || `Design ${designs.length + 1}`,
        thumb,
        state: { canvasSize, bg: strippedBg, bgOpacity, layers: strippedLayers },
      };
      designs.unshift(design);

      try {
        localStorage.setItem("ambaig_designs", JSON.stringify(designs.slice(0, 20)));
        showToast("✅ Saved to My Designs");
      } catch (storageErr) {
        // If still too large, save without thumbnail
        design.thumb = "";
        designs[0] = design;
        localStorage.setItem("ambaig_designs", JSON.stringify(designs.slice(0, 20)));
        showToast("✅ Saved (without thumbnail — storage full)");
      }
    } catch (e) {
      console.error("saveToGallery error:", e);
      showToast("⚠️ Could not save — " + (e.message || "unknown error"));
    }
  };

  // ── Clear canvas ──
  const clearCanvas = () => {
    if (!confirm("Clear canvas and start a new design?")) return;
    dispatch({ type: "RESET", payload: { ...INIT_CANVAS } });
    setActiveEl(null);
    localStorage.removeItem("ambaig_canvas_state");
    showToast("✅ Canvas cleared");
  };

  const activeLayer = activeEl ? layers.find(l => l.id === activeEl.id) : null;

  return (
    <div>
      <Head>
        <title>Design Studio — AmbaigDesigns</title>
        <meta name="description" content="Create pins and mockups with backgrounds, photos, text, and stickers." />
      </Head>
      <div className="page-header">
        <h1>Design Studio</h1>
        <p>Build your pin — background, images, stickers, text — then caption and post.</p>
      </div>

      <div className="studio-layout">
        {/* ── Left panel ── */}
        <div className="studio-panel">

          {/* Layer panel */}
          {showLayerPanel && (
            <div className="card">
              <p className="plabel">Layers</p>
              {layers.length === 0 && <p style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>No layers yet.</p>}
              {[...layers].reverse().map((layer) => {
                const isActive = activeEl?.id === layer.id;
                const icon = layer.type === "image" ? "🖼" : layer.type === "sticker" ? layer.emoji : "T";
                const label = layer.type === "text" ? (layer.text?.slice(0, 18) || "Text") : layer.type === "sticker" ? "Sticker" : "Image";
                return (
                  <div key={layer.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", borderBottom: "1px solid var(--border)", background: isActive ? "var(--accent-glow)" : "transparent", borderRadius: 4, marginBottom: 2 }}>
                    <span style={{ width: 18, textAlign: "center", fontSize: "0.85rem", flexShrink: 0 }}>{icon}</span>
                    <span onClick={() => setActiveEl({ type: layer.type, id: layer.id })} style={{ flex: 1, fontSize: "0.75rem", color: isActive ? "var(--accent)" : "var(--text-muted)", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                    <button onClick={() => updateLayer(layer.id, { visible: !(layer.visible !== false) })} title={layer.visible !== false ? "Hide" : "Show"} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", padding: "2px 3px", color: layer.visible !== false ? "var(--text-muted)" : "var(--text-dim)" }}>{layer.visible !== false ? "👁" : "🚫"}</button>
                    <button onClick={() => updateLayer(layer.id, { locked: !layer.locked })} title={layer.locked ? "Unlock" : "Lock"} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", padding: "2px 3px", color: "var(--text-muted)" }}>{layer.locked ? "🔒" : "🔓"}</button>
                    <button onClick={() => duplicateLayer(layer.id)} title="Duplicate" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", padding: "2px 3px", color: "var(--text-muted)" }}>⧉</button>
                    <button onClick={() => moveLayerUp(layer.id)} title="Move up" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", padding: "2px 3px", color: "var(--text-dim)" }}>↑</button>
                    <button onClick={() => moveLayerDown(layer.id)} title="Move down" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", padding: "2px 3px", color: "var(--text-dim)" }}>↓</button>
                    <button onClick={() => removeLayer(layer.id)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", padding: "2px 3px", color: "var(--danger)" }}>🗑</button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Canvas size */}
          <div className="card">
            <p className="plabel">Canvas Size</p>
            {Object.entries(SIZES).map(([key, val]) => (
              <button key={key} onClick={() => set({ canvasSize: key })} style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "6px 10px", borderRadius: 7, marginBottom: 5, border: canvasSize === key ? "1px solid var(--accent)" : "1px solid var(--border)", background: canvasSize === key ? "var(--accent-glow)" : "transparent", color: canvasSize === key ? "var(--accent)" : "var(--text-muted)", cursor: "pointer", fontSize: "0.76rem", fontWeight: 500 }}>
                <span style={{ textTransform: "capitalize" }}>{key}</span>
                <span style={{ opacity: 0.7, fontSize: "0.7rem" }}>{val.label}</span>
              </button>
            ))}
          </div>

          {/* Background */}
          <div className="card">
            <p className="plabel">Background</p>
            <input type="file" accept="image/*" ref={bgFileRef} style={{ display: "none" }} onChange={addBg} />
            <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
              {[{ key: "photo", label: "📷 Photo" }, { key: "color", label: "🎨 Color" }, { key: "gradient", label: "🌈 Gradient" }].map(t => (
                <button key={t.key} onClick={() => setBgTab(t.key)} style={{ flex: 1, padding: "6px 4px", borderRadius: 7, fontSize: "0.68rem", fontWeight: 600, border: bgTab === t.key ? "1px solid var(--accent)" : "1px solid var(--border)", background: bgTab === t.key ? "var(--accent-glow)" : "transparent", color: bgTab === t.key ? "var(--accent)" : "var(--text-muted)", cursor: "pointer" }}>{t.label}</button>
              ))}
            </div>

            {bgTab === "photo" && (
              bg?.type === "photo" ? (
                <div>
                  <div style={{ width: "100%", height: 70, borderRadius: 8, overflow: "hidden", marginBottom: 8, border: "1px solid var(--border)" }}><img src={bg.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: bgOpacity }} /></div>
                  <label className="field-label">Opacity — {Math.round(bgOpacity * 100)}%</label>
                  <input type="range" min="0.1" max="1" step="0.05" value={bgOpacity} onChange={e => set({ bgOpacity: Number(e.target.value) })} style={{ width: "100%", marginBottom: 8, accentColor: "var(--accent)" }} />
                  <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: "0.78rem" }} onClick={() => bgFileRef.current?.click()}>🖼 Change Photo</button>
                  <button onClick={() => set({ bg: null, bgOpacity: 1 })} style={{ width: "100%", marginTop: 6, padding: "4px", background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "0.7rem" }}>Remove background</button>
                </div>
              ) : (
                <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => bgFileRef.current?.click()}>🖼 Upload Photo</button>
              )
            )}

            {bgTab === "color" && (
              <div>
                <div style={{ width: "100%", height: 50, borderRadius: 8, marginBottom: 8, border: "1px solid var(--border)", background: bg?.type === "color" ? bg.color : "#1a1a24" }} />
                <input type="color" value={bg?.type === "color" ? bg.color : "#222233"} onChange={e => set({ bg: { type: "color", color: e.target.value } })} style={{ width: "100%", height: 34, padding: 2, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface2)", cursor: "pointer", marginBottom: 8 }} />
                <label className="field-label">Quick Colors</label>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                  {[{ c: "#e60023", n: "Pinterest Red" }, { c: "#1877f2", n: "Facebook Blue" }, { c: "#833ab4", n: "Instagram" }, { c: "#000000", n: "Threads" }, { c: "#1a1a24", n: "Charcoal" }, { c: "#7c3aed", n: "Violet" }, { c: "#10b981", n: "Emerald" }, { c: "#f59e0b", n: "Amber" }, { c: "#ec4899", n: "Pink" }, { c: "#ffffff", n: "White" }].map(({ c, n }) => (
                    <button key={c} onClick={() => set({ bg: { type: "color", color: c } })} title={n} style={{ width: 27, height: 27, borderRadius: 6, background: c, border: bg?.type === "color" && bg.color === c ? "2px solid var(--accent)" : "1px solid var(--border)", cursor: "pointer" }} />
                  ))}
                </div>
                {bg?.type === "color" && <button onClick={() => set({ bg: null })} style={{ width: "100%", padding: "4px", background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "0.7rem" }}>Remove background</button>}
              </div>
            )}

            {bgTab === "gradient" && (
              <div>
                <div style={{ width: "100%", height: 50, borderRadius: 8, marginBottom: 8, border: "1px solid var(--border)", background: bg?.type === "gradient" ? `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})` : "linear-gradient(135deg, #7c3aed, #ec4899)" }} />
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label className="field-label">From</label>
                    <input type="color" value={bg?.type === "gradient" ? bg.from : "#7c3aed"} onChange={e => set({ bg: { type: "gradient", from: e.target.value, to: bg?.to || "#ec4899", angle: bg?.angle ?? 135 } })} style={{ width: "100%", height: 30, padding: 2, borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface2)", cursor: "pointer" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="field-label">To</label>
                    <input type="color" value={bg?.type === "gradient" ? bg.to : "#ec4899"} onChange={e => set({ bg: { type: "gradient", from: bg?.from || "#7c3aed", to: e.target.value, angle: bg?.angle ?? 135 } })} style={{ width: "100%", height: 30, padding: 2, borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface2)", cursor: "pointer" }} />
                  </div>
                </div>
                <label className="field-label">Angle — {bg?.type === "gradient" ? bg.angle : 135}°</label>
                <input type="range" min="0" max="360" step="15" value={bg?.type === "gradient" ? bg.angle : 135} onChange={e => set({ bg: { type: "gradient", from: bg?.from || "#7c3aed", to: bg?.to || "#ec4899", angle: Number(e.target.value) } })} style={{ width: "100%", marginBottom: 8, accentColor: "var(--accent)" }} />
                <label className="field-label">Brand Presets</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5, marginBottom: 8 }}>
                  {[{ name: "Pinterest", from: "#e60023", to: "#ad081b", angle: 135 }, { name: "Instagram", from: "#833ab4", to: "#fd1d1d", angle: 135 }, { name: "Facebook", from: "#1877f2", to: "#0d5bc7", angle: 135 }, { name: "Sunset", from: "#f59e0b", to: "#ec4899", angle: 120 }, { name: "Ocean", from: "#0ea5e9", to: "#10b981", angle: 135 }, { name: "Midnight", from: "#1a1a24", to: "#374151", angle: 180 }, { name: "Royal", from: "#7c3aed", to: "#4c1d95", angle: 135 }, { name: "Peach", from: "#fbbf24", to: "#fb7185", angle: 120 }, { name: "Mint", from: "#34d399", to: "#0ea5e9", angle: 135 }].map(g => (
                    <button key={g.name} onClick={() => set({ bg: { type: "gradient", from: g.from, to: g.to, angle: g.angle } })} title={g.name} style={{ height: 38, borderRadius: 7, background: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})`, border: bg?.type === "gradient" && bg.from === g.from ? "2px solid var(--accent)" : "1px solid var(--border)", cursor: "pointer", position: "relative" }}>
                      <span style={{ position: "absolute", bottom: 2, left: 3, right: 3, fontSize: "0.52rem", color: "white", textShadow: "0 1px 2px rgba(0,0,0,0.8)", fontWeight: 600 }}>{g.name}</span>
                    </button>
                  ))}
                </div>
                {bg?.type === "gradient" && <button onClick={() => set({ bg: null })} style={{ width: "100%", padding: "4px", background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "0.7rem" }}>Remove background</button>}
              </div>
            )}
          </div>

          {/* Stickers */}
          <div className="card">
            <p className="plabel">Stickers & Emojis</p>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
              {Object.keys(STICKER_SETS).map(k => (
                <button key={k} onClick={() => setActiveStickerSet(k)} style={{ padding: "3px 7px", borderRadius: 6, fontSize: "0.65rem", border: activeStickerSet === k ? "1px solid var(--accent)" : "1px solid var(--border)", background: activeStickerSet === k ? "var(--accent-glow)" : "transparent", color: activeStickerSet === k ? "var(--accent)" : "var(--text-muted)", cursor: "pointer" }}>
                  {k.split(" ")[0]}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {STICKER_SETS[activeStickerSet].map(emoji => (
                <button key={emoji} onClick={() => addSticker(emoji)} title={`Add ${emoji}`} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface2)", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.1s" }}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Text Style */}
          <div className="card">
            <p className="plabel">Text Style</p>
            {(() => {
              const selBox = activeLayer?.type === "text" ? activeLayer : null;
              const isEditing = !!selBox;
              const curColor = isEditing ? (selBox.color || "#fff") : textColor;
              const curSize  = isEditing ? (selBox.fontSize || 22) : fontSize;
              const curAlign = isEditing ? (selBox.align || "left") : textAlign;
              const curStyle = isEditing ? (selBox.style || "shadow") : textStyle;
              const curBold  = isEditing ? !!selBox.bold : textBold;
              const curFont  = isEditing ? (selBox.font || "sans") : textFont;
              const apply = (patch) => {
                if (isEditing) updateLayer(selBox.id, patch);
                else {
                  if ("color" in patch) setTextColor(patch.color);
                  if ("fontSize" in patch) setFontSize(patch.fontSize);
                  if ("bold" in patch) setTextBold(patch.bold);
                  if ("align" in patch) setTextAlign(patch.align);
                  if ("style" in patch) setTextStyle(patch.style);
                  if ("font" in patch) setTextFont(patch.font);
                }
              };
              return (
                <div style={{ padding: "8px 10px", borderRadius: 10, background: isEditing ? "var(--accent-glow)" : "var(--surface2)", border: isEditing ? "1px solid var(--accent)" : "1px solid var(--border)" }}>
                  <p style={{ fontSize: "0.68rem", color: isEditing ? "var(--accent)" : "var(--text-muted)", fontWeight: 700, marginBottom: 8 }}>{isEditing ? "✏️ Editing selected text" : "🎨 New text style"}</p>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}><label className="field-label">Color</label><input type="color" value={curColor} onChange={e => apply({ color: e.target.value })} style={{ width: "100%", height: 30, padding: 2, borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface2)", cursor: "pointer" }} /></div>
                    <div style={{ flex: 1 }}><label className="field-label">Size</label><select value={curSize} onChange={e => apply({ fontSize: Number(e.target.value) })}>{[12,14,16,18,20,22,24,28,32,36,40,48,56,64,72].map(s => <option key={s} value={s}>{s}px</option>)}</select></div>
                  </div>
                  <label className="field-label">Font</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 8 }}>
                    {Object.entries(FONT_OPTIONS).map(([k, f]) => (
                      <button key={k} onClick={() => apply({ font: k })} style={{ padding: "5px 4px", borderRadius: 6, fontSize: "0.75rem", border: curFont === k ? "1px solid var(--accent)" : "1px solid var(--border)", background: curFont === k ? "var(--accent-glow)" : "transparent", color: curFont === k ? "var(--accent)" : "var(--text-muted)", cursor: "pointer", fontFamily: f.family, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.label}</button>
                    ))}
                  </div>
                  <label className="field-label">Alignment</label>
                  <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                    {["left","center","right"].map(a => <button key={a} onClick={() => apply({ align: a })} style={{ flex: 1, padding: "5px 0", borderRadius: 6, fontSize: "0.75rem", border: curAlign === a ? "1px solid var(--accent)" : "1px solid var(--border)", background: curAlign === a ? "var(--accent-glow)" : "transparent", color: curAlign === a ? "var(--accent)" : "var(--text-muted)", cursor: "pointer" }}>{a === "left" ? "⬅" : a === "center" ? "⬛" : "➡"}</button>)}
                  </div>
                  <label className="field-label">Style</label>
                  <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                    {Object.keys(TEXT_STYLES).map(s => <button key={s} onClick={() => apply({ style: s })} style={{ flex: 1, padding: "4px 0", borderRadius: 6, fontSize: "0.62rem", fontWeight: 600, border: curStyle === s ? "1px solid var(--accent)" : "1px solid var(--border)", background: curStyle === s ? "var(--accent-glow)" : "transparent", color: curStyle === s ? "var(--accent)" : "var(--text-muted)", cursor: "pointer", textTransform: "capitalize" }}>{s}</button>)}
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <input type="checkbox" checked={curBold} onChange={e => apply({ bold: e.target.checked })} style={{ accentColor: "var(--accent)" }} /> Bold
                  </label>
                </div>
              );
            })()}
          </div>

          {/* Add Text + Image + Undo — merged */}
          <div className="card">
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
              <p className="plabel" style={{ flex: 1, margin: 0 }}>Add Layers</p>
              <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: "0.75rem", gap: 4 }} onClick={undo} disabled={!past.length} title="Undo (Ctrl+Z)">↩ Undo</button>
              <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: "0.75rem", gap: 4 }} onClick={redo} disabled={!future.length} title="Redo (Ctrl+Y)">↪ Redo</button>
              <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: "0.75rem" }} onClick={() => setShowLayerPanel(p => !p)} title="Layer panel">{showLayerPanel ? "✕" : "☰"}</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input type="file" accept="image/*" ref={imgFileRef} style={{ display: "none" }} onChange={addImageLayer} />
              <button className="btn btn-ghost" style={{ justifyContent: "center" }} onClick={() => imgFileRef.current?.click()}>
                🖼 Add Image Layer
                {layers.filter(l => l.type === "image").length > 0 && <span style={{ marginLeft: 6, fontSize: "0.68rem", color: "var(--text-dim)" }}>({layers.filter(l => l.type === "image").length})</span>}
              </button>
              <button className="btn btn-ghost" style={{ justifyContent: "center" }} onClick={() => addTextBox("Title text", textColor, Math.max(fontSize, 28), true)}>+ Add Title</button>
              <button className="btn btn-ghost" style={{ justifyContent: "center" }} onClick={() => addTextBox("Description text", textColor, Math.min(fontSize, 16), false)}>+ Add Description</button>
              <button className="btn btn-ghost" style={{ justifyContent: "center" }} onClick={() => addTextBox()}>+ Add Text Box</button>
            </div>
          </div>

          {/* Export & Share — full width horizontal */}
          <div className="card export-card">
            <p className="plabel" style={{ marginBottom: 10 }}>Export & Share</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", whiteSpace: "nowrap" }} onClick={downloadPNG} disabled={saving}>{saving ? "⏳ Exporting…" : "💾 Save & Download PNG"}</button>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", borderColor: "var(--success)", color: "var(--success)", whiteSpace: "nowrap" }} onClick={saveToGallery}>📁 Save to My Designs</button>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", borderColor: "var(--success)", color: "var(--success)", whiteSpace: "nowrap" }} onClick={goToPost}>📤 Go to Post Manager</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", whiteSpace: "nowrap" }} onClick={goToCaptions}>✨ Generate Captions →</button>
              <button onClick={clearCanvas} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-dim)", cursor: "pointer", fontSize: "0.78rem", whiteSpace: "nowrap" }}>🗑 Clear & New Design</button>
            </div>
          </div>
        </div>

        {/* ── Canvas ── */}
        <div className="studio-canvas-wrap" ref={canvasWrapRef}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 8 }}>
            Canvas — {sz.w}×{sz.h}px {past.length > 0 && <span style={{ color: "var(--text-dim)" }}>· {past.length} step{past.length > 1 ? "s" : ""} in history</span>}
          </p>
          <div style={{ width: sz.w * canvasScale, height: sz.h * canvasScale, position: "relative", overflow: "hidden" }} onClick={(e) => { if (e.target === e.currentTarget) setActiveEl(null); }}>
            <div style={{ transformOrigin: "top left", transform: `scale(${canvasScale})`, width: sz.w, height: sz.h }}>
              <div ref={canvasRef} onClick={(e) => { if (!e.target.closest("[data-canvas-el]")) setActiveEl(null); }} style={{ position: "relative", width: sz.w, height: sz.h, overflow: "hidden", borderRadius: 10, border: "1px solid var(--border)", background: "#fff" }}>

                {/* Background */}
                {bg?.type === "photo" && bg.src && <BgImage src={bg.src} ox={bg.ox} oy={bg.oy} opacity={bgOpacity} onPan={(ox, oy) => set({ bg: { ...bg, ox, oy } })} />}
                {bg?.type === "color" && <div style={{ position: "absolute", inset: 0, zIndex: 1, background: bg.color }} />}
                {bg?.type === "gradient" && <div style={{ position: "absolute", inset: 0, zIndex: 1, background: `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})` }} />}

                {/* Layers in order */}
                {layers.map(layer => {
                  if (layer.visible === false && activeEl?.id !== layer.id) return null;
                  const isSelected = activeEl?.id === layer.id;
                  if (layer.locked && !isSelected) return (
                    <div key={layer.id} data-canvas-el={layer.type} style={{ position: "absolute", left: layer.x, top: layer.y, pointerEvents: "none", opacity: layer.visible !== false ? 1 : 0 }}>
                      {layer.type === "sticker" && <span style={{ fontSize: (layer.size || 60) * 0.75 }}>{layer.emoji}</span>}
                    </div>
                  );
                  const commonProps = {
                    key: layer.id, canvasRef, scale: canvasScale,
                    selected: isSelected,
                    onSelect: () => setActiveEl({ type: layer.type, id: layer.id }),
                    onUpdate: (patch) => silentUpdateLayer(layer.id, patch),
                    onCommit: () => commitLayer(),
                    onRemove: () => removeLayer(layer.id),
                    onDuplicate: () => duplicateLayer(layer.id),
                  };
                  if (layer.type === "image")   return <ImageLayer   {...commonProps} layer={layer} />;
                  if (layer.type === "sticker") return <StickerLayer {...commonProps} layer={layer} />;
                  if (layer.type === "text")    return <TextLayer    {...commonProps} layer={layer} />;
                  return null;
                })}
              </div>
            </div>
          </div>
          <p style={{ marginTop: 6, fontSize: "0.68rem", color: "var(--text-dim)" }}>💡 Tap to select · Double-tap text to edit · Pinch images to resize · ☰ for layer panel · Ctrl+Z to undo</p>
        </div>
      </div>

      <Toast msg={toast} />

      <style jsx>{`
        .plabel { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 9px; }
        .studio-layout { display: flex; flex-direction: column; gap: 12px; padding: 0 12px 80px; }
        .studio-panel { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 10px; align-items: stretch; }
        .export-card { grid-column: 1 / -1; } /* span all columns */
        .studio-canvas-wrap { width: 100%; }
        @media (max-width: 768px) {
          .studio-layout { padding: 0 8px 80px; gap: 10px; }
          .studio-panel { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
