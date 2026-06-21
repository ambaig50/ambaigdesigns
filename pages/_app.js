import { useRouter } from "next/router";
import Head from "next/head";
import "../styles/globals.css";

const NAV = [
  { href: "/home",      icon: "🎨", label: "Studio"   },
  { href: "/captions",  icon: "✨", label: "Captions" },
  { href: "/post",      icon: "📤", label: "Post"     },
  { href: "/settings",  icon: "⚙️",  label: "Settings" },
];

export default function App({ Component, pageProps }) {
  const router = useRouter();

  const defaultHead = (
    <Head>
      <title>AmbaigDesigns — Create, Caption, Post</title>
      <meta name="description" content="Free pin and mockup design tool. Create, caption with AI, and post to Pinterest, Facebook, Instagram, and Threads — no sign-up required." />
      <meta property="og:title" content="AmbaigDesigns" />
      <meta property="og:description" content="Create pins and mockups, generate AI captions, and post to your favorite platforms — free, no account needed." />
      <meta property="og:type" content="website" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  );

  if (router.pathname === "/") return <>{defaultHead}<Component {...pageProps} /></>;

  return (
    <>
      {defaultHead}
      <div className="app-shell">
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>AmbaigDesigns</h2>
          <p>Create · Caption · Post</p>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ href, icon, label }) => (
            <button
              key={href}
              className={`nav-item ${router.pathname === href ? "active" : ""}`}
              onClick={() => router.push(href)}
            >
              <span className="icon">{icon}</span>
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>AmbaigDesigns v1.0</p>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <Component {...pageProps} />
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="mobile-tabs">
        {NAV.map(({ href, icon, label }) => (
          <button
            key={href}
            className={`mobile-tab ${router.pathname === href ? "active" : ""}`}
            onClick={() => router.push(href)}
          >
            <span className="mobile-tab-icon">{icon}</span>
            <span className="mobile-tab-label">{label}</span>
          </button>
        ))}
      </nav>
      </div>
    </>
  );
}
