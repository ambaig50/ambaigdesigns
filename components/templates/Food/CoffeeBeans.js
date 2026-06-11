export default function CoffeeBeans({ title, description }) {
  return (
    <div style={{ background: "#3e2723", width: "600px", height: "900px", padding: "30px", color: "#fff" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "bold" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>☕</div>
    </div>
  );
}
