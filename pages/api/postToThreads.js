// pages/api/postToThreads.js
export default async function handler(req, res) {
  const { caption } = req.body;
  // TODO: Connect to Threads API
  res.status(200).json({ success: true, platform: "Threads", caption });
}
