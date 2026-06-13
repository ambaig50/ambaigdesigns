// pages/api/instagramCallback.js
export default async function handler(req, res) {
  const { code } = req.query;

  // Step 1: Exchange code for short-lived token
  const tokenRes = await fetch(
    `https://graph.instagram.com/v18.0/oauth/access_token?client_id=${process.env.META_CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&client_secret=${process.env.META_CLIENT_SECRET}&code=${code}`
  );
  const shortToken = await tokenRes.json();

  // Step 2: Exchange short-lived token for long-lived token
  const longRes = await fetch(
    `https://graph.instagram.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_CLIENT_ID}&client_secret=${process.env.META_CLIENT_SECRET}&fb_exchange_token=${shortToken.access_token}`
  );
  const longToken = await longRes.json();

  // Save longToken.access_token securely (DB or env for testing)
  console.log("Long-lived Meta token:", longToken.access_token);

  res.send("instagram connected with long-lived token!");
}
