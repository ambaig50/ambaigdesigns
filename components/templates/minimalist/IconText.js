export default function IconText({ title, description }) {
  return (
    <div style={{ background: "#fff", width: "600px", height: "900px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div style={{ fontSize: "60px" }}>★</div>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginTop: "20px" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "10px" }}>{description}</p>
    </div>
  );
}
