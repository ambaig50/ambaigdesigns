export default function RusticTable({ title, description }) {
  return (
    <div style={{ background: "#6d4c41", width: "600px", height: "900px", padding: "30px", color: "#fff3e0" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "bold" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>🥖🍷</div>
    </div>
  );
}
