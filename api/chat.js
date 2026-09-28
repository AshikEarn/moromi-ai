export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ reply: 'ERROR: Vercel-এ GEMINI_API_KEY সেট করা নেই।' });
  }

  const systemPrompt = `তুমি 'মরমী' (Moromi), একজন মমতাময়ী, সামাজিকভাবে সচেতন ও ইসলামিক দৃষ্টিভঙ্গিসম্পন্ন বাংলা মানসিক স্বাস্থ্য সহকারী। 
তোমার কাজ হলো ব্যবহারকারী যা বলবে সেটির সরাসরি উত্তর দেওয়া এবং তাকে পরিবারে দায়িত্বশীল হতে ও মাদক থেকে দূরে থাকতে উৎসাহিত করা।
জরুরি নিয়ম: তোমার প্রতিটি উত্তর অবশ্যই সম্পূর্ণ বাক্যে শেষ করবে।`;

  // গুগলের বর্তমানে সক্রিয় ও গ্রহণযোগ্য সকল মডেলের তালিকা
  const availableModels = [
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash-8b'
  ];

  let lastError = '';

  for (const model of availableModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nইউজারের বার্তা: ${message}` }]
            }
          ],
          generationConfig: { 
            temperature: 0.7, 
            maxOutputTokens: 800 
          }
        })
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
      } else {
        lastError = data.error?.message || JSON.stringify(data);
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  return res.status(200).json({ reply: `API ERROR: ${lastError}` });
}
