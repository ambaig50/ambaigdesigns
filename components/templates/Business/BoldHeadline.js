export default function BoldHeadline({ title, description }) {
  return (
    <div style={{ background: "#fff", width: "600px", height: "900px", padding: "40px", borderTop: "10px solid #000" }}>
      <h1 style={{ fontSize: "36px", fontWeight: "bold" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px" }}>{description}</p>
    </div>
  );
}
