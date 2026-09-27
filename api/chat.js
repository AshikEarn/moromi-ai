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

  const systemInstruction = `তুমি 'মরমী' (Moromi), একজন মমতাময়ী ও অনুভূতিশীল বাংলা মানসিক স্বাস্থ্য চ্যাটবট। 
তোমার কাজ হলো ব্যবহারকারীর মনের কষ্টের কথা শোনা, তাকে মানসিক সাপোর্ট দেওয়া এবং পরম সহানুভূতির সাথে বাংলায় ছোট ছোট বাক্যে উত্তর দেওয়া।`;

  // গুগলের ৩টি বিকল্প মডেল লিস্ট (একটি ব্যস্ত থাকলে অন্যটি ট্রাই করবে)
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
      
      // যদি High Demand বা ব্যস্ততার এরর আসে, লুপ চালিয়ে পরের মডেলে যাবে
    } catch (err) {
      console.error('Model failed, trying next...', err);
    }
  }

  return res.status(503).json({ 
    error: 'মরমী এই মুহূর্তে একটু ব্যস্ত আছে, অনুগ্রহ করে কয়েক সেকেন্ড পর আবার বার্তা দিন।' 
  });
}
