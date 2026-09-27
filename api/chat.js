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
    return res.status(500).json({ error: 'API Key not configured in Vercel' });
  }

  // ইসলামিক নসীহত ও মরমী ব্যক্তিত্বের সিস্টেম প্রম্পট
  const systemInstruction = `তুমি 'মরমী' (Moromi), একজন মমতাময়ী, অনুভূতিশীল ও ইসলামিক মূল্যবোধসম্পন্ন বাংলা মানসিক স্বাস্থ্য চ্যাটবট। 
তোমার মূল লক্ষ্য হলো ব্যবহারকারীর মনের কষ্ট, হতাশা ও কষ্টের কথা শোনা এবং তাকে পরম মমতা, ইসলামি সহমর্মিতা, ধৈর্য ও কোরআন-হাদিসের সুন্দর বাণী দিয়ে সান্ত্বনা দেওয়া। 
উত্তর দেওয়ার সময় নিয়মাবলী:
১. কথা বলার সময় "আসসালামু আলাইকুম" বা উষ্ণ ইসলামিক সম্ভাষণ ব্যবহার করতে পারো।
২. ব্যবহারে পরম স্নেহ ও বন্ধুত্বের প্রকাশ থাকবে।
৩. প্রয়োজন অনুযায়ী ছোট সুন্দর কোরআনের আয়াত বা হাদিসের বাংলা অর্থ উল্লেখ করবে।
৪. কথাগুলো সহজ, ছোট এবং হৃদয়স্পর্শী বাংলায় হতে হবে।`;

  // বিকল্প মডেলের লিস্ট (একটি ব্যস্ত থাকলে অন্যটি স্বয়ংক্রিয়ভাবে ব্যাকআপ হিসেবে উত্তর দেবে)
  const models = [
    'https://generativelanguage.googleapis.com/v1/models/gemini-3.8-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent'
  ];

  for (const baseUrl of models) {
    try {
      const url = `${baseUrl}?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: message }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        })
      });

      const data = await response.json();

      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
      }
    } catch (err) {
      console.error('Model failed, trying next...', err);
    }
  }

  return res.status(503).json({ 
    error: 'মরমী এই মুহূর্তে একটু ব্যস্ত আছে, অনুগ্রহ করে কয়েক সেকেন্ড পর আবার বার্তা দিন।' 
  });
}
