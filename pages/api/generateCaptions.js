export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { title, description, lang = "english", tone = "engaging" } = req.body;

  if (!title && !description) {
    return res.status(400).json({ error: "Title or description required" });
  }

  // Very explicit language instructions with examples
  const LANG_INSTRUCTIONS = {
    english: `Write ALL captions entirely in English.`,

    urdu: `Write ALL captions entirely in Urdu script (اردو). Do NOT include any English words except brand names or hashtags.
Example style: "یہ ڈیزائن بہت خوبصورت ہے! اپنے دوستوں کے ساتھ شیئر کریں۔ #ڈیزائن #تخلیق"`,

    roman_urdu: `Write ALL captions entirely in Roman Urdu — Urdu language written with English alphabet letters. Do NOT write in Urdu script. Do NOT write in English.
Example style: "Yeh design bohot khoobsurat hai! Apne doston ke saath share karo. Save kar lo baad ke liye! #Design #Creative"`,

    bilingual: `Write ALL captions in a MIX of Urdu script AND English — switching between both languages in the same caption, exactly how Pakistani social media users write.
IMPORTANT: Every caption MUST contain both Urdu script words AND English words mixed together.
Example style: "یہ design واقعی bohot amazing ہے! Save کریں for later اور اپنے friends کو بھی share کریں! ✨ #Design #تخلیق #Creative"`,
  };

  // Explicit tone instructions
  const TONE_INSTRUCTIONS = {
    engaging:     `Tone: Warm, friendly, conversational. Ask the audience a question. Encourage saving, sharing, or commenting. Use a few relevant emojis.`,
    professional: `Tone: Professional and polished. Suitable for a business or brand. No slang. Minimal emojis (max 1-2). Focus on value and quality.`,
    playful:      `Tone: Fun, energetic, and playful! Use exclamation marks, fun emojis 🎉✨😍, and light humour. Make it feel exciting and youthful.`,
    minimal:      `Tone: Minimal and clean. Very short sentences. No filler words. No excessive emojis — maximum 1. Let the design speak for itself.`,
    inspirational:`Tone: Uplifting and motivational. Focus on positivity, growth, and inspiration. Use powerful words that resonate emotionally.`,
  };

  const langInstruction = LANG_INSTRUCTIONS[lang] || LANG_INSTRUCTIONS.english;
  const toneInstruction = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.engaging;

  // Fallback templates per language
  const makeFallback = () => {
    const base = `${title || "Design"} — ${description || ""}`;
    if (lang === "roman_urdu") return {
      pinterest: `✨ Yeh ${title || "design"} bohot khoobsurat hai! ${description || ""} Save kar lo baad ke liye! #Design #Creative #Inspiration`,
      facebook:  `Dekho yeh zabardast ${title || "design"}! ${description || ""} Aap ka kya khayal hai? Comment mein batao 👇`,
      instagram: `${title || "Design"} ✨ ${description || ""} Bohot pyara! #Design #Creative #Pakistani #Art #Aesthetic #Khoobsurat`,
      threads:   `${title || "Design"} — ${description || ""} Bohot achha laga! 🌟`,
    };
    if (lang === "urdu") return {
      pinterest: `✨ ${title || "ڈیزائن"} — ${description || ""} بعد میں دیکھنے کے لیے محفوظ کریں! #ڈیزائن #تخلیق #آرٹ`,
      facebook:  `یہ خوبصورت ڈیزائن دیکھیں! ${description || ""} آپ کا کیا خیال ہے؟ کمنٹ میں بتائیں 👇`,
      instagram: `${title || "ڈیزائن"} ✨ ${description || ""} #ڈیزائن #تخلیق #آرٹ #خوبصورت`,
      threads:   `${title || "ڈیزائن"} — ${description || ""} بہت خوبصورت! 🌟`,
    };
    if (lang === "bilingual") return {
      pinterest: `✨ یہ ${title || "design"} واقعی amazing ہے! ${description || ""} Save کریں for later! #Design #تخلیق #Creative`,
      facebook:  `دیکھو یہ beautiful ${title || "design"}! ${description || ""} Aap ka kya khayal ہے؟ Comment کریں 👇`,
      instagram: `${title || "Design"} ✨ ${description || ""} Bohot khoobsurat ہے! #Design #تخلیق #Creative #Pakistani`,
      threads:   `${title || "Design"} — بہت ${description || "achha"} ہے! 🌟`,
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
          max_tokens: 1200,
          messages: [{
            role: "user",
            content: `You are a social media caption writer. Write 4 captions for a design/pin.

Design Title: ${title || "(untitled)"}
Design Description: ${description || "(none)"}

LANGUAGE RULE (MUST FOLLOW EXACTLY):
${langInstruction}

TONE RULE:
${toneInstruction}

Write one caption for each platform. Each caption must strictly follow both the language rule and tone rule above.

Return ONLY a valid JSON object — no markdown, no explanation, no extra text. Format:
{
  "pinterest": "Pinterest caption — emphasise saving/inspiration, add 2-3 hashtags",
  "facebook": "Facebook caption — conversational, end with a question",
  "instagram": "Instagram caption — visual and expressive, add 5-8 hashtags",
  "threads": "Threads caption — very short and punchy, max 2 sentences"
}`
          }]
        }),
      });
      const data = await response.json();
      const raw = data.content?.[0]?.text || "";
      // Strip any markdown fences
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return res.status(200).json(parsed);
    } catch (err) {
      console.error("Caption generation error:", err);
    }
  }

  return res.status(200).json(makeFallback());
}
