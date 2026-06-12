// pages/api/threadsCallback.js
export default async function handler(req, res) {
  const { code } = req.query;
  const clientId = process.env.THREADS_CLIENT_ID;
  const clientSecret = process.env.THREADS_CLIENT_SECRET;
  const redirectUri = "http://localhost:3000/api/threadsCallback";

  const tokenRes = await fetch(`https://graph.threads.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`);
  const tokenData = await tokenRes.json();

  // Save token securely (DB or server session
  console.log("Threads Access Token:", tokenData.access_token);

  res.send("Threads connected successfully!");
}
