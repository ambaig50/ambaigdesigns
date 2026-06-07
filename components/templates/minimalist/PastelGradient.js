export default function PastelGradient({ title, description }) {
  return (
    <div style={{ background: "linear-gradient(to bottom, #fceabb, #f8b500)", width: "600px", height: "900px", padding: "40px" }}>
      <h1 style={{ fontSize: "36px", fontWeight: "600" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px" }}>{description}</p>
    </div>
  );
}
