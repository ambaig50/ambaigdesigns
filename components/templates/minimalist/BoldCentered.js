export default function BoldCentered({ title, description }) {
  return (
    <div style={{ background: "#fff", width: "600px", height: "900px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", border: "2px solid #000" }}>
      <h1 style={{ fontSize: "40px", fontWeight: "bold" }}>{title}</h1>
      <p style={{ fontSize: "20px", marginTop: "20px" }}>{description}</p>
    </div>
  );
}
