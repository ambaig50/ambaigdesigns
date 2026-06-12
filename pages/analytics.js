// pages/analytics.js
import { useState, useEffect } from "react";

export default function Analytics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch analytics data from backend
    const fetchData = async () => {
      const res = await fetch("/api/getAnalytics");
      const result = await res.json();
      setData(result);
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>Analytics Dashboard</h1>
      <p>Track engagement across Pinterest, Facebook, Instagram, and Threads.</p>

      {/* Table of Metrics */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5" }}>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Platform</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Likes</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Shares</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Comments</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Saves</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{row.platform}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{row.likes}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{row.shares}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{row.comments}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{row.saves}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
