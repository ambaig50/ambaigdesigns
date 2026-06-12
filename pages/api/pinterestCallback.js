// pages/api/pinterestCallback.js
export default async function handler(req, res) {
  const { code } = req.query;
  const clientId = process.env.PINTEREST_CLIENT_ID;
  const clientSecret = process.env.PINTEREST_CLIENT_SECRET;
  const redirectUri = "http://localhost:3000/api/pinterestCallback";

  const tokenRes = await fetch(`https://graph.pinterest.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`);
  const tokenData = await tokenRes.json();

  // Save token securely (DB or server session)
  console.log("Pinterest Access Token:", tokenData.access_token);

  res.send("Pinterest connected successfully!");
}
