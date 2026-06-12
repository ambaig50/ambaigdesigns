// pages/post.js
import { useState } from "react";

export default function PostManager() {
  const [platforms, setPlatforms] = useState({
    pinterest: false,
    facebook: false,
    instagram: false,
    threads: false
  });

  const [captions, setCaptions] = useState({
    pinterest: "Save this cozy chai recipe 🌿✨",
    facebook: "Who else loves cinnamon in their tea?",
    instagram: "Spiced chai vibes ☕🍂 #TeaTime",
    threads: "Rainy day + chai = happiness 🌧️☕"
  });

  const [history, setHistory] = useState([]);

  const togglePlatform = (platform) => {
    setPlatforms({ ...platforms, [platform]: !platforms[platform] });
  };

  const postNow = async () => {
    const selected = Object.keys(platforms).filter((p) => platforms[p]);
    for (let platform of selected) {
      // Call backend API route for each platform
      await fetch(`/api/postTo${platform}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: captions[platform] })
      });
    }
    setHistory([...history, { date: new Date().toLocaleString(), platforms: selected }]);
    alert("Posted successfully!");
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>Post Manager</h1>
      <p>Select platforms and publish your design.</p>

      {/* Platform Checkboxes */}
      <div>
        <label><input type="checkbox" checked={platforms.pinterest} onChange={() => togglePlatform("pinterest")} /> Pinterest</label><br />
        <label><input type="checkbox" checked={platforms.facebook} onChange={() => togglePlatform("facebook")} /> Facebook</label><br />
        <label><input type="checkbox" checked={platforms.instagram} onChange={() => togglePlatform("instagram")} /> Instagram</label><br />
        <label><input type="checkbox" checked={platforms.threads} onChange={() => togglePlatform("threads")} /> Threads</label>
      </div>

      {/* Captions Preview */}
      <div style={{ marginTop: "20px" }}>
        <h3>Captions</h3>
        <p><b>Pinterest:</b> {captions.pinterest}</p>
        <p><b>Facebook:</b> {captions.facebook}</p>
        <p><b>Instagram:</b> {captions.instagram}</p>
        <p><b>Threads:</b> {captions.threads}</p>
      </div>

      {/* Post Button */}
      <button
        onClick={postNow}
        style={{ marginTop: "30px", padding: "12px 24px", backgroundColor: "#43a047", color: "#fff", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
      >
        Post Now
      </button>

      {/* History */}
      <div style={{ marginTop: "40px" }}>
        <h3>Posting History</h3>
        <ul>
          {history.map((h, i) => (
            <li key={i}>{h.date} → {h.platforms.join(", ")}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
