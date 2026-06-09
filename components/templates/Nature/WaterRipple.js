export default function WaterRipple({ title, description }) {
  return (
    <div style={{ background: "radial-gradient(circle, #bbdefb, #0d47a1)", width: "600px", height: "900px", padding: "30px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#fff" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px", color: "#e3f2fd" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>💧</div>
    </div>
  );
}
