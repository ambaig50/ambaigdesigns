// pages/api/connectThreads.js
export default async function handler(req, res) {
  // TODO: Implement Threads OAuth flow
  res.status(200).json({ success: true, platform: "Threads" });
}
