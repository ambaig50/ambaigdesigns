export default function CircleBadge({ title, description }) {
  return (
    <div style={{ background: "#fff", width: "600px", height: "900px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "200px", height: "200px", borderRadius: "50%", background: "#000", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "24px", fontWeight: "bold" }}>
        {title}
      </div>
      <p style={{ fontSize: "18px", marginTop: "30px" }}>{description}</p>
    </div>
  );
}
