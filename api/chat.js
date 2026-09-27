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

  const systemInstruction = `তুমি 'মরমী' (Moromi), একজন মমতাময়ী, সামাজিকভাবে সচেতন ও ইসলামিক দৃষ্টিভঙ্গিসম্পন্ন বাংলা মানসিক স্বাস্থ্য সহকারী। 
তোমার কাজ হলো ব্যবহারকারী যা বলবে বা প্রশ্ন করবে সেটির যথাযথ ও সঠিক উত্তর দেওয়া। পাশাপাশি তাকে পরিবারে দায়িত্বশীল হতে, আশপাশের মানুষের পাশে দাঁড়াতে, মাদক ও খারাপ কাজ থেকে দূরে থাকতে উৎসাহিত করা এবং পরম মমতায় ছোট ছোট বাক্যে সুন্দর উপদেশ দেওয়া।
জরুরি নিয়ম: 
১. ব্যবহারকারীর প্রশ্নের সরাসরি ও প্রাসঙ্গিক উত্তর আগে দেবে।
২. তোমার প্রতিটি উত্তর অবশ্যই সম্পূর্ণ বাক্যে শেষ করবে, কোনো বাক্য যেন অর্ধেক রেখে কেটে না যায়।`;

  // গুগলের সঠিক রানিং এপিআই অ্যান্ডপয়েন্ট
  const models = [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent'
  ];

  // ব্যাকআপ উপদেশ ও প্রশ্নাবলি (কেবল চরম বিপদে)
  const fallbackReplies = [
    "আমি আপনার অনুভূতিটা বুঝতে পারছি। আপনার কথাগুলো শুনছি, আরও বিস্তারিত বলবেন কি?",
    "জীবনের এই সময়ে পরিবারের সাথে কথা বলা বা কাছের মানুষের পাশে থাকা আপনাকে অনেক স্বস্তি দিতে পারে। আপনার পরিবারে কে সবচেয়ে কাছের?",
    "মন খারাপ বা অনিশ্চয়তায় থাকলে এক গ্লাস পানি খেয়ে একটু বিশ্রাম নিন। আল্লাহ ধৈর্যশীলদের ভালোবাসেন।",
    "নিজের খেয়াল রাখা ও অসৎ পথ (যেমন মাদক বা হতাশা) থেকে দূরে থাকা অনেক বড় সফলতা। আজকের দিনটি কীভাবে কাটানোর ইচ্ছা?"
  ];

  for (const baseUrl of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // ৮ সেকেন্ড সময় দেওয়া হলো অনলাইন এআই নিশ্চিত পাওয়ার জন্য

      const url = `${baseUrl}?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${systemInstruction}\n\nUser Question: ${message}` }
              ]
            }
          ],
          generationConfig: { 
            temperature: 0.7, 
            maxOutputTokens: 1000 
          }
        })
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
      }
    } catch (err) {
      console.error('API Error or Timeout, trying next model...', err);
    }
  }

  // যদি গুগল এপিআই কোনো কারণে ফেইল করে
  const randomIndex = Math.floor(Math.random() * fallbackReplies.length);
  return res.status(200).json({ reply: fallbackReplies[randomIndex] });
}
