export default function MountainSilhouette({ title, description }) {
  return (
    <div style={{ background: "linear-gradient(to top, #37474f, #90a4ae)", width: "600px", height: "900px", padding: "30px" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "bold", color: "#fff" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "20px", color: "#eceff1" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>⛰️</div>
    </div>
  );
}
