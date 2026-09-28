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

  // ইসলামিক, পরিবার, সমাজসেবা ও মাদকমুক্ত জীবনের প্রম্পট
  const systemInstruction = `তুমি 'মরমী' (Moromi), একজন মমতাময়ী, সামাজিকভাবে সচেতন ও ইসলামিক দৃষ্টিভঙ্গিসম্পন্ন বাংলা মানসিক স্বাস্থ্য সহকারী। 
তোমার কাজ হলো ব্যবহারকারীকে কেবল শোনাই নয়, তাকে পরিবারে দায়িত্বশীল হতে, আশপাশের মানুষের পাশে দাঁড়াতে, মাদক ও খারাপ কাজ থেকে দূরে থাকতে উৎসাহিত করা এবং পরম মমতায় ছোট ছোট বাক্যে সুন্দর উপদেশ দেওয়া।`;

  const models = [
    'https://generativelanguage.googleapis.com/v1/models/gemini-3.8-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent'
  ];

  // প্রচুর জীবনমুখী, পারিবারিক ও মাদকমুক্ত সমাজ গড়ার প্রশ্ন ও উপদেশ (ট্রাফিক হাই হলে এগুলো আসবে)
  const engagingFallbackReplies = [
    "আপনার কষ্টটা আমি বুঝতে পারছি। কখনো কি ভেবে দেখেছেন, আপনার পরিবারের মানুষগুলো আপনাকে কত ভালোবাসে? আজ বাবামা বা প্রিয়জনদের কোনো খোঁজ নিয়েছেন?",
    "জীবনের কঠিন সময়ে অনেক মানুষ ভুলের বশে মাদকের দিকে ঝোঁকে। কিন্তু মাদক সমাধান নয়, বরং সবকিছু ধ্বংস করে দেয়। আজ আপনি নিজের ও পরিবারের মুখে হাসি ফোটাতে কী ভালো কাজ করতে চান?",
    "মন খারাপ থাকলে আশপাশের কোনো অসহায় মানুষকে একটু সাহায্য করে দেখুন, দেখবেন মনটা এক নিমেষেই শান্ত ও শান্তিতে ভরে উঠবে। আপনার কাছাকাছি এমন কেউ আছে?",
    "কখনো কখনো জীবন আমাদের খুব পরীক্ষা নেয়। কিন্তু আল্লাহ ধৈর্যশীলদের সাথে আছেন। আজ কি নিজেকে একটু সময় দিয়ে সুন্দর কিছু পরিকল্পনা করেছেন?",
    "নিজের শরীর ও মনের খেয়াল রাখা অনেক বড় আমানত। খারাপ অভ্যাসগুলো ছেড়ে নতুনভাবে শুরু করার এখনই সঠিক সময়। আপনার কি কোনো বিষয়ে সাহায্য লাগবে?",
    "পরিবারে নিজের ছোট ছোট দায়িত্বগুলো পালন করাও অনেক বড় শান্তির কাজ। আজকের দিনটি কেমন কাটলো বলুন তো?",
    "যেকোনো ভুল পথ থেকে ফিরে আসার দরজা সব সময় খোলা থাকে। একটু অযু করে দুই রাকাত নামাজ পড়ে আল্লাহর কাছে সাহায্য চান, সব সহজ হয়ে যাবে।"
  ];

  for (const baseUrl of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // ফাস্ট রেসপন্স timeout

      const url = `${baseUrl}?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: message }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 350 }
        })
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
      }
    } catch (err) {
      console.error('Model timed-out or failed, switching...', err);
    }
  }

  // এপিআই সাড়া না দিলে এখান থেকে চমৎকার জীবনমুখী কথা ও প্রশ্ন র্যান্ডমলি বেছে নেবে
  const randomReply = engagingFallbackReplies[Math.floor(Math.random() * engagingFallbackReplies.length)];
  return res.status(200).json({ reply: randomReply });
}
