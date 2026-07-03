export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { title, description, lang = "english", tone = "engaging" } = req.body;

  if (!title && !description) {
    return res.status(400).json({ error: "Title or description required" });
  }

  const t = title || "Design";
  const d = description || "";

  // ── Complete fallback matrix: 5 tones × 3 languages ─────────────
  const FALLBACKS = {
    english: {
      engaging: {
        pinterest: `✨ ${t} — ${d} Save this for inspiration and share with a friend! #Inspiration #Design #Creative`,
        facebook:  `Look at this amazing design — ${t}! ${d} What do you think? Drop your thoughts below 👇`,
        instagram: `${t} ✨ ${d} Double-tap if you love it! Tag someone who'd appreciate this! #Design #Creative #Inspiration #Style`,
        threads:   `${t} is here! ${d} Love it? Save it! 🔥`,
      },
      professional: {
        pinterest: `${t}. ${d} A refined design for those who value quality and elegance. #Design #Professional #Creative`,
        facebook:  `Introducing ${t}. ${d} Crafted for those who appreciate attention to detail and quality.`,
        instagram: `${t} ${d} Elevate your standards. #Design #Professional #Quality #Brand #Creative`,
        threads:   `${t}. ${d} Quality speaks for itself.`,
      },
      playful: {
        pinterest: `🎉 OMG ${t} is giving EVERYTHING! ${d} You NEED this on your board right now! ✨🔥 #Design #Fun #Creative`,
        facebook:  `Wait — have you SEEN ${t}?! 😱 ${d} This is TOO good! Like if you love it! 😍`,
        instagram: `${t} just dropped and WOW 🤩 ${d} We are OBSESSED! 🙌✨ #Design #Obsessed #Creative #Fun #Vibes`,
        threads:   `${t} > everything else right now 😂🔥 ${d} No notes!!`,
      },
      minimal: {
        pinterest: `${t}. ${d} #Design`,
        facebook:  `${t}. ${d}`,
        instagram: `${t}. ${d} #Design #Art #Creative`,
        threads:   `${t}.`,
      },
      inspirational: {
        pinterest: `💫 ${t} — ${d} Every great journey starts with a single step. Let this inspire yours. #Inspiration #Motivation #Design`,
        facebook:  `✨ ${t} — ${d} Some designs don't just look good. They make you feel something. 💜`,
        instagram: `${t} 💫 ${d} Believe in what you create. Stay inspired, stay consistent. #Inspiration #Motivation #Design #Creative`,
        threads:   `${t}. ${d} Keep going. You're doing great. 💫`,
      },
    },

    urdu: {
      engaging: {
        pinterest: `✨ ${t} — ${d} اسے محفوظ کریں اور دوستوں کے ساتھ شیئر کریں! #ڈیزائن #تخلیق #آرٹ`,
        facebook:  `یہ خوبصورت ڈیزائن دیکھیں! ${t} — ${d} آپ کا کیا خیال ہے؟ کمنٹ میں بتائیں 👇`,
        instagram: `${t} ✨ ${d} پسند آیا؟ کسی دوست کو ٹیگ کریں! #ڈیزائن #تخلیق #آرٹ #پاکستان`,
        threads:   `${t} — ${d} کمال ہے! محفوظ کریں 🔥`,
      },
      professional: {
        pinterest: `${t}۔ ${d} اعلیٰ معیار کا ڈیزائن ان لوگوں کے لیے جو بہترین پسند کرتے ہیں۔ #ڈیزائن #پیشہ`,
        facebook:  `${t} پیش کر رہے ہیں۔ ${d} ان لوگوں کے لیے جو معیار اور خوبصورتی کی قدر کرتے ہیں۔`,
        instagram: `${t} ${d} اپنا معیار بلند کریں۔ #ڈیزائن #پیشہ #معیار #برانڈ`,
        threads:   `${t}۔ ${d} معیار خود بولتا ہے۔`,
      },
      playful: {
        pinterest: `🎉 ارے واہ ${t} نے تو کمال کر دیا! ${d} ابھی محفوظ کریں ورنہ پچھتائیں گے! ✨🔥 #ڈیزائن #تخلیق`,
        facebook:  `یار یار — کیا دیکھا ${t}؟! 😱 ${d} یہ تو بہت زیادہ اچھا ہے! لائیک کریں! 😍`,
        instagram: `${t} آ گیا اور واہ! 🤩 ${d} ہم تو دیوانے ہو گئے! 🙌✨ #ڈیزائن #کمال #تخلیق #پاکستان`,
        threads:   `${t} سب سے بہترین ابھی! 😂🔥 ${d} لاجواب!!`,
      },
      minimal: {
        pinterest: `${t}۔ ${d} #ڈیزائن`,
        facebook:  `${t}۔ ${d}`,
        instagram: `${t}۔ ${d} #ڈیزائن #آرٹ #تخلیق`,
        threads:   `${t}۔`,
      },
      inspirational: {
        pinterest: `💫 ${t} — ${d} ہر بڑا سفر ایک چھوٹے قدم سے شروع ہوتا ہے۔ یہ آپ کو متاثر کرے۔ #تحریک #ڈیزائن #الہام`,
        facebook:  `✨ ${t} — ${d} کچھ ڈیزائن صرف خوبصورت نہیں ہوتے — وہ کچھ محسوس کراتے ہیں۔ 💜`,
        instagram: `${t} 💫 ${d} جو بناتے ہو اس پر یقین رکھو۔ ہمیشہ متاثر رہو۔ #تحریک #ڈیزائن #الہام #پاکستان`,
        threads:   `${t}۔ ${d} آگے بڑھتے رہو۔ آپ اچھا کر رہے ہیں۔ 💫`,
      },
    },

    roman_urdu: {
      engaging: {
        pinterest: `✨ ${t} — ${d} Ise save karo aur doston ke saath share karo! #Design #Creative #Pakistani`,
        facebook:  `Yeh khubsurat design dekho! ${t} — ${d} Aap ka kya khayal hai? Comment mein batao 👇`,
        instagram: `${t} ✨ ${d} Pasand aaya? Kisi dost ko tag karo! #Design #Creative #Pakistani #Art`,
        threads:   `${t} — ${d} Kamal hai! Save karo 🔥`,
      },
      professional: {
        pinterest: `${t}. ${d} Ala darje ka design un logon ke liye jo behtareen pasand karte hain. #Design #Professional`,
        facebook:  `${t} pesh kar rahe hain. ${d} Un logon ke liye jo mayaar aur khubsurti ki qadar karte hain.`,
        instagram: `${t} ${d} Apna mayaar buland karo. #Design #Professional #Quality #Pakistani`,
        threads:   `${t}. ${d} Mayaar khud bolta hai.`,
      },
      playful: {
        pinterest: `🎉 Yaar ${t} ne toh kamal kar diya! ${d} Abhi save karo varna pachtaoge! ✨🔥 #Design #Mast #Creative`,
        facebook:  `Yaar yaar — kya dekha ${t}?! 😱 ${d} Yeh toh bohot zyada acha hai! Like karo! 😍`,
        instagram: `${t} aa gaya aur WOW! 🤩 ${d} Hum toh pagal ho gaye! 🙌✨ #Design #Kamaal #Creative #Pakistani`,
        threads:   `${t} sab se behtareen abhi! 😂🔥 ${d} Lajawaab!!`,
      },
      minimal: {
        pinterest: `${t}. ${d} #Design`,
        facebook:  `${t}. ${d}`,
        instagram: `${t}. ${d} #Design #Art #Pakistani`,
        threads:   `${t}.`,
      },
      inspirational: {
        pinterest: `💫 ${t} — ${d} Har badi safar ek chhote qadam se shuru hoti hai. Yeh tumhe inspire kare. #Inspiration #Design`,
        facebook:  `✨ ${t} — ${d} Kuch designs sirf sundar nahi hote — woh kuch feel karwate hain. 💜`,
        instagram: `${t} 💫 ${d} Jo banate ho usme yaqeen rakho. Hamesha inspired raho. #Inspiration #Design #Pakistani`,
        threads:   `${t}. ${d} Aage badhte raho. Tum acha kar rahe ho. 💫`,
      },
    },
  };

  const getFallback = () => {
    const langKey = lang === "urdu" ? "urdu" : lang === "roman_urdu" ? "roman_urdu" : "english";
    const toneData = FALLBACKS[langKey];
    return toneData[tone] || toneData.engaging;
  };

  // ── Claude API ───────────────────────────────────────────────────
  if (process.env.ANTHROPIC_API_KEY) {
    const LANG_PROMPTS = {
      english: `CRITICAL: Write ONLY in English. Do NOT use any Urdu script or Roman Urdu words. Pure English only.`,
      urdu: `CRITICAL: Write ONLY in Urdu script (اردو). Do NOT use any English words at all — not even "save", "design", "share", "like", "comment". Write every single word in proper Urdu script only. Use Urdu equivalents: محفوظ کریں (save), ڈیزائن (design), شیئر کریں (share), لائیک (like), کمنٹ (comment). Hashtags may use English letters.`,
      roman_urdu: `CRITICAL: Write ONLY in Roman Urdu — Urdu language written with English alphabet letters. Do NOT use any Urdu script characters. Do NOT write in standard English. Write Urdu words spelled out in English letters only. Examples of correct Roman Urdu: "Yeh bohot khoobsurat hai", "Save karo", "Pasand aaya?", "Kamal kar diya". Hashtags are fine in English.`,
    };

    const TONE_PROMPTS = {
      engaging:     `Tone: Warm and friendly. Ask a question. Encourage saving or commenting. A few emojis.`,
      professional: `Tone: Professional and polished. No slang. Minimal emojis (max 1). Focus on quality.`,
      playful:      `Tone: Fun, energetic, excited! Playful language, exclamation marks, fun emojis 🎉✨😍.`,
      minimal:      `Tone: Extremely minimal. Short. No filler. Maximum 1 emoji. Less is more.`,
      inspirational:`Tone: Uplifting and motivational. Powerful emotional words. Focus on belief and growth.`,
    };

    const langKey = lang === "urdu" ? "urdu" : lang === "roman_urdu" ? "roman_urdu" : "english";

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
            content: `Write 4 social media captions for a design.

Title: ${t}
Description: ${d || "none"}

LANGUAGE RULE — ${LANG_PROMPTS[langKey]}

TONE RULE — ${TONE_PROMPTS[tone] || TONE_PROMPTS.engaging}

IMPORTANT: Follow the language rule strictly. Do not mix languages. Every word must be in the specified language.

Return ONLY valid JSON, no markdown, no explanation:
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
