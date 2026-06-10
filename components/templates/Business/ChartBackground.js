export default function ChartBackground({ title, description }) {
  return (
    <div style={{ background: "#f5f5f5", width: "600px", height: "900px", padding: "30px", border: "2px solid #ccc" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "bold", color: "#212121" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>📊</div>
    </div>
  );
}
