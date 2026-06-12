// pages/home.js
import { useState } from "react";

// Import templates from all categories
import BoldCentered from "../components/templates/minimalist/BoldCentered";
import DeskScene from "../components/templates/lifestyle/DeskScene";
import LeafPattern from "../components/templates/nature/LeafPattern";
import CorporateBlue from "../components/templates/business/CorporateBlue";
import StyledDish from "../components/templates/food/StyledDish";

export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState("bold");

  // Template registry
  const templates = {
    bold: BoldCentered,
    desk: DeskScene,
    leaf: LeafPattern,
    corporate: CorporateBlue,
    dish: StyledDish,
    // Add all other templates here
  };

  const SelectedTemplate = templates[selected];

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <h1 style={{ marginBottom: "20px" }}>AmbaigDesigns — Home</h1>

      {/* Input Fields */}
      <label>Title:</label>
      <input
        type="text"
        placeholder="Enter Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: "block", marginBottom: "20px", width: "300px", padding: "8px" }}
      />

      <label>Description:</label>
      <textarea
        placeholder="Enter Base Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ display: "block", marginBottom: "20px", width: "300px", height: "100px", padding: "8px" }}
      />

      {/* Template Selector */}
      <label>Select Template:</label>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        style={{ display: "block", marginBottom: "20px", padding: "8px" }}
      >
        <option value="bold">Minimalist — Bold Centered</option>
        <option value="desk">Lifestyle — Desk Scene</option>
        <option value="leaf">Nature — Leaf Pattern</option>
        <option value="corporate">Business — Corporate Blue</option>
        <option value="dish">Food — Styled Dish Plate</option>
        {/* Add all other templates here */}
      </select>

      {/* Preview Area */}
      <div style={{ marginTop: "40px", border: "1px solid #ccc", padding: "20px" }}>
        <SelectedTemplate title={title} description={description} />
      </div>

      {/* Generate Captions Button */}
      <button
        style={{
          marginTop: "30px",
          padding: "12px 24px",
          backgroundColor: "#1565c0",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold"
        }}
        onClick={() => alert("Captions will be generated on the Caption Generator Page")}
      >
        Generate Captions
      </button>
    </div>
  );
}
