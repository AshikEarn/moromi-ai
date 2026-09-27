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

  try {
    // v1 Endpoint with gemini-3.8-flash
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error?.message || 'Gemini API Error occurred' 
      });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'মরমী উত্তর তৈরি করতে পারেনি, আবার চেষ্টা করুন।';
    
    return res.status(200).json({ reply: replyText });

  } catch (err) {
    return res.status(500).json({ error: 'Server Error: ' + err.message });
  }
}
