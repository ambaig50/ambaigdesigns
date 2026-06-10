export default function BusinessCardOverlay({ title, description }) {
  return (
    <div style={{ background: "#f5f5f5", width: "600px", height: "900px", padding: "40px", border: "1px solid #000" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#000" }}>{title}</h1>
      <p style={{ fontSize: "16px", marginTop: "20px", color: "#444" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>🧾</div>
    </div>
  );
}
