// pages/api/connectInstagram.js
export default async function handler(req, res) {
  // TODO: Implement Instagram OAuth flow
  res.status(200).json({ success: true, platform: "Instagram" });
}
