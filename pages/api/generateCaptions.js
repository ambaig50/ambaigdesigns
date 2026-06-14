export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { title, description } = req.body;

  if (!title && !description) {
    return res.status(400).json({ error: "Title or description required" });
  }

  // If Anthropic API key is available, use Claude for real captions
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 800,
          messages: [{
            role: "user",
            content: `Write 4 social media captions for the following design/pin.
Title: ${title}
Description: ${description}

Return ONLY valid JSON (no markdown) in this exact format:
{
  "pinterest": "caption for Pinterest (focus on saving/inspiration, use 2-3 hashtags, max 500 chars)",
  "facebook": "caption for Facebook (conversational, engaging, ask a question, max 400 chars)",
  "instagram": "caption for Instagram (visual, emojis, 5-8 hashtags, max 300 chars)",
  "threads": "caption for Threads (short, punchy, conversational, max 200 chars)"
}`
          }]
        }),
      });
      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      return res.status(200).json(parsed);
    } catch (err) {
      console.error("Claude caption error:", err);
      // Fall through to template captions
    }
  }

  // Fallback: template-based captions (no API key needed)
  const captions = {
    pinterest: `✨ ${title} — ${description} Save this for later! #Inspiration #Design #Creative`,
    facebook: `Check out this ${title}! ${description} What do you think? Let us know in the comments 👇`,
    instagram: `${title} ✨ ${description} #Design #Creative #Inspiration #Style #Aesthetic`,
    threads: `${title} — ${description}`,
  };
  return res.status(200).json(captions);
}
