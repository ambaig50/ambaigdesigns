export default function IngredientsFlatLay({ title, description }) {
  return (
    <div style={{ background: "#fef9e7", width: "600px", height: "900px", padding: "30px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#6d4c41" }}>{title}</h1>
      <p style={{ fontSize: "18px", marginTop: "15px" }}>{description}</p>
      <div style={{ marginTop: "40px", fontSize: "60px" }}>🥕🌶️🍋</div>
    </div>
  );
}
