// pages/post.js
import { useRouter } from "next/router";
import { useState } from "react";

export default function PostManager() {
  const router = useRouter();
  const { pinterest, facebook, instagram, threads, title, description, category, id } = router.query;

  const [platforms, setPlatforms] = useState({ pinterest: false, facebook: false, instagram: false, threads: false });
  const [history, setHistory] = useState([]);

  const togglePlatform = (p) => setPlatforms({ ...platforms, [p]: !platforms[p] });

  const postNow = async () => {
    const selected = Object.keys(platforms).filter(p => platforms[p]);
    for (let platform of selected) {
      await fetch(`/api/postTo${platform}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: router.query[platform], title, description, category, id })
      });
    }
    setHistory([...history, { date: new Date().toLocaleString(), platforms: selected }]);
    alert("Posted successfully!");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Post Manager</h1>
      <label><input type="checkbox" checked={platforms.pinterest} onChange={() => togglePlatform("pinterest")} /> Pinterest</label>
      <label><input type="checkbox" checked={platforms.facebook} onChange={() => togglePlatform("facebook")} /> Facebook</label>
      <label><input type="checkbox" checked={platforms.instagram} onChange={() => togglePlatform("instagram")} /> Instagram</label>
      <label><input type="checkbox" checked={platforms.threads} onChange={() => togglePlatform("threads")} /> Threads</label>

      <button onClick={postNow}>Post Now</button>

      <h3>Posting History</h3>
      <ul>{history.map((h, i) => <li key={i}>{h.date} → {h.platforms.join(", ")}</li>)}</ul>
    </div>
  );
}
