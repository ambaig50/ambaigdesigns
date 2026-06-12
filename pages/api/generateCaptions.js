// pages/api/generateCaptions.js
export default async function handler(req, res) {
  const { title, description } = req.body;

  // Mock AI captions (replace with OpenAI or other AI API)
  const captions = {
    pinterest: `Save this ${title} 🌿✨ — ${description}`,
    facebook: `Check out this ${title}! ${description}`,
    instagram: `${title} vibes ✨☕ #Foodie #Lifestyle`,
    threads: `${title} — quick thoughts: ${description}`
  };

  res.status(200).json(captions);
}
