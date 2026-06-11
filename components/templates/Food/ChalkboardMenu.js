export default function ChalkboardMenu({ title, description }) {
  return (
    <div style={{ background: "#212121", width: "600px", height: "900px", padding: "30px", color: "#fff" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", fontFamily: "cursive" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px", fontFamily: "cursive" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>📝</div>
    </div>
  );
}
