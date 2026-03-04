/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef, useCallback } from "react";
import { Analytics } from '@vercel/analytics/react';

function useAudio() {
  const speak = (text, rate = 0.85) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = rate; u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const eng = voices.find(v => v.lang.startsWith("en"));
    if (eng) u.voice = eng;
    window.speechSynthesis.speak(u);
  };
  const stop = () => window.speechSynthesis && window.speechSynthesis.cancel();
  return { speak, stop };
}

const S = {
  async get(k) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; } catch { return null; } },
  async set(k, v) { try { await window.storage.set(k, JSON.stringify(v)); } catch {} },
  async del(k) { try { await window.storage.delete(k); } catch {} },
};

const QUIZ = [
  { q: "When someone asks 'How are you?' you reply:", mr: "कोणी 'How are you?' विचारले तर:", options: [{ t: "I can't answer easily", mr: "उत्तर देणे कठीण", s: 0 }, { t: "Fine, thank you", mr: "Fine, thank you — एवढेच", s: 1 }, { t: "I'm doing well, thanks!", mr: "थोडे जास्त बोलतो", s: 2 }, { t: "I hold a full conversation", mr: "संपूर्ण संभाषण", s: 3 }] },
  { q: "How long can you speak English without stopping?", mr: "किती वेळ न थांबता बोलू शकता?", options: [{ t: "Less than 10 seconds", mr: "10 सेकंदांपेक्षा कमी", s: 0 }, { t: "About 30 seconds", mr: "सुमारे 30 सेकंद", s: 1 }, { t: "1–2 minutes", mr: "1–2 मिनिटे", s: 2 }, { t: "3+ minutes easily", mr: "3+ मिनिटे सहज", s: 3 }] },
  { q: "At work, how do you use English?", mr: "कामावर English कसे वापरता?", options: [{ t: "I avoid it completely", mr: "पूर्णपणे टाळतो", s: 0 }, { t: "Only simple words", mr: "फक्त साधे शब्द", s: 1 }, { t: "Emails yes, speaking hard", mr: "Emails ठीक, बोलणे कठीण", s: 2 }, { t: "Both comfortably", mr: "दोन्ही आरामात", s: 3 }] },
  { q: "When you think — which language comes first?", mr: "विचार करताना कोणती भाषा?", options: [{ t: "Only Marathi, then translate", mr: "फक्त मराठी, मग translate", s: 0 }, { t: "Mostly Marathi", mr: "जास्त मराठी", s: 1 }, { t: "Mix of both", mr: "दोन्ही मिळून", s: 2 }, { t: "Directly in English", mr: "थेट English", s: 3 }] },
  { q: "Your English speaking anxiety:", mr: "बोलताना किती घाबरतो?", options: [{ t: "9–10: Extremely anxious", mr: "खूप जास्त, टाळतो", s: 0 }, { t: "6–8: Very nervous", mr: "खूप घाबरतो", s: 1 }, { t: "3–5: Manageable", mr: "थोडे, handle करतो", s: 2 }, { t: "1–2: Mostly comfortable", mr: "जवळपास comfortable", s: 3 }] },
];

const LEVELS = {
  beginner:     { label: "Beginner",     mr: "नवीन शिकणारा", emoji: "🌱", color: "#c2410c", accent: "#fb923c", grad: "135deg,#7c2d12,#c2410c,#ea580c", min: 15 },
  intermediate: { label: "Intermediate", mr: "मध्यम स्तर",    emoji: "🌿", color: "#065f46", accent: "#10b981", grad: "135deg,#064e3b,#065f46,#059669", min: 20 },
  advanced:     { label: "Advanced",     mr: "प्रगत स्तर",    emoji: "🚀", color: "#1e1b4b", accent: "#818cf8", grad: "135deg,#1e1b4b,#3730a3,#6366f1", min: 30 },
};

const PHASES = {
  beginner: [
    { id:1, title:"Basic Speaking",      mr:"मूलभूत बोलणे",   days:"1–30",  icon:"🌱",
      drills:[
        { id:"b1", icon:"👋", name:"Daily Greetings",  mr:"रोजचे अभिवादन",    min:3, desc:"Practice 5 greeting conversations every morning until automatic.", mrDesc:"सकाळी 5 साध्या conversations चा सराव करा.", ex:'"Good morning!" "How are you?" "I am fine, thank you." "Have a good day!"' },
        { id:"b2", icon:"🔤", name:"Word of the Day",  mr:"आजचा शब्द",        min:5, desc:"Learn 1 new word. Say it in 3 sentences out loud. Use it today.",    mrDesc:"1 नवीन शब्द शिका. 3 वाक्यांत बोला. आज वापरा.",                    ex:'"Urgent" → "This is urgent." → "I have an urgent task."' },
        { id:"b3", icon:"🪞", name:"Mirror Talk",      mr:"आरशासमोर बोलणे",  min:5, desc:"Look in mirror. Describe what you see. Don't stop for 3 minutes.",   mrDesc:"आरशात बघा. दिसते ते सांगा. 3 मिनिट थांबू नका.",                  ex:'"I see my face. I have black hair. I am wearing a shirt today..."' },
        { id:"b4", icon:"👂", name:"Listen & Repeat",  mr:"ऐका आणि सांगा",   min:5, desc:"Play English YouTube video. After every sentence pause and repeat.", mrDesc:"YouTube video लावा. प्रत्येक वाक्यानंतर repeat करा.",             ex:"BBC Learning English, VOA Learning English — slow speed best." },
      ],
      vocab:[
        { en:"Good morning",      mr:"शुभ प्रभात",            cat:"Greetings"    },
        { en:"Thank you",         mr:"धन्यवाद",               cat:"Polite"       },
        { en:"Please",            mr:"कृपया",                 cat:"Polite"       },
        { en:"Sorry",             mr:"माफ करा",               cat:"Polite"       },
        { en:"I don't understand",mr:"मला समजले नाही",        cat:"Essential"    },
        { en:"Can you repeat?",   mr:"पुन्हा सांगता का?",     cat:"Essential"    },
        { en:"My name is",        mr:"माझे नाव ... आहे",      cat:"Introduction" },
        { en:"I work in printing",mr:"मी printing मध्ये काम", cat:"Work"         },
        { en:"Deadline",          mr:"अंतिम तारीख",           cat:"Work"         },
        { en:"Print order",       mr:"छपाईची ऑर्डर",          cat:"Printing"     },
      ],
      challenges:[
        { w:1,  en:"Record your name, job, and city in English. 30 seconds.",            mr:"नाव, काम, शहर English मध्ये 30 सेकंद record करा."           },
        { w:2,  en:"1-minute mirror conversation with yourself. Record it.",             mr:"आरशासमोर 1 मिनिट बोला. Record करा."                        },
        { w:3,  en:"Write 5 sentences about your work day. Read them aloud.",            mr:"कामाच्या दिवसाबद्दल 5 वाक्ये लिहा. मोठ्याने वाचा."        },
        { w:4,  en:"Watch 2-min English video and summarize it in 3 sentences.",         mr:"2 मिनिट video पहा आणि 3 वाक्यांत सांगा."                   },
      ] },
    { id:2, title:"Building Sentences",  mr:"वाक्ये बांधणे",  days:"31–60", icon:"🌿",
      drills:[
        { id:"b5", icon:"📝", name:"Sentence Builder", mr:"वाक्य बनवा",       min:5, desc:"Start with 1 simple word. Build into a full sentence. Add detail.", mrDesc:"1 शब्दाने सुरुवात. हळूहळू वाक्य मोठे करा.",                    ex:'"Print" → "We print." → "We print brochures for clients."' },
        { id:"b6", icon:"🌉", name:"Bridge Phrases",   mr:"Bridge Phrases",    min:5, desc:"Memorize 5 key phrases. Use them every time you need thinking time.",mrDesc:"5 phrases पाठ करा. विचार करायला वेळ लागेल तेव्हा वापरा.",      ex:'"Let me think..." | "What I mean is..." | "In other words..."' },
        { id:"b7", icon:"📧", name:"Email Drill",       mr:"Email सराव",       min:5, desc:"Write a 3-line email about a print order. Subject + 2 lines + Thanks.",mrDesc:"3 ओळी email लिहा. Subject + 2 वाक्ये + Thank you.",          ex:'Subject: Order Update — "Dear Sir, Brochures ready. Collect by Friday."' },
      ],
      vocab:[
        { en:"I would like to",       mr:"मला ... करायचे आहे",  cat:"Phrases"  },
        { en:"Could you please",      mr:"कृपया ... करता का?",  cat:"Polite"   },
        { en:"I understand",          mr:"मला समजले",            cat:"Responses"},
        { en:"Let me check",          mr:"मला तपासू द्या",       cat:"Work"     },
        { en:"Order is ready",        mr:"ऑर्डर तयार आहे",       cat:"Printing" },
        { en:"Quality check",         mr:"दर्जा तपासणी",         cat:"Printing" },
        { en:"Delivery date",         mr:"वितरण तारीख",          cat:"Work"     },
        { en:"I will follow up",      mr:"मी follow up करतो",    cat:"Phrases"  },
        { en:"Thank you for order",   mr:"ऑर्डरसाठी धन्यवाद",   cat:"Client"   },
        { en:"Small delay",           mr:"थोडा उशीर",            cat:"Work"     },
      ],
      challenges:[
        { w:5,  en:"Write and READ ALOUD a complete email about a print order.",         mr:"Print order email लिहा आणि मोठ्याने वाचा."                  },
        { w:6,  en:"Use bridge phrases 5 times today in practice. Count them.",          mr:"आज bridge phrases 5 वेळा वापरा. मोजा."                      },
        { w:7,  en:"Describe your job in English for 60 seconds without stopping.",      mr:"तुमच्या कामाबद्दल 60 सेकंद न थांबता बोला."                  },
        { w:8,  en:"Record a fake call — explain a print delay to a client. 2 min.",     mr:"Fake call record करा — delay बद्दल सांगा. 2 मिनिटे."        },
      ] },
    { id:3, title:"Real Conversations",  mr:"खरे संभाषण",    days:"61–90", icon:"🚀",
      drills:[
        { id:"b8",  icon:"🤝", name:"Client Simulation", mr:"Client Simulation", min:7, desc:"Use AI as client. Practice taking a print order from start to finish.",  mrDesc:"AI ला client म्हणून वापरा. Order घेण्याचा सराव.",               ex:'"Hello, how can I help?" → "What size?" → "When is deadline?"' },
        { id:"b9",  icon:"🎙️", name:"Voice Journal",     mr:"Voice Diary",       min:5, desc:"Every evening speak your day in English for 3 minutes. Just talk.",      mrDesc:"दररोज रात्री 3 मिनिट English मध्ये दिवस सांगा.",                ex:'"Today I came to work at 9. I had 3 orders to finish..."' },
        { id:"b10", icon:"⏱️", name:"2-Min Topic Talk",  mr:"2 मिनिट बोला",     min:5, desc:"Pick a topic. Talk for 2 full minutes. Use bridge phrases. Don't stop.", mrDesc:"विषय निवडा. 2 मिनिट बोला. Bridge phrases वापरा.",               ex:"My printing shop | My daily routine | My city | My family" },
      ],
      vocab:[
        { en:"I am confident",          mr:"मला आत्मविश्वास आहे",      cat:"Mindset"  },
        { en:"Let me explain",          mr:"मला समजावू द्या",           cat:"Phrases"  },
        { en:"In my experience",        mr:"माझ्या अनुभवानुसार",        cat:"Phrases"  },
        { en:"We specialize in",        mr:"आम्ही ... तज्ज्ञ आहोत",    cat:"Business" },
        { en:"Turnaround time",         mr:"delivery वेळ",              cat:"Printing" },
        { en:"High-quality output",     mr:"उच्च दर्जाचे output",       cat:"Printing" },
        { en:"Customer satisfaction",   mr:"ग्राहक समाधान",             cat:"Business" },
        { en:"Best price guaranteed",   mr:"सर्वोत्तम किंमत",           cat:"Sales"    },
        { en:"I will get back to you",  mr:"मी नंतर कळवतो",            cat:"Phrases"  },
        { en:"Thank you for trusting",  mr:"विश्वासाबद्दल धन्यवाद",    cat:"Client"   },
      ],
      challenges:[
        { w:9,  en:"Full 3-min AI conversation taking a client order start to finish.",  mr:"AI शी 3 मिनिट client order घेण्याचे conversation."           },
        { w:10, en:"Record your morning routine in English — 2 minutes. Listen back.",   mr:"सकाळची routine English मध्ये 2 मिनिट record करा."            },
        { w:11, en:"Say 5 things you are proud of about your work. Record it.",          mr:"कामाबद्दल 5 गोष्टी आत्मविश्वासाने English मध्ये सांगा."     },
        { w:12, en:"FINAL: 3-min professional self-introduction. Your fluency proof!",   mr:"अंतिम: 3 मिनिट professional ओळख. तुमचा पुरावा!"             },
      ] },
  ],
  intermediate: [
    { id:1, title:"Activation Sprint",   mr:"Activation Sprint",    days:"1–30",  icon:"⚡",
      drills:[
        { id:"i1", icon:"🪞", name:"Mirror Narration",    mr:"Mirror Narration",   min:5, desc:"Describe everything around you out loud. No pausing. Volume over perfection.", mrDesc:"दिसते ते मोठ्याने सांगा. थांबू नका.",                    ex:'"I am in my room. Blue shirt. Today 3 print jobs to complete..."' },
        { id:"i2", icon:"⚡", name:"60-Second Blast",     mr:"60 सेकंद Blast",    min:5, desc:"Set timer. Talk 60 full seconds. If stuck — use bridge phrase, continue.",     mrDesc:"Timer लावा. 60 सेकंद बोला. Bridge phrase वापरा.",        ex:"My daily routine | My work | My city | A recent challenge" },
        { id:"i3", icon:"📈", name:"Sentence Expansion",  mr:"वाक्य वाढवणे",     min:5, desc:"Take a simple sentence. Expand it 4 times adding more details each time.",      mrDesc:"साधे वाक्य 4 वेळा detail जोडून वाढवा.",                 ex:'"We print." → "We print quality brochures for corporate clients."' },
        { id:"i4", icon:"🌉", name:"Bridge Phrase Drill", mr:"Bridge Phrase सराव",min:5, desc:"Practice all 10 bridge phrases 3x each. Use them in 5 real sentences.",         mrDesc:"सर्व 10 bridge phrases 3 वेळा बोला. 5 वाक्यांत वापरा.", ex:'"That\'s a great point... | Let me think... | What I mean is..."' },
      ],
      vocab:[
        { en:"Turnaround time",      mr:"काम पूर्ण होण्याचा वेळ", cat:"Printing" },
        { en:"Color proof",          mr:"रंग तपासणी",              cat:"Printing" },
        { en:"Press-ready files",    mr:"छपाईसाठी तयार files",     cat:"Printing" },
        { en:"I would suggest",      mr:"मी सुचवेन",                cat:"Phrases"  },
        { en:"Let me clarify",       mr:"मला स्पष्ट करू द्या",     cat:"Phrases"  },
        { en:"In my opinion",        mr:"माझ्या मते",               cat:"Phrases"  },
        { en:"Could you elaborate?", mr:"अधिक सांगता का?",          cat:"Questions"},
        { en:"I'll follow up",       mr:"मी follow up करतो",        cat:"Work"     },
        { en:"Quality sign-off",     mr:"दर्जा मंजुरी",             cat:"Printing" },
        { en:"Client brief",         mr:"Client ची आवश्यकता",       cat:"Printing" },
      ],
      challenges:[
        { w:1,  en:"Record 60-sec introduction of yourself + work. No stopping.",        mr:"60 सेकंद ओळख + काम record करा."                             },
        { w:2,  en:"Describe your entire work day in English — 2 minutes out loud.",     mr:"कामाचा पूर्ण दिवस 2 मिनिट English मध्ये सांगा."             },
        { w:3,  en:"Write professional email and READ aloud as if on a call.",           mr:"Professional email लिहा आणि call सारखे वाचा."               },
        { w:4,  en:"AI role-play: client asks about print order. Speak all replies.",    mr:"AI role-play: print order — सर्व उत्तरे मोठ्याने बोला."     },
      ] },
    { id:2, title:"Fluency Power",       mr:"Fluency Power",        days:"31–60", icon:"🚀",
      drills:[
        { id:"i5", icon:"🎯", name:"PREP Framework",   mr:"PREP Framework",  min:5,  desc:"Answer using: Point → Reason → Example → Point again. Always.",  mrDesc:"उत्तर: Point → कारण → उदाहरण → पुन्हा Point.",           ex:'"Quality matters." → "Mistakes cost money." → "50k wrong prints."' },
        { id:"i6", icon:"🤖", name:"AI Conversation",  mr:"AI Conversation", min:10, desc:"Chat with AI in printing scenario. Speak OUT LOUD before typing.", mrDesc:"AI शी printing scenario. Type आधी मोठ्याने बोला.",       ex:"Client wants earlier delivery | Explain quality issue | New quote" },
        { id:"i7", icon:"🎭", name:"Shadowing",        mr:"Shadowing",       min:5,  desc:"Business video. Pause each sentence. Repeat same rhythm and tone.",mrDesc:"Video pause. तोच सूर आणि वेग लावून repeat.",             ex:"TED-Ed, BBC Business English, LinkedIn Learning clips" },
        { id:"i8", icon:"📧", name:"Email → Speech",   mr:"Email → बोलणे",  min:5,  desc:"Every work email — read aloud, then rephrase as a phone call.",   mrDesc:"प्रत्येक email मोठ्याने वाचा, phone call सारखे rephrase.", ex:'"Find attached proof." → "Hi, I sent proof — please check!"' },
      ],
      vocab:[
        { en:"Pantone matching",        mr:"रंग जुळवणे",             cat:"Printing" },
        { en:"Perfect binding",         mr:"पुस्तक binding",          cat:"Printing" },
        { en:"Production schedule",     mr:"उत्पादन वेळापत्रक",       cat:"Printing" },
        { en:"I would like to propose", mr:"मला सुचवायचे आहे",        cat:"Business" },
        { en:"Going forward",           mr:"पुढे जाताना",             cat:"Business" },
        { en:"As per our discussion",   mr:"आपल्या चर्चेनुसार",       cat:"Formal"   },
        { en:"Value-added service",     mr:"अतिरिक्त सेवा",           cat:"Business" },
        { en:"Ink coverage",            mr:"शाईचे प्रमाण",            cat:"Printing" },
        { en:"Let's align on this",     mr:"याबद्दल एकमत होऊया",      cat:"Meetings" },
        { en:"Kindly revert",           mr:"कृपया उत्तर द्या",        cat:"Email"    },
      ],
      challenges:[
        { w:5,  en:"5-min AI conversation about printing problem. All answers spoken.",  mr:"AI शी 5 मिनिट printing problem. उत्तरे मोठ्याने."           },
        { w:6,  en:"Record 2-min pitch of your printing services. Professional tone.",   mr:"2 मिनिट printing services pitch record करा."                 },
        { w:7,  en:"Write 3 responses to client complaint: Formal, Friendly, Firm.",     mr:"Client complaint ला 3 tone मध्ये उत्तर."                     },
        { w:8,  en:"Shadow 3-min video. Compare fluency with Week 1 recording.",         mr:"3 मिनिट video shadow. Week 1 शी तुलना."                      },
      ] },
    { id:3, title:"Professional Mastery",mr:"Professional Mastery",  days:"61–90", icon:"👑",
      drills:[
        { id:"i9",  icon:"🔥", name:"Pressure Drill",     mr:"Pressure Drill",    min:5, desc:"Ask AI surprise questions. 5 seconds to start answering.",         mrDesc:"AI ला अचानक प्रश्न. 5 सेकंदांत उत्तर सुरू करा.",        ex:'"Client rejected 50,000 prints — what do you say?" → Go!' },
        { id:"i10", icon:"🎛️", name:"Tone-Shift Drill",   mr:"Tone बदलणे",       min:8, desc:"One message. Three tones: Formal, Friendly, Firm. All three.",     mrDesc:"एक message. Formal, Friendly, Firm — तीन tone.",         ex:"Client discount request → Formal | Friendly | Firm" },
        { id:"i11", icon:"🎙️", name:"Voice Journal",      mr:"Voice Journal",     min:5, desc:"Speak your day in English for 3 minutes every evening. No writing.",mrDesc:"दररोज रात्री 3 मिनिट English voice diary.",             ex:'"Today I finished 2 orders. One client wanted changes..."' },
        { id:"i12", icon:"📣", name:"Mini Presentation",  mr:"Mini Presentation", min:7, desc:"2-min: Hook → Context → Key Point → Evidence → Call to Action.",   mrDesc:"2 मिनिट presentation — Hook → मुद्दा → पुरावा → Action.", ex:'"Why fast turnaround wins clients" | "Our quality edge"' },
      ],
      vocab:[
        { en:"Competitive advantage",   mr:"स्पर्धात्मक फायदा",       cat:"Business"    },
        { en:"Client retention",        mr:"ग्राहक टिकवणे",            cat:"Business"    },
        { en:"Variable data printing",  mr:"बदलणारी माहिती छपाई",      cat:"Printing"    },
        { en:"My recommendation is",    mr:"माझी शिफारस आहे",          cat:"Leadership"  },
        { en:"To summarize",            mr:"थोडक्यात सांगायचे तर",      cat:"Presentation"},
        { en:"The key takeaway is",     mr:"मुख्य मुद्दा आहे",          cat:"Presentation"},
        { en:"Sustainable printing",    mr:"पर्यावरणपूरक छपाई",        cat:"Printing"    },
        { en:"Print-on-demand",         mr:"मागणीनुसार छपाई",          cat:"Printing"    },
        { en:"I'd like to emphasize",   mr:"मला जोर द्यायचा आहे",      cat:"Leadership"  },
        { en:"Moving forward",          mr:"आता पुढे",                  cat:"Business"    },
      ],
      challenges:[
        { w:9,  en:"3-min presentation on printing company strengths. Record and grade.", mr:"Printing strengths वर 3 मिनिट. Record करा."                  },
        { w:10, en:"Full negotiation: opening + conflict + resolution. 5 minutes.",       mr:"पूर्ण negotiation. 5 मिनिटे."                               },
        { w:11, en:"5-min day reflection in English. Compare with Week 1 recording.",    mr:"5 मिनिट day reflection. Week 1 शी तुलना."                    },
        { w:12, en:"FINAL: 5-min professional self-introduction. Name + job + expertise.",mr:"अंतिम: 5 मिनिट professional ओळख."                          },
      ] },
  ],
  advanced: [
    { id:1, title:"Command & Presence",  mr:"Command & Presence",   days:"1–30",  icon:"💎",
      drills:[
        { id:"a1", icon:"👔", name:"Executive Monologue",  mr:"Executive Monologue",  min:7,  desc:"Speak 3 minutes on business topic. No filler words. Every sentence has a point.", mrDesc:"3 मिनिट business topic. Filler words नाहीत.",        ex:'"Future of printing" | "Why quality beats price"' },
        { id:"a2", icon:"🔥", name:"Filler Word Detox",    mr:"Filler Word Detox",    min:5,  desc:"Record 2 minutes. Count every 'umm', 'like'. Goal: zero in 30 days.",            mrDesc:"2 मिनिट record. 'umm' मोजा. 30 दिवसांत zero.",      ex:'Replace with pause or "That\'s an interesting point."' },
        { id:"a3", icon:"⚡", name:"Spontaneous Response", mr:"Spontaneous Response", min:8,  desc:"Ask AI for random question. 3 seconds to start a 2-minute answer.",              mrDesc:"Random question. 3 सेकंदांत 2 मिनिटांचे उत्तर.",    ex:'"5-year plan?" | "Major client complaint?" | "Pitch company."' },
        { id:"a4", icon:"🎭", name:"Advanced Shadowing",   mr:"Advanced Shadowing",   min:10, desc:"Shadow TED talks. Match speed, pauses, emphasis, and emotion exactly.",          mrDesc:"TED talks shadow. Speed, pause, emotion — जुळवा.",  ex:"Simon Sinek, Brené Brown — master one speaker's delivery." },
      ],
      vocab:[
        { en:"Strategic alignment",   mr:"धोरणात्मक सहमती",  cat:"Leadership" },
        { en:"Value proposition",     mr:"मूल्य प्रस्ताव",    cat:"Business"   },
        { en:"Core competency",       mr:"मूलभूत क्षमता",     cat:"Business"   },
        { en:"Scalable solution",     mr:"विस्तारयोग्य उपाय", cat:"Business"   },
        { en:"G7 color calibration",  mr:"G7 रंग calibration", cat:"Printing"  },
        { en:"Cross-media campaign",  mr:"Cross-media मोहीम", cat:"Printing"   },
        { en:"Let me challenge that", mr:"मला आव्हान द्यायचे",cat:"Leadership" },
        { en:"The data suggests",     mr:"आकडेवारी सांगते",   cat:"Analytical" },
        { en:"Stakeholder management",mr:"भागधारक व्यवस्थापन",cat:"Leadership" },
        { en:"ICC color profile",     mr:"ICC रंग profile",    cat:"Printing"   },
      ],
      challenges:[
        { w:1,  en:"Record 3-min talk on future of printing in India. Zero filler words.", mr:"'भारतातील printing चे भविष्य' — 3 मिनिट. Filler words शून्य." },
        { w:2,  en:"Impromptu 2-min answer to AI surprise question. Record it.",           mr:"AI च्या अचानक प्रश्नाला 2 मिनिट impromptu उत्तर."           },
        { w:3,  en:"Shadow a TED talk segment. Compare delivery with the speaker.",        mr:"TED talk shadow. Speaker शी तुलना."                          },
        { w:4,  en:"5-min conversation with AI on complex printing business topic.",       mr:"AI शी complex printing topic वर 5 मिनिट."                   },
      ] },
    { id:2, title:"Influence & Negotiation",mr:"Influence & Negotiation",days:"31–60",icon:"🤝",
      drills:[
        { id:"a5", icon:"🎯", name:"Negotiation Simulation",mr:"Negotiation Simulation",min:10, desc:"Full negotiation: opening, counter-offer, concession, close. 5 min min.",  mrDesc:"Opening → counter → concession → close. 5+ मिनिटे.",   ex:'"Need 20% discount." → "Quality justifies price. Let me offer..."' },
        { id:"a6", icon:"🌊", name:"Objection Handling",    mr:"Objection Handling",    min:8,  desc:"AI throws 5 objections. 10 seconds to start a confident response each.",   mrDesc:"AI 5 objections. 10 सेकंदांत confident response.",      ex:'"Price too high." "Competitor better." "Had problems before."' },
        { id:"a7", icon:"📊", name:"Data-Driven Speaking",  mr:"Data-Driven बोलणे",    min:7,  desc:"Support every claim with specific numbers and evidence in speech.",         mrDesc:"दावे specific numbers आणि पुरावे देऊन करा.",            ex:'"Efficiency improved 23%. Here\'s what that means for costs..."' },
        { id:"a8", icon:"🎭", name:"3-Tone Mastery",        mr:"3-Tone Mastery",        min:5,  desc:"One message in 3 tones: Authoritative, Empathetic, Assertive.",            mrDesc:"एक message तीन tone: Authoritative, Empathetic, Assertive.",ex:"Bad news to client → 3 different tone responses" },
      ],
      vocab:[
        { en:"I appreciate your perspective",mr:"तुमचा दृष्टिकोन समजतो", cat:"Empathy"     },
        { en:"Let me reframe this",          mr:"वेगळ्या प्रकारे पाहूया", cat:"Negotiation" },
        { en:"Non-negotiable",               mr:"बदलता येणार नाही",        cat:"Negotiation" },
        { en:"Mutual benefit",               mr:"दोन्ही बाजूंना फायदा",    cat:"Negotiation" },
        { en:"Cost-per-impression",          mr:"प्रति impression खर्च",   cat:"Printing"    },
        { en:"Workflow optimization",        mr:"Workflow सुधारणा",         cat:"Printing"    },
        { en:"I can offer you instead",      mr:"मी हे देऊ शकतो",          cat:"Negotiation" },
        { en:"The ROI on this is",           mr:"याचा ROI आहे",             cat:"Business"    },
        { en:"To be transparent",            mr:"स्पष्टपणे सांगायचे तर",   cat:"Leadership"  },
        { en:"Let's find common ground",     mr:"सामान्य मुद्दा शोधूया",   cat:"Negotiation" },
      ],
      challenges:[
        { w:5,  en:"Full 7-min negotiation. Record. Analyze where you hesitated.",         mr:"7 मिनिट negotiation. कुठे hesitate केलात ते पहा."           },
        { w:6,  en:"Handle 5 client objections back-to-back without pause.",               mr:"5 objections एका पाठोपाठ handle करा."                       },
        { w:7,  en:"Same message in 3 tones. Record all 3. Compare them.",                 mr:"एकच message 3 tone मध्ये. तुलना करा."                       },
        { w:8,  en:"Business case for expanding printing services. Data-driven. 4 min.",   mr:"Printing services expand चा business case. 4 मिनिटे."       },
      ] },
    { id:3, title:"Elite Communication",  mr:"Elite Communication",  days:"61–90", icon:"🏆",
      drills:[
        { id:"a9",  icon:"📖", name:"Business Storytelling", mr:"Business Storytelling", min:10, desc:"3-min story: Challenge → Action → Result → Lesson. Real or hypothetical.", mrDesc:"3 मिनिट story: समस्या → काय केले → निकाल → शिकवण.",    ex:'"A client once rejected our entire print run. Here\'s what happened..."' },
        { id:"a10", icon:"🎤", name:"Full Presentation",     mr:"Full Presentation",     min:10, desc:"4-min presentation. Grade: Content (1-5), Delivery (1-5), Confidence (1-5).",mrDesc:"4 मिनिट presentation. स्वतःला grade द्या.",             ex:'"Next 5 Years in Printing" | "Why We Are Best Choice"' },
        { id:"a11", icon:"🧠", name:"Think-English Journal", mr:"Think-English Journal", min:5,  desc:"Speak day + thoughts + tomorrow's plans in English. 3 minutes.",             mrDesc:"दिवस + विचार + योजना English मध्ये. 3 मिनिटे.",         ex:'"Today was intense. Three big clients. Handled Sharma account well..."' },
        { id:"a12", icon:"🌍", name:"Thought Leader Talk",   mr:"Thought Leader Talk",   min:8,  desc:"Expert opinion on printing industry trend for 3 minutes. Like podcast host.", mrDesc:"Printing trend वर 3 मिनिट expert opinion. Podcast host.",ex:'"Sustainable printing is not just a trend — it\'s a client requirement..."' },
      ],
      vocab:[
        { en:"Paradigm shift",      mr:"मूलभूत बदल",          cat:"Leadership"  },
        { en:"Industry disruption", mr:"उद्योग क्षेत्रातील बदल",cat:"Business"  },
        { en:"Thought leadership",  mr:"विचारनेतृत्व",          cat:"Leadership" },
        { en:"FSC certified stock", mr:"FSC certified कागद",   cat:"Printing"   },
        { en:"Print benchmark",     mr:"Printing उद्योगाचा मानक",cat:"Printing" },
        { en:"I want to challenge", mr:"मला आव्हान द्यायचे",   cat:"Leadership" },
        { en:"The bigger picture",  mr:"मोठा विचार करायचा तर", cat:"Strategy"   },
        { en:"Here's my conviction",mr:"माझा ठाम विश्वास",     cat:"Leadership" },
        { en:"Let me paint a picture",mr:"मला कल्पना सांगू",   cat:"Storytelling"},
        { en:"Ecosystem partner",   mr:"व्यवस्था भागीदार",     cat:"Business"   },
      ],
      challenges:[
        { w:9,  en:"4-min presentation on future of printing. Zero notes.",                mr:"Printing च्या भविष्यावर 4 मिनिट. Notes नाहीत."              },
        { w:10, en:"3-min business story from real experience. Record it.",                mr:"खऱ्या अनुभवातून 3 मिनिट business story."                    },
        { w:11, en:"Lead mock 5-min meeting. Set agenda, run it, close it.",               mr:"5 मिनिट mock meeting lead करा."                             },
        { w:12, en:"FINAL: 5-min expert talk on printing topic. Your thought leadership!", mr:"अंतिम: 5 मिनिट expert talk. तुमचे thought leadership!"     },
      ] },
  ],
};

const BRIDGE = [
  { en:"Let me think for a moment...", mr:"एक क्षण विचार करतो..." },
  { en:"What I mean is...",            mr:"मला म्हणायचे आहे..."    },
  { en:"To put it simply...",          mr:"सोप्या शब्दांत..."      },
  { en:"In other words...",            mr:"दुसऱ्या शब्दांत..."     },
  { en:"Let me rephrase that...",      mr:"पुन्हा सांगतो..."       },
  { en:"That's a great point...",      mr:"चांगला मुद्दा..."       },
  { en:"If I understand correctly...", mr:"बरोबर समजलो तर..."      },
  { en:"The thing is...",              mr:"गोष्ट ही आहे..."        },
];

const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

const GS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Baloo+2:wght@500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:0;}
input,select{outline:none;}
.tap{transition:transform 0.12s,opacity 0.12s;cursor:pointer;}
.tap:active{transform:scale(0.96);opacity:0.88;}
.fc{perspective:700px;}
.fi{transition:transform 0.45s;transform-style:preserve-3d;width:100%;height:100%;position:relative;}
.fi.fl{transform:rotateY(180deg);}
.ff,.fb{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;text-align:center;}
.fb{transform:rotateY(180deg);}
@keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fu 0.3s ease forwards;}
`;

/* ── AUTH ── */
function AuthScreen({ onAuth }) {
  const [mode, setMode]   = useState("login");
  const [form, setForm]   = useState({ name:"", email:"", password:"", industry:"Printing" });
  const [err,  setErr]    = useState("");
  const [busy, setBusy]   = useState(false);
  const industries = ["Printing","IT / Software","Education","Healthcare","Manufacturing","Retail","Other"];

  const handle = async () => {
    setErr(""); setBusy(true);
    if (mode === "signup") {
      if (!form.name.trim())            { setErr("Please enter your name.");          setBusy(false); return; }
      if (!form.email.includes("@"))    { setErr("Please enter a valid email.");      setBusy(false); return; }
      if (form.password.length < 4)     { setErr("Password must be 4+ characters."); setBusy(false); return; }
      const existing = await S.get(`user:${form.email.toLowerCase()}`);
      if (existing)                     { setErr("Account exists. Please login.");    setBusy(false); return; }
      const u = { name:form.name.trim(), email:form.email.toLowerCase(), password:form.password, industry:form.industry, createdAt:new Date().toISOString() };
      await S.set(`user:${u.email}`, u);
      await S.set("current-user", u.email);
      onAuth(u);
    } else {
      if (!form.email.includes("@"))    { setErr("Please enter a valid email.");     setBusy(false); return; }
      const u = await S.get(`user:${form.email.toLowerCase()}`);
      if (!u)                           { setErr("Account not found. Sign up first.");setBusy(false); return; }
      if (u.password !== form.password) { setErr("Incorrect password.");              setBusy(false); return; }
      await S.set("current-user", u.email);
      onAuth(u);
    }
    setBusy(false);
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a,#1e1b4b,#0f172a)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif",padding:"24px 20px"}}>
      <style>{GS}</style>
      <div style={{fontSize:52,marginBottom:8}}>🗣️</div>
      <div style={{color:"white",fontSize:22,fontWeight:800,marginBottom:2}}>English Fluency</div>
      <div style={{color:"#fb923c",fontFamily:"'Baloo 2'",fontSize:17,fontWeight:700,marginBottom:28}}>मराठी लोकांसाठी</div>

      <div style={{display:"flex",background:"rgba(255,255,255,0.06)",borderRadius:14,padding:4,marginBottom:22,width:"100%",maxWidth:340}}>
        {["login","signup"].map(m=>(
          <button key={m} onClick={()=>{setMode(m);setErr("");}} className="tap"
            style={{flex:1,padding:"10px 0",borderRadius:10,border:"none",background:mode===m?"white":"transparent",color:mode===m?"#0f172a":"#64748b",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Sora',sans-serif",textTransform:"capitalize"}}>
            {m==="login"?"Login":"Sign Up"}
          </button>
        ))}
      </div>

      <div style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:11}}>
        {mode==="signup"&&(
          <input placeholder="Your Name — तुमचे नाव" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
            style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"13px 16px",color:"white",fontSize:14,fontFamily:"'Sora',sans-serif",width:"100%"}}/>
        )}
        <input placeholder="Email address" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} type="email"
          style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"13px 16px",color:"white",fontSize:14,fontFamily:"'Sora',sans-serif",width:"100%"}}/>
        <input placeholder="Password (4+ characters)" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type="password"
          style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"13px 16px",color:"white",fontSize:14,fontFamily:"'Sora',sans-serif",width:"100%"}}/>
        {mode==="signup"&&(
          <select value={form.industry} onChange={e=>setForm({...form,industry:e.target.value})}
            style={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"13px 16px",color:"white",fontSize:14,fontFamily:"'Sora',sans-serif",width:"100%"}}>
            {industries.map(i=><option key={i} value={i}>{i}</option>)}
          </select>
        )}
        {err&&<div style={{color:"#f87171",fontSize:13,background:"rgba(239,68,68,0.1)",padding:"10px 14px",borderRadius:10,border:"1px solid rgba(239,68,68,0.2)"}}>{err}</div>}
        <button className="tap" onClick={handle} disabled={busy}
          style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"white",border:"none",padding:"15px",borderRadius:14,fontWeight:800,fontSize:16,cursor:"pointer",fontFamily:"'Sora',sans-serif",opacity:busy?0.7:1,marginTop:4}}>
          {busy?"...":(mode==="login"?"Login →":"Create Account →")}
        </button>
        <div style={{color:"#475569",fontSize:12,textAlign:"center",marginTop:2}}>
          {mode==="login"?"New here? ":"Already have account? "}
          <span onClick={()=>{setMode(mode==="login"?"signup":"login");setErr("");}} style={{color:"#818cf8",cursor:"pointer",fontWeight:700}}>
            {mode==="login"?"Sign Up":"Login"}
          </span>
        </div>
        <div style={{color:"#1e3a5f",fontSize:11,textAlign:"center",marginTop:6,fontFamily:"'Baloo 2'"}}>मोफत • Free • Open Source 🧡</div>
      </div>
    </div>
  );
}

/* ── ROOT ── */
export default function App() {
  const [user,     setUser]     = useState(null);
  const [boot,     setBoot]     = useState(true);
  const [screen,   setScreen]   = useState("splash");
  const [qi,       setQi]       = useState(0);
  const [qs,       setQs]       = useState(0);
  const [levelId,  setLevelId]  = useState(null);
  const [tab,      setTab]      = useState("home");
  const [day,      setDay]      = useState(1);
  const [streak,   setStreak]   = useState(0);
  const [doneD,    setDoneD]    = useState({});
  const [doneC,    setDoneC]    = useState({});
  const [vFlip,    setVFlip]    = useState({});
  const [selPhase, setSelPhase] = useState(null);
  const [phTab,    setPhTab]    = useState("drills");
  const [drill,    setDrill]    = useState(null);
  const [tSec,     setTSec]     = useState(0);
  const [tOn,      setTOn]      = useState(false);
  const [tDone,    setTDone]    = useState(false);
  const [bridge,   setBridge]   = useState(false);
  const [saying,   setSaying]   = useState(null);
  const tRef = useRef(null);
  const { speak, stop } = useAudio();

  /* boot: auto-login */
  useEffect(() => {
    (async () => {
      const email = await S.get("current-user");
      if (email) {
        const u = await S.get(`user:${email}`);
        if (u) {
          setUser(u);
          const p = await S.get(`progress:${email}`);
          if (p) {
            setLevelId(p.levelId || null);
            setDay(p.day || 1);
            setStreak(p.streak || 0);
            setDoneD(p.doneD || {});
            setDoneC(p.doneC || {});
            if (p.levelId) setScreen("app");
          }
        }
      }
      setBoot(false);
    })();
  }, []);

  /* save progress */
  const saveProgress = useCallback(async (patch) => {
    if (!user) return;
    const cur = (await S.get(`progress:${user.email}`)) || {};
    await S.set(`progress:${user.email}`, {
      ...cur, levelId, day, streak, doneD, doneC, ...patch,
    });
  }, [user, levelId, day, streak, doneD, doneC]);

  useEffect(() => { saveProgress(); }, [saveProgress]);

  /* timer */
  useEffect(() => {
    if (tOn && tSec > 0)       tRef.current = setTimeout(() => setTSec(s => s-1), 1000);
    else if (tOn && tSec === 0){ setTOn(false); setTDone(true); }
    return () => clearTimeout(tRef.current);
  }, [tOn, tSec]);

  const handleAuth = async (u) => {
    setUser(u);
    const p = await S.get(`progress:${u.email}`);
    if (p && p.levelId) {
      setLevelId(p.levelId); setDay(p.day||1); setStreak(p.streak||0);
      setDoneD(p.doneD||{}); setDoneC(p.doneC||{});
      setScreen("app");
    } else setScreen("splash");
  };

  const logout = async () => {
    stop();
    await S.del("current-user");
    setUser(null); setScreen("splash"); setLevelId(null);
    setDay(1); setStreak(0); setDoneD({}); setDoneC({});
    setTab("home"); setSelPhase(null); setDrill(null);
  };

  const sayIt = (text, id) => {
    if (saying === id) { stop(); setSaying(null); return; }
    setSaying(id); speak(text);
    setTimeout(() => setSaying(null), 3500);
  };

  if (boot) return <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:36}}>🗣️</div>;
  if (!user) return <AuthScreen onAuth={handleAuth} />;

  const lvl      = levelId ? LEVELS[levelId] : null;
  const phases   = levelId ? PHASES[levelId] : null;
  const curPhase = phases ? (day<=30?phases[0]:day<=60?phases[1]:phases[2]) : null;
  const prog     = Math.round((day/90)*100);
  const todayDone  = curPhase ? curPhase.drills.filter(d=>doneD[`${day}-${d.id}`]).length : 0;
  const todayTotal = curPhase ? curPhase.drills.length : 0;

  const doQuiz = (s) => {
    const ns = qs + s;
    if (qi+1 >= QUIZ.length) {
      const lid = ns<=5?"beginner":ns<=10?"intermediate":"advanced";
      setLevelId(lid); setQs(ns); setScreen("result");
    } else { setQs(ns); setQi(i=>i+1); }
  };

  const startDrill = (d) => { setDrill(d); setTSec(d.min*60); setTOn(false); setTDone(false); };
  const doneDrill  = (d) => { setDoneD(p=>({...p,[`${day}-${d.id}`]:true})); setDrill(null); setTOn(false); clearTimeout(tRef.current); };
  const advDay     = ()  => { if(day<90){ setDay(d=>d+1); setStreak(s=>s+1); }};

  /* ── DRILL SCREEN ── */
  if (drill && lvl) {
    const tot=drill.min*60, el=tot-tSec, pct=tDone?1:el/tot, r=56, C=2*Math.PI*r;
    return (
      <div style={{minHeight:"100vh",background:"#0f172a",fontFamily:"'Sora',sans-serif",maxWidth:430,margin:"0 auto"}}>
        <style>{GS}</style>
        <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
          <button className="tap" onClick={()=>{setDrill(null);setTOn(false);clearTimeout(tRef.current);stop();}}
            style={{background:"rgba(255,255,255,0.06)",border:"none",color:"white",width:36,height:36,borderRadius:10,fontSize:16}}>←</button>
          <div style={{flex:1}}>
            <div style={{color:"white",fontWeight:700,fontSize:15}}>{drill.icon} {drill.name}</div>
            <div style={{color:"#64748b",fontSize:11}}>{drill.mr}</div>
          </div>
          <button className="tap" onClick={()=>sayIt(drill.name,"dn")}
            style={{background:saying==="dn"?"rgba(251,146,60,0.2)":"rgba(255,255,255,0.06)",border:"none",color:saying==="dn"?"#fb923c":"#94a3b8",width:36,height:36,borderRadius:10,fontSize:18}}>
            {saying==="dn"?"🔊":"🔈"}
          </button>
        </div>
        <div style={{padding:"20px 20px 30px",overflowY:"auto"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",margin:"10px 0 22px"}}>
            <div style={{position:"relative",width:130,height:130}}>
              <svg width="130" height="130" style={{transform:"rotate(-90deg)"}}>
                <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                <circle cx="65" cy="65" r={r} fill="none" stroke={tDone?"#10b981":lvl.accent} strokeWidth="8"
                  strokeDasharray={C} strokeDashoffset={C*(1-pct)} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.6s"}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{color:tDone?"#10b981":"white",fontSize:24,fontWeight:800}}>{tDone?"✓":fmt(tSec)}</div>
                <div style={{color:"#475569",fontSize:11}}>{drill.min} min</div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              {!tDone&&(
                <button className="tap" onClick={()=>setTOn(o=>!o)}
                  style={{background:tOn?"#ef4444":lvl.accent,color:"white",border:"none",padding:"10px 24px",borderRadius:50,fontWeight:700,fontSize:14}}>
                  {tOn?"⏸ Pause":tSec===tot?"▶ Start":"▶ Resume"}
                </button>
              )}
              <button className="tap" onClick={()=>{setTSec(tot);setTOn(false);setTDone(false);}}
                style={{background:"rgba(255,255,255,0.07)",color:"#94a3b8",border:"none",padding:"10px 14px",borderRadius:50,fontWeight:600,fontSize:14}}>↺</button>
            </div>
          </div>
          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:16,marginBottom:12,border:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{color:"#94a3b8",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>📋 Instructions</div>
              <button className="tap" onClick={()=>sayIt(drill.desc,"dd")}
                style={{background:saying==="dd"?"rgba(251,146,60,0.15)":"rgba(255,255,255,0.04)",border:"none",color:saying==="dd"?"#fb923c":"#64748b",padding:"4px 10px",borderRadius:8,fontSize:12,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>
                {saying==="dd"?"🔊 Playing":"🔈 Listen"}
              </button>
            </div>
            <div style={{color:"#e2e8f0",fontSize:13,lineHeight:1.7}}>{drill.desc}</div>
          </div>
          <div style={{background:"rgba(251,146,60,0.06)",border:"1px solid rgba(251,146,60,0.18)",borderRadius:14,padding:14,marginBottom:12}}>
            <div style={{color:"#fb923c",fontSize:11,fontWeight:700,marginBottom:6,fontFamily:"'Baloo 2'"}}>🇮🇳 मराठीत</div>
            <div style={{color:"#fed7aa",fontSize:13,lineHeight:1.7,fontFamily:"'Baloo 2'"}}>{drill.mrDesc}</div>
          </div>
          <div style={{background:"rgba(99,102,241,0.06)",borderRadius:12,padding:14,marginBottom:20,borderLeft:"3px solid #6366f1"}}>
            <div style={{color:"#a5b4fc",fontSize:11,fontWeight:700,marginBottom:4}}>💡 Example</div>
            <div style={{color:"#94a3b8",fontSize:12,fontStyle:"italic",lineHeight:1.6}}>{drill.ex}</div>
          </div>
          {tDone&&(
            <button className="tap" onClick={()=>doneDrill(drill)}
              style={{width:"100%",background:"linear-gradient(135deg,#059669,#10b981)",color:"white",border:"none",padding:16,borderRadius:14,fontWeight:800,fontSize:15,fontFamily:"'Sora',sans-serif"}}>
              ✅ Mark Complete — छान केलेस! 🎉
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── PHASE DETAIL ── */
  if (selPhase && lvl) {
    const ph = selPhase;
    return (
      <div style={{minHeight:"100vh",background:"#0f172a",fontFamily:"'Sora',sans-serif",maxWidth:430,margin:"0 auto"}}>
        <style>{GS}</style>
        <div style={{background:`linear-gradient(${lvl.grad})`,padding:"18px 20px 24px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.2)"}}/>
          <div style={{position:"relative"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <button className="tap" onClick={()=>setSelPhase(null)}
                style={{background:"rgba(255,255,255,0.15)",border:"none",color:"white",width:36,height:36,borderRadius:10,fontSize:16}}>←</button>
              <div style={{color:"rgba(255,255,255,0.7)",fontSize:11,fontWeight:700,letterSpacing:1}}>PHASE {ph.id} • DAYS {ph.days}</div>
            </div>
            <div style={{fontSize:32}}>{ph.icon}</div>
            <div style={{color:"white",fontSize:19,fontWeight:800,marginTop:5}}>{ph.title}</div>
            <div style={{color:"rgba(255,255,255,0.65)",fontSize:12,fontFamily:"'Baloo 2'"}}>{ph.mr}</div>
          </div>
        </div>
        <div style={{display:"flex",background:"#1e293b",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
          {["drills","vocab","challenges"].map(t=>(
            <button key={t} onClick={()=>setPhTab(t)}
              style={{flex:1,background:"none",border:"none",color:phTab===t?lvl.accent:"#475569",padding:"12px 0",fontSize:12,fontWeight:700,cursor:"pointer",borderBottom:phTab===t?`2px solid ${lvl.accent}`:"2px solid transparent",textTransform:"capitalize",fontFamily:"'Sora',sans-serif"}}>
              {t==="drills"?"🏋️ Drills":t==="vocab"?"📚 Vocab":"🏆 Challenges"}
            </button>
          ))}
        </div>
        <div style={{padding:"14px 16px 80px",overflowY:"auto",maxHeight:"calc(100vh - 190px)"}}>
          {phTab==="drills" && ph.drills.map(d=>{
            const done=doneD[`${day}-${d.id}`];
            return (
              <div key={d.id} className="tap" onClick={()=>startDrill(d)}
                style={{background:done?"rgba(16,185,129,0.07)":"rgba(255,255,255,0.03)",border:`1px solid ${done?"rgba(16,185,129,0.25)":"rgba(255,255,255,0.06)"}`,borderRadius:16,padding:15,marginBottom:11}}>
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:7}}>
                  <span style={{fontSize:24}}>{d.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <div style={{color:"white",fontWeight:700,fontSize:13}}>{d.name}</div>
                      {done&&<span style={{color:"#10b981",fontSize:11,fontWeight:700}}>✓ Done</span>}
                    </div>
                    <div style={{color:"#64748b",fontSize:11}}>{d.mr} • {d.min} min</div>
                  </div>
                </div>
                <div style={{color:"#94a3b8",fontSize:12,lineHeight:1.6}}>{d.desc}</div>
              </div>
            );
          })}
          {phTab==="vocab"&&(
            <>
              <div style={{color:"#64748b",fontSize:12,textAlign:"center",marginBottom:12}}>Tap = Marathi • 🔈 = Pronunciation</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {ph.vocab.map((v,i)=>{
                  const key=`${ph.id}-${i}`,fl=vFlip[key];
                  return (
                    <div key={i} style={{height:92,position:"relative"}}>
                      <div className="fc tap" style={{height:"100%"}} onClick={()=>setVFlip(p=>({...p,[key]:!p[key]}))}>
                        <div className={`fi${fl?" fl":""}`}>
                          <div className="ff" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
                            <div style={{color:"white",fontWeight:700,fontSize:12}}>{v.en}</div>
                            <div style={{color:lvl.accent,fontSize:10,marginTop:4}}>{v.cat}</div>
                          </div>
                          <div className="fb" style={{background:`linear-gradient(135deg,${lvl.color}55,${lvl.accent}30)`,border:`1px solid ${lvl.accent}30`}}>
                            <div style={{color:"#fef3c7",fontFamily:"'Baloo 2'",fontSize:13,fontWeight:600}}>{v.mr}</div>
                            <div style={{color:lvl.accent,fontSize:10,marginTop:4}}>{v.en}</div>
                          </div>
                        </div>
                      </div>
                      <button className="tap" onClick={e=>{e.stopPropagation();sayIt(v.en,key);}}
                        style={{position:"absolute",top:4,right:4,background:saying===key?"rgba(251,146,60,0.25)":"rgba(0,0,0,0.45)",border:"none",color:saying===key?"#fb923c":"#94a3b8",width:24,height:24,borderRadius:6,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}>
                        {saying===key?"🔊":"🔈"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {phTab==="challenges"&&ph.challenges.map((ch,i)=>{
            const key=`p${ph.id}w${ch.w}`,done=doneC[key];
            return (
              <div key={i} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${done?"rgba(16,185,129,0.25)":"rgba(255,255,255,0.06)"}`,borderRadius:16,padding:15,marginBottom:11}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{background:`${lvl.accent}20`,color:lvl.accent,padding:"3px 12px",borderRadius:50,fontSize:11,fontWeight:700}}>Week {ch.w}</span>
                  {done&&<span style={{color:"#10b981",fontSize:11,fontWeight:700}}>✅ Done</span>}
                </div>
                <div style={{color:"white",fontSize:13,lineHeight:1.6,marginBottom:5}}>{ch.en}</div>
                <div style={{color:"#fb923c",fontSize:12,lineHeight:1.5,fontFamily:"'Baloo 2'",marginBottom:12}}>{ch.mr}</div>
                <button className="tap" onClick={()=>setDoneC(p=>({...p,[key]:!p[key]}))}
                  style={{width:"100%",background:done?"rgba(16,185,129,0.1)":`linear-gradient(${lvl.grad})`,color:done?"#10b981":"white",border:done?"1px solid rgba(16,185,129,0.3)":"none",padding:"10px 0",borderRadius:50,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>
                  {done?"✓ Done — Undo?":"Mark Complete ✓"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── SPLASH ── */
  if (screen==="splash") return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a,#1e1b4b,#0f172a)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif",padding:28,textAlign:"center",position:"relative",overflow:"hidden"}}>
      <style>{GS}</style>
      <div style={{position:"absolute",top:-80,right:-80,width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)"}}/>
      <div style={{background:"rgba(255,255,255,0.06)",borderRadius:14,padding:"7px 14px",marginBottom:18,color:"#94a3b8",fontSize:12}}>
        नमस्ते! Welcome, <span style={{color:"white",fontWeight:700}}>{user.name}</span> 👋
      </div>
      <div style={{fontSize:60,marginBottom:10}}>🗣️</div>
      <div style={{color:"white",fontSize:28,fontWeight:800,lineHeight:1.2,marginBottom:4}}>English Fluency</div>
      <div style={{color:"#fb923c",fontFamily:"'Baloo 2'",fontSize:19,fontWeight:700,marginBottom:6}}>मराठी लोकांसाठी</div>
      <div style={{color:"#64748b",fontSize:13,lineHeight:1.7,maxWidth:280,marginBottom:32}}>Take a 5-question assessment. Get your personalized 90-day plan.</div>
      <button className="tap" onClick={()=>{setQi(0);setQs(0);setScreen("quiz");}}
        style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"white",border:"none",padding:"15px 40px",borderRadius:16,fontWeight:800,fontSize:16,fontFamily:"'Sora',sans-serif",width:"100%",maxWidth:300}}>
        🎯 Start Assessment
      </button>
      <div style={{color:"#334155",fontSize:11,marginTop:10}}>5 questions • 2 minutes • मराठीत उपलब्ध</div>
      <button className="tap" onClick={logout} style={{marginTop:28,background:"none",border:"none",color:"#334155",fontSize:12,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>Logout</button>
    </div>
  );

  /* ── QUIZ ── */
  if (screen==="quiz") {
    const q=QUIZ[qi];
    return (
      <div style={{minHeight:"100vh",background:"#0f172a",fontFamily:"'Sora',sans-serif",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column"}}>
        <style>{GS}</style>
        <div style={{padding:"18px 20px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <button onClick={()=>qi===0?setScreen("splash"):setQi(i=>i-1)} className="tap"
              style={{background:"rgba(255,255,255,0.06)",border:"none",color:"#94a3b8",width:36,height:36,borderRadius:10,fontSize:16}}>←</button>
            <div style={{color:"#64748b",fontSize:13,fontWeight:600}}>{qi+1} / {QUIZ.length}</div>
            <div style={{width:36}}/>
          </div>
          <div style={{background:"rgba(255,255,255,0.05)",borderRadius:99,height:5}}>
            <div style={{background:"linear-gradient(90deg,#4f46e5,#7c3aed)",height:"100%",borderRadius:99,width:`${(qi/QUIZ.length)*100}%`,transition:"width 0.4s"}}/>
          </div>
        </div>
        <div className="fu" style={{flex:1,padding:"24px 20px 20px"}}>
          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:18,padding:"20px 18px",marginBottom:20,border:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{color:"white",fontSize:16,fontWeight:700,lineHeight:1.5,marginBottom:5}}>{q.q}</div>
            <div style={{color:"#fb923c",fontSize:13,fontFamily:"'Baloo 2'"}}>{q.mr}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {q.options.map((opt,i)=>(
              <button key={i} className="tap" onClick={()=>doQuiz(opt.s)}
                style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"13px 16px",textAlign:"left",cursor:"pointer",width:"100%"}}>
                <div style={{color:"white",fontSize:13,fontWeight:600,marginBottom:2}}>{opt.t}</div>
                <div style={{color:"#fb923c",fontSize:12,fontFamily:"'Baloo 2'"}}>{opt.mr}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── RESULT ── */
  if (screen==="result"&&lvl&&phases) return (
    <div style={{minHeight:"100vh",background:"#0f172a",fontFamily:"'Sora',sans-serif",overflowY:"auto",maxWidth:430,margin:"0 auto"}}>
      <style>{GS}</style>
      <div style={{background:`linear-gradient(${lvl.grad})`,padding:"44px 24px 48px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.22)"}}/>
        <div style={{position:"relative"}}>
          <div style={{fontSize:56,marginBottom:8}}>{lvl.emoji}</div>
          <div style={{color:"rgba(255,255,255,0.7)",fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Your Level, {user.name}</div>
          <div style={{color:"white",fontSize:30,fontWeight:800}}>{lvl.label}</div>
          <div style={{color:"rgba(255,255,255,0.7)",fontSize:17,fontFamily:"'Baloo 2'",marginBottom:12}}>{lvl.mr}</div>
          <div style={{background:"rgba(255,255,255,0.12)",borderRadius:50,padding:"5px 16px",display:"inline-block",color:"white",fontSize:12}}>Score: {qs}/15 • {user.industry}</div>
        </div>
      </div>
      <div style={{padding:"20px 20px 40px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
          {[["📅","Daily Time",`${lvl.min} min`],["🗂️","Phases","3"],["🎯","Days","90"]].map(([ic,l,v])=>(
            <div key={l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:"13px 8px",textAlign:"center"}}>
              <div style={{fontSize:17,marginBottom:3}}>{ic}</div>
              <div style={{color:lvl.accent,fontSize:19,fontWeight:800}}>{v}</div>
              <div style={{color:"#64748b",fontSize:10,marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
        {phases.map((ph,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:"12px 16px",marginBottom:9,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:24}}>{ph.icon}</span>
            <div>
              <div style={{color:"white",fontWeight:700,fontSize:13}}>Phase {ph.id}: {ph.title}</div>
              <div style={{color:"#64748b",fontSize:11}}>Days {ph.days} • {ph.mr}</div>
            </div>
          </div>
        ))}
        <button className="tap" onClick={()=>{setScreen("app");setTab("home");}}
          style={{width:"100%",background:`linear-gradient(${lvl.grad})`,color:"white",border:"none",padding:"16px",borderRadius:16,fontWeight:800,fontSize:16,fontFamily:"'Sora',sans-serif",marginTop:12}}>
          🚀 Start My 90-Day Journey
        </button>
      </div>
    </div>
  );

  /* ── MAIN APP ── */
  if (screen==="app"&&lvl&&curPhase) return (
    <div style={{minHeight:"100vh",background:"#0f172a",fontFamily:"'Sora',sans-serif",maxWidth:430,margin:"0 auto"}}>
      <style>{GS}</style>
      <div style={{paddingBottom:72,minHeight:"100vh",overflowY:"auto"}}>

        {/* HOME */}
        {tab==="home"&&(
          <div>
            <div style={{background:`linear-gradient(${lvl.grad})`,padding:"20px 20px 26px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.2)"}}/>
              <div style={{position:"relative"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div>
                    <div style={{color:"rgba(255,255,255,0.6)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>नमस्ते, {user.name}!</div>
                    <div style={{color:"white",fontSize:20,fontWeight:800,marginTop:1}}>Day {day} of 90</div>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginTop:4}}>
                      <span style={{background:"rgba(255,255,255,0.14)",color:"white",padding:"2px 10px",borderRadius:50,fontSize:11,fontWeight:600}}>{lvl.emoji} {lvl.label}</span>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end"}}>
                    <div style={{background:"rgba(255,255,255,0.12)",borderRadius:11,padding:"6px 11px",textAlign:"center"}}>
                      <div style={{color:"#fbbf24",fontSize:17,fontWeight:800}}>🔥{streak}</div>
                      <div style={{color:"rgba(255,255,255,0.5)",fontSize:9}}>Streak</div>
                    </div>
                    <button className="tap" onClick={logout} style={{background:"rgba(255,255,255,0.08)",border:"none",color:"rgba(255,255,255,0.45)",padding:"3px 8px",borderRadius:7,fontSize:10,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>Logout</button>
                  </div>
                </div>
                <div style={{background:"rgba(255,255,255,0.14)",borderRadius:99,height:6,marginBottom:4}}>
                  <div style={{background:"#fbbf24",height:"100%",borderRadius:99,width:`${prog}%`,transition:"width 0.6s"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"rgba(255,255,255,0.4)",fontSize:10}}>Day 1</span>
                  <span style={{color:"white",fontSize:10,fontWeight:700}}>{prog}% Complete</span>
                  <span style={{color:"rgba(255,255,255,0.4)",fontSize:10}}>Day 90</span>
                </div>
              </div>
            </div>
            <div style={{padding:"14px 16px"}}>
              <div style={{background:`${lvl.accent}10`,border:`1px solid ${lvl.accent}28`,borderRadius:12,padding:"8px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:17}}>🏭</span>
                <div style={{flex:1}}>
                  <div style={{color:lvl.accent,fontWeight:700,fontSize:12}}>{user.industry} • {curPhase.title}</div>
                  <div style={{color:"#64748b",fontSize:11}}>{lvl.min} min/day • {todayDone}/{todayTotal} done</div>
                </div>
              </div>
              <div style={{color:"white",fontSize:14,fontWeight:700,marginBottom:11}}>Today's Drills</div>
              {curPhase.drills.map(d=>{
                const done=doneD[`${day}-${d.id}`];
                return (
                  <div key={d.id} className="tap" onClick={()=>startDrill(d)}
                    style={{background:done?"rgba(16,185,129,0.07)":"rgba(255,255,255,0.03)",border:`1px solid ${done?"rgba(16,185,129,0.22)":"rgba(255,255,255,0.05)"}`,borderRadius:14,padding:"12px 13px",marginBottom:9,display:"flex",alignItems:"center",gap:11}}>
                    <div style={{width:40,height:40,borderRadius:11,background:done?"rgba(16,185,129,0.15)":`${lvl.accent}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{done?"✅":d.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{color:"white",fontSize:13,fontWeight:600}}>{d.name}</div>
                      <div style={{color:"#64748b",fontSize:11}}>{d.mr} • {d.min} min</div>
                    </div>
                    <button className="tap" onClick={e=>{e.stopPropagation();sayIt(d.name,"h"+d.id);}}
                      style={{background:saying==="h"+d.id?"rgba(251,146,60,0.15)":"rgba(255,255,255,0.05)",border:"none",color:saying==="h"+d.id?"#fb923c":"#475569",width:28,height:28,borderRadius:8,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {saying==="h"+d.id?"🔊":"🔈"}
                    </button>
                    <div style={{color:"#334155",fontSize:15}}>›</div>
                  </div>
                );
              })}
              {todayDone===todayTotal&&todayTotal>0&&day<90&&(
                <button className="tap" onClick={advDay}
                  style={{width:"100%",background:"linear-gradient(135deg,#059669,#10b981)",color:"white",border:"none",padding:14,borderRadius:14,fontWeight:800,fontSize:14,fontFamily:"'Sora',sans-serif",marginTop:2,marginBottom:14}}>
                  🎉 Day Complete! → Day {day+1}
                </button>
              )}
              <div style={{background:"rgba(99,102,241,0.07)",border:"1px solid rgba(99,102,241,0.15)",borderRadius:14,padding:14,marginBottom:11}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:bridge?11:0}}>
                  <div style={{color:"#a5b4fc",fontWeight:700,fontSize:13}}>🌉 Bridge Phrases</div>
                  <button className="tap" onClick={()=>setBridge(b=>!b)}
                    style={{background:"rgba(99,102,241,0.15)",border:"none",color:"#a5b4fc",padding:"3px 11px",borderRadius:50,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'Sora',sans-serif"}}>
                    {bridge?"Hide":"Show"}
                  </button>
                </div>
                {bridge&&BRIDGE.map((p,i)=>(
                  <div key={i} style={{padding:"6px 0",borderBottom:i<BRIDGE.length-1?"1px dashed rgba(99,102,241,0.1)":"none",display:"flex",alignItems:"center",gap:8}}>
                    <div style={{flex:1}}>
                      <div style={{color:"white",fontSize:13,fontWeight:500}}>{p.en}</div>
                      <div style={{color:"#fb923c",fontSize:12,fontFamily:"'Baloo 2'"}}>{p.mr}</div>
                    </div>
                    <button className="tap" onClick={()=>sayIt(p.en,"br"+i)}
                      style={{background:saying==="br"+i?"rgba(251,146,60,0.15)":"rgba(255,255,255,0.04)",border:"none",color:saying==="br"+i?"#fb923c":"#475569",width:28,height:28,borderRadius:8,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {saying==="br"+i?"🔊":"🔈"}
                    </button>
                  </div>
                ))}
              </div>
              <div style={{background:"rgba(251,191,36,0.05)",border:"1px solid rgba(251,191,36,0.12)",borderRadius:13,padding:13}}>
                <div style={{color:"#fbbf24",fontWeight:700,fontSize:12,marginBottom:4}}>💛 Coach Note</div>
                <div style={{color:"#fde68a",fontSize:12,lineHeight:1.7,fontFamily:"'Baloo 2'"}}>
                  {levelId==="beginner"?day<=30?"चुकीचे बोललो तरी चालेल — फक्त बोला! Every word out loud is progress.":day<=60?"तुम्ही खूप प्रगती केली! आत्मविश्वास वाढतोय. Keep going!":"तुम्ही English speaker आहात आता! 🎉"
                  :levelId==="intermediate"?day<=30?"Imperfect spoken English beats perfect silent English. बोला!":day<=60?"Speed coming. Structure forming. Push harder now!":"You are commanding English now. Own it."
                  :day<=30?"Building presence. Every session raise the bar.":day<=60?"Negotiations, presentations — you handle them all.":"You are the person who gets heard and remembered. 🏆"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHASES */}
        {tab==="phases"&&(
          <div>
            <div style={{padding:"20px 20px 12px"}}>
              <div style={{color:"white",fontSize:19,fontWeight:800}}>Learning Path</div>
              <div style={{color:"#64748b",fontSize:12,marginTop:2,fontFamily:"'Baloo 2'"}}>{lvl.emoji} {lvl.label} • {lvl.mr}</div>
            </div>
            <div style={{padding:"0 16px 20px"}}>
              {phases.map((ph,i)=>{
                const isAct=curPhase?.id===ph.id;
                const chDone=ph.challenges.filter(ch=>doneC[`p${ph.id}w${ch.w}`]).length;
                return (
                  <div key={i} className="tap" onClick={()=>{setSelPhase(ph);setPhTab("drills");}}
                    style={{background:isAct?`${lvl.color}40`:"rgba(255,255,255,0.03)",border:`1.5px solid ${isAct?lvl.accent+"50":"rgba(255,255,255,0.06)"}`,borderRadius:18,padding:17,marginBottom:13}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{display:"flex",gap:12,alignItems:"center"}}>
                        <span style={{fontSize:28}}>{ph.icon}</span>
                        <div>
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            <div style={{color:"white",fontSize:14,fontWeight:800}}>{ph.title}</div>
                            {isAct&&<span style={{background:lvl.accent,color:"white",fontSize:8,fontWeight:700,padding:"2px 8px",borderRadius:50}}>ACTIVE</span>}
                          </div>
                          <div style={{color:lvl.accent,fontSize:11}}>Days {ph.days}</div>
                          <div style={{color:"#64748b",fontSize:11,fontFamily:"'Baloo 2'"}}>{ph.mr}</div>
                        </div>
                      </div>
                      <span style={{color:"#334155",fontSize:17}}>›</span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:12}}>
                      {[["Drills",ph.drills.length],["Vocab",ph.vocab.length],["Done",`${chDone}/${ph.challenges.length}`]].map(([l,v])=>(
                        <div key={l} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"8px 0",textAlign:"center"}}>
                          <div style={{color:"white",fontWeight:700,fontSize:14}}>{v}</div>
                          <div style={{color:"#64748b",fontSize:10}}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VOCAB */}
        {tab==="vocab"&&(
          <div>
            <div style={{padding:"20px 20px 10px"}}>
              <div style={{color:"white",fontSize:19,fontWeight:800}}>Vocabulary</div>
              <div style={{color:"#64748b",fontSize:12,marginTop:2}}>Tap = Marathi • 🔈 = Hear pronunciation</div>
            </div>
            <div style={{padding:"0 16px 20px"}}>
              {phases.map(ph=>(
                <div key={ph.id} style={{marginBottom:22}}>
                  <div style={{color:lvl.accent,fontSize:12,fontWeight:700,marginBottom:11,textTransform:"uppercase",letterSpacing:1}}>{ph.icon} Phase {ph.id} — {ph.title}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {ph.vocab.map((v,i)=>{
                      const key=`${ph.id}-${i}`,fl=vFlip[key];
                      return (
                        <div key={i} style={{height:88,position:"relative"}}>
                          <div className="fc tap" style={{height:"100%"}} onClick={()=>setVFlip(p=>({...p,[key]:!p[key]}))}>
                            <div className={`fi${fl?" fl":""}`}>
                              <div className="ff" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
                                <div style={{color:"white",fontWeight:700,fontSize:12}}>{v.en}</div>
                                <div style={{color:lvl.accent,fontSize:10,marginTop:4}}>{v.cat}</div>
                              </div>
                              <div className="fb" style={{background:`linear-gradient(135deg,${lvl.color}55,${lvl.accent}30)`,border:`1px solid ${lvl.accent}30`}}>
                                <div style={{color:"#fef3c7",fontFamily:"'Baloo 2'",fontSize:13,fontWeight:600}}>{v.mr}</div>
                                <div style={{color:lvl.accent,fontSize:10,marginTop:4}}>{v.en}</div>
                              </div>
                            </div>
                          </div>
                          <button className="tap" onClick={e=>{e.stopPropagation();sayIt(v.en,key);}}
                            style={{position:"absolute",top:4,right:4,background:saying===key?"rgba(251,146,60,0.25)":"rgba(0,0,0,0.45)",border:"none",color:saying===key?"#fb923c":"#94a3b8",width:24,height:24,borderRadius:6,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}>
                            {saying===key?"🔊":"🔈"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROGRESS */}
        {tab==="progress"&&(
          <div>
            <div style={{padding:"20px 20px 12px"}}>
              <div style={{color:"white",fontSize:19,fontWeight:800}}>Progress</div>
              <div style={{color:"#64748b",fontSize:12,fontFamily:"'Baloo 2'",marginTop:2}}>तुमची प्रगती, {user.name}</div>
            </div>
            <div style={{padding:"0 16px 20px"}}>
              <div style={{background:`linear-gradient(${lvl.grad})`,borderRadius:18,padding:18,marginBottom:14,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.22)"}}/>
                <div style={{position:"relative",display:"flex",gap:13,alignItems:"center"}}>
                  <div style={{width:48,height:48,borderRadius:50,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:"white"}}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{color:"white",fontSize:15,fontWeight:800}}>{user.name}</div>
                    <div style={{color:"rgba(255,255,255,0.6)",fontSize:11}}>{user.email}</div>
                    <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,fontFamily:"'Baloo 2'"}}>{user.industry} • {lvl.label}</div>
                  </div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
                {[["📅","Day",day],["🔥","Streak",streak],["📊","Done",`${prog}%`]].map(([ic,l,v])=>(
                  <div key={l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:13,padding:"13px 8px",textAlign:"center"}}>
                    <div style={{fontSize:17,marginBottom:3}}>{ic}</div>
                    <div style={{color:lvl.accent,fontSize:19,fontWeight:800}}>{v}</div>
                    <div style={{color:"#64748b",fontSize:10,marginTop:2}}>{l}</div>
                  </div>
                ))}
              </div>
              {phases.map(ph=>{
                const done=ph.challenges.filter(ch=>doneC[`p${ph.id}w${ch.w}`]).length;
                const pct=Math.round((done/ph.challenges.length)*100);
                return (
                  <div key={ph.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:13,padding:14,marginBottom:9}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                      <div style={{color:"white",fontWeight:700,fontSize:12}}>{ph.icon} Phase {ph.id}: {ph.title}</div>
                      <div style={{color:lvl.accent,fontWeight:700,fontSize:12}}>{done}/{ph.challenges.length}</div>
                    </div>
                    <div style={{background:"rgba(255,255,255,0.06)",borderRadius:99,height:5}}>
                      <div style={{background:`linear-gradient(90deg,${lvl.color},${lvl.accent})`,height:"100%",borderRadius:99,width:`${pct}%`,transition:"width 0.5s"}}/>
                    </div>
                  </div>
                );
              })}
              <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:13,padding:15,marginBottom:10}}>
                <div style={{color:"white",fontWeight:700,fontSize:12,marginBottom:13}}>⚙️ Adjust Day</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20}}>
                  <button className="tap" onClick={()=>setDay(d=>Math.max(1,d-1))}
                    style={{background:"rgba(255,255,255,0.07)",border:"none",color:"white",width:40,height:40,borderRadius:50,fontSize:18,fontFamily:"'Sora',sans-serif"}}>−</button>
                  <div style={{color:"white",fontSize:22,fontWeight:800,minWidth:70,textAlign:"center"}}>Day {day}</div>
                  <button className="tap" onClick={()=>setDay(d=>Math.min(90,d+1))}
                    style={{background:"rgba(255,255,255,0.07)",border:"none",color:"white",width:40,height:40,borderRadius:50,fontSize:18,fontFamily:"'Sora',sans-serif"}}>+</button>
                </div>
              </div>
              <button className="tap" onClick={logout}
                style={{width:"100%",background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)",color:"#f87171",padding:"13px",borderRadius:13,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Sora',sans-serif",marginBottom:10}}>
                🚪 Logout
              </button>
              <div style={{background:"rgba(16,185,129,0.05)",border:"1px solid rgba(16,185,129,0.14)",borderRadius:13,padding:13}}>
                <div style={{color:"#10b981",fontWeight:700,fontSize:12,marginBottom:3}}>🌍 Open Source</div>
                <div style={{color:"#6ee7b7",fontSize:12,lineHeight:1.7,fontFamily:"'Baloo 2'"}}>मराठी लोकांसाठी मोफत. मित्रांना share करा! Built with ❤️ for Maharashtra 🧡</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(15,23,42,0.97)",backdropFilter:"blur(12px)",borderTop:"1px solid rgba(255,255,255,0.05)",display:"flex",padding:"8px 0 12px",zIndex:100}}>
        {[{id:"home",ic:"🏠",l:"Home"},{id:"phases",ic:"📋",l:"Phases"},{id:"vocab",ic:"📚",l:"Vocab"},{id:"progress",ic:"📊",l:"Me"}].map(t=>(
          <button key={t.id} className="tap" onClick={()=>setTab(t.id)}
            style={{flex:1,background:"none",border:"none",cursor:"pointer",padding:"4px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:2,fontFamily:"'Sora',sans-serif"}}>
            <div style={{fontSize:tab===t.id?21:18,filter:tab!==t.id?"grayscale(60%) opacity(0.4)":"none",transition:"all 0.2s"}}>{t.ic}</div>
            <div style={{fontSize:10,fontWeight:700,color:tab===t.id?lvl.accent:"#334155"}}>{t.l}</div>
          </button>
        ))}
      </div>
      <Analytics />
    </div>
  );

  return null;
}
