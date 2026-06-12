// pages/captions.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Captions() {
  const router = useRouter();
  const { title, description, category, id } = router.query;
  const [captions, setCaptions] = useState({ pinterest: "", facebook: "", instagram: "", threads: "" });

  useEffect(() => {
    if (title && description) {
      fetch("/api/generateCaptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description })
      })
        .then(res => res.json())
        .then(data => setCaptions(data));
    }
  }, [title, description]);

  const goToPostManager = () => {
    router.push({
      pathname: "/post",
      query: { ...captions, category, id, title, description }
    });
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>AI Caption Generator</h1>
      <textarea value={captions.pinterest} onChange={(e) => setCaptions({ ...captions, pinterest: e.target.value })} />
      <textarea value={captions.facebook} onChange={(e) => setCaptions({ ...captions, facebook: e.target.value })} />
      <textarea value={captions.instagram} onChange={(e) => setCaptions({ ...captions, instagram: e.target.value })} />
      <textarea value={captions.threads} onChange={(e) => setCaptions({ ...captions, threads: e.target.value })} />
      <button onClick={goToPostManager}>Continue to Post Manager</button>
    </div>
  );
}
