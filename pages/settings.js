// pages/settings.js
import { useState } from "react";

export default function Settings() {
  const [status, setStatus] = useState({
    pinterest: false,
    facebook: false,
    instagram: false,
    threads: false
  });

  const connectPlatform = async (platform) => {
    window.location.href = `/api/connect${platform}`; // Redirect to OAuth
  };

  const disconnectPlatform = (platform) => {
    setStatus({ ...status, [platform]: false });
    alert(`${platform} disconnected.`);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Integration Settings</h1>
      <p>Connect your accounts to enable posting.</p>

      {["pinterest", "facebook", "instagram", "threads"].map((platform) => (
        <div key={platform} style={{ marginTop: "20px" }}>
          <h3>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h3>
          {status[platform] ? (
            <button onClick={() => disconnectPlatform(platform)}>Disconnect</button>
          ) : (
            <button onClick={() => connectPlatform(platform)}>Connect {platform}</button>
          )}
        </div>
      ))}
    </div>
  );
}
