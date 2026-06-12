// pages/api/connectPinterest.js
export default async function handler(req, res) {
  // TODO: Implement Pinterest OAuth flow
  res.status(200).json({ success: true, platform: "Pinterest" });
}
