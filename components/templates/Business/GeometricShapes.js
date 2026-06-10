export default function GeometricShapes({ title, description }) {
  return (
    <div style={{ background: "linear-gradient(135deg, #2196f3 25%, #f5f5f5 25%, #f5f5f5 50%, #2196f3 50%, #2196f3 75%, #f5f5f5 75%, #f5f5f5)", backgroundSize: "40px 40px", width: "600px", height: "900px", padding: "30px" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "bold", color: "#000" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px", color: "#333" }}>{description}</p>
    </div>
  );
}
