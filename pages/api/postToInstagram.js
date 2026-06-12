// pages/api/postToInstagram.js
export default async function handler(req, res) {
  const { caption } = req.body;
  // TODO: Connect to Instagram API
  res.status(200).json({ success: true, platform: "Instagram", caption });
}
