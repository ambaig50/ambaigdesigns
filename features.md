# AmbaigDesigns — Features & Roadmap

_Last updated: July 2026_

A free, public, client-side Pin and mockup design tool. Create designs, generate AI captions in multiple languages, and post manually to Pinterest, Facebook, Instagram, or Threads — no account, no sign-up, no backend required.

**Live:** [ambaigdesigns.vercel.app](https://ambaigdesigns.vercel.app)

---

## ✅ Current Features

### 🎨 Design Studio (`/home`)

#### Canvas
- **Three sizes**: Portrait 600×900 (Pinterest 2:3), Square 600×600 (Instagram 1:1), Landscape 800×450 (Facebook 16:9)
- Canvas auto-scales to fit any screen width with pixel-accurate coordinate math
- Default canvas size can be set in Settings

#### Background layer (tabbed)
- **📷 Photo** — upload any image; drag to pan; opacity slider (10–100%)
- **🎨 Solid color** — color picker + 10 named brand swatches (Pinterest Red, Facebook Blue, Instagram Purple, Threads Black, etc.)
- **🌈 Gradient** — from/to color pickers, 0–360° angle slider, 9 named brand presets (Pinterest, Instagram, Facebook, Sunset, Ocean, Midnight, Royal Purple, Peach, Mint)

#### Overlay image layers
- Upload any number of images
- Drag to move, pinch to resize (mobile), corner handle (desktop)
- ✂ Crop/pan mode — reposition photo inside its frame
- 🔄 Rotate handle — free rotation; Shift snaps to 15°
- ⧉ Duplicate button on selected layer
- × delete

#### Sticker & emoji layers (12 packs, 96 emoji total)
- **⭐ Stars** · **❤️ Hearts** · **🎉 Party** · **📌 Markers** · **😊 Faces** · **🌸 Nature** · **◆ Shapes** · **➡️ Arrows**
- **🕌 Islamic** · **🎊 Eid** · **🇵🇰 Pakistan** · **🌿 Cultural**
- Drag, resize, rotate, duplicate per sticker

#### Text layers
- Add Title (large), Add Description (small), Add Text Box (custom)
- Drag to move; double-tap to edit inline
- Text shrinks to fit content width (no wide empty boxes)
- **Rich text formatting** — select any word/phrase while editing to get a floating toolbar: Bold, Italic, 9 colour swatches, Clear formatting. Per-word colours and bold export correctly to PNG.
- Per-layer controls (always visible):
  - Color picker + font size dropdown (12–72px)
  - **8 fonts**: Sans (DM Sans), Serif (Merriweather), Script (Pacifico), Display (Bebas Neue), Playfair, Montserrat, Lato, Dancing Script
  - Alignment: left / center / right
  - Style: Shadow, Outline, Pill, Plain
  - Bold toggle
- 🔄 Rotate handle · ⧉ Duplicate on every text box

#### Layer panel (☰)
- Lists all layers in stack order (images, stickers, text)
- Per-layer: 👁 show/hide, 🔒 lock, ⧉ duplicate, ↑↓ reorder, 🗑 delete
- Click any layer name to select it on canvas

#### Undo / Redo
- 20-step history — ↩ Undo · ↪ Redo in the Add Layers card header
- Keyboard: Ctrl+Z / Ctrl+Y
- Drag/resize/rotate uses silent updates during gesture; commits one history entry on release

#### Export
- **Save & Download PNG** — 2× retina; all layers including rotation, per-word rich text colours, emoji
- **Save to My Designs** — full thumbnail render saved to gallery

#### Panel layout
- All control panels display above the canvas in a responsive grid
- Canvas gets full width below — maximises design space especially on landscape
- **Export & Share** bar spans full width: Save PNG · Save to Designs · Post Manager · Generate Captions · Clear

#### Theme
- **🌙 Dark mode** (default) / **☀️ Light mode** toggle
- Available in the desktop sidebar (bottom) and mobile tab bar (6th tab)
- Preference saved to localStorage — persists across sessions

---

### 📁 My Designs (`/designs`)
- Gallery of up to 20 saved designs
- Thumbnails rendered with full canvas: photo, gradient, image layers, stickers, text
- ✏️ Open restores full design in Studio · 🗑 Delete individual or Clear All
- Clean thumbnails — no canvas size badge overlay

---

### ✨ AI Captions (`/captions`)

#### Generation
- 4 platform-specific captions: Pinterest, Facebook, Instagram, Threads
- Works from Studio navigation OR directly from sidebar nav (reads canvas text from localStorage if no query params)
- Uses Claude Haiku when `ANTHROPIC_API_KEY` is set in Vercel env
- **Full fallback matrix (zero config needed)** — 5 tones × 3 languages = 15 fully distinct caption sets

#### Language (3 options — strict separation, no mixing)
- 🇬🇧 **English** — pure English only
- 🇵🇰 **اردو** — pure Urdu script; English title/description is translated, not copied raw
- 🇵🇰 **Roman Urdu** — Urdu words in English letters; English titles translated to Roman Urdu meaning

#### Tone (5 options — auto-regenerates on selection)
- **Engaging** · **Professional** · **Playful** · **Minimal** · **Inspirational**
- Selecting a different tone or language instantly regenerates all 4 captions
- Buttons disabled during generation to prevent request queuing
- Status text shows active language + tone combination

#### Caption controls
- Each caption editable in textarea
- 📋 Copy to clipboard
- 🖼 **Add to Canvas** — with font size selector (12–40px, live "Aa" preview) before adding; caption placed at correct position for all canvas sizes including landscape
- Mini canvas preview matches correct aspect ratio with layers, rotation, fonts

---

### 📤 Post Manager (`/post`)
- Standalone — works with or without generated captions
- Editable caption textarea per platform (pre-filled from Captions if available, otherwise blank)
- **Open & Post ↗** — opens platform + copies caption synchronously (avoids mobile popup blockers)
- Pinterest and Threads use share-intent URLs; Facebook/Instagram open for manual paste
- Per-post history log, clearable
- Popup-blocked warning toast

---

### ⚙️ Settings (`/settings`)
- Live status: saved designs count, active canvas, captions, post history
- Preferences: display name, default canvas size
- Per-platform posting guide
- Clear All Saved Data

---

### Architecture
- **Next.js (Pages Router)** on Vercel
- **No database** — all state in `localStorage`
- **No required API keys** — `ANTHROPIC_API_KEY` optional; full fallback works without it
- **No OAuth** — posting is manual via `window.open` + clipboard
- Mobile-first: bottom tab bar (6 tabs inc. theme toggle) on mobile, sticky sidebar on desktop
- Per-page `<title>` and meta tags; SVG favicon; Open Graph tags
- Dark/light theme via CSS custom properties on `data-theme` attribute

---

## 🚧 Known Limitations (by design, for now)
- Up to 20 designs in browser only — clearing browser data loses them
- Image layers stripped from My Designs saved state (thumbnail preserved) to avoid localStorage quota limits
- No real engagement analytics — requires OAuth + database
- Facebook/Instagram have no public unauthenticated share-intent URL — must paste manually
- Emoji rendering in PNG export varies slightly across device OS font stacks

---

## 💡 Next Steps

### Quick
- **Stock photo search** — Unsplash/Pexels API as background source (free tier available)
- **Duplicate design** in My Designs gallery — copy a saved design to iterate from it
- **Text box resize handle** — drag corner to resize the text box width explicitly (currently auto-fits content)
- **Watermark option** — toggle to add "AmbaigDesigns" or custom logo to exports

### Medium
- **Image hosting** (Vercel Blob) — host exported PNG at public URL so Pinterest auto-attaches image in share link, removing manual upload step
- **More font packs** — Arabic/Urdu-style display fonts for Urdu text layers
- **More sticker packs** — seasonal (Ramazan, New Year), food & lifestyle, business/quote frames

### Large (requires backend)
- **Real auto-posting** — Pinterest + Meta + Threads API; needs OAuth, server-side token storage, image hosting
- **Cross-device sync** — Vercel Postgres + anonymous device-ID auth for My Designs across browsers
- **Real analytics** — saves/likes/views per post; requires OAuth tokens stored per user

### Monetization
- **Free/Pro split** — current features free; Pro unlocks extra font packs, batch export, watermark removal, custom brand kit (Gumroad pattern, same as LinguaApp)
- **Design pack store** — sell pre-made background/sticker packs targeting Pakistani/Urdu-speaking audience
