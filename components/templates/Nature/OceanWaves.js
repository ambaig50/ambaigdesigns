export default function OceanWaves({ title, description }) {
  return (
    <div style={{ background: "linear-gradient(to bottom, #0288d1, #e1f5fe)", width: "600px", height: "900px", padding: "30px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#fff" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px", color: "#e0f7fa" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>🌊</div>
    </div>
  );
}
