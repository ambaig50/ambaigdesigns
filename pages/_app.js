import { useRouter } from "next/router";
import Head from "next/head";
import { useState, useEffect } from "react";
import "../styles/globals.css";

const NAV = [
  { href: "/home",      icon: "🎨", label: "Studio"    },
  { href: "/designs",   icon: "📁", label: "Designs"   },
  { href: "/captions",  icon: "✨", label: "Captions"  },
  { href: "/post",      icon: "📤", label: "Post"      },
  { href: "/settings",  icon: "⚙️",  label: "Settings"  },
];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [theme, setTheme] = useState("dark");

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("ambaig_theme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("ambaig_theme", next);
  };

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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="data:image/png;base64,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" alt="AmbaigDesigns" style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0 }} />
            <div>
              <h2 style={{ lineHeight: 1.1 }}>AmbaigDesigns</h2>
              <p>Create · Caption · Post</p>
            </div>
          </div>
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
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "8px 10px", borderRadius: 10, marginBottom: 10,
              border: "1px solid var(--border)", background: "var(--surface2)",
              color: "var(--text-muted)", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>{theme === "dark" ? "☀️" : "🌙"}</span>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
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
        {/* Theme toggle in mobile tab bar */}
        <button className="mobile-tab" onClick={toggleTheme}>
          <span className="mobile-tab-icon">{theme === "dark" ? "☀️" : "🌙"}</span>
          <span className="mobile-tab-label">{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
      </nav>
      </div>
    </>
  );
}
