export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { title, description, lang = "english", tone = "engaging" } = req.body;

  if (!title && !description) {
    return res.status(400).json({ error: "Title or description required" });
  }

  const t = title || "Design";
  const d = description || "";
  const langKey = lang === "urdu" ? "urdu" : lang === "roman_urdu" ? "roman_urdu" : "english";

  // ── Complete fallback matrix: 3 langs × 5 tones ──────────────────
  const FALLBACKS = {
    english: {
      engaging:     { pinterest: `✨ ${t} — ${d} Save this for inspiration! #Inspiration #Design #Creative`, facebook: `Look at this amazing design — ${t}! ${d} What do you think? 👇`, instagram: `${t} ✨ ${d} Tag someone who'd love this! #Design #Creative #Inspiration #Style`, threads: `${t} — ${d} Love it? Save it! 🔥` },
      professional: { pinterest: `${t}. ${d} Crafted for those who value quality. #Design #Professional #Creative`, facebook: `Introducing ${t}. ${d} Quality design for those who appreciate elegance.`, instagram: `${t} ${d} Elevate your standards. #Design #Professional #Quality #Brand`, threads: `${t}. ${d} Quality speaks for itself.` },
      playful:      { pinterest: `🎉 ${t} is giving EVERYTHING! ${d} You NEED this! ✨🔥 #Design #Fun #Creative`, facebook: `Have you SEEN ${t}?! 😱 ${d} This is TOO good! 😍`, instagram: `${t} just dropped and WOW! 🤩 ${d} OBSESSED! 🙌✨ #Design #Fun #Creative #Vibes`, threads: `${t} > everything else 😂🔥 No notes!!` },
      minimal:      { pinterest: `${t}. ${d} #Design`, facebook: `${t}. ${d}`, instagram: `${t}. ${d} #Design #Art #Creative`, threads: `${t}.` },
      inspirational:{ pinterest: `💫 ${t} — ${d} Let this inspire your next step. #Inspiration #Motivation #Design`, facebook: `✨ ${t} — ${d} Some designs make you feel something. This is one of them. 💜`, instagram: `${t} 💫 ${d} Believe in what you create. #Inspiration #Motivation #Design #Creative`, threads: `${t}. ${d} Keep going. 💫` },
    },
    urdu: {
      engaging:     { pinterest: `✨ ${t} — ${d} اسے محفوظ کریں اور دوستوں کے ساتھ شیئر کریں! #ڈیزائن #تخلیق #آرٹ`, facebook: `یہ خوبصورت ڈیزائن دیکھیں! ${t} — ${d} آپ کا کیا خیال ہے؟ کمنٹ میں بتائیں 👇`, instagram: `${t} ✨ ${d} پسند آیا؟ کسی دوست کو ٹیگ کریں! #ڈیزائن #تخلیق #آرٹ #پاکستان`, threads: `${t} — ${d} کمال ہے! محفوظ کریں 🔥` },
      professional: { pinterest: `${t}۔ ${d} اعلیٰ معیار کا ڈیزائن بہترین پسند کرنے والوں کے لیے۔ #ڈیزائن #پیشہ`, facebook: `${t} پیش کر رہے ہیں۔ ${d} معیار اور خوبصورتی کی قدر کرنے والوں کے لیے۔`, instagram: `${t} ${d} اپنا معیار بلند کریں۔ #ڈیزائن #پیشہ #معیار #برانڈ`, threads: `${t}۔ ${d} معیار خود بولتا ہے۔` },
      playful:      { pinterest: `🎉 واہ ${t} نے تو کمال کر دیا! ${d} ابھی محفوظ کریں! ✨🔥 #ڈیزائن #تخلیق`, facebook: `یار — کیا دیکھا ${t}؟! 😱 ${d} بہت اچھا ہے! لائیک کریں! 😍`, instagram: `${t} آ گیا اور واہ! 🤩 ${d} ہم دیوانے ہو گئے! #ڈیزائن #کمال #تخلیق`, threads: `${t} سب سے بہترین! 😂🔥 لاجواب!!` },
      minimal:      { pinterest: `${t}۔ ${d} #ڈیزائن`, facebook: `${t}۔ ${d}`, instagram: `${t}۔ ${d} #ڈیزائن #آرٹ #تخلیق`, threads: `${t}۔` },
      inspirational:{ pinterest: `💫 ${t} — ${d} ہر بڑا سفر ایک چھوٹے قدم سے شروع ہوتا ہے۔ #تحریک #ڈیزائن #الہام`, facebook: `✨ ${t} — ${d} کچھ ڈیزائن صرف خوبصورت نہیں، وہ احساس جگاتے ہیں۔ 💜`, instagram: `${t} 💫 ${d} جو بناتے ہو اس پر یقین رکھو۔ #تحریک #ڈیزائن #الہام #پاکستان`, threads: `${t}۔ ${d} آگے بڑھتے رہو۔ 💫` },
    },
    roman_urdu: {
      engaging:     { pinterest: `✨ ${t} — ${d} Ise save karo aur doston ke saath share karo! #Design #Creative #Pakistani`, facebook: `Yeh khubsurat design dekho! ${t} — ${d} Aap ka kya khayal hai? Comment mein batao 👇`, instagram: `${t} ✨ ${d} Pasand aaya? Kisi dost ko tag karo! #Design #Creative #Pakistani #Art`, threads: `${t} — ${d} Kamal hai! Save karo 🔥` },
      professional: { pinterest: `${t}. ${d} Aala darje ka design behtareen pasand karne walon ke liye. #Design #Professional`, facebook: `${t} pesh kar rahe hain. ${d} Mayaar aur khubsurti ki qadar karne walon ke liye.`, instagram: `${t} ${d} Apna mayaar buland karo. #Design #Professional #Quality #Pakistani`, threads: `${t}. ${d} Mayaar khud bolta hai.` },
      playful:      { pinterest: `🎉 Yaar ${t} ne kamal kar diya! ${d} Abhi save karo! ✨🔥 #Design #Mast #Creative`, facebook: `Yaar — kya dekha ${t}?! 😱 ${d} Bohot acha hai! Like karo! 😍`, instagram: `${t} aa gaya aur wow! 🤩 ${d} Hum pagal ho gaye! #Design #Kamaal #Creative #Pakistani`, threads: `${t} sab se behtareen! 😂🔥 Lajawaab!!` },
      minimal:      { pinterest: `${t}. ${d} #Design`, facebook: `${t}. ${d}`, instagram: `${t}. ${d} #Design #Art #Pakistani`, threads: `${t}.` },
      inspirational:{ pinterest: `💫 ${t} — ${d} Har badi safar ek chhote qadam se shuru hoti hai. #Inspiration #Design`, facebook: `✨ ${t} — ${d} Kuch designs sirf sundar nahi hote, woh feel karate hain. 💜`, instagram: `${t} 💫 ${d} Jo banate ho usme yaqeen rakho. #Inspiration #Design #Pakistani`, threads: `${t}. ${d} Aage badhte raho. 💫` },
    },
  };

  const getFallback = () => {
    const toneData = FALLBACKS[langKey];
    return toneData[tone] || toneData.engaging;
  };

  // ── Claude API ───────────────────────────────────────────────────
  if (process.env.ANTHROPIC_API_KEY) {

    // System prompts enforce language at the model instruction level
    const SYSTEM_PROMPTS = {
      english: `You are a social media caption writer. You write ONLY in English. Never use Urdu script or Roman Urdu words.`,
      urdu: `آپ ایک سوشل میڈیا کیپشن لکھنے والے ہیں۔ آپ صرف اور صرف اردو میں لکھتے ہیں۔ کبھی انگریزی الفاظ استعمال نہ کریں سوائے ہیش ٹیگ کے۔ ہر لفظ خالص اردو رسم الخط میں ہونا چاہیے۔`,
      roman_urdu: `You are a social media caption writer. You write ONLY in Roman Urdu — Urdu words spelled with English letters. Examples: "Yeh bohot khoobsurat hai", "Save karo yaar", "Kamal kar diya". Never use Urdu script. Never write standard English sentences. Only Roman Urdu.`,
    };

    const TONE_PROMPTS = {
      engaging:     `Friendly and warm. Ask a question. Encourage saving or commenting. Use a few emojis.`,
      professional: `Professional and polished. No slang. Minimal emojis (max 1). Focus on quality and value.`,
      playful:      `Fun, excited, energetic! Use playful words, exclamation marks, fun emojis.`,
      minimal:      `Extremely short and minimal. No filler words. Maximum 1 emoji. Less is more.`,
      inspirational:`Uplifting and motivational. Emotional words. Focus on belief, growth, and inspiration.`,
    };

    // Examples of what each caption should look like
    const EXAMPLES = {
      english: `{"pinterest":"✨ Beautiful Design — Save this for inspiration! #Design #Creative","facebook":"Look at this design! What do you think? 👇","instagram":"Beautiful Design ✨ Amazing work! #Design #Creative #Art","threads":"Beautiful Design — Amazing! 🔥"}`,
      urdu: `{"pinterest":"✨ خوبصورت ڈیزائن — اسے محفوظ کریں! #ڈیزائن #تخلیق","facebook":"یہ ڈیزائن دیکھیں! آپ کا کیا خیال ہے؟ 👇","instagram":"خوبصورت ڈیزائن ✨ شاندار کام! #ڈیزائن #تخلیق #آرٹ","threads":"خوبصورت ڈیزائن — لاجواب! 🔥"}`,
      roman_urdu: `{"pinterest":"✨ Khoobsurat Design — Ise save karo! #Design #Creative","facebook":"Yeh design dekho! Aap ka kya khayal hai? 👇","instagram":"Khoobsurat Design ✨ Kamal kaam! #Design #Creative #Art","threads":"Khoobsurat Design — Lajawaab! 🔥"}`,
    };

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
            content: `Write 4 social media captions for this design:
Title: ${t}
Description: ${d || "none"}
Tone: ${TONE_PROMPTS[tone] || TONE_PROMPTS.engaging}

Here is an example of the EXACT format and language style required:
${EXAMPLES[langKey]}

Now write captions for the title and description above in the same language style. Return ONLY valid JSON:
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
