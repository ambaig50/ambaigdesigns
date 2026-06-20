# AmbaigDesigns — Features & Roadmap

_Last updated: June 2026_

A free, public, client-side Pin/mockup design tool. Anyone can create a design, generate captions, and post it manually to Pinterest, Facebook, Instagram, or Threads — no account, no API keys, no backend required.

---

## ✅ Current Features

### Design Studio (`/home`)
- **Canvas sizes**: Portrait (600×900, Pinterest 2:3), Square (600×600, Instagram 1:1), Landscape (800×450, Facebook 16:9)
- **Background layer** — three types, switchable via tabs:
  - **Photo**: upload an image, drag to pan/reposition, opacity slider (10–100%)
  - **Solid color**: color picker + 10 quick swatches
  - **Gradient**: from/to color pickers, 0–360° angle slider, 6 quick presets
- **Overlay images**: upload any number of images on top of the background
  - Drag to move (full canvas-space accuracy, scale-aware for mobile)
  - Resize via corner handle (desktop) or two-finger pinch (mobile)
  - Crop/pan mode (✂ toggle) to reposition the image inside its frame
  - Delete via × button
- **Text layers**: fully freeform, not tied to any template
  - Add Title / Add Description / Add Text Box (different default sizes)
  - Drag to move; double-tap/double-click to edit inline
  - Per-box controls: color, font size (dropdown 12–72px), alignment (left/center/right), 4 styles (Shadow, Outline, Pill, Plain), bold
  - Enter key inserts a real line break; text wraps automatically
  - Single persistent control panel — never disappears when deselecting
- **Save & Download PNG** — exports the canvas (background + images + text, in correct layer order) as a real PNG file, 2x resolution, downloads directly to device
- **Clear & New Design** — wipes canvas and local state with confirmation
- **Auto-save** — entire canvas state persists to `localStorage`, survives navigation and page reloads
- **Responsive layout** — sticky left-side panel column on desktop, stacked full-width panel on mobile; canvas scales to fit any screen width with pixel-accurate coordinate math

### AI Captions (`/captions`)
- Generates 4 platform-specific captions (Pinterest, Facebook, Instagram, Threads) from your text layers
- Uses Claude (Haiku) via `/api/generateCaptions` if `ANTHROPIC_API_KEY` is set in Vercel env vars
- **Gracefully falls back to template-based captions with zero configuration** if no API key is present — app works out of the box for any deployer
- Live mini preview of the actual canvas (background + images + text), matched to the correct aspect ratio
- Each caption is editable, with live character count
- "🖼 Add to Canvas" places any caption as a draggable text layer back on the design
- "📋 Copy" with clipboard fallback for browsers that block `navigator.clipboard`

### Post Manager (`/post`)
- Fully standalone — works whether or not you generated captions first
- Editable caption box per platform (type your own or use AI-generated ones)
- **"Open & Post ↗"** per platform: opens the platform in a new tab and copies the caption to clipboard simultaneously (synchronous `window.open` call to avoid mobile popup blockers)
- Pinterest and Threads use share-intent URLs that pre-fill the caption; Facebook/Instagram open the platform for manual paste (no public unauthenticated share-intent exists for these)
- Post history log (platform + title + timestamp), stored locally, clearable

### Settings (`/settings`)
- Live status card: shows whether a design/captions exist and how many posts are logged
- User preferences: display name, default canvas size (applied on next fresh session)
- Explanation of how posting works per platform
- "Clear All Saved Data" — wipes every `localStorage` key the app uses
- Honest data/privacy note: everything is local-only, no server storage, no account

### Architecture
- Next.js (Pages Router), deployed on Vercel
- **No database** — all state lives in browser `localStorage`
- **No required API keys** — `ANTHROPIC_API_KEY` is optional (captions fall back to templates without it)
- **No OAuth / social API integrations** — posting is manual via `window.open` + clipboard copy
- Mobile-first responsive design with a fixed bottom tab bar on mobile, sticky sidebar on desktop

---

## 💡 Suggestions for Next Steps

### Quick wins / cleanup
- **Remove dead code**: `utils/loadTemplates.js` and `utils/templateComponents.js` are no longer imported anywhere since templates were removed from the canvas — safe to delete
- **Remove `components/templates/`** folder (50 unused template files) once you're sure you won't reuse any of that artwork
- Add a **favicon** and proper `<title>`/meta tags per page for SEO and browser tab clarity

### Design Studio enhancements
- **Stickers/shapes layer** — simple icon or shape overlays (arrows, stars, badges) in addition to photos and text
- **Multi-select / layer panel** — a list view of all layers (background, each image, each text box) with reorder/lock/visibility toggles, useful once designs get complex
- **Undo/redo** — currently any mistake requires manual fixing; even a 5-step undo stack would help a lot
- **Font choices** — currently fixed to DM Sans; adding 2–3 alternate Google Fonts (a serif, a script, a display font) would meaningfully expand creative range
- **Gradient/color background presets that match brand palettes** (e.g. "Pinterest red," "Instagram gradient") since you specifically target Pinterest/Instagram users
- **Save multiple designs** — right now only one design lives in `localStorage` at a time; a simple "My Designs" gallery (list of saved canvases, thumbnail + reopen) would let users keep a library instead of overwriting their work each session

### Captions
- **Language support** — given your interest in Urdu-speaking audiences, an option to generate captions in Urdu or Roman Urdu alongside English would be a natural differentiator
- **Tone/style presets** — e.g. "Professional," "Playful," "Minimal" — passed into the Claude prompt to vary caption voice

### Posting
- **Pinterest is the one platform with genuine uplift potential**: their public "Save" button URL scheme already pre-fills description; you could also pre-fill the **image URL** if you host the exported PNG somewhere temporarily (e.g. Vercel Blob), which would let Pinterest auto-attach the image instead of requiring manual upload
- If you ever want real auto-posting (not just opening + copy), that requires:
  1. OAuth app registration with each platform (Pinterest Developer, Meta for Developers)
  2. A way to host the exported image at a public URL (Vercel Blob, S3, Cloudinary)
  3. Server-side token storage (this is where a real database becomes necessary — Postgres/Neon/Supabase)
  - This is a meaningfully bigger project phase, not a quick add — worth scoping separately when you're ready

### Data persistence (if you outgrow localStorage)
- If you want users to keep designs across devices/browsers, or want a "My Designs" gallery that survives a cache clear, you'd need:
  - **Vercel Postgres or Neon** for storing designs (probably just JSON blobs + image URLs)
  - **A lightweight auth layer** — even just a magic-link or anonymous device-ID system, not necessarily full accounts
  - **Image hosting** (Vercel Blob is the simplest fit for a Vercel-deployed app)
  - This is also the prerequisite for any real analytics (likes/views/saves) from the platforms themselves, since that requires storing OAuth tokens tied to a user

### Monetization (matches your past projects — LinguaApp, URLBoost Pro)
- Given your Gumroad-listing pattern with LinguaApp, a similar model could work here: a free tier (current feature set) + a one-time-purchase "Pro" tier unlocking extra fonts, stock photo search, or batch design export
- Alternatively, a small affiliate/Gumroad page offering done-for-you design packs (pre-made backgrounds/templates) targeting your Pakistani/Urdu-speaking audience segment

---

## Known Limitations (by design, for now)
- Single design at a time — no gallery/multi-project support yet
- No real engagement analytics (likes/views/saves) — would require OAuth + database, intentionally deferred
- Facebook/Instagram require manual paste (no public share-intent URL exists for unauthenticated posting)
- Templates (the original 50 pre-built layouts) were removed in favor of the color/gradient/photo background system — old template files are still in the repo but unused
