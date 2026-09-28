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

  // গুগলের v1 স্ট্যাবল অ্যান্ডপয়েন্ট (যা সব এপিআই কী-তে কাজ করে)
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

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
      const errMsg = data.error?.message || JSON.stringify(data);
      return res.status(200).json({ reply: `API ERROR: ${errMsg}` });
    }
  } catch (err) {
    return res.status(200).json({ reply: `FETCH ERROR: ${err.message}` });
  }
}
