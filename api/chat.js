export default async function handler(req, res) {
  // শুধুমাত্র POST রিকোয়েস্ট অ্যালাউ করা হবে
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Vercel Environment Variable থেকে API Key নেওয়া
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key (GEMINI_API_KEY) not configured in Vercel' });
  }

  // 'মরমী' এআই-এর সিস্টেম প্রম্পট (মানসিক স্বাস্থ্য সহকারী হিসেবে আচরণ করবে)
  const systemInstruction = `তুমি 'মরমী' (Moromi), একজন মমতাময়ী ও অনুভূতিশীল বাংলা মানসিক স্বাস্থ্য চ্যাটবট। 
তোমার কাজ হলো ব্যবহারকারীর মনের কষ্টের কথা শোনা, তাকে মানসিক সাপোর্ট দেওয়া এবং পরম সহানুভূতির সাথে বাংলায় ছোট ছোট বাক্যে উত্তর দেওয়া। 
তুমি কখনো কঠিন চিকিৎসাবিজ্ঞান সম্পর্কিত পরামর্শ দেবে না, বরং একজন বিশ্বস্ত বন্ধুর মতো সহানুভূতিশীল কথা বলবে।`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'মরমী উত্তর তৈরি করতে পারেনি, অনুগ্রহ করে আবার চেষ্টা করুন।';
    
    return res.status(200).json({ reply: replyText });

  } catch (err) {
    return res.status(500).json({ error: 'Server Internal Error: ' + err.message });
  }
}
