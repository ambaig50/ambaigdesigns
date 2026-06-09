export default function SunsetGradient({ title, description }) {
  return (
    <div style={{ background: "linear-gradient(to top, #ff7043, #fdd835)", width: "600px", height: "900px", padding: "30px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#fff" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px", color: "#fffde7" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>🌇</div>
    </div>
  );
}
