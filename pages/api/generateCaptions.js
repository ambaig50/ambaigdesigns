export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { title, description, lang = "english", tone = "engaging" } = req.body;

  if (!title && !description) {
    return res.status(400).json({ error: "Title or description required" });
  }

  const t = title || "";
  const d = description || "";
  const langKey = lang === "urdu" ? "urdu" : lang === "roman_urdu" ? "roman_urdu" : "english";

  // ── Fallback matrix ───────────────────────────────────────────────
  // Fallback does NOT inject title/description as raw text since they may be
  // English and would break language purity. Instead uses generic phrases.
  const FALLBACKS = {
    english: {
      engaging:     { pinterest: `✨ ${t} — ${d} Save this for inspiration! #Inspiration #Design #Creative`, facebook: `Look at this! ${t} — ${d} What do you think? 👇`, instagram: `${t} ✨ ${d} Tag someone who'd love this! #Design #Creative #Inspiration`, threads: `${t} — ${d} Love it? Save it! 🔥` },
      professional: { pinterest: `${t}. ${d} Quality design for those who value elegance. #Design #Professional`, facebook: `${t}. ${d} Crafted with attention to detail and quality.`, instagram: `${t} ${d} Elevate your standards. #Design #Professional #Quality`, threads: `${t}. ${d} Quality speaks for itself.` },
      playful:      { pinterest: `🎉 ${t} is giving EVERYTHING! ${d} Save NOW! ✨🔥 #Design #Fun`, facebook: `Have you SEEN ${t}?! 😱 ${d} TOO good! 😍`, instagram: `${t} just dropped! 🤩 ${d} OBSESSED! 🙌✨ #Design #Fun #Vibes`, threads: `${t} > everything 😂🔥 No notes!!` },
      minimal:      { pinterest: `${t}. ${d} #Design`, facebook: `${t}. ${d}`, instagram: `${t}. ${d} #Design #Art #Creative`, threads: `${t}.` },
      inspirational:{ pinterest: `💫 ${t} — ${d} Let this inspire your next step. #Inspiration #Design`, facebook: `✨ ${t} — ${d} Some things make you feel something. 💜`, instagram: `${t} 💫 ${d} Believe in what you create. #Inspiration #Design`, threads: `${t}. ${d} Keep going. 💫` },
    },
    urdu: {
      engaging:     { pinterest: `✨ خوبصورت ڈیزائن — ابھی محفوظ کریں اور دوستوں کے ساتھ شیئر کریں! #ڈیزائن #تخلیق #آرٹ`, facebook: `یہ خوبصورت ڈیزائن دیکھیں! آپ کا کیا خیال ہے؟ کمنٹ میں بتائیں 👇`, instagram: `خوبصورت ڈیزائن ✨ پسند آیا؟ کسی دوست کو ٹیگ کریں! #ڈیزائن #تخلیق #آرٹ #پاکستان`, threads: `شاندار ڈیزائن — کمال ہے! محفوظ کریں 🔥` },
      professional: { pinterest: `اعلیٰ معیار کا ڈیزائن — بہترین پسند کرنے والوں کے لیے۔ #ڈیزائن #پیشہ`, facebook: `شاندار ڈیزائن پیش ہے۔ معیار اور خوبصورتی کی قدر کرنے والوں کے لیے۔`, instagram: `خوبصورت ڈیزائن — اپنا معیار بلند کریں۔ #ڈیزائن #پیشہ #معیار #برانڈ`, threads: `معیاری ڈیزائن۔ معیار خود بولتا ہے۔` },
      playful:      { pinterest: `🎉 واہ! کیا شاندار ڈیزائن ہے! ابھی محفوظ کریں ورنہ پچھتائیں گے! ✨🔥 #ڈیزائن #تخلیق`, facebook: `یار — کیا ڈیزائن ہے یہ؟! 😱 بہت زیادہ اچھا ہے! لائیک کریں! 😍`, instagram: `واہ! کیا خوبصورت ڈیزائن! 🤩 ہم تو دیوانے ہو گئے! #ڈیزائن #کمال #تخلیق`, threads: `سب سے بہترین ڈیزائن! 😂🔥 لاجواب!!` },
      minimal:      { pinterest: `خوبصورت ڈیزائن۔ #ڈیزائن`, facebook: `خوبصورت ڈیزائن۔`, instagram: `خوبصورت ڈیزائن۔ #ڈیزائن #آرٹ #تخلیق`, threads: `خوبصورت ڈیزائن۔` },
      inspirational:{ pinterest: `💫 ہر بڑا سفر ایک چھوٹے قدم سے شروع ہوتا ہے۔ یہ ڈیزائن آپ کو متاثر کرے۔ #تحریک #ڈیزائن #الہام`, facebook: `✨ کچھ ڈیزائن صرف خوبصورت نہیں ہوتے — وہ دل میں اتر جاتے ہیں۔ 💜`, instagram: `💫 جو بناتے ہو اس پر یقین رکھو۔ ہمیشہ متاثر رہو۔ #تحریک #ڈیزائن #الہام #پاکستان`, threads: `آگے بڑھتے رہو۔ آپ اچھا کر رہے ہیں۔ 💫` },
    },
    roman_urdu: {
      engaging:     { pinterest: `✨ Khoobsurat design — Abhi save karo aur doston ke saath share karo! #Design #Creative #Pakistani`, facebook: `Yeh khoobsurat design dekho! Aap ka kya khayal hai? Comment mein batao 👇`, instagram: `Khoobsurat design ✨ Pasand aaya? Kisi dost ko tag karo! #Design #Creative #Pakistani #Art`, threads: `Shandar design — Kamal hai! Save karo 🔥` },
      professional: { pinterest: `Aala darje ka design — Behtareen pasand karne walon ke liye. #Design #Professional`, facebook: `Shandar design pesh hai. Mayaar aur khubsurti ki qadar karne walon ke liye.`, instagram: `Khoobsurat design — Apna mayaar buland karo. #Design #Professional #Quality #Pakistani`, threads: `Mayaari design. Mayaar khud bolta hai.` },
      playful:      { pinterest: `🎉 Yaar! Kya shandar design hai! Abhi save karo varna pachtaoge! ✨🔥 #Design #Mast`, facebook: `Yaar — kya design hai yeh?! 😱 Bohot zyada acha hai! Like karo! 😍`, instagram: `Wow! Kya khoobsurat design! 🤩 Hum toh pagal ho gaye! #Design #Kamaal #Creative #Pakistani`, threads: `Sab se behtareen design! 😂🔥 Lajawaab!!` },
      minimal:      { pinterest: `Khoobsurat design. #Design`, facebook: `Khoobsurat design.`, instagram: `Khoobsurat design. #Design #Art #Pakistani`, threads: `Khoobsurat design.` },
      inspirational:{ pinterest: `💫 Har badi safar ek chhote qadam se shuru hoti hai. Yeh design tumhe inspire kare. #Inspiration #Design`, facebook: `✨ Kuch designs sirf sundar nahi hote — woh dil mein utar jate hain. 💜`, instagram: `💫 Jo banate ho usme yaqeen rakho. Hamesha inspired raho. #Inspiration #Design #Pakistani`, threads: `Aage badhte raho. Tum acha kar rahe ho. 💫` },
    },
  };

  const getFallback = () => {
    const toneData = FALLBACKS[langKey];
    return (toneData[tone] || toneData.engaging);
  };

  // ── Claude API ───────────────────────────────────────────────────
  if (process.env.ANTHROPIC_API_KEY) {

    const SYSTEM_PROMPTS = {
      english: `You are a social media caption writer. You write ONLY in English. Never use Urdu script or Roman Urdu words under any circumstances.`,
      urdu: `آپ ایک سوشل میڈیا کیپشن لکھنے والے ہیں۔ آپ صرف اور صرف اردو رسم الخط میں لکھتے ہیں۔ آپ کو جو بھی عنوان یا تفصیل ملے، چاہے وہ انگریزی میں ہو، آپ اسے اردو میں ترجمہ کر کے کیپشن لکھیں۔ کبھی بھی انگریزی الفاظ استعمال نہ کریں سوائے ہیش ٹیگ کے۔`,
      roman_urdu: `You are a social media caption writer. You write ONLY in Roman Urdu — Urdu language written with English letters. Whatever title or description you receive, even if it is in English, you must translate it to Urdu meaning and write the caption in Roman Urdu words. Never write standard English sentences. Never use Urdu script. Only Roman Urdu like: "Subah bakhair", "Bohot acha", "Khoobsurat", "Pyara design", "Save karo yaar".`,
    };

    const TONE_PROMPTS = {
      engaging:     `Friendly and warm. Ask a question. Encourage saving or commenting. Use a few emojis.`,
      professional: `Professional and polished. No slang. Minimal emojis (max 1). Focus on quality and value.`,
      playful:      `Fun, excited, energetic! Playful words, exclamation marks, fun emojis.`,
      minimal:      `Extremely short and minimal. No filler words. Maximum 1 emoji.`,
      inspirational:`Uplifting and motivational. Emotional words. Focus on belief and growth.`,
    };

    const TRANSLATION_NOTE = langKey === "english"
      ? ""
      : langKey === "urdu"
        ? `\nنوٹ: اگر عنوان یا تفصیل انگریزی میں ہو تو اسے اردو میں ترجمہ کریں اور پھر کیپشن لکھیں۔`
        : `\nNote: If the title or description is in English, translate it to Urdu meaning first, then write the caption in Roman Urdu words.`;

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
          system: SYSTEM_PROMPTS[langKey],
          messages: [{
            role: "user",
            content: `Write 4 social media captions for this design.
Title: ${t}
Description: ${d || "none"}
Tone: ${TONE_PROMPTS[tone] || TONE_PROMPTS.engaging}${TRANSLATION_NOTE}

Return ONLY valid JSON with no markdown:
{"pinterest":"...","facebook":"...","instagram":"...","threads":"..."}`
          }]
        }),
      });

      const data = await response.json();
      const raw = data.content?.[0]?.text || "";
      const parsed = JSON.parse(raw.replace(/```json\n?|```\n?/g, "").trim());
      if (parsed.pinterest) return res.status(200).json(parsed);
    } catch (err) {
      console.error("Caption API error:", err);
    }
  }

  return res.status(200).json(getFallback());
}
