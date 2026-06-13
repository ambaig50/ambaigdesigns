// pages/api/pinterestRefresh.js
export default async function handler(req, res) {
  const refreshToken = "stored_refresh_token"; // save this when user first connects

  const response = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.PINTEREST_CLIENT_ID,
      client_secret: process.env.PINTEREST_CLIENT_SECRET
    })
  });

  const data = await response.json();
  console.log("New Pinterest access token:", data.access_token);

  res.json({ success: true, token: data.access_token });
}
