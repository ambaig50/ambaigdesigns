# AmbaigDesigns — Features & Roadmap

_Last updated: July 2026_

A free, public, client-side Pin and mockup design tool. Anyone can create a design, generate AI captions in multiple languages, and post manually to Pinterest, Facebook, Instagram, or Threads — no account, no sign-up, no backend required.

**Live:** [ambaigdesigns.vercel.app](https://ambaigdesigns.vercel.app)

---

## ✅ Current Features

### 🎨 Design Studio (`/home`)

#### Canvas
- **Three sizes**: Portrait 600×900 (Pinterest 2:3), Square 600×600 (Instagram 1:1), Landscape 800×450 (Facebook 16:9)
- Canvas auto-scales to fit any screen width with pixel-accurate coordinate math — drag precision is the same on mobile and desktop
- Default canvas size can be set in Settings and applies on fresh sessions

#### Background layer (tabbed)
- **📷 Photo** — upload any image; drag on canvas to pan/reposition; opacity slider (10–100%)
- **🎨 Solid color** — color picker + 10 named brand-color swatches (Pinterest Red, Facebook Blue, Instagram Purple, Threads Black, etc.)
- **🌈 Gradient** — from/to color pickers, 0–360° angle slider, 9 named brand presets (Pinterest, Instagram, Facebook, Sunset, Ocean, Midnight, Royal Purple, Peach, Mint)

#### Overlay image layers
- Upload any number of images on top of the background
- Drag to move (scale-aware, accurate on mobile)
- Two-finger pinch to resize on mobile; corner handle on desktop
- ✂ Crop/pan mode — reposition the photo inside its frame without resizing
- 🔄 Rotate handle — drag to rotate freely; Shift snaps to 15° increments
- × button to delete

#### Sticker & emoji layers
- 8 categories with 8 emoji each: ⭐ Stars, ❤️ Hearts, 🎉 Party, 📌 Markers, 😊 Faces, 🌸 Nature, ◆ Shapes, ➡️ Arrows
- Tap any emoji to drop it on canvas
- Drag to move, corner handle to resize, 🔄 to rotate
- Exports correctly to PNG via Canvas API emoji font stack

#### Text layers
- Three add buttons: + Add Title (large, bold), + Add Description (small), + Add Text Box (custom)
- Drag to move; double-tap to edit inline; Enter for line break; text wraps automatically
- **Text shrinks to fit content** — short text like "WOW" stays tight, long captions wrap to a max width
- Per-layer controls (always visible in panel):
  - Color picker
  - Font size dropdown (12–72px)
  - Font choice: Sans (DM Sans), Serif (Merriweather), Script (Pacifico), Display (Bebas Neue)
  - Alignment: left / center / right
  - Style: Shadow, Outline, Pill, Plain
  - Bold toggle
- 🔄 Rotate handle on every text box

#### Layer panel (☰)
- Lists all layers in stack order (images, stickers, text)
- Per-layer: 👁 show/hide, 🔒 lock (visible but non-interactive), ↑↓ reorder, 🗑 delete
- Click any layer name to select it on canvas

#### Undo / Redo
- 20-step history stack
- ↩ Undo / ↪ Redo buttons in the panel
- Keyboard: Ctrl+Z (undo), Ctrl+Y or Ctrl+Shift+Z (redo)
- Drag/resize/rotate uses silent updates during gesture; commits one history entry on release — no history flooding

#### Export
- **Save & Download PNG** — 2× retina resolution; draws background + all layers in correct order; custom fonts load via `document.fonts.ready` before drawing; rotation applied per layer via `ctx.rotate()`; emoji rendered with color font stack (`Apple Color Emoji`, `Segoe UI Emoji`, `Noto Color Emoji`)
- **Save to My Designs** — renders a full thumbnail (photo, gradient, all layers) and saves to gallery

#### Other
- Auto-save — full canvas state persists to `localStorage` on every change including during drag
- Clear & New Design — resets canvas with confirmation

---

### 📁 My Designs (`/designs`)
- Gallery of up to 20 saved designs
- Thumbnails rendered with full canvas content: photo background, gradient, image layers, stickers, text layers
- Canvas size badge (Portrait / Square / Landscape) on each card
- Design name auto-set from first text layer
- ✏️ Open — restores full design state in Studio
- 🗑 Delete individual designs (with confirmation step)
- Clear All

---

### ✨ AI Captions (`/captions`)

#### Generation
- Generates 4 platform-specific captions (Pinterest, Facebook, Instagram, Threads) from your text layers
- Works when navigating from Studio **or** directly from sidebar nav — reads canvas text from `localStorage` if no query params
- Uses Claude Haiku via `/api/generateCaptions` when `ANTHROPIC_API_KEY` is set in Vercel env
- **Full fallback matrix (no API key needed)** — 5 tones × 4 languages = 20 pre-written caption sets, each with genuinely distinct sentence structure, vocabulary, length, and energy

#### Language options
- 🇬🇧 **English**
- 🇵🇰 **اردو** — full Urdu script
- 🇵🇰 **Roman Urdu** — Urdu words in English letters, as Pakistani social media users type
- 🌐 **Urdu + English** — bilingual code-switching mix in every caption

#### Tone options
- **Engaging** — friendly, asks questions, encourages saves/comments
- **Professional** — polished, no slang, minimal emojis
- **Playful** — energetic, exclamation marks, fun emojis 🎉✨😍
- **Minimal** — just the title + 1 hashtag, nothing more
- **Inspirational** — motivational, emotionally resonant, quote-style

Changing language or tone **auto-regenerates** immediately. Buttons disabled during generation to prevent request queuing.

#### Caption controls
- Each caption is editable in a textarea
- 📋 Copy to clipboard (with fallback for browsers blocking `navigator.clipboard`)
- 🖼 Add to Canvas — adds caption as a draggable text layer; **canvas font size selector** (12–40px) with live "Aa" preview lets you choose the size before adding
- Mini canvas preview matched to correct aspect ratio, showing actual layers including rotation and fonts

---

### 📤 Post Manager (`/post`)
- Fully standalone — works whether or not you generated captions first
- Editable textarea per platform (pre-filled if you came from Captions, blank otherwise)
- **Open & Post ↗** — opens platform in a new tab + copies caption to clipboard synchronously (avoids mobile popup blockers)
- Pinterest and Threads use share-intent URLs that pre-fill captions; Facebook/Instagram open the platform for manual paste
- Per-post history log (platform + design title + timestamp), clearable
- If popup is blocked, shows a clear warning toast

---

### ⚙️ Settings (`/settings`)
- Live status card: saved designs count (of 20), active canvas design, generated captions, post history count
- Preferences: display name, default canvas size
- Per-platform posting guide (how each platform works with manual posting)
- Clear All Saved Data — wipes all 7 localStorage keys
- Data/privacy note: everything local-only, no server, no account needed

---

### Architecture
- **Next.js (Pages Router)** deployed on Vercel
- **No database** — all state in `localStorage`
- **No required API keys** — `ANTHROPIC_API_KEY` is optional; full fallback caption matrix works without it
- **No OAuth** — posting is manual via `window.open` + clipboard copy
- **No templates** — replaced with color/gradient/photo background system
- Mobile-first: bottom tab bar on mobile, sticky sidebar panel on desktop
- Per-page `<title>` and meta description tags; SVG favicon in app brand colors; Open Graph tags

---

## 🚧 Known Limitations (by design, for now)
- Up to 20 designs saved in browser only — clearing browser data or switching devices loses them
- No real engagement analytics (likes/views/saves) — requires OAuth + database
- Facebook/Instagram have no public unauthenticated share-intent URL — must paste manually
- Sticker emoji rendering in PNG export depends on device OS emoji font — may vary slightly across devices

---

## 💡 Next Steps (if you want to go further)

### Small / Quick
- **Stock photo search** — integrate Unsplash or Pexels API as a background/overlay image source (free tier available), so users don't need to upload from device
- **Text formatting per word** — bold/color a single word inside a box (requires switching from `contentEditable` plain text to a rich text model)
- **Duplicate layer** — copy an existing text/sticker/image layer in one tap
- **Canvas size badge** in My Designs is purely informational — could be removed if you find it clutters the gallery

### Medium
- **Image hosting** (Vercel Blob or Cloudinary) — host the exported PNG at a public URL so Pinterest's "Save" button can auto-attach the image, removing the need for manual upload
- **More sticker packs** — Islamic art, Eid/occasion greetings, Pakistani cultural motifs — would resonate with your target audience
- **Watermark / branding option** — automatically add "AmbaigDesigns" or a custom logo to exports

### Large (requires backend)
- **Real auto-posting** — Pinterest API + Meta Graph API + Threads API; needs OAuth app approval, server-side token storage, and image hosting at a public URL
- **Cross-device sync** — Vercel Postgres or Neon + lightweight anonymous device-ID auth to keep My Designs across browsers and devices
- **Real analytics** — engagement data (saves, likes, views) per post; requires OAuth tokens stored server-side per user

### Monetization
- **Free/Pro split** matching your LinguaApp Gumroad pattern: free tier = current feature set; Pro tier = extra font packs, batch PNG export, watermark removal, or custom brand kit
- **Design pack store** — sell pre-made background/sticker packs on Gumroad targeting Pakistani/Urdu-speaking audiences
