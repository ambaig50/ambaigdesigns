// pages/api/connectFacebook.js
export default async function handler(req, res) {
  // TODO: Implement Facebook OAuth flow
  res.status(200).json({ success: true, platform: "Facebook" });
}
