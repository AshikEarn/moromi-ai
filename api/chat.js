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
      error: "OPENAI_API_KEY is missing in Vercel Environment Variables."
    });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({
      error: "Message is required."
    });
  }

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
- If the user writes Bangla, reply naturally in Bangla.
- If the user writes English, reply in English.
- Keep replies simple, friendly, natural and helpful.
- If the user is sad, worried, lonely or stressed, respond with empathy and practical support.
- Do not pretend to replace family, friends, doctors or mental-health professionals.
- Answer normal questions normally.
- Avoid unnecessarily long replies.
${userName ? `The user's name is ${userName}.` : ""}
          `,

          input: message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OPENAI ERROR:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "OpenAI API request failed."
      });
    }

    const reply = data.output_text;

    if (!reply) {
      return res.status(500).json({
        error: "OpenAI returned no text response."
      });
    }

    return res.status(200).json({
      reply: reply
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      error: error.message || "Server error."
    });
  }
}
