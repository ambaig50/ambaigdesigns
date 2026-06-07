export default function UnderlineAccent({ title, description }) {
  return (
    <div style={{ background: "#fff", width: "600px", height: "900px", padding: "40px" }}>
      <h1 style={{ fontSize: "36px", fontWeight: "bold", borderBottom: "4px solid #000", display: "inline-block" }}>
        {title}
      </h1>
      <p style={{ fontSize: "18px", marginTop: "30px" }}>{description}</p>
    </div>
  );
}
