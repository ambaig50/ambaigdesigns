// pages/api/postToFacebook.js
export default async function handler(req, res) {
  const { caption } = req.body;
  const accessToken = process.env.META_ACCESS_TOKEN;

  const response = await fetch(`https://graph.facebook.com/v18.0/{page_id}/feed`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${accessToken}` },
    body: new URLSearchParams({ message: caption })
  });

  const data = await response.json();
  res.status(200).json({ success: true, platform: "Facebook", data });
}
