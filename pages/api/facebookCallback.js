// pages/api/facebookCallback.js
export default async function handler(req, res) {
  const { code } = req.query;
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
  const redirectUri = "http://localhost:3000/api/facebookCallback";

  const tokenRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`);
  const tokenData = await tokenRes.json();

  // Save token securely (DB or server session)
  console.log("Facebook Access Token:", tokenData.access_token);

  res.send("Facebook connected successfully!");
}
