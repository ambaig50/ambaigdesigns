export default function DarkProfessional({ title, description }) {
  return (
    <div style={{ background: "#212121", width: "600px", height: "900px", padding: "40px", color: "#e0e0e0" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#f8b500" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px" }}>{description}</p>
    </div>
  );
}
