export default function PresentationSlide({ title, description }) {
  return (
    <div style={{ background: "#fff", width: "600px", height: "900px", padding: "40px", border: "5px solid #2196f3" }}>
      <h1 style={{ fontSize: "34px", fontWeight: "bold", color: "#2196f3" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px", color: "#333" }}>{description}</p>
    </div>
  );
}
