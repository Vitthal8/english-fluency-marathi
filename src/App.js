import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
   DIAGNOSTIC QUESTIONS
═══════════════════════════════════════════════════════════ */
const QUIZ = [
  {
    q: "When someone asks 'How are you?' — you reply:",
    mr: "कोणी 'How are you?' विचारले तर तुम्ही उत्तर द्याल:",
    options: [
      { text: "I can't answer easily", mr: "मला उत्तर देणे कठीण आहे", score: 0 },
      { text: "Fine, thank you", mr: "Fine, thank you — एवढेच", score: 1 },
      { text: "I'm doing well, thanks for asking!", mr: "थोडे जास्त बोलतो", score: 2 },
      { text: "I hold a full conversation", mr: "संपूर्ण संभाषण करतो", score: 3 },
    ],
  },
  {
    q: "Reading this English sentence — how do you feel?",
    mr: "हे English वाक्य वाचताना कसे वाटते?",
    sub: '"The quarterly production report showed a 12% improvement in efficiency."',
    options: [
      { text: "I don't understand most words", mr: "बरेच शब्द समजत नाहीत", score: 0 },
      { text: "I understand but can't use these words", mr: "समजते पण वापरता येत नाही", score: 1 },
      { text: "I understand and can explain it", mr: "समजते आणि सांगता येते", score: 2 },
      { text: "I can write a similar sentence easily", mr: "असे वाक्य सहज लिहू शकतो", score: 3 },
    ],
  },
  {
    q: "At work, how do you communicate in English?",
    mr: "कामावर तुम्ही English मध्ये कसे बोलता?",
    options: [
      { text: "I avoid English completely", mr: "English टाळतो मी", score: 0 },
      { text: "Only simple words/phrases", mr: "फक्त साधे शब्द वापरतो", score: 1 },
      { text: "Emails yes, speaking is difficult", mr: "Emails ठीक, बोलणे कठीण", score: 2 },
      { text: "Both emails and speaking comfortably", mr: "Email आणि बोलणे दोन्ही", score: 3 },
    ],
  },
  {
    q: "How long can you speak in English without stopping?",
    mr: "तुम्ही किती वेळ English मध्ये न थांबता बोलू शकता?",
    options: [
      { text: "Less than 10 seconds", mr: "10 सेकंदांपेक्षा कमी", score: 0 },
      { text: "About 30 seconds", mr: "सुमारे 30 सेकंद", score: 1 },
      { text: "1–2 minutes", mr: "1–2 मिनिटे", score: 2 },
      { text: "3+ minutes easily", mr: "3+ मिनिटे सहज", score: 3 },
    ],
  },
  {
    q: "When you think — which language comes first?",
    mr: "विचार करताना — कोणती भाषा आधी येते?",
    options: [
      { text: "Only Marathi, then I translate", mr: "फक्त मराठी, मग translate", score: 0 },
      { text: "Marathi mostly, English sometimes", mr: "जास्त मराठी, कधी कधी English", score: 1 },
      { text: "Mix of both languages", mr: "दोन्ही मिळून येतात", score: 2 },
      { text: "Directly in English", mr: "थेट English मध्ये विचार", score: 3 },
    ],
  },
  {
    q: "Your English speaking anxiety level:",
    mr: "English बोलताना तुम्हाला किती घाबरल्यासारखे वाटते?",
    options: [
      { text: "9–10: Extremely anxious, I avoid it", mr: "9–10: खूप जास्त, टाळतो मी", score: 0 },
      { text: "6–8: Very nervous but I try", mr: "6–8: खूप घाबरतो पण प्रयत्न करतो", score: 1 },
      { text: "3–5: Nervous but manageable", mr: "3–5: थोडे वाटते, handle करतो", score: 2 },
      { text: "1–2: Mostly comfortable", mr: "1–2: जवळपास comfortable", score: 3 },
    ],
  },
  {
    q: "Have you ever spoken English on a phone call or meeting?",
    mr: "तुम्ही कधी English मध्ये phone call किंवा meeting केली आहे का?",
    options: [
      { text: "Never — too scary", mr: "कधीच नाही — खूप भीती", score: 0 },
      { text: "Once or twice, very badly", mr: "एक–दोनदा, खूप खराब", score: 1 },
      { text: "Yes, sometimes, somewhat okay", mr: "हो, कधी कधी, बऱ्यापैकी", score: 2 },
      { text: "Yes, regularly and confidently", mr: "हो, नियमित आणि आत्मविश्वासाने", score: 3 },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════
   LEVEL DATA
═══════════════════════════════════════════════════════════ */
const LEVELS = {
  beginner: {
    id: "beginner",
    label: "Beginner",
    marathi: "नवीन शिकणारा",
    emoji: "🌱",
    color: "#c2410c",
    accent: "#fb923c",
    light: "#fff7ed",
    gradient: "linear-gradient(135deg, #7c2d12, #c2410c, #ea580c)",
    minutes: 15,
    desc: "You are starting fresh. We will build your English from the ground up — slowly, confidently, step by step.",
    marathiDesc: "तुम्ही नुकतीच सुरुवात करत आहात. आपण हळूहळू, आत्मविश्वासाने English शिकूया.",
    scoreRange: "0–7",
    phases: [
      {
        id: 1, title: "Basic Speaking", marathi: "मूलभूत बोलणे", days: "1–30", icon: "🌱",
        focus: [
          { en: "Learn 5 new words daily", mr: "रोज 5 नवीन शब्द शिका" },
          { en: "Simple greetings & responses", mr: "साध्या अभिवादन वाक्यांचा सराव" },
          { en: "Mirror talking — 5 min/day", mr: "आरशासमोर 5 मिनिट बोला" },
          { en: "Listen to English 10 min/day", mr: "रोज 10 मिनिट English ऐका" },
        ],
        drills: [
          { id: "b1", icon: "👋", name: "Daily Greetings", mr: "रोजचे अभिवादन", min: 3,
            desc: "Practice 5 basic greeting conversations every morning. Repeat until they feel automatic.",
            mrDesc: "सकाळी 5 साध्या conversations चा सराव करा. Automatic वाटेपर्यंत repeat करा.",
            example: '"Good morning!" "How are you?" "I am fine, thank you." "Have a good day!" "See you tomorrow!"' },
          { id: "b2", icon: "🔤", name: "Word of the Day", mr: "आजचा शब्द", min: 5,
            desc: "Learn 1 new English word. Say it in 3 different sentences out loud. Write it. Use it today.",
            mrDesc: "1 नवीन English शब्द शिका. तो 3 वेगळ्या वाक्यांत मोठ्याने बोला. लिहा. आज वापरा.",
            example: 'Word: "Urgent" → "This is urgent." → "I have an urgent task." → "Please handle this urgent matter."' },
          { id: "b3", icon: "🪞", name: "Mirror Talk", mr: "आरशासमोर बोलणे", min: 5,
            desc: "Look in the mirror. Describe what you see. Use simple words. Don't stop for 3 minutes.",
            mrDesc: "आरशात बघा. दिसते ते सांगा. साधे शब्द वापरा. 3 मिनिट न थांबता बोला.",
            example: '"I see my face. I have black hair. I am wearing a shirt. The mirror is clean. I look okay today."' },
          { id: "b4", icon: "👂", name: "Listen & Repeat", mr: "ऐका आणि सांगा", min: 5,
            desc: "Play any English YouTube video (news/cartoon). After every sentence, pause and repeat it aloud.",
            mrDesc: "कोणताही English YouTube video लावा. प्रत्येक वाक्यानंतर pause करा आणि ते पुन्हा बोला.",
            example: 'BBC Learning English, VOA Learning English — slow speed videos work best for beginners.' },
        ],
        vocab: [
          { en: "Good morning", mr: "शुभ प्रभात", cat: "Greetings" },
          { en: "Thank you", mr: "धन्यवाद", cat: "Polite" },
          { en: "Please", mr: "कृपया", cat: "Polite" },
          { en: "Sorry", mr: "माफ करा", cat: "Polite" },
          { en: "I don't understand", mr: "मला समजले नाही", cat: "Essential" },
          { en: "Can you repeat?", mr: "पुन्हा सांगता का?", cat: "Essential" },
          { en: "My name is...", mr: "माझे नाव... आहे", cat: "Introduction" },
          { en: "I work in printing", mr: "मी printing मध्ये काम करतो", cat: "Work" },
          { en: "Deadline", mr: "अंतिम तारीख", cat: "Work" },
          { en: "Print order", mr: "छपाईची ऑर्डर", cat: "Printing" },
        ],
        challenges: [
          { week: 1, en: "Record yourself saying your full name, job, and city in English. 30 seconds.", mr: "तुमचे नाव, काम, आणि शहर English मध्ये सांगा. 30 सेकंद record करा." },
          { week: 2, en: "Have a 1-minute conversation with yourself in front of the mirror. Record it.", mr: "आरशासमोर 1 मिनिट स्वतःशी बोला. Record करा." },
          { week: 3, en: "Write 5 sentences about your work day in English. Then read them aloud.", mr: "कामाच्या दिवसाबद्दल 5 English वाक्ये लिहा. मग मोठ्याने वाचा." },
          { week: 4, en: "Watch a 2-minute English video and summarize what you heard in 3 sentences.", mr: "2 मिनिटांचा English video पहा आणि 3 वाक्यांत सांगा काय ऐकले ते." },
        ],
      },
      {
        id: 2, title: "Building Sentences", marathi: "वाक्ये बांधणे", days: "31–60", icon: "🌿",
        focus: [
          { en: "Form complete sentences naturally", mr: "पूर्ण वाक्ये सहज बनवा" },
          { en: "Basic workplace communication", mr: "कामाच्या ठिकाणी basic communication" },
          { en: "Bridge phrases to avoid silence", mr: "शांतता टाळण्यासाठी bridge phrases" },
          { en: "Simple email writing", mr: "साध्या emails लिहा" },
        ],
        drills: [
          { id: "b5", icon: "📝", name: "Sentence Builder", mr: "वाक्य बनवा", min: 5,
            desc: "Start with 1 simple word. Build it into a full sentence. Then add more detail.",
            mrDesc: "1 साध्या शब्दाने सुरुवात करा. पूर्ण वाक्य बनवा. मग अधिक detail जोडा.",
            example: '"Print" → "We print." → "We print brochures." → "We print brochures for clients every week."' },
          { id: "b6", icon: "🌉", name: "Bridge Phrases", mr: "Bridge Phrases", min: 5,
            desc: "Memorize these 5 phrases. Use them every time you need time to think. Practice daily.",
            mrDesc: "हे 5 phrases पाठ करा. विचार करायला वेळ लागेल तेव्हा वापरा.",
            example: '"Let me think..." | "What I mean is..." | "In other words..." | "To be clear..." | "Let me explain..."' },
          { id: "b7", icon: "📧", name: "Simple Email Drill", mr: "Email सराव", min: 5,
            desc: "Write a 3-line email about a print order. Subject + 2 sentences + Thank you.",
            mrDesc: "Print order बद्दल 3 ओळींचा email लिहा. Subject + 2 वाक्ये + Thank you.",
            example: 'Subject: Print Order Update\n"Dear Sir, The brochures are ready. Please collect them by Friday. Thank you."' },
        ],
        vocab: [
          { en: "I would like to...", mr: "मला ... करायचे आहे", cat: "Phrases" },
          { en: "Could you please...", mr: "कृपया ... करता का?", cat: "Polite" },
          { en: "I understand", mr: "मला समजले", cat: "Responses" },
          { en: "Let me check", mr: "मला तपासू द्या", cat: "Work" },
          { en: "The order is ready", mr: "ऑर्डर तयार आहे", cat: "Printing" },
          { en: "Quality check", mr: "दर्जा तपासणी", cat: "Printing" },
          { en: "Delivery date", mr: "वितरण तारीख", cat: "Work" },
          { en: "I will get back to you", mr: "मी तुम्हाला नंतर कळवतो", cat: "Phrases" },
          { en: "Thank you for your order", mr: "तुमच्या ऑर्डरसाठी धन्यवाद", cat: "Client" },
          { en: "There is a small delay", mr: "थोडा उशीर आहे", cat: "Work" },
        ],
        challenges: [
          { week: 5, en: "Write and then READ ALOUD a complete email to a client about their print order.", mr: "Client ला print order बद्दल email लिहा आणि मोठ्याने वाचा." },
          { week: 6, en: "Use bridge phrases 5 times today in real or practice conversations. Count them.", mr: "आज bridge phrases 5 वेळा वापरा. मोजा." },
          { week: 7, en: "Describe your job in English for 60 seconds without stopping.", mr: "तुमच्या कामाबद्दल 60 सेकंद न थांबता English मध्ये बोला." },
          { week: 8, en: "Record a fake phone call — you explain a print delay to a client. 2 minutes.", mr: "एक fake phone call record करा — client ला print delay बद्दल सांगा. 2 मिनिटे." },
        ],
      },
      {
        id: 3, title: "Real Conversations", marathi: "खरे संभाषण", days: "61–90", icon: "🚀",
        focus: [
          { en: "Hold 2–3 minute conversations", mr: "2–3 मिनिटांचे conversations करा" },
          { en: "Handle basic client interactions", mr: "Client शी basic conversations करा" },
          { en: "Reduce translation dependency", mr: "Translate करणे कमी करा" },
          { en: "Build daily English habit", mr: "रोज English बोलण्याची सवय लावा" },
        ],
        drills: [
          { id: "b8", icon: "🤝", name: "Client Simulation", mr: "Client Simulation", min: 7,
            desc: "Use AI as a client. Practice taking a print order from start to end. Full conversation.",
            mrDesc: "AI ला client म्हणून वापरा. Print order घेण्याचा पूर्ण सराव करा.",
            example: '"Hello, how can I help you?" → "What size do you need?" → "When is your deadline?" → "We will have it ready."' },
          { id: "b9", icon: "🎙️", name: "Voice Journal", mr: "Voice Diary", min: 5,
            desc: "Every evening — speak your day in English for 3 minutes. No writing. Just talking.",
            mrDesc: "दररोज रात्री — 3 मिनिट English मध्ये तुमचा दिवस सांगा. लिहू नका. फक्त बोला.",
            example: '"Today I came to work at 9. I had 3 orders to finish. One client called about delay..."' },
          { id: "b10", icon: "⏱️", name: "2-Min Topic Talk", mr: "2 मिनिट विषय बोला", min: 5,
            desc: "Pick a topic. Talk about it for 2 full minutes. Use bridge phrases. Do not stop.",
            mrDesc: "एक विषय निवडा. 2 पूर्ण मिनिटे बोला. Bridge phrases वापरा. थांबू नका.",
            example: 'Topics: My printing shop | My daily routine | My city Pune/Nagpur | My family' },
        ],
        vocab: [
          { en: "I am confident", mr: "मला आत्मविश्वास आहे", cat: "Mindset" },
          { en: "Let me explain", mr: "मला समजावू द्या", cat: "Phrases" },
          { en: "In my experience", mr: "माझ्या अनुभवानुसार", cat: "Phrases" },
          { en: "We specialize in", mr: "आम्ही ... मध्ये तज्ज्ञ आहोत", cat: "Business" },
          { en: "Our turnaround time", mr: "आमचा delivery वेळ", cat: "Printing" },
          { en: "High-quality output", mr: "उच्च दर्जाचे output", cat: "Printing" },
          { en: "Customer satisfaction", mr: "ग्राहक समाधान", cat: "Business" },
          { en: "Best price guaranteed", mr: "सर्वोत्तम किंमत guaranteed", cat: "Sales" },
          { en: "I will follow up", mr: "मी follow up करतो", cat: "Work" },
          { en: "Thank you for trusting us", mr: "आमच्यावर विश्वास ठेवल्याबद्दल धन्यवाद", cat: "Client" },
        ],
        challenges: [
          { week: 9, en: "Have a full 3-minute AI conversation taking a client order from start to finish.", mr: "AI शी 3 मिनिट client order घेण्याचे पूर्ण conversation करा." },
          { week: 10, en: "Record your morning routine in English — 2 minutes. Play it back and listen.", mr: "तुमची सकाळची routine English मध्ये 2 मिनिट record करा. ऐका." },
          { week: 11, en: "Say 5 things you are proud of — about your work — in English. Record it.", mr: "तुमच्या कामाबद्दल 5 गोष्टी आत्मविश्वासाने English मध्ये सांगा." },
          { week: 12, en: "FINAL: Record a 3-minute introduction of yourself and your work. This is your proof!", mr: "अंतिम: स्वतःची आणि कामाची 3 मिनिट ओळख record करा. हा तुमचा पुरावा!" },
        ],
      },
    ],
  },

  intermediate: {
    id: "intermediate",
    label: "Intermediate",
    marathi: "मध्यम स्तर",
    emoji: "🌿",
    color: "#065f46",
    accent: "#10b981",
    light: "#f0fdf4",
    gradient: "linear-gradient(135deg, #064e3b, #065f46, #059669)",
    minutes: 20,
    desc: "You have a foundation. Now we build speed, confidence, and professional power.",
    marathiDesc: "तुमच्याकडे आधीच base आहे. आता आपण वेग, आत्मविश्वास आणि professional English बनवूया.",
    scoreRange: "8–14",
    phases: [
      {
        id: 1, title: "Activation Sprint", marathi: "Activation Sprint", days: "1–30", icon: "⚡",
        focus: [
          { en: "Eliminate the freeze response", mr: "बोलताना थांबणे बंद करा" },
          { en: "60-second speaking without pause", mr: "60 सेकंद न थांबता बोला" },
          { en: "Bridge phrases mastery", mr: "Bridge phrases expert व्हा" },
          { en: "Mirror narration daily", mr: "रोज mirror narration करा" },
        ],
        drills: [
          { id: "i1", icon: "🪞", name: "Mirror Narration", mr: "Mirror Narration", min: 5,
            desc: "Describe everything you see and do out loud in English. No pausing. Volume over perfection.",
            mrDesc: "दिसते ते सगळे मोठ्याने English मध्ये सांगा. थांबू नका. आवाज महत्त्वाचा, परफेक्शन नाही.",
            example: '"I am standing in my room. I have a blue shirt on. I can see the window. Today I have 3 print jobs to complete..."' },
          { id: "i2", icon: "⚡", name: "60-Second Blast", mr: "60 सेकंद Blast", min: 5,
            desc: "Set a timer. Pick a topic. Talk for 60 full seconds. If stuck — use a bridge phrase and continue.",
            mrDesc: "Timer लावा. विषय निवडा. 60 पूर्ण सेकंद बोला. अडकलो — bridge phrase वापरा आणि चालू ठेवा.",
            example: 'Week 1: My daily routine | Week 2: My work | Week 3: My city | Week 4: A recent challenge I faced' },
          { id: "i3", icon: "📈", name: "Sentence Expansion", mr: "वाक्य वाढवणे", min: 5,
            desc: "Take a simple sentence. Expand it 4 times by adding more details each time.",
            mrDesc: "एक साधे वाक्य घ्या. 4 वेळा detail जोडून ते वाढवा.",
            example: '"We print." → "We print brochures." → "We print high-quality brochures for clients." → "We print high-quality brochures for corporate clients with 48-hour delivery."' },
          { id: "i4", icon: "🌉", name: "Bridge Phrase Drill", mr: "Bridge Phrase सराव", min: 5,
            desc: "Practice all 10 bridge phrases out loud 3 times each. Then use them in 5 sentences.",
            mrDesc: "सर्व 10 bridge phrases 3 वेळा मोठ्याने बोला. मग 5 वाक्यांत वापरा.",
            example: '"That\'s a great point..." | "Let me think for a moment..." | "What I mean is..." | "To put it simply..."' },
        ],
        vocab: [
          { en: "Turnaround time", mr: "काम पूर्ण होण्याचा वेळ", cat: "Printing" },
          { en: "Color proof", mr: "रंग तपासणी", cat: "Printing" },
          { en: "Press-ready files", mr: "छपाईसाठी तयार files", cat: "Printing" },
          { en: "I would suggest", mr: "मी सुचवेन", cat: "Phrases" },
          { en: "Let me clarify", mr: "मला स्पष्ट करू द्या", cat: "Phrases" },
          { en: "In my opinion", mr: "माझ्या मते", cat: "Phrases" },
          { en: "Could you elaborate?", mr: "अधिक सांगता का?", cat: "Questions" },
          { en: "I'll follow up by email", mr: "मी email करून कळवतो", cat: "Work" },
          { en: "Quality sign-off", mr: "दर्जा मंजुरी", cat: "Printing" },
          { en: "Client brief", mr: "Client ची आवश्यकता", cat: "Printing" },
        ],
        challenges: [
          { week: 1, en: "Record a 60-second introduction of yourself + your work. No stopping.", mr: "तुमची 60 सेकंद ओळख + काम record करा. न थांबता." },
          { week: 2, en: "Describe your entire work day in English — 2 minutes out loud.", mr: "कामाचा पूर्ण दिवस 2 मिनिट English मध्ये सांगा." },
          { week: 3, en: "Write a professional email and then READ it aloud as if on a call.", mr: "Professional email लिहा आणि phone call सारखे मोठ्याने वाचा." },
          { week: 4, en: "AI role-play: client asks about a print order. Speak all replies out loud.", mr: "AI role-play: client print order बद्दल विचारतो. सर्व उत्तरे मोठ्याने बोला." },
        ],
      },
      {
        id: 2, title: "Fluency Power", marathi: "Fluency Power", days: "31–60", icon: "🚀",
        focus: [
          { en: "PREP framework for all answers", mr: "प्रत्येक उत्तरासाठी PREP वापरा" },
          { en: "AI conversation simulations", mr: "AI शी conversations करा" },
          { en: "Professional email to speech", mr: "Email ते बोलणे — bridge करा" },
          { en: "Shadowing technique", mr: "Shadowing सराव करा" },
        ],
        drills: [
          { id: "i5", icon: "🎯", name: "PREP Framework", mr: "PREP Framework", min: 5,
            desc: "Answer every question using: Point → Reason → Example → Point. Structure your speech.",
            mrDesc: "प्रत्येक प्रश्नाचे उत्तर: Point → कारण → उदाहरण → पुन्हा Point. Structure वापरा.",
            example: '"Quality matters." → "Because mistakes cost money." → "50,000 wrong prints = full reprint cost." → "So quality first, always."' },
          { id: "i6", icon: "🤖", name: "AI Conversation", mr: "AI Conversation", min: 10,
            desc: "Chat with AI in a printing scenario. Speak your answers OUT LOUD before typing them.",
            mrDesc: "AI शी printing scenario मध्ये बोला. उत्तर type करण्याआधी मोठ्याने बोला.",
            example: 'Scenarios: "Client wants earlier delivery" | "Explain a quality issue" | "Quote for new order"' },
          { id: "i7", icon: "🎭", name: "Shadowing", mr: "Shadowing", min: 5,
            desc: "Find a business English video. Pause after each sentence. Repeat with same rhythm and tone.",
            mrDesc: "Business English video लावा. प्रत्येक वाक्यानंतर pause करा. तोच सूर आणि वेग लावून repeat करा.",
            example: 'Best sources: TED-Ed, BBC Business English, LinkedIn Learning short clips' },
          { id: "i8", icon: "📧", name: "Email → Speech", mr: "Email → बोलणे", min: 5,
            desc: "Every work email you write — read it aloud, then rephrase it as a phone call.",
            mrDesc: "तुम्ही लिहिलेला प्रत्येक email मोठ्याने वाचा, मग phone call सारखे rephrase करा.",
            example: 'Written: "Please find attached the proof for review." → Spoken: "Hi, I\'ve sent the proof — please check and let me know!"' },
        ],
        vocab: [
          { en: "Pantone color matching", mr: "Pantone रंग जुळवणे", cat: "Printing" },
          { en: "Perfect binding", mr: "पुस्तक binding", cat: "Printing" },
          { en: "Production schedule", mr: "उत्पादन वेळापत्रक", cat: "Printing" },
          { en: "I would like to propose", mr: "मला सुचवायचे आहे", cat: "Business" },
          { en: "Let's align on this", mr: "याबद्दल एकमत होऊया", cat: "Meetings" },
          { en: "Going forward", mr: "पुढे जाताना", cat: "Business" },
          { en: "As per our discussion", mr: "आपल्या चर्चेनुसार", cat: "Formal" },
          { en: "Kindly revert", mr: "कृपया उत्तर द्या", cat: "Email" },
          { en: "Value-added service", mr: "अतिरिक्त सेवा", cat: "Business" },
          { en: "Ink coverage", mr: "शाईचे प्रमाण", cat: "Printing" },
        ],
        challenges: [
          { week: 5, en: "5-minute AI conversation about a printing problem. All answers spoken out loud.", mr: "AI शी 5 मिनिट printing problem बद्दल बोला. सर्व उत्तरे मोठ्याने." },
          { week: 6, en: "Record 2-minute pitch of your printing services. Professional tone.", mr: "तुमच्या printing services चा 2 मिनिट professional pitch record करा." },
          { week: 7, en: "Write 3 responses to a client complaint: Formal, Friendly, and Firm.", mr: "Client complaint ला 3 वेगळ्या tone मध्ये उत्तर लिहा: Formal, Friendly, Firm." },
          { week: 8, en: "Shadow a 3-minute video. Compare your fluency with Week 1 recording.", mr: "3 मिनिटांचा video shadow करा. Week 1 recording शी fluency तुलना करा." },
        ],
      },
      {
        id: 3, title: "Professional Mastery", marathi: "Professional Mastery", days: "61–90", icon: "👑",
        focus: [
          { en: "Lead professional conversations", mr: "Professional conversations lead करा" },
          { en: "Handle unexpected questions", mr: "अचानक प्रश्नांना उत्तर द्या" },
          { en: "Tone-shifting: formal/friendly/firm", mr: "Tone बदलण्याची कला" },
          { en: "Default English thinking mode", mr: "थेट English मध्ये विचार करा" },
        ],
        drills: [
          { id: "i9", icon: "🔥", name: "Pressure Drill", mr: "Pressure Drill", min: 5,
            desc: "Ask AI for surprise questions. Give yourself 5 seconds to start answering. Pure spontaneous English.",
            mrDesc: "AI ला अचानक प्रश्न विचारायला सांगा. 5 सेकंदात उत्तर द्यायला सुरुवात करा.",
            example: '"Client rejected 50,000 prints — what do you say?" → Answer in 5 seconds. Go!' },
          { id: "i10", icon: "🎛️", name: "Tone-Shift Drill", mr: "Tone बदलणे", min: 8,
            desc: "One message. Three tones: Formal (professional email), Friendly (colleague), Firm (setting boundary).",
            mrDesc: "एक संदेश. तीन tone: Formal (email), Friendly (मित्र), Firm (clear boundary).",
            example: 'Client discount request → Formal | Friendly | Firm — all three responses practiced.' },
          { id: "i11", icon: "🎙️", name: "Voice Journal", mr: "Voice Journal", min: 5,
            desc: "Speak your day in English for 3 minutes every evening. Like a voice diary. No writing.",
            mrDesc: "दररोज रात्री 3 मिनिट English मध्ये दिवस सांगा. Voice diary. लिहू नका.",
            example: '"Today I finished 2 big orders. One client wanted changes. I handled it professionally..."' },
          { id: "i12", icon: "📣", name: "Mini Presentation", mr: "Mini Presentation", min: 7,
            desc: "Give a 2-minute presentation using Hook → Context → Key Point → Evidence → Call to Action.",
            mrDesc: "2 मिनिटांची presentation द्या: Hook → Context → मुख्य मुद्दा → पुरावा → Action.",
            example: '"Why fast turnaround wins clients" | "Our quality vs competitors" | "How digital print is changing"' },
        ],
        vocab: [
          { en: "Competitive advantage", mr: "स्पर्धात्मक फायदा", cat: "Business" },
          { en: "Client retention", mr: "ग्राहक टिकवणे", cat: "Business" },
          { en: "Variable data printing", mr: "बदलणारी माहिती छपाई", cat: "Printing" },
          { en: "My recommendation is", mr: "माझी शिफारस आहे", cat: "Leadership" },
          { en: "To summarize", mr: "थोडक्यात सांगायचे तर", cat: "Presentation" },
          { en: "The key takeaway is", mr: "मुख्य मुद्दा आहे", cat: "Presentation" },
          { en: "Sustainable printing", mr: "पर्यावरणपूरक छपाई", cat: "Printing" },
          { en: "Print-on-demand", mr: "मागणीनुसार छपाई", cat: "Printing" },
          { en: "I'd like to emphasize", mr: "मला जोर द्यायचा आहे", cat: "Leadership" },
          { en: "Moving forward", mr: "आता पुढे", cat: "Business" },
        ],
        challenges: [
          { week: 9, en: "3-minute presentation on your printing company strengths. Record and grade yourself.", mr: "तुमच्या printing company च्या strengths वर 3 मिनिट. Record करा, grade द्या." },
          { week: 10, en: "Full negotiation simulation: opening + conflict + resolution. Minimum 5 minutes.", mr: "पूर्ण negotiation simulation: सुरुवात + समस्या + उपाय. 5 मिनिटे." },
          { week: 11, en: "5-minute day reflection in English. Compare with Week 1 recording.", mr: "5 मिनिट English day reflection. Week 1 recording शी तुलना करा." },
          { week: 12, en: "FINAL: 5-minute professional self-introduction. Name + job + expertise + vision.", mr: "अंतिम: 5 मिनिट professional ओळख. नाव + काम + expertise + vision." },
        ],
      },
    ],
  },

  advanced: {
    id: "advanced",
    label: "Advanced",
    marathi: "प्रगत स्तर",
    emoji: "🚀",
    color: "#1e1b4b",
    accent: "#818cf8",
    light: "#eef2ff",
    gradient: "linear-gradient(135deg, #1e1b4b, #3730a3, #6366f1)",
    minutes: 30,
    desc: "You already speak English. Now we make you commanding, persuasive, and professionally elite.",
    marathiDesc: "तुम्ही आधीच English बोलता. आता आपण तुम्हाला commanding, persuasive professional बनवू.",
    scoreRange: "15–21",
    phases: [
      {
        id: 1, title: "Command & Presence", marathi: "Command & Presence", days: "1–30", icon: "💎",
        focus: [
          { en: "Own the room — executive presence", mr: "Room वर command करा" },
          { en: "Eliminate filler words completely", mr: "Filler words पूर्णपणे काढा" },
          { en: "Speed + clarity balance", mr: "वेग + स्पष्टता balance करा" },
          { en: "Power vocabulary activation", mr: "Power vocabulary वापरायला सुरुवात करा" },
        ],
        drills: [
          { id: "a1", icon: "👔", name: "Executive Monologue", mr: "Executive Monologue", min: 7,
            desc: "Speak for 3 minutes on any business topic. No filler words. Every sentence must have a clear point.",
            mrDesc: "कोणत्याही business topic वर 3 मिनिट बोला. Filler words नाहीत. प्रत्येक वाक्याला clear point असावा.",
            example: 'Topics: "The future of printing industry" | "Why quality beats price every time" | "How I would grow this business"' },
          { id: "a2", icon: "🔥", name: "Filler Word Detox", mr: "Filler Word Detox", min: 5,
            desc: "Record yourself for 2 minutes. Count every 'umm', 'like', 'you know'. Goal: zero in 30 days.",
            mrDesc: "2 मिनिट record करा. प्रत्येक 'umm', 'like', 'you know' मोजा. 30 दिवसांत zero करणे goal.",
            example: 'Replace with: strategic pause (silence), "That\'s an interesting point.", "Let me be precise about this."' },
          { id: "a3", icon: "⚡", name: "Spontaneous Response", mr: "Spontaneous Response", min: 8,
            desc: "Ask AI to give you a random business question. You have 3 seconds to start a 2-minute answer.",
            mrDesc: "AI ला random business question विचारायला सांगा. 3 सेकंदांत 2 मिनिटांचे उत्तर सुरू करा.",
            example: '"What\'s your 5-year plan?" "How do you handle a major client complaint?" "Pitch your company in 60 seconds."' },
          { id: "a4", icon: "🎭", name: "Advanced Shadowing", mr: "Advanced Shadowing", min: 10,
            desc: "Shadow TED talks or business podcasts. Match exactly: speed, pauses, emphasis, emotion.",
            mrDesc: "TED talks किंवा business podcasts shadow करा. Speed, pause, emphasis, emotion — सगळे जुळवा.",
            example: 'Simon Sinek talks, Brené Brown, Gary Vaynerchuk — pick one speaker and master their delivery style.' },
        ],
        vocab: [
          { en: "Strategic alignment", mr: "धोरणात्मक सहमती", cat: "Leadership" },
          { en: "Value proposition", mr: "मूल्य प्रस्ताव", cat: "Business" },
          { en: "Core competency", mr: "मूलभूत क्षमता", cat: "Business" },
          { en: "Stakeholder management", mr: "भागधारक व्यवस्थापन", cat: "Leadership" },
          { en: "Scalable solution", mr: "विस्तारयोग्य उपाय", cat: "Business" },
          { en: "G7 color calibration", mr: "G7 रंग calibration", cat: "Printing" },
          { en: "ICC color profile", mr: "ICC रंग profile", cat: "Printing" },
          { en: "Cross-media campaign", mr: "Cross-media मोहीम", cat: "Printing" },
          { en: "Let me challenge that idea", mr: "मला त्या विचाराला आव्हान द्यायचे आहे", cat: "Leadership" },
          { en: "The data suggests", mr: "आकडेवारी सांगते", cat: "Analytical" },
        ],
        challenges: [
          { week: 1, en: "Record a 3-minute talk on 'The future of printing in India'. Zero filler words.", mr: "'भारतातील printing चे भविष्य' वर 3 मिनिट बोला. Filler words शून्य." },
          { week: 2, en: "Give an impromptu 2-minute answer to a surprise question from AI. Record it.", mr: "AI च्या अचानक प्रश्नाला 2 मिनिट impromptu उत्तर द्या." },
          { week: 3, en: "Shadow a TED talk segment. Record yourself. Compare delivery with the speaker.", mr: "TED talk segment shadow करा. Record करा. Speaker शी delivery तुलना करा." },
          { week: 4, en: "Hold a 5-minute conversation with AI on a complex printing business topic.", mr: "AI शी complex printing business topic वर 5 मिनिट conversation करा." },
        ],
      },
      {
        id: 2, title: "Influence & Negotiation", marathi: "Influence & Negotiation", days: "31–60", icon: "🤝",
        focus: [
          { en: "Master persuasion language", mr: "Persuasion language master करा" },
          { en: "Lead high-stakes negotiations", mr: "High-stakes negotiations lead करा" },
          { en: "Handle objections with confidence", mr: "Objections आत्मविश्वासाने handle करा" },
          { en: "Adapt tone to every situation", mr: "प्रत्येक situation नुसार tone बदला" },
        ],
        drills: [
          { id: "a5", icon: "🎯", name: "Negotiation Simulation", mr: "Negotiation Simulation", min: 10,
            desc: "Full negotiation with AI: opening position, counter-offer, concession, close. 5 minutes minimum.",
            mrDesc: "AI शी पूर्ण negotiation: opening, counter-offer, concession, close. किमान 5 मिनिटे.",
            example: '"We need a 20% discount." → Counter: "Our quality justifies the price. Let me offer you this instead..."' },
          { id: "a6", icon: "🌊", name: "Objection Handling", mr: "Objection Handling", min: 8,
            desc: "AI throws 5 client objections. You have 10 seconds to start a confident, professional response.",
            mrDesc: "AI 5 client objections देतो. 10 सेकंदांत confident, professional response सुरू करा.",
            example: '"Your price is too high." "Competitor gives better quality." "We\'ve had problems before." — Handle all.' },
          { id: "a7", icon: "📊", name: "Data-Driven Speaking", mr: "Data-Driven बोलणे", min: 7,
            desc: "Make any claim and support it with specific numbers and evidence in your speech.",
            mrDesc: "कोणताही दावा करा आणि specific numbers आणि पुरावे देऊन support करा.",
            example: '"Our efficiency improved by 23% after switching workflows. Here\'s what that means for your costs..."' },
          { id: "a8", icon: "🎭", name: "3-Tone Mastery", mr: "3-Tone Mastery", min: 5,
            desc: "One message delivered in 3 tones: Authoritative, Empathetic, Assertive. Record all three.",
            mrDesc: "एक message तीन tone मध्ये: Authoritative, Empathetic, Assertive. तिन्ही record करा.",
            example: 'Bad news to client → Authoritative (direct) | Empathetic (understanding) | Assertive (solution-focused)' },
        ],
        vocab: [
          { en: "I appreciate your perspective", mr: "मी तुमचा दृष्टिकोन समजतो", cat: "Empathy" },
          { en: "Let me reframe this", mr: "याचा वेगळ्या प्रकारे विचार करूया", cat: "Negotiation" },
          { en: "Non-negotiable", mr: "बदलता येणार नाही", cat: "Negotiation" },
          { en: "Mutual benefit", mr: "दोन्ही बाजूंना फायदा", cat: "Negotiation" },
          { en: "Cost-per-impression", mr: "प्रति impression खर्च", cat: "Printing" },
          { en: "Workflow optimization", mr: "Workflow सुधारणा", cat: "Printing" },
          { en: "I can offer you instead", mr: "मी तुम्हाला हे देऊ शकतो", cat: "Negotiation" },
          { en: "The ROI on this is", mr: "याचा ROI आहे", cat: "Business" },
          { en: "To be transparent", mr: "स्पष्टपणे सांगायचे तर", cat: "Leadership" },
          { en: "Let's find common ground", mr: "एक सामान्य मुद्दा शोधूया", cat: "Negotiation" },
        ],
        challenges: [
          { week: 5, en: "Full 7-minute negotiation simulation. Record. Analyze: Where did you hesitate?", mr: "7 मिनिट negotiation simulation. Record करा. विश्लेषण करा: कुठे hesitate केलात?" },
          { week: 6, en: "Handle 5 client objections back-to-back without pause. Time yourself.", mr: "5 client objections एका पाठोपाठ एक handle करा. वेळ मोजा." },
          { week: 7, en: "Deliver same message in 3 different tones. Record all 3. Compare.", mr: "एकच message 3 वेगळ्या tone मध्ये बोला. Record करा. तुलना करा." },
          { week: 8, en: "Present a business case for expanding your printing services. Data-driven. 4 minutes.", mr: "Printing services expand करण्याचा business case present करा. Data सह. 4 मिनिटे." },
        ],
      },
      {
        id: 3, title: "Elite Communication", marathi: "Elite Communication", days: "61–90", icon: "🏆",
        focus: [
          { en: "Lead meetings and presentations", mr: "Meetings आणि presentations lead करा" },
          { en: "Storytelling as a business tool", mr: "Storytelling — business tool म्हणून" },
          { en: "Your unique English voice", mr: "तुमचा स्वतःचा English voice" },
          { en: "Zero anxiety — full ownership", mr: "शून्य anxiety — पूर्ण ownership" },
        ],
        drills: [
          { id: "a9", icon: "📖", name: "Business Storytelling", mr: "Business Storytelling", min: 10,
            desc: "Tell a 3-minute business story: Challenge → Action → Result → Lesson. Real or hypothetical.",
            mrDesc: "3 मिनिटांची business story: समस्या → काय केले → निकाल → शिकवण. सांगा.",
            example: '"A client once rejected our entire print run. Here\'s what I did, what happened, and what I learned..."' },
          { id: "a10", icon: "🎤", name: "Full Presentation", mr: "Full Presentation", min: 10,
            desc: "Deliver a 4-minute structured presentation. Grade yourself: Content (1-5), Delivery (1-5), Confidence (1-5).",
            mrDesc: "4 मिनिटांची structured presentation द्या. स्वतःला grade द्या: Content, Delivery, Confidence.",
            example: '"The Next 5 Years in Printing" | "Why We Are the Best Choice" | "My Vision for This Company"' },
          { id: "a11", icon: "🧠", name: "Think-English Journal", mr: "Think-English Journal", min: 5,
            desc: "Speak your day, thoughts, and plans for tomorrow in English. Stream of consciousness. 3 minutes.",
            mrDesc: "आजचा दिवस, विचार, उद्याच्या योजना English मध्ये बोला. 3 मिनिटे. थेट मनातून.",
            example: '"Today was intense. Three big clients. I handled the Sharma account well but I think I could have..."' },
          { id: "a12", icon: "🌍", name: "Industry Thought Leader", mr: "Industry Thought Leader", min: 8,
            desc: "Speak your expert opinion on a printing industry trend for 3 minutes. Like a podcast host.",
            mrDesc: "Printing industry trend वर 3 मिनिट तुमचे expert opinion बोला. Podcast host सारखे.",
            example: '"Sustainable printing is not just a trend — it\'s becoming a client requirement. Here\'s my take..."' },
        ],
        vocab: [
          { en: "Paradigm shift", mr: "मूलभूत बदल", cat: "Leadership" },
          { en: "Industry disruption", mr: "उद्योग क्षेत्रातील बदल", cat: "Business" },
          { en: "Thought leadership", mr: "विचारनेतृत्व", cat: "Leadership" },
          { en: "Ecosystem partner", mr: "व्यवस्था भागीदार", cat: "Business" },
          { en: "FSC certified stock", mr: "FSC certified कागद", cat: "Printing" },
          { en: "Print industry benchmark", mr: "Printing उद्योगाचा मानक", cat: "Printing" },
          { en: "I want to challenge", mr: "मला आव्हान द्यायचे आहे", cat: "Leadership" },
          { en: "The bigger picture is", mr: "मोठा विचार करायचा तर", cat: "Strategy" },
          { en: "Here's my conviction", mr: "माझा ठाम विश्वास आहे", cat: "Leadership" },
          { en: "Let me paint a picture", mr: "मला एक कल्पना सांगू", cat: "Storytelling" },
        ],
        challenges: [
          { week: 9, en: "Record a 4-min presentation on the future of printing in India. Zero notes.", mr: "भारतातील printing च्या भविष्यावर 4 मिनिट. Notes नाहीत." },
          { week: 10, en: "Tell a 3-minute business story from your real experience. Record it.", mr: "तुमच्या खऱ्या अनुभवातून 3 मिनिटांची business story सांगा." },
          { week: 11, en: "Lead a mock 5-minute meeting. Set agenda. Run it. Close it. Record.", mr: "5 मिनिटांची mock meeting lead करा. Agenda, run, close. Record." },
          { week: 12, en: "FINAL: 5-min expert talk on a printing topic. This is your thought leadership debut.", mr: "अंतिम: Printing topic वर 5 मिनिट expert talk. हे तुमचे thought leadership आहे!" },
        ],
      },
    ],
  },
};

const BRIDGE_PHRASES = [
  { en: "Let me think for a moment...", mr: "एक क्षण विचार करतो..." },
  { en: "What I mean is...", mr: "मला म्हणायचे आहे..." },
  { en: "To put it simply...", mr: "सोप्या शब्दांत..." },
  { en: "In other words...", mr: "दुसऱ्या शब्दांत..." },
  { en: "Let me rephrase that...", mr: "पुन्हा सांगतो..." },
  { en: "That's a great point...", mr: "हा चांगला मुद्दा आहे..." },
  { en: "If I understand correctly...", mr: "जर बरोबर समजलो तर..." },
  { en: "The thing is...", mr: "गोष्ट ही आहे..." },
  { en: "What I want to say is...", mr: "मला सांगायचे ते..." },
  { en: "To be more precise...", mr: "नक्की सांगायचे तर..." },
];

/* ═══════════════════════════════════════════════════════════
   UTILITY
═══════════════════════════════════════════════════════════ */
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/* ═══════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("splash"); // splash | quiz | result | app
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [levelId, setLevelId] = useState(null);
  const [appTab, setAppTab] = useState("home");
  const [currentDay, setCurrentDay] = useState(1);
  const [streak, setStreak] = useState(0);
  const [completedDrills, setCompletedDrills] = useState({});
  const [completedChallenges, setCompletedChallenges] = useState({});
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [phaseTab, setPhaseTab] = useState("drills");
  const [activeDrill, setActiveDrill] = useState(null);
  const [timerSec, setTimerSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [vocabFlipped, setVocabFlipped] = useState({});
  const [showBridge, setShowBridge] = useState(false);
  const timerRef = useRef(null);

  // Load persisted state
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("fluency-state");
        if (r) {
          const s = JSON.parse(r.value);
          if (s.levelId) { setLevelId(s.levelId); setScreen("app"); }
          setCurrentDay(s.currentDay || 1);
          setStreak(s.streak || 0);
          setCompletedDrills(s.completedDrills || {});
          setCompletedChallenges(s.completedChallenges || {});
        }
      } catch (_) {}
    })();
  }, []);

  useEffect(() => {
    if (!levelId) return;
    (async () => {
      try {
        await window.storage.set("fluency-state", JSON.stringify({ levelId, currentDay, streak, completedDrills, completedChallenges }));
      } catch (_) {}
    })();
  }, [levelId, currentDay, streak, completedDrills, completedChallenges]);

  // Timer
  useEffect(() => {
    if (timerRunning && timerSec > 0) {
      timerRef.current = setTimeout(() => setTimerSec(t => t - 1), 1000);
    } else if (timerRunning && timerSec === 0) {
      setTimerRunning(false); setTimerDone(true);
    }
    return () => clearTimeout(timerRef.current);
  }, [timerRunning, timerSec]);

  const level = levelId ? LEVELS[levelId] : null;
  const currentPhase = level ? (() => {
    if (currentDay <= 30) return level.phases[0];
    if (currentDay <= 60) return level.phases[1];
    return level.phases[2];
  })() : null;

  const progress = Math.round((currentDay / 90) * 100);
  const doneToday = currentPhase ? currentPhase.drills.filter(d => completedDrills[`${currentDay}-${d.id}`]).length : 0;
  const totalToday = currentPhase ? currentPhase.drills.length : 0;

  const handleAnswer = (score) => {
    const newScore = quizScore + score;
    const newAnswers = [...quizAnswers, score];
    if (quizIdx + 1 >= QUIZ.length) {
      setQuizScore(newScore);
      setQuizAnswers(newAnswers);
      const lvl = newScore <= 7 ? "beginner" : newScore <= 14 ? "intermediate" : "advanced";
      setLevelId(lvl);
      setScreen("result");
    } else {
      setQuizScore(newScore);
      setQuizAnswers(newAnswers);
      setQuizIdx(i => i + 1);
    }
  };

  const startApp = () => { setScreen("app"); setAppTab("home"); };
  const resetApp = () => {
    setScreen("splash"); setQuizIdx(0); setQuizScore(0); setQuizAnswers([]);
    setLevelId(null); setCurrentDay(1); setStreak(0);
    setCompletedDrills({}); setCompletedChallenges({});
  };

  const startDrill = (drill) => {
    setActiveDrill(drill);
    setTimerSec(drill.min * 60);
    setTimerRunning(false); setTimerDone(false);
  };
  const completeDrill = (drill) => {
    setCompletedDrills(p => ({ ...p, [`${currentDay}-${drill.id}`]: true }));
    setActiveDrill(null); setTimerRunning(false);
    clearTimeout(timerRef.current);
  };
  const advanceDay = () => {
    if (currentDay < 90) { setCurrentDay(d => d + 1); setStreak(s => s + 1); }
  };

  const GS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Baloo+2:wght@400;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{width:0;}
    .tap{transition:transform 0.12s,opacity 0.12s;cursor:pointer;}
    .tap:active{transform:scale(0.96);opacity:0.85;}
    .fc{perspective:700px;}
    .fi{transition:transform 0.45s;transform-style:preserve-3d;width:100%;height:100%;position:relative;}
    .fi.fl{transform:rotateY(180deg);}
    .ff,.fb{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;}
    .fb{transform:rotateY(180deg);}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    .fu{animation:fadeUp 0.35s ease forwards;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
    .pulse{animation:pulse 2s infinite;}
  `;

  /* ── SPLASH ── */
  if (screen === "splash") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Sora',sans-serif", padding: 32, textAlign: "center", position: "relative", overflow: "hidden" }}>
      <style>{GS}</style>
      {/* decorative circles */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, left: -60, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle,rgba(251,146,60,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />

      <div className="fu" style={{ fontSize: 72, marginBottom: 16 }}>🗣️</div>
      <div className="fu" style={{ fontSize: 32, fontWeight: 800, color: "white", lineHeight: 1.2, marginBottom: 8 }}>English Fluency</div>
      <div className="fu" style={{ fontFamily: "'Baloo 2',sans-serif", fontSize: 22, fontWeight: 700, color: "#fb923c", marginBottom: 6 }}>मराठी लोकांसाठी</div>
      <div className="fu" style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, maxWidth: 280, marginBottom: 40 }}>
        90-day personalized English journey — built for Marathi speakers, free forever.
      </div>

      <div className="fu" style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 300 }}>
        <button className="tap" onClick={() => setScreen("quiz")}
          style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "white", border: "none", padding: "16px 0", borderRadius: 16, fontWeight: 700, fontSize: 16, fontFamily: "'Sora',sans-serif", width: "100%" }}>
          🎯 Start Free Assessment
        </button>
        <div style={{ color: "#64748b", fontSize: 12 }}>📊 7 questions • takes 2 minutes • मराठीत उपलब्ध</div>
      </div>

      <div className="fu" style={{ marginTop: 48, display: "flex", gap: 28, justifyContent: "center" }}>
        {[["🌱","Beginner"],["🌿","Intermediate"],["🚀","Advanced"]].map(([e,l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24 }}>{e}</div>
            <div style={{ color: "#475569", fontSize: 11, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── QUIZ ── */
  if (screen === "quiz") {
    const q = QUIZ[quizIdx];
    const pct = ((quizIdx) / QUIZ.length) * 100;
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Sora',sans-serif", display: "flex", flexDirection: "column" }}>
        <style>{GS}</style>
        {/* Header */}
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <button onClick={() => quizIdx === 0 ? setScreen("splash") : setQuizIdx(i => i - 1)}
              style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#94a3b8", width: 36, height: 36, borderRadius: 10, cursor: "pointer", fontSize: 16 }}>←</button>
            <div style={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>{quizIdx + 1} / {QUIZ.length}</div>
            <div style={{ width: 36 }} />
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 99, height: 6 }}>
            <div style={{ background: "linear-gradient(90deg,#4f46e5,#7c3aed)", height: "100%", borderRadius: 99, width: `${pct}%`, transition: "width 0.4s" }} />
          </div>
        </div>

        {/* Question */}
        <div className="fu" style={{ flex: 1, padding: "28px 20px 20px" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "24px 20px", marginBottom: 24, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ color: "white", fontSize: 17, fontWeight: 700, lineHeight: 1.5, marginBottom: 8 }}>{q.q}</div>
            <div style={{ color: "#fb923c", fontSize: 14, fontFamily: "'Baloo 2',sans-serif" }}>{q.mr}</div>
            {q.sub && <div style={{ color: "#6366f1", fontSize: 13, marginTop: 10, fontStyle: "italic", padding: "10px 14px", background: "rgba(99,102,241,0.08)", borderRadius: 10 }}>{q.sub}</div>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {q.options.map((opt, i) => (
              <button key={i} className="tap" onClick={() => handleAnswer(opt.score)}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 18px", textAlign: "left", cursor: "pointer", width: "100%" }}>
                <div style={{ color: "white", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{opt.text}</div>
                <div style={{ color: "#fb923c", fontSize: 12, fontFamily: "'Baloo 2',sans-serif" }}>{opt.mr}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── RESULT ── */
  if (screen === "result" && level) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Sora',sans-serif", overflow: "auto" }}>
        <style>{GS}</style>
        <div style={{ background: level.gradient, padding: "40px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
          <div style={{ position: "relative" }}>
            <div className="fu" style={{ fontSize: 64, marginBottom: 12 }}>{level.emoji}</div>
            <div className="fu" style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Your Level</div>
            <div className="fu" style={{ color: "white", fontSize: 34, fontWeight: 800 }}>{level.label}</div>
            <div className="fu" style={{ color: "rgba(255,255,255,0.75)", fontSize: 20, fontFamily: "'Baloo 2',sans-serif", marginBottom: 16 }}>{level.marathi}</div>
            <div className="fu" style={{ background: "rgba(255,255,255,0.12)", borderRadius: 50, padding: "6px 20px", display: "inline-block", color: "white", fontSize: 13, fontWeight: 600 }}>Score: {quizScore} / 21</div>
          </div>
        </div>

        <div style={{ padding: "24px 20px 40px" }}>
          <div className="fu" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 20, marginBottom: 20 }}>
            <div style={{ color: "white", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>🧠 Coach's Assessment</div>
            <div style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>{level.desc}</div>
            <div style={{ color: "#fb923c", fontSize: 14, fontFamily: "'Baloo 2',sans-serif", lineHeight: 1.6 }}>{level.marathiDesc}</div>
          </div>

          <div className="fu" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Daily Time", labelMr: "रोजचा वेळ", value: `${level.minutes} min` },
              { label: "Phases", labelMr: "टप्पे", value: "3" },
              { label: "Days", labelMr: "दिवस", value: "90" },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 8px", textAlign: "center" }}>
                <div style={{ color: level.accent, fontSize: 20, fontWeight: 800 }}>{s.value}</div>
                <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>{s.label}</div>
                <div style={{ color: "#fb923c", fontSize: 10, fontFamily: "'Baloo 2',sans-serif" }}>{s.labelMr}</div>
              </div>
            ))}
          </div>

          {level.phases.map((ph, i) => (
            <div key={i} className="fu" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 28 }}>{ph.icon}</div>
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>Phase {ph.id}: {ph.title}</div>
                <div style={{ color: "#64748b", fontSize: 11 }}>Days {ph.days} • {ph.marathi}</div>
              </div>
            </div>
          ))}

          <button className="tap" onClick={startApp}
            style={{ width: "100%", background: level.gradient, color: "white", border: "none", padding: "18px 0", borderRadius: 16, fontWeight: 800, fontSize: 17, fontFamily: "'Sora',sans-serif", marginTop: 16 }}>
            🚀 Start My 90-Day Journey
          </button>
          <div style={{ color: "#64748b", fontSize: 12, textAlign: "center", marginTop: 10, fontFamily: "'Baloo 2',sans-serif" }}>सुरुवात करूया! मराठी लोकांसाठी मोफत 🧡</div>
        </div>
      </div>
    );
  }

  /* ── DRILL TIMER SCREEN ── */
  if (activeDrill && level) {
    const totalSec = activeDrill.min * 60;
    const elapsed = totalSec - timerSec;
    const arcPct = timerDone ? 1 : elapsed / totalSec;
    const r = 58, C = 2 * Math.PI * r;
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Sora',sans-serif", display: "flex", flexDirection: "column" }}>
        <style>{GS}</style>
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <button className="tap" onClick={() => { setActiveDrill(null); setTimerRunning(false); clearTimeout(timerRef.current); }}
            style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "white", width: 36, height: 36, borderRadius: 10, cursor: "pointer", fontSize: 16 }}>←</button>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>{activeDrill.icon} {activeDrill.name}</div>
            <div style={{ color: "#64748b", fontSize: 11 }}>{activeDrill.mr}</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: "24px 20px 30px", overflow: "auto" }}>
          {/* Arc timer */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
            <div style={{ position: "relative", width: 140, height: 140 }}>
              <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="70" cy="70" r={r} fill="none" stroke={timerDone ? "#10b981" : level.accent} strokeWidth="8"
                  strokeDasharray={C} strokeDashoffset={C * (1 - arcPct)}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ color: timerDone ? "#10b981" : "white", fontSize: 26, fontWeight: 800 }}>{timerDone ? "✓" : fmt(timerSec)}</div>
                <div style={{ color: "#64748b", fontSize: 11 }}>{activeDrill.min} min</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              {!timerDone && (
                <button className="tap" onClick={() => setTimerRunning(r => !r)}
                  style={{ background: timerRunning ? "#ef4444" : level.accent, color: "white", border: "none", padding: "10px 26px", borderRadius: 50, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  {timerRunning ? "⏸ Pause" : timerSec === totalSec ? "▶ Start" : "▶ Resume"}
                </button>
              )}
              <button className="tap" onClick={() => { setTimerSec(totalSec); setTimerRunning(false); setTimerDone(false); }}
                style={{ background: "rgba(255,255,255,0.07)", color: "#94a3b8", border: "none", padding: "10px 16px", borderRadius: 50, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>↺</button>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 18, marginBottom: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>📋 What to do</div>
            <div style={{ color: "#e2e8f0", fontSize: 13, lineHeight: 1.7 }}>{activeDrill.desc}</div>
          </div>
          <div style={{ background: "rgba(251,146,60,0.07)", border: "1px solid rgba(251,146,60,0.18)", borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <div style={{ color: "#fb923c", fontSize: 12, fontWeight: 700, marginBottom: 6, fontFamily: "'Baloo 2',sans-serif" }}>🇮🇳 मराठीत</div>
            <div style={{ color: "#fed7aa", fontSize: 13, lineHeight: 1.7, fontFamily: "'Baloo 2',sans-serif" }}>{activeDrill.mrDesc}</div>
          </div>
          <div style={{ background: "rgba(99,102,241,0.06)", borderRadius: 14, padding: 14, marginBottom: 20, borderLeft: "3px solid #6366f1" }}>
            <div style={{ color: "#a5b4fc", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>💡 Example</div>
            <div style={{ color: "#94a3b8", fontSize: 12, fontStyle: "italic", lineHeight: 1.6 }}>{activeDrill.example}</div>
          </div>
          {timerDone && (
            <button className="tap" onClick={() => completeDrill(activeDrill)}
              style={{ width: "100%", background: "linear-gradient(135deg,#059669,#10b981)", color: "white", border: "none", padding: 16, borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
              ✅ Mark Complete — छान केलेस! 🎉
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── PHASE DETAIL ── */
  if (selectedPhase && level) {
    const ph = selectedPhase;
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Sora',sans-serif" }}>
        <style>{GS}</style>
        <div style={{ background: level.gradient, padding: "20px 20px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <button className="tap" onClick={() => setSelectedPhase(null)}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", width: 36, height: 36, borderRadius: 10, cursor: "pointer", fontSize: 16 }}>←</button>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>PHASE {ph.id} • DAYS {ph.days}</div>
          </div>
          <div style={{ fontSize: 36 }}>{ph.icon}</div>
          <div style={{ color: "white", fontSize: 22, fontWeight: 800, marginTop: 6 }}>{ph.title}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{ph.marathi}</div>
        </div>

        <div style={{ display: "flex", background: "#1e293b", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {["drills","vocab","challenges"].map(t => (
            <button key={t} onClick={() => setPhaseTab(t)}
              style={{ flex: 1, background: "none", border: "none", color: phaseTab === t ? level.accent : "#475569", padding: "12px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", borderBottom: phaseTab === t ? `2px solid ${level.accent}` : "2px solid transparent", textTransform: "capitalize", fontFamily: "'Sora',sans-serif" }}>
              {t === "drills" ? "🏋️ Drills" : t === "vocab" ? "📚 Vocab" : "🏆 Challenges"}
            </button>
          ))}
        </div>

        <div style={{ padding: "16px 16px 80px", overflow: "auto", maxHeight: "calc(100vh - 180px)", overflowY: "scroll" }}>
          {phaseTab === "drills" && ph.drills.map(drill => {
            const done = completedDrills[`${currentDay}-${drill.id}`];
            return (
              <div key={drill.id} className="tap" onClick={() => startDrill(drill)}
                style={{ background: done ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${done ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.06)"}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontSize: 26 }}>{drill.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{drill.name}</div>
                      {done && <span style={{ color: "#10b981", fontSize: 11, fontWeight: 700 }}>✓ Done</span>}
                    </div>
                    <div style={{ color: "#64748b", fontSize: 11 }}>{drill.mr} • {drill.min} min</div>
                  </div>
                </div>
                <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6 }}>{drill.desc}</div>
              </div>
            );
          })}

          {phaseTab === "vocab" && (
            <>
              <div style={{ color: "#64748b", fontSize: 12, textAlign: "center", marginBottom: 14 }}>Tap to flip • दाबा मराठी अर्थासाठी</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {ph.vocab.map((v, i) => {
                  const flipped = vocabFlipped[`${ph.id}-${i}`];
                  return (
                    <div key={i} className="fc tap" style={{ height: 90 }}
                      onClick={() => setVocabFlipped(p => ({ ...p, [`${ph.id}-${i}`]: !p[`${ph.id}-${i}`] }))}>
                      <div className={`fi${flipped ? " fl" : ""}`}>
                        <div className="ff" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                          <div style={{ color: "white", fontWeight: 700, fontSize: 12, textAlign: "center" }}>{v.en}</div>
                          <div style={{ color: level.accent, fontSize: 10, marginTop: 4 }}>{v.cat}</div>
                        </div>
                        <div className="fb" style={{ background: `linear-gradient(135deg,${level.color}60,${level.accent}30)`, border: `1px solid ${level.accent}30` }}>
                          <div style={{ color: "#fef3c7", fontFamily: "'Baloo 2',sans-serif", fontSize: 13, textAlign: "center", fontWeight: 600 }}>{v.mr}</div>
                          <div style={{ color: level.accent, fontSize: 10, marginTop: 4 }}>{v.en}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {phaseTab === "challenges" && ph.challenges.map((ch, i) => {
            const key = `p${ph.id}w${ch.week}`;
            const done = completedChallenges[key];
            return (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${done ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.06)"}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ background: `${level.accent}20`, color: level.accent, padding: "3px 12px", borderRadius: 50, fontSize: 11, fontWeight: 700 }}>Week {ch.week}</span>
                  {done && <span style={{ color: "#10b981", fontSize: 11, fontWeight: 700 }}>✅ Done</span>}
                </div>
                <div style={{ color: "white", fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>{ch.en}</div>
                <div style={{ color: "#fb923c", fontSize: 12, lineHeight: 1.5, fontFamily: "'Baloo 2',sans-serif", marginBottom: 12 }}>{ch.mr}</div>
                <button className="tap" onClick={() => setCompletedChallenges(p => ({ ...p, [key]: !p[key] }))}
                  style={{ width: "100%", background: done ? "rgba(16,185,129,0.1)" : level.gradient, color: done ? "#10b981" : "white", border: done ? "1px solid rgba(16,185,129,0.3)" : "none", padding: "10px 0", borderRadius: 50, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
                  {done ? "✓ Completed — Undo?" : "Mark Complete"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── MAIN APP ── */
  if (screen === "app" && level) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Sora',sans-serif", maxWidth: 430, margin: "0 auto", position: "relative" }}>
        <style>{GS}</style>
        <div style={{ paddingBottom: 72, minHeight: "100vh", overflowY: "auto" }}>

          {/* HOME */}
          {appTab === "home" && (
            <div>
              <div style={{ background: level.gradient, padding: "26px 20px 32px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                    <div>
                      <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>नमस्ते! Welcome Back</div>
                      <div style={{ color: "white", fontSize: 22, fontWeight: 800, marginTop: 2 }}>Day {currentDay} of 90</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <span style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 600 }}>{level.emoji} {level.label}</span>
                        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{level.marathi}</span>
                      </div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: "8px 14px", textAlign: "center" }}>
                      <div style={{ color: "#fbbf24", fontSize: 20, fontWeight: 800 }}>🔥{streak}</div>
                      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}>Streak</div>
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 99, height: 7, marginBottom: 5 }}>
                    <div style={{ background: "#fbbf24", height: "100%", borderRadius: 99, width: `${progress}%`, transition: "width 0.6s" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>Day 1</span>
                    <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>{progress}% Complete</span>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>Day 90</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: "16px 16px" }}>
                {/* Level badge */}
                <div style={{ background: `${level.accent}12`, border: `1px solid ${level.accent}30`, borderRadius: 14, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{level.emoji}</span>
                  <div>
                    <div style={{ color: level.accent, fontWeight: 700, fontSize: 13 }}>{level.label} Path • {level.marathi}</div>
                    <div style={{ color: "#64748b", fontSize: 11 }}>{level.minutes} min/day • {currentPhase?.title}</div>
                  </div>
                  <button className="tap" onClick={() => { if (window.confirm("Retake the assessment? Your progress will be cleared.")) resetApp(); }}
                    style={{ marginLeft: "auto", background: "rgba(255,255,255,0.05)", border: "none", color: "#475569", padding: "4px 10px", borderRadius: 8, fontSize: 10, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Retake</button>
                </div>

                {/* Today's drills */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Today's Drills</div>
                  <div style={{ color: "#64748b", fontSize: 12 }}>{doneToday}/{totalToday} done</div>
                </div>

                {currentPhase?.drills.map(drill => {
                  const done = completedDrills[`${currentDay}-${drill.id}`];
                  return (
                    <div key={drill.id} className="tap" onClick={() => startDrill(drill)}
                      style={{ background: done ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${done ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.05)"}`, borderRadius: 14, padding: "12px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: done ? "rgba(16,185,129,0.15)" : `${level.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{done ? "✅" : drill.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{drill.name}</div>
                        <div style={{ color: "#64748b", fontSize: 11 }}>{drill.mr} • {drill.min} min</div>
                      </div>
                      <div style={{ color: "#334155", fontSize: 18 }}>›</div>
                    </div>
                  );
                })}

                {doneToday === totalToday && totalToday > 0 && currentDay < 90 && (
                  <button className="tap" onClick={advanceDay}
                    style={{ width: "100%", background: "linear-gradient(135deg,#059669,#10b981)", color: "white", border: "none", padding: 16, borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: "pointer", marginTop: 8, marginBottom: 20, fontFamily: "'Sora',sans-serif" }}>
                    🎉 Day Complete! → Day {currentDay + 1}
                  </button>
                )}

                {/* Bridge phrases */}
                <div style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 16, padding: 16, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showBridge ? 12 : 0 }}>
                    <div style={{ color: "#a5b4fc", fontWeight: 700, fontSize: 13 }}>🌉 Bridge Phrases</div>
                    <button className="tap" onClick={() => setShowBridge(b => !b)}
                      style={{ background: "rgba(99,102,241,0.15)", border: "none", color: "#a5b4fc", padding: "4px 12px", borderRadius: 50, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "'Sora',sans-serif" }}>
                      {showBridge ? "Hide" : "Show"}
                    </button>
                  </div>
                  {showBridge && BRIDGE_PHRASES.map((p, i) => (
                    <div key={i} style={{ padding: "7px 0", borderBottom: i < BRIDGE_PHRASES.length - 1 ? "1px dashed rgba(99,102,241,0.12)" : "none" }}>
                      <div style={{ color: "white", fontSize: 13, fontWeight: 500 }}>{p.en}</div>
                      <div style={{ color: "#fb923c", fontSize: 12, fontFamily: "'Baloo 2',sans-serif" }}>{p.mr}</div>
                    </div>
                  ))}
                </div>

                {/* Coach note */}
                <div style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 14, padding: 14 }}>
                  <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: 12, marginBottom: 6 }}>💛 Coach Note — Day {currentDay}</div>
                  <div style={{ color: "#fde68a", fontSize: 12, lineHeight: 1.7, fontFamily: "'Baloo 2',sans-serif" }}>
                    {levelId === "beginner"
                      ? (currentDay <= 30 ? "सुरुवात झाली! चुकीचे बोललो तरी चालेल — फक्त बोला! Every word out loud is progress." : currentDay <= 60 ? "तुम्ही खूप प्रगती केली आहे! आता आत्मविश्वास वाढतोय. Keep going!" : "तुम्ही beginner राहिला नाहीत! तुम्ही आता English speaker आहात. 🎉")
                      : levelId === "intermediate"
                      ? (currentDay <= 30 ? "Imperfect English spoken loud beats perfect English kept silent. बोला! बोला! बोला!" : currentDay <= 60 ? "Speed is coming. Structure is forming. You are in the zone — push harder now." : "60+ days in. You are commanding English now. Own it completely.")
                      : (currentDay <= 30 ? "You are not polishing language — you are building presence. Every session, raise the bar." : currentDay <= 60 ? "Negotiations, presentations, objections — you handle them all now. Elite communicator in progress." : "90 days. You are the person who gets heard, respected, and remembered. That's you now.")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PHASES TAB */}
          {appTab === "phases" && (
            <div>
              <div style={{ padding: "22px 20px 14px" }}>
                <div style={{ color: "white", fontSize: 20, fontWeight: 800 }}>Your Learning Path</div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>तुमचा {level.label} प्रवास — {level.marathi}</div>
              </div>
              <div style={{ padding: "0 16px 20px" }}>
                {level.phases.map((ph, i) => {
                  const isActive = currentPhase?.id === ph.id;
                  const chDone = ph.challenges.filter(ch => completedChallenges[`p${ph.id}w${ch.week}`]).length;
                  return (
                    <div key={i} className="tap" onClick={() => { setSelectedPhase(ph); setPhaseTab("drills"); }}
                      style={{ background: isActive ? `${level.color}44` : "rgba(255,255,255,0.03)", border: `1.5px solid ${isActive ? level.accent + "50" : "rgba(255,255,255,0.06)"}`, borderRadius: 20, padding: 18, marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <span style={{ fontSize: 32 }}>{ph.icon}</span>
                          <div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <div style={{ color: "white", fontSize: 15, fontWeight: 800 }}>{ph.title}</div>
                              {isActive && <span style={{ background: level.accent, color: "white", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 50 }}>ACTIVE</span>}
                            </div>
                            <div style={{ color: level.accent, fontSize: 11 }}>Days {ph.days}</div>
                            <div style={{ color: "#64748b", fontSize: 11 }}>{ph.marathi}</div>
                          </div>
                        </div>
                        <span style={{ color: "#334155", fontSize: 20 }}>›</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 14 }}>
                        {[["Drills", ph.drills.length], ["Vocab", ph.vocab.length], ["Done", `${chDone}/${ph.challenges.length}`]].map(([l, v]) => (
                          <div key={l} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 0", textAlign: "center" }}>
                            <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>{v}</div>
                            <div style={{ color: "#64748b", fontSize: 10 }}>{l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VOCAB TAB */}
          {appTab === "vocab" && (
            <div>
              <div style={{ padding: "22px 20px 10px" }}>
                <div style={{ color: "white", fontSize: 20, fontWeight: 800 }}>Vocabulary Flashcards</div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>Tap to flip • दाबा मराठी अर्थासाठी</div>
              </div>
              <div style={{ padding: "0 16px 20px" }}>
                {level.phases.map(ph => (
                  <div key={ph.id} style={{ marginBottom: 24 }}>
                    <div style={{ color: level.accent, fontSize: 12, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>{ph.icon} Phase {ph.id} — {ph.title}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {ph.vocab.map((v, i) => {
                        const flipped = vocabFlipped[`${ph.id}-${i}`];
                        return (
                          <div key={i} className="fc tap" style={{ height: 86 }}
                            onClick={() => setVocabFlipped(p => ({ ...p, [`${ph.id}-${i}`]: !p[`${ph.id}-${i}`] }))}>
                            <div className={`fi${flipped ? " fl" : ""}`}>
                              <div className="ff" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                                <div style={{ color: "white", fontWeight: 700, fontSize: 12, textAlign: "center" }}>{v.en}</div>
                                <div style={{ color: level.accent, fontSize: 10, marginTop: 4 }}>{v.cat}</div>
                              </div>
                              <div className="fb" style={{ background: `linear-gradient(135deg,${level.color}60,${level.accent}30)`, border: `1px solid ${level.accent}30` }}>
                                <div style={{ color: "#fef3c7", fontFamily: "'Baloo 2',sans-serif", fontSize: 13, textAlign: "center", fontWeight: 600 }}>{v.mr}</div>
                                <div style={{ color: level.accent, fontSize: 10, marginTop: 4 }}>{v.en}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROGRESS TAB */}
          {appTab === "progress" && (
            <div>
              <div style={{ padding: "22px 20px 14px" }}>
                <div style={{ color: "white", fontSize: 20, fontWeight: 800 }}>Your Progress</div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>तुमची प्रगती</div>
              </div>
              <div style={{ padding: "0 16px 20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
                  {[["📅", "Day", currentDay], ["🔥", "Streak", streak], ["📊", "%", `${progress}%`]].map(([ic, l, v]) => (
                    <div key={l} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 8px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{ic}</div>
                      <div style={{ color: level.accent, fontSize: 20, fontWeight: 800 }}>{v}</div>
                      <div style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>

                {/* Level card */}
                <div style={{ background: level.gradient, borderRadius: 18, padding: 20, marginBottom: 16, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
                  <div style={{ position: "relative" }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>{level.emoji}</div>
                    <div style={{ color: "white", fontSize: 18, fontWeight: 800 }}>{level.label} Path</div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontFamily: "'Baloo 2',sans-serif" }}>{level.marathi} • {level.minutes} min/day</div>
                  </div>
                </div>

                {/* Phases progress */}
                {level.phases.map(ph => {
                  const done = ph.challenges.filter(ch => completedChallenges[`p${ph.id}w${ch.week}`]).length;
                  const pct = Math.round((done / ph.challenges.length) * 100);
                  return (
                    <div key={ph.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ color: "white", fontWeight: 700, fontSize: 13 }}>{ph.icon} Phase {ph.id}: {ph.title}</div>
                        <div style={{ color: level.accent, fontWeight: 700, fontSize: 12 }}>{done}/{ph.challenges.length}</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 99, height: 5 }}>
                        <div style={{ background: `linear-gradient(90deg,${level.color},${level.accent})`, height: "100%", borderRadius: 99, width: `${pct}%`, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  );
                })}

                {/* Day adjuster */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                  <div style={{ color: "white", fontWeight: 700, fontSize: 13, marginBottom: 14 }}>⚙️ Adjust Day</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
                    <button className="tap" onClick={() => setCurrentDay(d => Math.max(1, d - 1))}
                      style={{ background: "rgba(255,255,255,0.07)", border: "none", color: "white", width: 40, height: 40, borderRadius: 50, cursor: "pointer", fontSize: 18, fontFamily: "'Sora',sans-serif" }}>−</button>
                    <div style={{ color: "white", fontSize: 26, fontWeight: 800, minWidth: 80, textAlign: "center" }}>Day {currentDay}</div>
                    <button className="tap" onClick={() => setCurrentDay(d => Math.min(90, d + 1))}
                      style={{ background: "rgba(255,255,255,0.07)", border: "none", color: "white", width: 40, height: 40, borderRadius: 50, cursor: "pointer", fontSize: 18, fontFamily: "'Sora',sans-serif" }}>+</button>
                  </div>
                </div>

                <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: 14, padding: 16 }}>
                  <div style={{ color: "#10b981", fontWeight: 700, fontSize: 12, marginBottom: 6 }}>🌍 Open Source — मुक्त स्रोत</div>
                  <div style={{ color: "#6ee7b7", fontSize: 12, lineHeight: 1.7, fontFamily: "'Baloo 2',sans-serif" }}>हे app सर्व मराठी भाषिकांसाठी मोफत आहे. मित्रांना शेअर करा! Built with ❤️ for Maharashtra 🧡</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAV */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(15,23,42,0.97)", backdropFilter: "blur(10px)", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", padding: "8px 0 12px", zIndex: 100 }}>
          {[
            { id: "home", icon: "🏠", label: "Home" },
            { id: "phases", icon: "📋", label: "Phases" },
            { id: "vocab", icon: "📚", label: "Vocab" },
            { id: "progress", icon: "📊", label: "Progress" },
          ].map(t => (
            <button key={t.id} className="tap" onClick={() => setAppTab(t.id)}
              style={{ flex: 1, background: "none", border: "none", cursor: "pointer", padding: "4px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: "'Sora',sans-serif" }}>
              <div style={{ fontSize: appTab === t.id ? 22 : 19, transition: "all 0.2s", filter: appTab !== t.id ? "grayscale(60%) opacity(0.45)" : "none" }}>{t.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: appTab === t.id ? level.accent : "#334155" }}>{t.label}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return <div style={{ color: "white", background: "#0f172a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;
}
