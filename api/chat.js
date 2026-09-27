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
তোমার কাজ হলো ব্যবহারকারী যা বলবে বা প্রশ্ন করবে সেটির সরাসরি ও প্রাসঙ্গিক উত্তর আগে দেওয়া। পাশাপাশি তাকে পরিবারে দায়িত্বশীল হতে, মাদক ও খারাপ কাজ থেকে দূরে থাকতে উৎসাহিত করা এবং পরম মমতায় ছোট ছোট বাক্যে সুন্দর উপদেশ দেওয়া।
জরুরি নিয়ম: 
১. ব্যবহারকারীর প্রশ্নের সরাসরি ও সঠিক উত্তর আগে দেবে।
২. তোমার প্রতিটি উত্তর অবশ্যই সম্পূর্ণ বাক্যে শেষ করবে, কোনো বাক্য যেন অর্ধেক রেখে কেটে না যায়।`;

  // গুগলের ১০০% অ্যাক্টিভ স্ট্যাবল এপিআই অ্যান্ডপয়েন্ট
  const models = [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent'
  ];

  // ব্যাকআপ অফলাইন উপদেশ (কেবল এপিআই ফেল করলে)
  const fallbackReplies = [
    "আপনার কষ্টটা আমি বুঝতে পারছি। কখনো কি ভেবে দেখেছেন, আপনার পরিবারের মানুষগুলো আপনাকে কত ভালোবাসে? আজ বাবা-মা বা প্রিয়জনদের কোনো খোঁজ নিয়েছেন?",
    "জীবনের কঠিন সময়ে অনেক মানুষ ভুলের বশে মাদকের দিকে ঝোঁকে। কিন্তু মাদক সমাধান নয়, বরং সবকিছু ধ্বংস করে দেয়। আজ আপনি নিজের ও পরিবারের মুখে হাসি ফোটাতে কী ভালো কাজ করতে চান?",
    "মন খারাপ থাকলে আশপাশের কোনো অসহায় মানুষকে একটু সাহায্য করে দেখুন, দেখবেন মনটা এক নিমেষেই শান্ত হয়ে যাবে। আপনার কাছাকাছি এমন কেউ আছে?",
    "কখনো কখনো জীবন আমাদের খুব পরীক্ষা নেয়। কিন্তু আল্লাহ ধৈর্যশীলদের সাথে আছেন। আজ কি নিজেকে একটু সময় দিয়ে সুন্দর কিছু পরিকল্পনা করেছেন?",
    "নিজের শরীর ও মনের খেয়াল রাখা অনেক বড় আমানত। খারাপ অভ্যাসগুলো ছেড়ে নতুনভাবে শুরু করার এখনই সঠিক সময়। আপনার কি কোনো বিষয়ে সাহায্য লাগবে?"
  ];

  for (const baseUrl of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000); // ৯ সেকেন্ড সময় ওয়েট করবে

      const url = `${baseUrl}?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: message }] }],
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
      }
    } catch (err) {
      console.error('API Error or Timeout, trying next model...', err);
    }
  }

  // যদি এপিআই ফেইল করে তবে অফলাইন র্যান্ডম বার্তা
  const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
  return res.status(200).json({ reply: randomReply });
}
