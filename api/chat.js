export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const { message, userName } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "API key is missing in environment variables."
    });
  }

  // মেসেজ না থাকলে
  if (!message || !message.trim()) {
    return res.status(400).json({
      error: "Message is required."
    });
  }

  // অফলাইন ব্যাকআপ উপদেশ
  const fallbackAdviceList = [
    "মন খারাপ বা দুশ্চিন্তা হলে একটু পানি পান করুন এবং কিছুক্ষণ শান্তভাবে বসুন। এখন আপনার মনের অনুভূতিটি কেমন?",
    "জীবন সবসময় একরকম যায় না। কঠিন সময়ও ধীরে ধীরে কেটে যায় ইনশাআল্লাহ। আজ আপনাকে সবচেয়ে বেশি কোন বিষয়টি ভাবাচ্ছে?",
    "কখনো কখনো নিজেকে একটু সময় দেওয়া প্রয়োজন। নিজের যত্ন নিন এবং চাইলে আমার সাথে কথা বলতে পারেন।",
    "যেকোনো কঠিন পরিস্থিতিতে শান্ত থাকার চেষ্টা করুন। আমাকে বলতে পারেন, আপনি ঠিক কোন বিষয়ে সাহায্য চাইছেন?"
  ];

  // র্যান্ডম ব্যাকআপ উত্তর
  const randomFallbackAdvice =
    fallbackAdviceList[
      Math.floor(Math.random() * fallbackAdviceList.length)
    ];

  try {
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },

        body: JSON.stringify({
          model: "gpt-5-mini",

          instructions: `
You are Moromi (মরমী), a warm and supportive AI companion.

Rules:
- You are clearly an AI, not a human.
- Understand Bangla, Banglish, and English.
- If the user writes Banglish, understand it and reply naturally in Bangla.
- If the user writes English, reply in English.
- If the user writes Bangla, reply naturally in Bangla.
- Keep replies simple, friendly, natural and helpful.
- If the user is sad, worried, lonely or stressed, respond with empathy and practical support.
- Do not make every conversation about mental health.
- Do not pretend to replace family, friends, doctors or mental-health professionals.
- Answer normal questions normally.
- Avoid unnecessarily long replies.
- Do not claim to be human.
- Do not say that you are always physically present.
- Be respectful and supportive.
${userName ? `The user's name is ${userName}.` : ""}
          `,

          input: message
        })
      }
    );

    const data = await response.json();

    // OpenAI API থেকে কোনো error এলে
    if (!response.ok) {
      console.error("OpenAI API error:", data);

      return res.status(200).json({
        reply: randomFallbackAdvice
      });
    }

    // AI-এর উত্তর
    const reply =
      data.output_text ||
      randomFallbackAdvice;

    return res.status(200).json({
      reply: reply
    });

  } catch (error) {
    console.error("Moromi server error:", error);

    // Server/API সমস্যা হলে
    return res.status(200).json({
      reply: randomFallbackAdvice
    });
  }
}
