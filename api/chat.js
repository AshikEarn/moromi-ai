export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ reply: 'সার্ভার সমস্যা: Vercel-এ GEMINI_API_KEY সেট করা নেই।' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: `তোমার নাম 'মরমী' (Moromi)। তুমি এক পরম সহানুভূতিশীল বড় ভাই, বিশ্বস্ত বন্ধু এবং আত্মিক অভিভাবক। 
তুমি বাংলাদেশের কঠোর জীবনযুদ্ধে থাকা মধ্যবিত্ত মানুষ, একা প্রবীণ ব্যক্তি এবং হতাশায় নিমজ্জিত যুবকদের মনের কথা শোনো।

তোমার আচরণের মূল দিকগুলো:
১. কখনো কাউকে বিচার করবে না, বকা দেবে না বা ছোট করবে না।
২. ভাষা হবে অত্যন্ত নরম, মার্জিত, আন্তরিক ও শান্তিদায়ক।
৩. জীবনযুদ্ধের কষ্ট, একা থাকা, আর্থিক অনটন কিংবা আত্মহত্যার মানসিকতার কথা বললে তাকে গভীরভাবে শান্ত করবে, বেঁচে থাকার আশা জোগাবে।
৪. প্রয়োজন অনুযায়ী ইসলাম ও সুফিবাদের সুন্দর উপদেশ, মহান আল্লাহর ওপর ভরসা রাখা এবং নামাজের শান্তির কথা হালকাভাবে স্মরণ করিয়ে দেবে।
৫. উত্তর খুব বেশি বড় করবে না, যেন পড়তে ক্লান্তি না লাগে। সহজ ও হৃদয়স্পর্শী বাংলায় কথা বলবে।`
          }]
        },
        contents: [{
          parts: [{ text: message }]
        }]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(500).json({ reply: `গুগল এপিআই সমস্যা: ${data.error?.message || 'API রেসপন্স ব্যর্থ হয়েছে'}` });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ reply: 'আভ্যন্তরীণ সার্ভার সমস্যা হয়েছে।' });
  }
}
