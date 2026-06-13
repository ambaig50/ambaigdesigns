// pages/api/connectThreads.js
export default async function handler(req, res) {
  const clientId = process.env.META_CLIENT_ID;
  const redirectUri = "http://localhost:3000/api/threadsCallback";

  const authUrl = `https://www.threads.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=pages_manage_posts,pages_read_engagement`;

  res.redirect(authUrl);
}
