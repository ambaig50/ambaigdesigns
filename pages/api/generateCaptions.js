export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { title, description, lang = "english", tone = "engaging" } = req.body;

  if (!title && !description) {
    return res.status(400).json({ error: "Title or description required" });
  }

  const t = title || "Design";
  const d = description || "";

  // ── Fully distinct fallback captions per tone × language ──────────────────
  // Each tone has its own sentence structure, vocabulary, length and energy.
  // Language wrapping is applied on top of the tone base.

  const TONE_TEMPLATES = {
    engaging: {
      en: {
        pinterest: `✨ ${t} — ${d} Save this for inspiration and share with a friend who needs it! #Inspiration #Design #Creative`,
        facebook:  `Look at this amazing ${t}! ${d} What do you think? Drop your thoughts in the comments 👇`,
        instagram: `${t} ✨ ${d} Double-tap if you love it! Tag someone who'd appreciate this 💜 #Design #Creative #Inspiration #Style #Art`,
        threads:   `${t} is here! ${d} Love it? Save it! 🔥`,
      },
      roman_urdu: {
        pinterest: `✨ ${t} — ${d} Yeh save karo aur doston ke saath share karo! #Design #Creative #Pakistani`,
        facebook:  `Yeh dekho kitna zabardast hai! ${t} — ${d} Aap ka kya khayal hai? Comment mein batao 👇`,
        instagram: `${t} ✨ ${d} Pasand aaya? Tag karo us dost ko jo yeh dekhna chahiye! #Design #Creative #Pakistani #Art`,
        threads:   `${t} — ${d} Yeh toh kamal hai! Save karo 🔥`,
      },
      urdu: {
        pinterest: `✨ ${t} — ${d} محفوظ کریں اور دوستوں کے ساتھ شیئر کریں! #ڈیزائن #تخلیق #آرٹ`,
        facebook:  `دیکھیں یہ کتنا شاندار ہے! ${t} — ${d} آپ کا کیا خیال ہے؟ کمنٹ میں بتائیں 👇`,
        instagram: `${t} ✨ ${d} پسند آیا؟ کسی دوست کو ٹیگ کریں! #ڈیزائن #تخلیق #آرٹ #پاکستان`,
        threads:   `${t} — ${d} کمال ہے! محفوظ کریں 🔥`,
      },
      bilingual: {
        pinterest: `✨ یہ ${t} amazing ہے! ${d} Save کریں اور share کریں friends کے ساتھ! #Design #تخلیق #Creative`,
        facebook:  `Dekho یہ ${t} kitna zabardast ہے! ${d} Aap ka kya khayal ہے؟ Comment کریں 👇`,
        instagram: `${t} ✨ ${d} Tag کرو اس دوست کو! #Design #تخلیق #Creative #Pakistani`,
        threads:   `${t} — ${d} Kamal ہے! Save کریں 🔥`,
      },
    },

    professional: {
      en: {
        pinterest: `${t}. ${d} A refined design for those who value quality and elegance. Save for your mood board. #Design #Professional #Creative`,
        facebook:  `Introducing ${t}. ${d} Crafted for those who appreciate attention to detail and quality design.`,
        instagram: `${t} ${d} Elevate your standards. #Design #Professional #Quality #Brand #Creative #Premium`,
        threads:   `${t}. ${d} Quality speaks for itself.`,
      },
      roman_urdu: {
        pinterest: `${t}. ${d} Yeh ek high-quality design hai un logon ke liye jo best pasand karte hain. Save karen. #Design #Professional`,
        facebook:  `${t} pesh kar rahe hain. ${d} Un logon ke liye jo quality aur elegance ki qadar karte hain.`,
        instagram: `${t} ${d} Apna standard buland karen. #Design #Professional #Quality #Pakistani #Brand`,
        threads:   `${t}. ${d} Quality khud bolta hai.`,
      },
      urdu: {
        pinterest: `${t}. ${d} اعلیٰ معیار کا ڈیزائن ان لوگوں کے لیے جو بہترین پسند کرتے ہیں۔ محفوظ کریں۔ #ڈیزائن #پیشہ`,
        facebook:  `${t} پیش کر رہے ہیں۔ ${d} ان لوگوں کے لیے جو معیار اور خوبصورتی کی قدر کرتے ہیں۔`,
        instagram: `${t} ${d} اپنا معیار بلند کریں۔ #ڈیزائن #پیشہ #معیار #برانڈ`,
        threads:   `${t}۔ ${d} معیار خود بولتا ہے۔`,
      },
      bilingual: {
        pinterest: `${t}. ${d} یہ ایک high-quality design ہے quality کے لیے۔ Save کریں۔ #Design #Professional #تخلیق`,
        facebook:  `${t} present kar rahe hain. ${d} ان لوگوں کے لیے جو quality appreciate کرتے ہیں۔`,
        instagram: `${t} ${d} Apna standard بلند کریں۔ #Design #Professional #Quality #Pakistani`,
        threads:   `${t}. ${d} Quality خود بولتی ہے۔`,
      },
    },

    playful: {
      en: {
        pinterest: `🎉 OMG ${t} is giving EVERYTHING! ${d} You NEED this on your board right now! ✨🔥 #Design #Vibes #Creative #Fun`,
        facebook:  `Wait wait wait — have you seen ${t}?! 😱 ${d} This is TOO good! Like if you love it! 😍`,
        instagram: `${t} just dropped and WOW 🤩 ${d} We are OBSESSED! 🙌✨ #Design #Obsessed #Creative #Fun #Cute #Vibes`,
        threads:   `${t} > everything else right now 😂🔥 ${d} No notes!!`,
      },
      roman_urdu: {
        pinterest: `🎉 Arre yaar ${t} toh kamaal kar diya! ${d} Abhi save karo varna pachtaoge! ✨🔥 #Design #Mast #Creative`,
        facebook:  `Yaar yaar yaar — kya dekha ${t}?! 😱 ${d} Yeh toh bht zyada acha hai! Like karo agar pasand aaya! 😍`,
        instagram: `${t} aa gaya aur WOW 🤩 ${d} Hum toh pagal ho gaye! 🙌✨ #Design #Kamaal #Creative #Pakistani #Mast`,
        threads:   `${t} > baaki sab abhi 😂🔥 ${d} Koi sawaal nahi!!`,
      },
      urdu: {
        pinterest: `🎉 ارے واہ ${t} نے تو کمال کر دیا! ${d} ابھی محفوظ کریں ورنہ پچھتائیں گے! ✨🔥 #ڈیزائن #مزہ #تخلیق`,
        facebook:  `یار یار یار — کیا دیکھا ${t}؟! 😱 ${d} یہ تو بہت زیادہ اچھا ہے! لائیک کریں اگر پسند آیا! 😍`,
        instagram: `${t} آ گیا اور WOW 🤩 ${d} ہم تو پاگل ہو گئے! 🙌✨ #ڈیزائن #کمال #تخلیق #پاکستان`,
        threads:   `${t} > باقی سب ابھی 😂🔥 ${d} کوئی سوال نہیں!!`,
      },
      bilingual: {
        pinterest: `🎉 Arre yaar ${t} نے تو WOW کر دیا! ${d} Abhi save کرو ورنہ پچھتاؤ گے! ✨🔥 #Design #Kamaal #Creative`,
        facebook:  `Yaar yaar — kya dekha ${t}؟! 😱 ${d} Yeh toh too good ہے! Like کرو agar pasand آیا! 😍`,
        instagram: `${t} aa gaya اور WOW 🤩 ${d} ہم obsessed ہیں! #Design #Kamaal #Creative #Pakistani`,
        threads:   `${t} > baaki sab ابھی 😂🔥 ${d} No notes!!`,
      },
    },

    minimal: {
      en: {
        pinterest: `${t}. ${d} #Design`,
        facebook:  `${t}. ${d}`,
        instagram: `${t}. ${d} #Design #Art #Creative`,
        threads:   `${t}.`,
      },
      roman_urdu: {
        pinterest: `${t}. ${d} #Design`,
        facebook:  `${t}. ${d}`,
        instagram: `${t}. ${d} #Design #Art #Pakistani`,
        threads:   `${t}.`,
      },
      urdu: {
        pinterest: `${t}. ${d} #ڈیزائن`,
        facebook:  `${t}. ${d}`,
        instagram: `${t}. ${d} #ڈیزائن #آرٹ #تخلیق`,
        threads:   `${t}.`,
      },
      bilingual: {
        pinterest: `${t}. ${d} #Design #ڈیزائن`,
        facebook:  `${t}. ${d}`,
        instagram: `${t}. ${d} #Design #Art #Pakistani`,
        threads:   `${t}.`,
      },
    },

    inspirational: {
      en: {
        pinterest: `💫 ${t} — ${d} Every great journey starts with a single step. Let this inspire yours. Save it. #Inspiration #Motivation #Design #Growth`,
        facebook:  `✨ "${t}" — ${d} Some designs don't just look good. They make you feel something. This is one of them. 💜`,
        instagram: `${t} 💫 ${d} Believe in what you create. Stay inspired, stay consistent. 🌟 #Inspiration #Motivation #Design #Creative #Growth #Believe`,
        threads:   `${t}. ${d} Keep going. You're doing great. 💫`,
      },
      roman_urdu: {
        pinterest: `💫 ${t} — ${d} Har badi safar ek chhote qadam se shuru hoti hai. Yeh aapko inspire kare. Save karen. #Inspiration #Motivation #Design`,
        facebook:  `✨ "${t}" — ${d} Kuch designs sirf sundar nahi hote — woh kuch feel karwate hain. Yeh unme se ek hai. 💜`,
        instagram: `${t} 💫 ${d} Jo banate ho usmein yaqeen rakho. Inspired raho. 🌟 #Inspiration #Motivation #Design #Pakistani #Growth`,
        threads:   `${t}. ${d} Chalta raho. Tum acha kar rahe ho. 💫`,
      },
      urdu: {
        pinterest: `💫 ${t} — ${d} ہر بڑا سفر ایک چھوٹے قدم سے شروع ہوتا ہے۔ یہ آپ کو inspire کرے۔ محفوظ کریں۔ #تحریک #ڈیزائن #الہام`,
        facebook:  `✨ "${t}" — ${d} کچھ ڈیزائن صرف خوبصورت نہیں ہوتے — وہ کچھ محسوس کراتے ہیں۔ یہ انہی میں سے ایک ہے۔ 💜`,
        instagram: `${t} 💫 ${d} جو بناتے ہو اس پر یقین رکھو۔ inspired رہو۔ 🌟 #تحریک #ڈیزائن #الہام #پاکستان`,
        threads:   `${t}۔ ${d} چلتے رہو۔ تم اچھا کر رہے ہو۔ 💫`,
      },
      bilingual: {
        pinterest: `💫 ${t} — ${d} Har badi journey ایک chhote qadam سے شروع ہوتی ہے۔ Inspired رہو۔ Save کریں۔ #Inspiration #تحریک #Design`,
        facebook:  `✨ "${t}" — ${d} Kuch designs sirf sundar نہیں ہوتے — وہ feel کراتے ہیں۔ Yeh unme se hai. 💜`,
        instagram: `${t} 💫 ${d} Jo banate ho اس پر یقین رکھو۔ Inspired رہو۔ 🌟 #Inspiration #تحریک #Design #Pakistani`,
        threads:   `${t}. ${d} Chalta رہو۔ Tum acha kar rahe ho. 💫`,
      },
    },
  };

  const makeFallback = () => {
    const toneData = TONE_TEMPLATES[tone] || TONE_TEMPLATES.engaging;
    const langKey = lang === "roman_urdu" ? "roman_urdu"
                  : lang === "urdu" ? "urdu"
                  : lang === "bilingual" ? "bilingual"
                  : "en";
    return toneData[langKey] || toneData.en;
  };

  // ── Claude API (when key is available) ──────────────────────────
  if (process.env.ANTHROPIC_API_KEY) {
    const LANG_INSTRUCTIONS = {
      english:    `Write ALL captions entirely in English.`,
      urdu:       `Write ALL captions entirely in Urdu script (اردو). No English except brand names or hashtags. Example: "یہ ڈیزائن بہت خوبصورت ہے! #ڈیزائن"`,
      roman_urdu: `Write ALL captions in Roman Urdu (Urdu words in English letters). NOT English, NOT Urdu script. Example: "Yeh design bohot khoobsurat hai! Save karo! #Design"`,
      bilingual:  `Write ALL captions mixing Urdu script AND English words in the SAME sentence — exactly how Pakistani social media users write. Every caption MUST have both. Example: "یہ design واقعی bohot amazing ہے! Save کریں for later!"`,
    };
    const TONE_INSTRUCTIONS = {
      engaging:     `Warm, friendly, conversational. Ask the audience a question. Encourage saving or commenting. Use a few relevant emojis.`,
      professional: `Professional and polished. No slang. Minimal emojis (max 1-2). Focus on quality and value.`,
      playful:      `Fun, energetic, excited! Use playful language, exclamation marks, fun emojis 🎉✨😍. Make it feel exciting.`,
      minimal:      `Extremely minimal. Short sentences. No filler words. Maximum 1 emoji. Less is more.`,
      inspirational:`Uplifting and motivational. Powerful, emotional words. Focus on belief, growth, and inspiration.`,
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
          messages: [{
            role: "user",
            content: `Write 4 social media captions for a design.

Title: ${t}
Description: ${d || "none"}

LANGUAGE (follow exactly): ${LANG_INSTRUCTIONS[lang] || LANG_INSTRUCTIONS.english}
TONE (follow exactly): ${TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.engaging}

Return ONLY valid JSON, no markdown:
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

  return res.status(200).json(makeFallback());
}
