// pages/home.js
import { useState } from "react";
import dynamic from "next/dynamic";
import { getTemplateRegistry } from "../utils/loadTemplates";

export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState({ category: "minimalist", id: "bold" });

  const registry = getTemplateRegistry();
  const selectedTemplate = registry[selected.category].find(t => t.id === selected.id);

  // Dynamically import template component
  const TemplateComponent = dynamic(() => import(`${selectedTemplate.path}`));

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>AmbaigDesigns — Home</h1>

      {/* Input Fields */}
      <input
        type="text"
        placeholder="Enter Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: "block", marginBottom: "20px", width: "300px", padding: "8px" }}
      />
      <textarea
        placeholder="Enter Base Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ display: "block", marginBottom: "20px", width: "300px", height: "100px", padding: "8px" }}
      />

      {/* Category Selector */}
      <select
        value={selected.category}
        onChange={(e) => setSelected({ ...selected, category: e.target.value, id: registry[e.target.value][0].id })}
        style={{ display: "block", marginBottom: "20px", padding: "8px" }}
      >
        {Object.keys(registry).map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* Template Selector */}
      <select
        value={selected.id}
        onChange={(e) => setSelected({ ...selected, id: e.target.value })}
        style={{ display: "block", marginBottom: "20px", padding: "8px" }}
      >
        {registry[selected.category].map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      {/* Preview Area */}
      <div style={{ marginTop: "40px", border: "1px solid #ccc", padding: "20px" }}>
        <TemplateComponent title={title} description={description} />
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
