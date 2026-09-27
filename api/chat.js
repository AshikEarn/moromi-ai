const https = require('https');

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({ reply: 'বার্তা পাওয়া যায়নি।' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ reply: 'সার্ভার সমস্যা: Vercel-এ GEMINI_API_KEY সেট করা নেই।' });
  }

  const payload = JSON.stringify({
    systemInstruction: {
      parts: [{
        text: `তোমার নাম 'মরমী' (Moromi)। তুমি এক পরম সহানুভূতিশীল বড় ভাই, বিশ্বস্ত বন্ধু এবং আত্মিক অভিভাবক। তুমি বাংলাদেশের কঠোর জীবনযুদ্ধে থাকা মধ্যবিত্ত মানুষ, একা প্রবীণ ব্যক্তি এবং হতাশায় নিমজ্জিত যুবকদের মনের কথা শোনো।\n\nতোমার আচরণের মূল দিকগুলো:\n১. কখনো কাউকে বিচার করবে না, বকা দেবে না বা ছোট করবে না।\n২. ভাষা হবে অত্যন্ত নরম, মার্জিত, আন্তরিক ও শান্তিদায়ক।\n৩. জীবনযুদ্ধের কষ্ট, একা থাকা, আর্থিক অনটন কিংবা আত্মহত্যার মানসিকতার কথা বললে তাকে গভীরভাবে শান্ত করবে, বেঁচে থাকার আশা জোগাবে।\n৪. প্রয়োজন অনুযায়ী ইসলাম ও সুফিবাদের সুন্দর উপদেশ, মহান আল্লাহর ওপর ভরসা রাখা এবং নামাজের শান্তির কথা হালকাভাবে স্মরণ করিয়ে দেবে।\n৫. উত্তর খুব বেশি বড় করবে না, যেন পড়তে ক্লান্তি না লাগে। সহজ ও হৃদয়স্পর্শী বাংলায় কথা বলবে।`
      }]
    },
    contents: [{
      parts: [{ text: message }]
    }]
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve) => {
    const apiReq = https.request(options, (apiRes) => {
      let data = '';

      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        try {
          const parsedData = JSON.parse(data);

          if (apiRes.statusCode !== 200) {
            console.error('Gemini API Error:', parsedData);
            res.status(apiRes.statusCode).json({
              reply: `গুগল এপিআই সমস্যা (${apiRes.statusCode}): ${parsedData.error?.message || 'API রেসপন্স ব্যর্থ হয়েছে'}`
            });
            return resolve();
          }

          const reply = parsedData.candidates?.[0]?.content?.parts?.[0]?.text || 'কোনো উত্তর পাওয়া যায়নি।';
          res.status(200).json({ reply });
          return resolve();
        } catch (e) {
          console.error('JSON Parse Error:', e);
          res.status(500).json({ reply: 'রেসপন্স পার্স করতে সমস্যা হয়েছে।' });
          return resolve();
        }
      });
    });

    apiReq.on('error', (error) => {
      console.error('HTTPS Request Error:', error);
      res.status(500).json({ reply: 'গুগল সার্ভারে সংযোগ করা যায়নি।' });
      return resolve();
    });

    apiReq.write(payload);
    apiReq.end();
  });
};
