export default function GrassField({ title, description }) {
  return (
    <div style={{ background: "#a5d6a7", width: "600px", height: "900px", padding: "30px", color: "#1b5e20" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>🌱</div>
    </div>
  );
}
