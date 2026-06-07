export default function DarkThemeAccent({ title, description }) {
  return (
    <div style={{ background: "#1a1a1a", color: "#e0e0e0", width: "600px", height: "900px", padding: "40px" }}>
      <h1 style={{ fontSize: "36px", fontWeight: "bold", color: "#f8b500" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px" }}>{description}</p>
    </div>
  );
}
