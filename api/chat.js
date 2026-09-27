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
তোমার কাজ হলো ব্যবহারকারীকে কেবল শোনাই নয়, তাকে পরিবারে দায়িত্বশীল হতে, আশপাশের মানুষের পাশে দাঁড়াতে, মাদক ও খারাপ কাজ থেকে দূরে থাকতে উৎসাহিত করা এবং পরম মমতায় ছোট ছোট বাক্যে সুন্দর উপদেশ দেওয়া।
জরুরি নিয়ম: তোমার প্রতিটি উত্তর অবশ্যই সম্পূর্ণ বাক্যে শেষ করবে, কোনো বাক্য যেন অর্ধেক রেখে কেটে না যায়।`;

  // গুগলের সঠিক ভার্সনের অফিশিয়াল মডেল অ্যান্ডপয়েন্ট
  const models = [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent'
  ];

  // ট্রাফিক অতিরিক্ত হাই থাকলে ডায়নামিক বৈচিত্র্যময় প্রশ্ন ও উপদেশ
  const fallbackReplies = [
    "আপনার কষ্টের কথা আমি বুঝতে পারছি। জীবনের এই কঠিন সময়ে পরিবারের কার কাছে মন খুলে কথা বললে আপনার একটু ভালো লাগবে বলুন তো?",
    "কখনো কখনো জীবন পরীক্ষা নেয়। তবে মাদক বা খারাপ কোনো পথ কখনোই সমাধান দেয় না। আজ নিজের বা পরিবারের মুখে হাসি ফোটাতে কোনো পরিকল্পনা করেছেন?",
    "মন খারাপ থাকলে আশপাশের কোনো অসহায় মানুষকে সাহায্য করার চেষ্টা করুন। অন্যের মুখে হাসি ফোটালে নিজের মনটাও এক নিমেষে শান্ত হয়ে যায়।",
    "ধৈর্য ও প্রার্থনার শক্তি অনেক বড়। আজকের দিনে কি এমন কিছু ঘটেছে যা আপনাকে খুব ভাবাচ্ছে? চাইলে আমার সাথে শেয়ার করতে পারেন।",
    "নিজের খেয়াল রাখা ও পরিবারের পাশে থাকা অনেক বড় এক ইবাদত। আজ কি বাবামা বা প্রিয়জনদের কোনো খোঁজ নিয়েছেন?",
    "খারাপ লাগার মুহূর্তগুলো চিরস্থায়ী নয়। একটু অযু করে দুই রাকাত নামাজ পড়ুন, আল্লাহর কাছে মনে কথা বলুন—অনেক হালকা লাগবে।",
    "নিজের জীবনকে গুছিয়ে তুলতে প্রতিটি নতুন দিনই একটি নতুন সুযোগ। আজকের দিনটিকে কীভাবে আরও সুন্দর করা যায় বলুন তো?",
    "সমাজ ও পরিবারের জন্য ভালো কিছু করার প্রেরণা পাওয়ার জন্য ধনসম্পদের প্রয়োজন হয় না, শুধু একটা সুন্দর মনের প্রয়োজন হয়। আপনার দিনটি কেমন কাটছে?"
  ];

  for (const baseUrl of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000); // ৭ সেকেন্ড ব্যাকএন্ড ওয়েট

      const url = `${baseUrl}?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: message }] }],
          generationConfig: { 
            temperature: 0.8, 
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

  // র্যান্ডমলি একেকবার একেক প্রশ্ন নির্বাচন
  const randomIndex = Math.floor(Math.random() * fallbackReplies.length);
  return res.status(200).json({ reply: fallbackReplies[randomIndex] });
}
