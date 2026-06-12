// pages/analytics.js
import { useState, useEffect } from "react";

export default function Analytics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/getAnalytics");
      const result = await res.json();
      setData(result);
    };
    fetchData();
  }, []);

  // Function to download CSV
  const downloadReport = () => {
    const headers = ["Platform", "Likes", "Shares", "Comments", "Saves"];
    const rows = data.map(row => [row.platform, row.likes, row.shares, row.comments, row.saves]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analytics_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

      {/* Download Button */}
      <button
        onClick={downloadReport}
        style={{ marginTop: "30px", padding: "12px 24px", backgroundColor: "#1565c0", color: "#fff", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
      >
        Download Analytics Report (CSV)
      </button>
    </div>
  );
}
