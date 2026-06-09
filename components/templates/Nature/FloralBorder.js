export default function FloralBorder({ title, description }) {
  return (
    <div style={{ background: "#fff", width: "600px", height: "900px", border: "10px solid pink", padding: "30px" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "bold", color: "#d81b60" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px", color: "#444" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>🌸🌺🌼</div>
    </div>
  );
}
