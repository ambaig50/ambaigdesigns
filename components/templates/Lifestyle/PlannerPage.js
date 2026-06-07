export default function PlannerPage({ title, description }) {
  return (
    <div style={{ background: "#fff", width: "600px", height: "900px", border: "1px dashed #000", padding: "20px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>{title}</h1>
      <p style={{ fontSize: "16px", marginTop: "20px" }}>{description}</p>
      <div style={{ marginTop: "30px", fontSize: "50px" }}>📅</div>
    </div>
  );
}
