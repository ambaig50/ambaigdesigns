// pages/api/postToFacebook.js
export default async function handler(req, res) {
  const { caption } = req.body;
  // TODO: Connect to Facebook API
  res.status(200).json({ success: true, platform: "Facebook", caption });
}
