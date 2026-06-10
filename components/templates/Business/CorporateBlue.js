export default function CorporateBlue({ title, description }) {
  return (
    <div style={{ background: "#1565c0", color: "#fff", width: "600px", height: "900px", padding: "40px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px" }}>{description}</p>
    </div>
  );
}
