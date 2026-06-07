export default function WorkspacePlants({ title, description }) {
  return (
    <div style={{ background: "#f0fff0", width: "600px", height: "900px", padding: "30px" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "bold" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>💻🌿</div>
    </div>
  );
}
