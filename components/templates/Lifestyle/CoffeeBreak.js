export default function CoffeeBreak({ title, description }) {
  return (
    <div style={{ background: "#fff8f0", width: "600px", height: "900px", padding: "40px" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "600" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px" }}>{description}</p>
      <div style={{ marginTop: "50px", fontSize: "70px" }}>☕</div>
    </div>
  );
}
