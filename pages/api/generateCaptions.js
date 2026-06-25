export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { title, description, lang = "english", tone = "engaging" } = req.body;

  if (!title && !description) {
    return res.status(400).json({ error: "Title or description required" });
  }

  // Language instruction
  const LANG_MAP = {
    english:     "Write all captions in English.",
    urdu:        "Write all captions in Urdu script (اردو). Use proper Urdu vocabulary appropriate for social media.",
    roman_urdu:  "Write all captions in Roman Urdu (Urdu words written in English letters, e.g. 'Bohat khoobsurat design hai!'). This is how Pakistani users commonly type on social media.",
    bilingual:   "Write each caption starting with one sentence in Urdu script, then continue in English. Mix both languages naturally as Pakistani social media users do.",
  };

  // Tone instruction
  const TONE_MAP = {
    engaging:     "Use an engaging, friendly tone that encourages interaction.",
    professional: "Use a professional, polished tone suitable for business or brand accounts. Avoid slang or emojis except sparingly.",
    playful:      "Use a fun, playful, energetic tone with emojis and light humour.",
    minimal:      "Use a minimal, clean tone. Short sentences. No filler words. Let the design speak.",
    inspirational:"Use an uplifting, motivational tone. Focus on inspiration and positivity.",
  };

  const langInstruction = LANG_MAP[lang] || LANG_MAP.english;
  const toneInstruction = TONE_MAP[tone] || TONE_MAP.engaging;

  // Template fallback (used when no API key, or Claude call fails)
  const makeFallback = () => {
    const base = `${title || "Design"} — ${description || ""}`;
    if (lang === "roman_urdu") return {
      pinterest: `✨ ${base} — Bohot khubsurat! Save kar lein baad mein! #Design #Creative #Inspiration`,
      facebook:  `Dekhen yeh beautiful design! ${base} 😍 Aap ka kya khayal hai? Comment mein batayein 👇`,
      instagram: `${base} ✨ Bohot pyara! #Design #Creative #Pakistani #Art #Aesthetic`,
      threads:   `${base} — Bohot achha laga! 🌟`,
    };
    if (lang === "urdu") return {
      pinterest: `✨ ${title || "ڈیزائن"} — ${description || ""} بعد میں دیکھنے کے لیے محفوظ کریں! #ڈیزائن #تخلیق`,
      facebook:  `یہ خوبصورت ڈیزائن دیکھیں! ${base} آپ کا کیا خیال ہے؟ 👇`,
      instagram: `${title || "ڈیزائن"} ✨ ${description || ""} #ڈیزائن #تخلیق #آرٹ`,
      threads:   `${base} — بہت خوبصورت! 🌟`,
    };
    return {
      pinterest: `✨ ${base} Save this for later! #Inspiration #Design #Creative`,
      facebook:  `Check out this ${title || "design"}! ${description || ""} What do you think? 👇`,
      instagram: `${title || ""} ✨ ${description || ""} #Design #Creative #Inspiration #Style`,
      threads:   `${base}`,
    };
  };

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
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Write 4 social media captions for a design/pin.

Title: ${title || "(none)"}
Description: ${description || "(none)"}

Language: ${langInstruction}
Tone: ${toneInstruction}

Return ONLY valid JSON (no markdown, no explanation) in exactly this format:
{
  "pinterest": "caption for Pinterest — focus on saving/inspiration, 2-3 relevant hashtags, max 500 chars",
  "facebook": "caption for Facebook — conversational, ask a question, max 400 chars",
  "instagram": "caption for Instagram — visual feel, 5-8 hashtags, max 300 chars",
  "threads": "caption for Threads — short, punchy, max 200 chars"
}`
          }]
        }),
      });
      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      return res.status(200).json(parsed);
    } catch (err) {
      console.error("Caption generation error:", err);
      // Fall through to template
    }
  }

  return res.status(200).json(makeFallback());
}
