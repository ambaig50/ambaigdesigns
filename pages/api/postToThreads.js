// pages/api/postToThreads.js
export default async function handler(req, res) {
  const { caption } = req.body;
  const accessToken = process.env.META_ACCESS_TOKEN;

  const response = await fetch(`https://graph.facebook.com/v18.0/{threads_user_id}/threads`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${accessToken}` },
    body: new URLSearchParams({ text: caption })
  });

  const data = await response.json();
  res.status(200).json({ success: true, platform: "Threads", data });
}
