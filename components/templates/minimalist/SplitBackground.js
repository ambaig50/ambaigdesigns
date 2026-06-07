export default function SplitBackground({ title, description }) {
  return (
    <div style={{ display: "flex", width: "600px", height: "900px" }}>
      <div style={{ flex: 1, background: "#fff", padding: "20px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>{title}</h1>
      </div>
      <div style={{ flex: 1, background: "#000", color: "#fff", padding: "20px" }}>
        <p style={{ fontSize: "18px" }}>{description}</p>
      </div>
    </div>
  );
}
