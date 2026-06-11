export default function KitchenCounterFood({ title, description }) {
  return (
    <div style={{ background: "#fffde7", width: "600px", height: "900px", padding: "30px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#f57f17" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "15px" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>🍳🥘</div>
    </div>
  );
}
