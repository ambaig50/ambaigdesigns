export default function GridLayout({ title, description }) {
  return (
    <div style={{ background: "#f5f5f5", width: "600px", height: "900px", display: "grid", gridTemplateRows: "1fr 1fr", padding: "20px" }}>
      <div style={{ border: "1px solid #000", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>{title}</h1>
      </div>
      <div style={{ border: "1px solid #000", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ fontSize: "18px" }}>{description}</p>
      </div>
    </div>
  );
}
