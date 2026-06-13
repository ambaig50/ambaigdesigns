// pages/api/postToPinterest.js
export default async function handler(req, res) {
  const { caption, title, description } = req.body;
  const accessToken = process.env.PINTEREST_ACCESS_TOKEN; // stored after OAuth

  const response = await fetch("https://api.pinterest.com/v5/pins", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      board_id: "your_board_id",
      title,
      description: caption,
      media_source: { source_type: "image_url", url: "https://your-image-url.com" }
    })
  });

  const data = await response.json();
  res.status(200).json({ success: true, platform: "Pinterest", data });
}
