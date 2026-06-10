export default function OfficeDesk({ title, description }) {
  return (
    <div style={{ background: "#eeeeee", width: "600px", height: "900px", padding: "30px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#424242" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "15px" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>💼</div>
    </div>
  );
}
