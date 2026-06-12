// pages/home.js
import { useState } from "react";
import dynamic from "next/dynamic";
import { getTemplateRegistry } from "../utils/loadTemplates";
import { useRouter } from "next/router";

export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState({ category: "minimalist", id: "bold" });
  const router = useRouter();

  const registry = getTemplateRegistry();
  const selectedTemplate = registry[selected.category].find(t => t.id === selected.id);
  const TemplateComponent = dynamic(() => import(`${selectedTemplate.path}`));

  const goToCaptions = () => {
    router.push({
      pathname: "/captions",
      query: { title, description, category: selected.category, id: selected.id }
    });
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>AmbaigDesigns — Home</h1>

      <input type="text" placeholder="Enter Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="Enter Base Description" value={description} onChange={(e) => setDescription(e.target.value)} />

      <select value={selected.category} onChange={(e) => setSelected({ ...selected, category: e.target.value, id: registry[e.target.value][0].id })}>
        {Object.keys(registry).map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </select>

      <select value={selected.id} onChange={(e) => setSelected({ ...selected, id: e.target.value })}>
        {registry[selected.category].map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <div style={{ marginTop: "20px" }}>
        <TemplateComponent title={title} description={description} />
      </div>

      <button onClick={goToCaptions}>Generate Captions</button>
    </div>
  );
}
