import { useRouter } from "next/router";
import "../styles/globals.css";

const NAV = [
  { href: "/home",      icon: "🎨", label: "Design Studio" },
  { href: "/captions",  icon: "✨", label: "AI Captions"   },
  { href: "/post",      icon: "📤", label: "Post Manager"  },
  { href: "/analytics", icon: "📊", label: "Analytics"     },
  { href: "/settings",  icon: "⚙️",  label: "Settings"     },
];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isIndex = router.pathname === "/";

  if (isIndex) return <Component {...pageProps} />;

  return (
    <div className="app-shell">
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
              {label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
            AmbaigDesigns v1.0
          </p>
        </div>
      </aside>
      <main className="main-content">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
