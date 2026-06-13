// pages/api/postToInstagram.js
export default async function handler(req, res) {
  const { caption } = req.body;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  const response = await fetch(`https://graph.facebook.com/v18.0/{instagram_business_account_id}/media`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${accessToken}` },
    body: JSON.stringify({
      image_url: "https://your-image-url.com",
      caption
    })
  });

  const data = await response.json();
  res.status(200).json({ success: true, platform: "Instagram", data });
}
