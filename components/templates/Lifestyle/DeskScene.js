export default function DeskScene({ title, description }) {
  return (
    <div style={{ background: "#fdfdfd", width: "600px", height: "900px", padding: "40px", border: "2px solid #ccc" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>📝</div>
    </div>
  );
}
