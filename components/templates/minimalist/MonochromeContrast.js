export default function MonochromeContrast({ title, description }) {
  return (
    <div style={{ background: "#000", color: "#fff", width: "600px", height: "900px", padding: "40px" }}>
      <h1 style={{ fontSize: "40px", fontWeight: "bold" }}>{title}</h1>
      <p style={{ fontSize: "20px", marginTop: "20px" }}>{description}</p>
    </div>
  );
}
