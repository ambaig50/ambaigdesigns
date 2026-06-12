// pages/captions.js
import { useState } from "react";

export default function Captions() {
  const [captions, setCaptions] = useState({
    pinterest: "",
    facebook: "",
    instagram: "",
    threads: ""
  });

  const [loading, setLoading] = useState(false);

  const generateCaptions = async () => {
    setLoading(true);
    const res = await fetch("/api/generateCaptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Sample Title", description: "Sample Description" })
    });
    const data = await res.json();
    setCaptions(data);
    setLoading(false);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>AI Caption Generator</h1>
      <p>Platform‑specific captions generated from your design.</p>

      <button
        onClick={generateCaptions}
        style={{ marginBottom: "20px", padding: "10px 20px", backgroundColor: "#1565c0", color: "#fff", border: "none", cursor: "pointer" }}
      >
        {loading ? "Generating..." : "Generate Captions"}
      </button>

      {/* Editable Captions */}
      <div style={{ marginTop: "20px" }}>
        <h3>Pinterest</h3>
        <textarea value={captions.pinterest} onChange={(e) => setCaptions({ ...captions, pinterest: e.target.value })} style={{ width: "100%", height: "80px" }} />

        <h3>Facebook</h3>
        <textarea value={captions.facebook} onChange={(e) => setCaptions({ ...captions, facebook: e.target.value })} style={{ width: "100%", height: "80px" }} />

        <h3>Instagram</h3>
        <textarea value={captions.instagram} onChange={(e) => setCaptions({ ...captions, instagram: e.target.value })} style={{ width: "100%", height: "80px" }} />

        <h3>Threads</h3>
        <textarea value={captions.threads} onChange={(e) => setCaptions({ ...captions, threads: e.target.value })} style={{ width: "100%", height: "80px" }} />
      </div>

      {/* Continue Button */}
      <button
        style={{ marginTop: "30px", padding: "12px 24px", backgroundColor: "#43a047", color: "#fff", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
        onClick={() => alert("Proceeding to Post Manager Page...")}
      >
        Continue to Post Manager
      </button>
    </div>
  );
}
