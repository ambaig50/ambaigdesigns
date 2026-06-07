export default function QuoteBlock({ title, description }) {
  return (
    <div style={{ background: "#f9f9f9", width: "600px", height: "900px", display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
      <blockquote style={{ fontSize: "28px", fontStyle: "italic", borderLeft: "4px solid #000", paddingLeft: "20px" }}>
        {title}
      </blockquote>
      <p style={{ fontSize: "18px", marginTop: "20px" }}>{description}</p>
    </div>
  );
}
