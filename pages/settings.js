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
    // Call backend OAuth route for each platform
    await fetch(`/api/connect${platform}`, { method: "GET" });
    setStatus({ ...status, [platform]: true });
    alert(`${platform} connected successfully!`);
  };

  const disconnectPlatform = (platform) => {
    setStatus({ ...status, [platform]: false });
    alert(`${platform} disconnected.`);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>Integration Settings</h1>
      <p>Connect your accounts to enable posting.</p>

      {/* Pinterest */}
      <div style={{ marginTop: "20px" }}>
        <h3>Pinterest</h3>
        {status.pinterest ? (
          <button onClick={() => disconnectPlatform("pinterest")}>Disconnect</button>
        ) : (
          <button onClick={() => connectPlatform("pinterest")}>Connect Pinterest</button>
        )}
      </div>

      {/* Facebook */}
      <div style={{ marginTop: "20px" }}>
        <h3>Facebook</h3>
        {status.facebook ? (
          <button onClick={() => disconnectPlatform("facebook")}>Disconnect</button>
        ) : (
          <button onClick={() => connectPlatform("facebook")}>Connect Facebook</button>
        )}
      </div>

      {/* Instagram */}
      <div style={{ marginTop: "20px" }}>
        <h3>Instagram</h3>
        {status.instagram ? (
          <button onClick={() => disconnectPlatform("instagram")}>Disconnect</button>
        ) : (
          <button onClick={() => connectPlatform("instagram")}>Connect Instagram</button>
        )}
      </div>

      {/* Threads */}
      <div style={{ marginTop: "20px" }}>
        <h3>Threads</h3>
        {status.threads ? (
          <button onClick={() => disconnectPlatform("threads")}>Disconnect</button>
        ) : (
          <button onClick={() => connectPlatform("threads")}>Connect Threads</button>
        )}
      </div>
    </div>
  );
}
