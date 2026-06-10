export default function InfographicStyle({ title, description }) {
  return (
    <div style={{ background: "#fafafa", width: "600px", height: "900px", padding: "30px", border: "2px solid #000" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#212121" }}>{title}</h1>
      <p style={{ fontSize: "16px", marginTop: "20px", color: "#424242" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>📈📉</div>
    </div>
  );
}
