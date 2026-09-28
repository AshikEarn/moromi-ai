export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is missing in environment variables.' });
  }

  // প্রাইমারি ও ব্যাকআপ মডেলের লিস্ট
  const models = ['gemini-3.8-flash', 'gemini-2.5-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are 'Moromi', a compassionate mental health chatbot. Always reply politely in Bengali.\n\nUser: ${message}`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();

      if (response.ok && data.candidates && data.candidates[0].content.parts[0].text) {
        return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
      }

      lastError = data.error?.message || 'High demand error';
    } catch (err) {
      lastError = err.message;
    }
  }

  // দুটি মডেলই ব্যর্থ হলে
  return res.status(500).json({ 
    error: 'গুগল সার্ভারে সাময়িক চাপ রয়েছে। অনুগ্রহ করে ১ মিনিট পর আবার চেষ্টা করুন।' 
  });
}
