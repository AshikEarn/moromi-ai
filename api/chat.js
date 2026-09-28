export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is missing in environment variables.' });
  }

  // অফলাইন ব্যাকআপ উপদেশ বা বার্তা (সার্ভারে সমস্যা হলে বা সময় নিলে এগুলো র্যান্ডমলি দেখাবে)
  const fallbackAdviceList = [
    "মন খারাপ বা দুশ্চিন্তা হলে এক গ্লাস ঠাণ্ডা পানি খেয়ে একটু দীর্ঘশ্বাস নিন। মনে রাখবেন, আল্লাহ তাআলা কোনো বান্দাকে তার সাধ্যের বাইরে কষ্ট দেন না। এখন আপনার মনের অনুভূতিটি কেমন?",
    "জীবন সবসময় একরকম যায় না, মেঘের পরেই যেমন সূর্য ওঠে, আপনার কষ্টের দিনগুলোও কেটে যাবে ইনশাআল্লাহ। ধৈর্য রাখুন। আজ আপনাকে সবচেয়ে বেশি কোন বিষয়টি ভাবাচ্ছে?",
    "কখনো কখনো নিজেকে একটু সময় দেওয়া প্রয়োজন। নিজের যত্ন নিন, ভালো কোনো বই পড়ুন বা প্রিয় মানুষের সাথে কথা বলুন। আপনার কি এখন কারো সাথে কথা বলতে ইচ্ছে করছে?",
    "যেকোনো কঠিন পরিস্থিতিতে শান্ত থাকাটাই সবচেয়ে বড় শক্তি। আপনি একা নন, সবসময় মনে আশা রাখুন। আমাকে বলতে পারেন, আপনি ঠিক কোন বিষয়ে সাহায্য চাইছেন?"
  ];

  // র্যান্ডমলি একটি অফলাইন উপদেশ বেছে নেওয়া
  const randomFallbackAdvice = fallbackAdviceList[Math.floor(Math.random() * fallbackAdviceList.length)];

  // প্রাইমারি ও ব্যাকআপ মডেলের লিস্ট
  const models = ['gemini-3.8-flash', 'gemini-2.5-flash'];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are 'Moromi', a compassionate mental health chatbot. Always reply politely in Bengali.\n\nUser: ${message}`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();

      if (response.ok && data.candidates && data.candidates[0].content.parts[0].text) {
        return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
      }
    } catch (err) {
      // সমস্যা হলে লুপ পরবর্তী মডেলে যাবে
    }
  }

  // কোনো কারণে এআই মডেল রেসপন্স না দিলে সুন্দর অফলাইন উপদেশ উত্তর হিসেবে পাঠাবে
  return res.status(200).json({ 
    reply: randomFallbackAdvice 
  });
}
