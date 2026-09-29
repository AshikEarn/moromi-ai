export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const text = String(message).toLowerCase().trim();

    let reply = "";

    if (
      text.includes("মন খারাপ") ||
      text.includes("দুঃখ") ||
      text.includes("কষ্ট") ||
      text.includes("হতাশ") ||
      text.includes("depressed") ||
      text.includes("sad") ||
      text.includes("stress") ||
      text.includes("tension")
    ) {
      reply =
        "মন খারাপ থাকা মানেই আপনি দুর্বল নন। 🌿 একটু পানি পান করুন, ধীরে শ্বাস নিন এবং একজন বিশ্বস্ত মানুষের সাথে কথা বলুন। সব সমস্যা একদিনে সমাধান করতে হয় না। আজ শুধু একটি ছোট ভালো পদক্ষেপ নিন। আপনার মন খারাপের কারণটা চাইলে আমাকে বলতে পারেন।";
    }

    else if (
      text.includes("মাদক") ||
      text.includes("নেশা") ||
      text.includes("গাঁজা") ||
      text.includes("ইয়াবা") ||
      text.includes("ইয়াবা") ||
      text.includes("drug") ||
      text.includes("নেশা")
    ) {
      reply =
        "মাদক কোনো সমস্যার স্থায়ী সমাধান নয়। 🚫 এটি স্বাস্থ্য, অর্থ, পরিবার ও ভবিষ্যতের ক্ষতি করতে পারে। নেশা ছাড়তে চাইলে একা লড়াই করার দরকার নেই—বিশ্বস্ত পরিবার, চিকিৎসক বা আসক্তি চিকিৎসা সেবার সাহায্য নিন। আপনি চাইলে মাদক ছাড়ার জন্য ধাপে ধাপে একটি পরিকল্পনা করতে পারি।";
    }

    else if (
      text.includes("জুয়া") ||
      text.includes("জুয়া") ||
      text.includes("বেটিং") ||
      text.includes("betting") ||
      text.includes("gambling") ||
      text.includes("casino") ||
      text.includes("ক্যাসিনো")
    ) {
      reply =
        "বেটিং বা জুয়াকে সহজ আয়ের পথ মনে করবেন না। 🎯 এতে টাকা হারানোর ঝুঁকি থাকে এবং হারানো টাকা ফেরত পাওয়ার জন্য আবার বেট করার চক্র তৈরি হতে পারে। অ্যাপ বা সাইট বন্ধ করা, পেমেন্টের সহজ পথ সরিয়ে রাখা এবং বিশ্বস্ত কাউকে জানানো—এসব দিয়ে শুরু করতে পারেন।";
    }

    else if (
      text.includes("আল্লাহ") ||
      text.includes("ইসলাম") ||
      text.includes("নামাজ") ||
      text.includes("কোরআন") ||
      text.includes("কুরআন") ||
      text.includes("রাসূল") ||
      text.includes("রাসুল") ||
      text.includes("দোয়া") ||
      text.includes("দোয়া") ||
      text.includes("allah") ||
      text.includes("islam") ||
      text.includes("namaz") ||
      text.includes("quran") ||
      text.includes("dua")
    ) {
      reply =
        "আল্লাহর দিকে ফিরে আসার ইচ্ছাটাই একটি সুন্দর শুরু। 🌙 নামাজ, দোয়া, কোরআন তিলাওয়াত এবং ভালো কাজের মাধ্যমে ধীরে ধীরে নিজেকে গড়ে তুলুন। অতীতের ভুলের জন্য তওবা করুন এবং হতাশ হবেন না। কোরআনে এসেছে: “নিশ্চয়ই আল্লাহর স্মরণেই অন্তরসমূহ প্রশান্ত হয়।” — সূরা আর-রাদ ১৩:২৮।";
    }

    else if (
      text.includes("পরিবার") ||
      text.includes("বাবা") ||
      text.includes("মা") ||
      text.includes("স্ত্রী") ||
      text.includes("বউ") ||
      text.includes("সন্তান") ||
      text.includes("family") ||
      text.includes("wife") ||
      text.includes("mother") ||
      text.includes("father")
    ) {
      reply =
        "পরিবারের সাথে সুন্দর সম্পর্কের জন্য ভালোবাসার পাশাপাশি সম্মান ও যোগাযোগ দরকার। ❤️ রাগের সময় কঠিন কথা না বলে কিছুক্ষণ বিরতি নিন এবং পরে শান্তভাবে কথা বলুন। আজ পরিবারের কাউকে একটি ভালো কথা বলা বা ছোট কোনো কাজে সাহায্য করা দিয়ে শুরু করতে পারেন।";
    }

    else if (
      text.includes("পড়াশোনা") ||
      text.includes("পড়াশোনা") ||
      text.includes("ভবিষ্যৎ") ||
      text.includes("লক্ষ্য") ||
      text.includes("ক্যারিয়ার") ||
      text.includes("ক্যারিয়ার") ||
      text.includes("চাকরি") ||
      text.includes("যুব") ||
      text.includes("future") ||
      text.includes("career") ||
      text.includes("study") ||
      text.includes("job")
    ) {
      reply =
        "আপনার ভবিষ্যৎ আজকের ছোট ছোট অভ্যাসে তৈরি হচ্ছে। 🌱 একসাথে অনেক কিছু করার দরকার নেই। একটি দক্ষতা বেছে নিয়ে প্রতিদিন ৩০ মিনিট শেখার চেষ্টা করুন। ব্যর্থ হলে থেমে যাবেন না—ভুল থেকে শিক্ষা নিয়ে আবার শুরু করুন। আপনার সবচেয়ে বড় লক্ষ্যটি কী?";
    }

    else if (
      text.includes("টাকা") ||
      text.includes("আয়") ||
      text.includes("আয়") ||
      text.includes("বেতন") ||
      text.includes("সঞ্চয়") ||
      text.includes("সঞ্চয়") ||
      text.includes("ঋণ") ||
      text.includes("কাজ") ||
      text.includes("income") ||
      text.includes("salary") ||
      text.includes("money") ||
      text.includes("work")
    ) {
      reply =
        "সৎ উপার্জন ও দক্ষতা—দুটিই গুরুত্বপূর্ণ। 💰 আয় কম হলে আগে প্রয়োজনীয় খরচ আলাদা করুন, তারপর সম্ভব হলে অল্প হলেও সঞ্চয় করুন। পাশাপাশি এমন একটি দক্ষতা শেখার চেষ্টা করুন যা ভবিষ্যতে আপনার আয় বাড়াতে পারে। আপনি কোন কাজ বা দক্ষতা শিখতে চান?";
    }

    else if (
      text.includes("রাগ") ||
      text.includes("ঝগড়া") ||
      text.includes("ঝগড়া") ||
      text.includes("সম্পর্ক") ||
      text.includes("ভালোবাসা") ||
      text.includes("প্রেম") ||
      text.includes("ক্ষমা") ||
      text.includes("love") ||
      text.includes("relationship")
    ) {
      reply =
        "রাগের সময় সিদ্ধান্ত না নেওয়াই ভালো। 🌿 কিছুক্ষণ বিরতি নিন, শান্ত হন এবং পরে সমস্যাটা নিয়ে কথা বলুন। কাউকে হারানোর জন্য নয়, সমস্যা সমাধানের জন্য কথা বলুন। ভুল হলে নিজের ভুল স্বীকার করাও সম্পর্ককে সুন্দর করার একটি শক্তি।";
    }

    else if (
      text.includes("হাই") ||
      text.includes("হ্যালো") ||
      text.includes("hello") ||
      text.includes("hi") ||
      text.includes("hey") ||
      text.includes("সালাম") ||
      text.includes("আসসালামু")
    ) {
      reply =
        "আসসালামু আলাইকুম 🌸 আমি মরমী। আজ কেমন আছেন? আপনার মনের কথা, কোনো প্রশ্ন বা জীবনের কোনো সমস্যা নিয়ে আমার সাথে কথা বলতে পারেন।";
    }

    else {
      reply =
        "আপনার কথাটি বুঝতে পেরেছি। 🌿 মরমী এখন একটি ফ্রি Offline Bot, তাই সব প্রশ্নের উত্তর দিতে পারবে না। তবে আপনি মাদক, বেটিং, ইসলাম, পরিবার, মন খারাপ, পড়াশোনা, কাজ, টাকা, সম্পর্ক বা জীবনের কোনো সমস্যা নিয়ে প্রশ্ন করতে পারেন। আপনার প্রশ্নটি আরেকটু বিস্তারিত করে লিখবেন?";
    }

    return res.status(200).json({
      reply: reply,
      mode: "offline"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "মরমীর উত্তর তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।"
    });
  }
}
