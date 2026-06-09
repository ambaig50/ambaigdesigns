export default function LeafPattern({ title, description }) {
  return (
    <div style={{ background: "#e8f5e9", width: "600px", height: "900px", padding: "30px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#2e7d32" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>🍃</div>
    </div>
  );
}
