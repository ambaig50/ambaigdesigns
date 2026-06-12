// pages/api/connectPinterest.js
export default async function handler(req, res) {
  const clientId = process.env.PINTEREST_CLIENT_ID;
  const redirectUri = "http://localhost:3000/api/pinterestCallback";

  const authUrl = `https://www.pinterest.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=pages_manage_posts,pages_read_engagement`;

  res.redirect(authUrl);
}
