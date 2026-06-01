type StepContent = { title: string; description: string }

interface GuideSteps {
  // shared
  menuBtn: StepContent
  helpBtn: StepContent
  backBtn: StepContent
  // lobby-browser
  joinCode: StepContent
  createCard: StepContent
  lobbyList: StepContent
  // lobby-room
  lobbyCode: StepContent
  playerSlots: StepContent
  actionButtons: StepContent
  chat: StepContent
  // game-table
  topBar: StepContent
  settingsBtn: StepContent
  turnIndicator: StepContent
  trumpLed: StepContent
  playerHand: StepContent
}

const en: GuideSteps = {
  menuBtn: {
    title: '☰ Menu — Language & Theme',
    description: "Tap this button to open the menu. Inside you'll find:\n• 🌐 Language selector — switch app language\n• 🌙/☀️ Light / Dark mode toggle\n• 👤 Profile, Settings, Leaderboard",
  },
  helpBtn: {
    title: '? Help Button',
    description: "Tap this button to start a guided tour of the current page. It will highlight and explain each feature, showing you how to use the app.",
  },
  backBtn: {
    title: '← Back Button',
    description: "Tap this button to go back to the landing page. You'll leave the lobby browser and return to the main menu.",
  },
  joinCode: {
    title: '🔑 Join by Code',
    description: "Got a code from a friend? Paste the 6-character lobby code here to join their game directly — even private ones that don't appear in the list.",
  },
  createCard: {
    title: '➕ Create a Lobby',
    description: "Start your own game here. Give it a name, choose how many players (3–5), and decide if it's public or invite-only. You'll become the host.",
  },
  lobbyList: {
    title: '🎮 Available Games',
    description: 'All open public lobbies are listed here. Each card shows the lobby name, host, and current players. Tap any card to join instantly. Lobbies "In Progress" cannot be joined.',
  },
  lobbyCode: {
    title: '📋 Your Lobby Code',
    description: "This 6-character code is your lobby's invite link. Share it with friends so they can join directly — even if the lobby is private.",
  },
  playerSlots: {
    title: '👥 Player Slots',
    description: 'Green bar = ready. Yellow bar = not ready. "You" marks your slot. Dashed empty slots are waiting for more players.',
  },
  actionButtons: {
    title: '🎮 Action Buttons',
    description: '▶ Start Game — host only, activates when all are ready.\n🚪 Leave Lobby — go back to the browser.\n🗑 Delete Lobby — host only, removes the lobby for everyone.\n\nClick Ready in your player slot before the host can start!',
  },
  chat: {
    title: '💬 Chat',
    description: 'Chat with other players while waiting for the game to start. On mobile, tap the 💬 button to open it.',
  },
  topBar: {
    title: '🕹️ Top Bar Overview',
    description: 'The top bar shows your Room ID, connection status, current round (of 13), and whose turn it is. On desktop: use 🔊 for sound and the Quit button to leave. On mobile: tap ≡ (left) to access settings.',
  },
  settingsBtn: {
    title: '≡ Settings (Mobile)',
    description: 'Tap here to open the settings panel.\n• 🔊 Sound control — toggle game sound effects\n• 🌙/☀️ Light / Dark mode — change theme\n• 🌐 Language — switch app language\n• 🚪 Quit Game',
  },
  turnIndicator: {
    title: '▶ Turn Indicator',
    description: "This tells you whose turn it is. When it says \"YOUR TURN\" and glows green — it's your move! There's a time limit, so play before it runs out.",
  },
  trumpLed: {
    title: '🃏 Trump & Led Suit',
    description: 'TRUMP SUIT: the strongest suit — trump cards beat all other cards.\nLED SUIT: the suit played first this trick — you must follow it if you have a matching card.',
  },
  playerHand: {
    title: '✋ Your Hand',
    description: "These are your cards — only you can see them. When it's your turn, click or tap any valid card to play it. You must follow the led suit if possible. The highest card of the led suit wins — unless someone plays a trump!",
  },
}

const hi: GuideSteps = {
  menuBtn: {
    title: '☰ मेनू — भाषा और थीम',
    description: 'यहाँ टैप करें मेनू खोलने के लिए:\n• 🌐 भाषा बदलें\n• 🌙/☀️ लाइट/डार्क मोड टॉगल करें\n• 👤 प्रोफाइल, सेटिंग्स, लीडरबोर्ड',
  },
  helpBtn: {
    title: '? सहायता बटन',
    description: 'इस बटन पर टैप करें वर्तमान पृष्ठ का एक निर्देशित दौरा शुरू करने के लिए। यह प्रत्येक सुविधा को हाइलाइट करेगा और समझाएगा।',
  },
  backBtn: {
    title: '← वापस बटन',
    description: 'इस बटन पर टैप करें लैंडिंग पृष्ठ पर जाने के लिए। आप लॉबी ब्राउजर छोड़ेंगे और मुख्य मेनू में लौट जाएंगे।',
  },
  joinCode: {
    title: '🔑 कोड से जोड़ें',
    description: 'किसी दोस्त ने 6-अक्षर का कोड भेजा? यहाँ डालें और सीधे उनकी लॉबी में जाएं — प्राइवेट लॉबी भी।',
  },
  createCard: {
    title: '➕ लॉबी बनाएं',
    description: 'अपना गेम शुरू करें। नाम दें, खिलाड़ियों की संख्या (3–5) चुनें, और प्राइवेट/पब्लिक तय करें। आप होस्ट बनेंगे।',
  },
  lobbyList: {
    title: '🎮 उपलब्ध गेम्स',
    description: 'सभी खुली लॉबी यहाँ दिखती हैं। किसी कार्ड पर टैप करें और सीधे जोड़ें। "In Progress" वाली लॉबी में नहीं जा सकते।',
  },
  lobbyCode: {
    title: '📋 लॉबी कोड',
    description: 'यह 6-अक्षर का कोड आपकी लॉबी का इनवाइट लिंक है। दोस्तों को शेयर करें — प्राइवेट लॉबी में भी।',
  },
  playerSlots: {
    title: '👥 खिलाड़ी स्लॉट',
    description: 'हरी पट्टी = तैयार। पीली पट्टी = तैयार नहीं। "आप" = आपका स्लॉट। खाली स्लॉट = इंतजार।',
  },
  actionButtons: {
    title: '🎮 एक्शन बटन',
    description: '▶ गेम शुरू — सिर्फ होस्ट, जब सब तैयार हों।\n🚪 लॉबी छोड़ें — वापस ब्राउज़र।\n🗑 लॉबी हटाएं — सिर्फ होस्ट।\n\nगेम शुरू होने से पहले रेडी बटन दबाएं!',
  },
  chat: {
    title: '💬 चैट',
    description: 'गेम शुरू होने तक दूसरे खिलाड़ियों से बात करें। मोबाइल पर 💬 बटन दबाएं।',
  },
  topBar: {
    title: '🕹️ टॉप बार',
    description: 'रूम ID, कनेक्शन, राउंड नंबर, और किसकी बारी है यहाँ दिखता है। डेस्कटॉप पर: 🔊 साउंड, Quit से छोड़ें। मोबाइल पर: ≡ से सेटिंग्स।',
  },
  settingsBtn: {
    title: '≡ सेटिंग्स (मोबाइल)',
    description: 'यहाँ टैप करें:\n• 🔊 साउंड कंट्रोल\n• 🌙/☀️ थीम बदलें\n• 🌐 भाषा बदलें\n• 🚪 गेम छोड़ें',
  },
  turnIndicator: {
    title: '▶ बारी संकेतक',
    description: 'यह बताता है किसकी बारी है। जब "आपकी बारी" लिखे और हरा चमके — आपको चाल चलनी है! समय सीमा है।',
  },
  trumpLed: {
    title: '🃏 ट्रंप और लेड सूट',
    description: 'ट्रंप सूट: सबसे मजबूत सूट — ट्रंप कार्ड सबको हराता है।\nलेड सूट: इस राउंड में पहले चला सूट — आपके पास हो तो यही खेलना होगा।',
  },
  playerHand: {
    title: '✋ आपके पत्ते',
    description: 'ये आपके पत्ते हैं — सिर्फ आप देख सकते हैं। अपनी बारी पर कोई भी वैध पत्ता टैप करें। लेड सूट का पत्ता होने पर वही खेलना होगा। सबसे ऊंचा या ट्रंप जीतता है।',
  },
}

const bn: GuideSteps = {
  menuBtn: { title: '☰ মেনু — ভাষা এবং থিম', description: 'মেনু খুলতে ট্যাপ করুন:\n• 🌐 ভাষা পরিবর্তন করুন\n• 🌙/☀️ লাইট/ডার্ক মোড\n• 👤 প্রোফাইল, সেটিংস, লিডারবোর্ড' },
  helpBtn: { title: '? সাহায্য বোতাম', description: 'এই বোতামে ট্যাপ করুন বর্তমান পৃষ্ঠার একটি নির্দেশিত ট্যুর শুরু করতে। এটি প্রতিটি বৈশিষ্ট্য হাইলাইট এবং ব্যাখ্যা করবে।' },
  backBtn: { title: '← ফিরে যান বোতাম', description: 'এই বোতামে ট্যাপ করুন ল্যান্ডিং পৃষ্ঠায় ফিরতে। আপনি লবি ব্রাউজার ছেড়ে মূল মেনুতে ফিরে আসবেন।' },
  joinCode: { title: '🔑 কোড দিয়ে যোগ দিন', description: 'বন্ধু 6-অক্ষরের কোড পাঠিয়েছে? এখানে লিখুন এবং সরাসরি তাদের লবিতে যান।' },
  createCard: { title: '➕ লবি তৈরি করুন', description: 'নিজের গেম শুরু করুন। নাম দিন, খেলোয়াড় সংখ্যা (3–5) বেছে নিন। আপনি হোস্ট হবেন।' },
  lobbyList: { title: '🎮 পাওয়া যাচ্ছে গেমস', description: 'সব খোলা লবি এখানে দেখায়। যেকোনো কার্ডে ট্যাপ করে যোগ দিন।' },
  lobbyCode: { title: '📋 লবি কোড', description: 'এই 6-অক্ষরের কোড আপনার লবির আমন্ত্রণ লিঙ্ক। বন্ধুদের শেয়ার করুন।' },
  playerSlots: { title: '👥 খেলোয়াড় স্লট', description: 'সবুজ বার = প্রস্তুত। হলুদ বার = প্রস্তুত নয়। "আপনি" = আপনার স্লট।' },
  actionButtons: { title: '🎮 অ্যাকশন বোতাম', description: '▶ গেম শুরু — শুধু হোস্ট।\n🚪 লবি ছাড়ুন।\n🗑 লবি মুছুন — শুধু হোস্ট।\n\nশুরুর আগে রেডি বোতাম চাপুন!' },
  chat: { title: '💬 চ্যাট', description: 'গেম শুরু হওয়ার আগে চ্যাট করুন। মোবাইলে 💬 বোতাম চাপুন।' },
  topBar: { title: '🕹️ টপ বার', description: 'রুম ID, কানেকশন, রাউন্ড এবং কার পালা এখানে দেখায়।' },
  settingsBtn: { title: '≡ সেটিংস (মোবাইল)', description: '• 🔊 সাউন্ড\n• 🌙/☀️ থিম\n• 🌐 ভাষা\n• 🚪 গেম ছাড়ুন' },
  turnIndicator: { title: '▶ পালার সংকেত', description: '"আপনার পালা" এবং সবুজ আলো — এখন চাল দিন! সময়সীমা আছে।' },
  trumpLed: { title: '🃏 ট্রাম্প এবং লেড স্যুট', description: 'ট্রাম্প স্যুট: সবচেয়ে শক্তিশালী।\nলেড স্যুট: প্রথম খেলা স্যুট — থাকলে সেটাই খেলুন।' },
  playerHand: { title: '✋ আপনার তাস', description: 'এগুলো আপনার তাস — শুধু আপনি দেখতে পাবেন। আপনার পালায় যেকোনো বৈধ তাস ট্যাপ করুন।' },
}

const ta: GuideSteps = {
  menuBtn: { title: '☰ மெனு — மொழி மற்றும் தீம்', description: 'மெனு திறக்க இங்கே தொட்டுவிடுங்கள்:\n• 🌐 மொழி மாற்று\n• 🌙/☀️ லைட்/டார்க் மோட்\n• 👤 புரோபைல், அமைப்புகள்' },
  helpBtn: { title: '? உதவி பொத்தாணு', description: 'இந்த பொத்தாணை தொட்டு தற்போதைய பக்கத்தின் வழிகாட்டப்பட்ட சுற்றுலா தொடங்கவும். இது ஒவ்வொரு வசதியையும் எடுத்துக்காட்டி விளக்கும்.' },
  backBtn: { title: '← திரும்ப பொத்தாணு', description: 'இந்த பொத்தாணை தொட்டு முகப்புப் பக்கத்திற்குத் திரும்பவும். நீங்கள் லாபி உலாவலியை விட்டுவிட்டு முதன்மை மெனுவிற்குத் திரும்புவீர்கள்.' },
  joinCode: { title: '🔑 குறியீட்டால் சேரு', description: 'நண்பர் 6-எழுத்து குறியீடு அனுப்பினாரா? இங்கே உள்ளிட்டு நேரடியாக சேருங்கள்.' },
  createCard: { title: '➕ லாபி உருவாக்கு', description: 'உங்கள் சொந்த கேம் தொடங்குங்கள். பெயர் கொடுங்கள், வீரர்கள் (3–5) தேர்வு செய்யுங்கள். நீங்கள் ஹோஸ்ட் ஆவீர்கள்.' },
  lobbyList: { title: '🎮 கிடைக்கும் கேம்கள்', description: 'அனைத்து திறந்த லாபிகளும் இங்கே காட்டப்படும். எந்த கார்டையும் தொட்டு உடனே சேருங்கள்.' },
  lobbyCode: { title: '📋 லாபி குறியீடு', description: 'இந்த 6-எழுத்து குறியீடு உங்கள் லாபியின் அழைப்பு இணைப்பு. நண்பர்களுக்கு பகிருங்கள்.' },
  playerSlots: { title: '👥 வீரர் இடங்கள்', description: 'பச்சை பட்டை = தயார். மஞ்சள் பட்டை = தயாரில்லை. "நீங்கள்" = உங்கள் இடம்.' },
  actionButtons: { title: '🎮 செயல் பொத்தான்கள்', description: '▶ கேம் தொடங்கு — ஹோஸ்ட் மட்டும்.\n🚪 லாபி விட்டு வெளியேறு.\n🗑 லாபி நீக்கு — ஹோஸ்ட் மட்டும்.' },
  chat: { title: '💬 அரட்டை', description: 'கேம் தொடங்கும் வரை பேசுங்கள். மொபைலில் 💬 பொத்தான் அழுத்துங்கள்.' },
  topBar: { title: '🕹️ மேல் பட்டை', description: 'ரூம் ID, இணைப்பு, சுற்று எண், யாரின் முறை என்று காட்டும்.' },
  settingsBtn: { title: '≡ அமைப்புகள் (மொபைல்)', description: '• 🔊 ஒலி\n• 🌙/☀️ தீம்\n• 🌐 மொழி\n• 🚪 கேமை விட்டு வெளியேறு' },
  turnIndicator: { title: '▶ முறை காட்டி', description: '"உங்கள் முறை" மற்றும் பச்சை ஒளி — இப்போது சீட்டு போடுங்கள்! நேர வரம்பு உள்ளது.' },
  trumpLed: { title: '🃏 ட்ரம்ப் & லெட் சூட்', description: 'ட்ரம்ப் சூட்: மிகவும் வலிமையான சூட்.\nலெட் சூட்: முதலில் போட்ட சூட் — இருந்தால் அதையே போடவும்.' },
  playerHand: { title: '✋ உங்கள் சீட்டுகள்', description: 'இவை உங்கள் சீட்டுகள் — நீங்கள் மட்டுமே பார்க்கலாம். உங்கள் முறையில் சரியான சீட்டை தொடுங்கள்.' },
}

const te: GuideSteps = {
  menuBtn: { title: '☰ మెనూ — భాష మరియు థీమ్', description: 'మెనూ తెరవడానికి నొక్కండి:\n• 🌐 భాష మార్చండి\n• 🌙/☀️ లైట్/డార్క్ మోడ్\n• 👤 ప్రొఫైల్, సెట్టింగ్స్' },
  helpBtn: { title: '? సహాయ బటన్', description: 'ఈ బటన్‌ను నొక్కి ప్రస్తుత పేజీ యొక్క గైడెడ్ ట్యూర్ ప్రారంభించండి. ఇది ప్రతిটి ఫీచర్‌ను హైలైట్ చేసి వివరిస్తుంది.' },
  backBtn: { title: '← వెనుకకు బటన్', description: 'ఈ బటన్‌ను నొక్కి ల్యాండింగ్ పేజీకి తిరిగి వెళ్లండి. మీరు లాబీ బ్రౌజర్‌ను విడిచిపెట్టి ప్రధాన మెనువుకు తిరిగి వస్తారు.' },
  joinCode: { title: '🔑 కోడ్‌తో చేరండి', description: 'స్నేహితుడు 6-అక్షరాల కోడ్ పంపారా? ఇక్కడ నమోదు చేసి నేరుగా చేరండి.' },
  createCard: { title: '➕ లాబీ సృష్టించు', description: 'మీ సొంత గేమ్ ప్రారంభించండి. పేరు ఇవ్వండి, ఆటగాళ్ళ సంఖ్య (3–5) ఎంచుకోండి.' },
  lobbyList: { title: '🎮 అందుబాటులో ఉన్న గేమ్‌లు', description: 'అన్ని తెరిచిన లాబీలు ఇక్కడ చూపిస్తాయి. ఏ కార్డ్ నొక్కినా చేరవచ్చు.' },
  lobbyCode: { title: '📋 లాబీ కోడ్', description: 'ఈ 6-అక్షరాల కోడ్ మీ లాబీ ఆహ్వానం. స్నేహితులకు పంపండి.' },
  playerSlots: { title: '👥 ఆటగాళ్ళ స్లాట్‌లు', description: 'ఆకుపచ్చ పట్టీ = సిద్ధంగా ఉన్నారు. పసుపు పట్టీ = సిద్ధంగా లేరు.' },
  actionButtons: { title: '🎮 యాక్షన్ బటన్‌లు', description: '▶ గేమ్ ప్రారంభించు — హోస్ట్ మాత్రమే.\n🚪 లాబీ వదలు.\n🗑 లాబీ తొలగించు — హోస్ట్ మాత్రమే.' },
  chat: { title: '💬 చాట్', description: 'గేమ్ ప్రారంభమయ్యే వరకు మాట్లాడండి. మొబైల్‌లో 💬 నొక్కండి.' },
  topBar: { title: '🕹️ టాప్ బార్', description: 'రూమ్ ID, కనెక్షన్, రౌండ్ నంబర్, ఎవరి వంతు అని చూపిస్తుంది.' },
  settingsBtn: { title: '≡ సెట్టింగ్స్ (మొబైల్)', description: '• 🔊 సౌండ్\n• 🌙/☀️ థీమ్\n• 🌐 భాష\n• 🚪 గేమ్ వదలు' },
  turnIndicator: { title: '▶ వంతు సూచిక', description: '"మీ వంతు" మరియు ఆకుపచ్చ మెరుపు — ఇప్పుడు ఆడండి! సమయ పరిమితి ఉంది.' },
  trumpLed: { title: '🃏 ట్రంప్ & లెడ్ సూట్', description: 'ట్రంప్ సూట్: అత్యంత శక్తివంతమైన సూట్.\nలెడ్ సూట్: మొదట ఆడిన సూట్ — ఉంటే అదే ఆడాలి.' },
  playerHand: { title: '✋ మీ పేకలు', description: 'ఇవి మీ పేకలు — మీరు మాత్రమే చూడగలరు. మీ వంతులో చెల్లుబడి అయ్యే పేకను నొక్కండి.' },
}

const ml: GuideSteps = {
  menuBtn: { title: '☰ മെനു — ഭാഷ & തീം', description: 'മെനു തുറക്കാൻ ടാപ്പ് ചെയ്യുക:\n• 🌐 ഭാഷ മാറ്റുക\n• 🌙/☀️ ലൈറ്റ്/ഡാർക്ക് മോഡ്\n• 👤 പ്രൊഫൈൽ, ക്രമീകരണങ്ങൾ' },
  helpBtn: { title: '? സഹായ ബട്ടൺ', description: 'ഈ ബട്ടണിൽ ടാപ്പ് ചെയ്ത് നിലവിലെ പേജിന്റെ ഗൈഡഡ് ടൂർ ആരംഭിക്കുക. ഇത് ഓരോ ഫീച്ചർ ഹൈലൈറ്റ് ചെയ്ത് വിശദീകരിക്കും.' },
  backBtn: { title: '← വെണ്ടാൻ ബട്ടൺ', description: 'ഈ ബട്ടണിൽ ടാപ്പ് ചെയ്ത് ലാൻഡിംഗ് പേജിൽ തിരിച്ചുപോകുക. നിങ്ങൾ ലോബി ബ്രൗസർ വിട്ടുകൊണ്ട് പ്രധാന മെനുവിലേക്ക് മടങ്ങും.' },
  joinCode: { title: '🔑 കോഡ് ഉപയോഗിച്ച് ചേരുക', description: 'സുഹൃത്ത് 6-അക്ഷര കോഡ് അയച്ചോ? ഇവിടെ നൽകി നേരിട്ട് ചേരുക.' },
  createCard: { title: '➕ ലോബി ഉണ്ടാക്കുക', description: 'സ്വന്തം ഗെയിം ആരംഭിക്കുക. പേര്, കളിക്കാർ (3–5) തിരഞ്ഞെടുക്കുക. നിങ്ങൾ ഹോസ്റ്റ് ആകും.' },
  lobbyList: { title: '🎮 ലഭ്യമായ ഗെയിമുകൾ', description: 'തുറന്ന ലോബികൾ ഇവിടെ കാണാം. ഏത് കാർഡും ടാപ്പ് ചെയ്ത് ചേരാം.' },
  lobbyCode: { title: '📋 ലോബി കോഡ്', description: 'ഈ 6-അക്ഷര കോഡ് നിങ്ങളുടെ ലോബിയുടെ ക്ഷണ ലിങ്ക്. സുഹൃത്തുക്കളുമായി പങ്കിടുക.' },
  playerSlots: { title: '👥 കളിക്കാർ സ്ലോട്ടുകൾ', description: 'പച്ച ബാർ = തയ്യാർ. മഞ്ഞ ബാർ = തയ്യാറല്ല. "നിങ്ങൾ" = നിങ്ങളുടെ സ്ലോട്ട്.' },
  actionButtons: { title: '🎮 ആക്ഷൻ ബട്ടണുകൾ', description: '▶ ഗെയിം തുടങ്ങുക — ഹോസ്റ്റ് മാത്രം.\n🚪 ലോബി വിടുക.\n🗑 ലോബി ഇല്ലാതാക്കുക — ഹോസ്റ്റ് മാത്രം.' },
  chat: { title: '💬 ചാറ്റ്', description: 'ഗെയിം ആരംഭിക്കുന്നതുവരെ സംസാരിക്കുക. മൊബൈലിൽ 💬 ടാപ്പ് ചെയ്യുക.' },
  topBar: { title: '🕹️ ടോപ്പ് ബാർ', description: 'റൂം ID, കണക്ഷൻ, റൗണ്ട്, ആരുടെ ഊഴം എന്ന് ഇവിടെ കാണാം.' },
  settingsBtn: { title: '≡ ക്രമീകരണങ്ങൾ (മൊബൈൽ)', description: '• 🔊 ശബ്ദം\n• 🌙/☀️ തീം\n• 🌐 ഭാഷ\n• 🚪 ഗെയിം വിടുക' },
  turnIndicator: { title: '▶ ഊഴം സൂചിക', description: '"നിങ്ങളുടെ ഊഴം" & പച്ച തിളക്കം — ഇപ്പോൾ കളിക്കുക! സമയ പരിധിയുണ്ട്.' },
  trumpLed: { title: '🃏 ട്രംപ് & ലെഡ് സൂട്ട്', description: 'ട്രംപ് സൂട്ട്: ഏറ്റവും ശക്തമായ സൂട്ട്.\nലെഡ് സൂട്ട്: ആദ്യം കളിച്ച സൂട്ട് — ഉണ്ടെങ്കിൽ അത് കളിക്കണം.' },
  playerHand: { title: '✋ നിങ്ങളുടെ കാർഡുകൾ', description: 'ഇവ നിങ്ങളുടെ കാർഡുകൾ — നിങ്ങൾക്ക് മാത്രം കാണാം. ഊഴത്തിൽ ഏത് കാർഡും ടാപ്പ് ചെയ്യുക.' },
}

const kn: GuideSteps = {
  menuBtn: { title: '☰ ಮೆನು — ಭಾಷೆ & ಥೀಮ್', description: 'ಮೆನು ತೆರೆಯಲು ಟ್ಯಾಪ್ ಮಾಡಿ:\n• 🌐 ಭಾಷೆ ಬದಲಿಸಿ\n• 🌙/☀️ ಲೈಟ್/ಡಾರ್ಕ್ ಮೋಡ್\n• 👤 ಪ್ರೊಫೈಲ್, ಸೆಟ್ಟಿಂಗ್ಸ್' },
  helpBtn: { title: '? ಸಹಾಯ ಬಟನ್', description: 'ಈ ಬಟನ್‌ನಲ್ಲಿ ಟ್ಯಾಪ್ ಮಾಡಿ ಪ್ರಸ್ತುತ ಪುಟದ ಗೈಡೆಡ್ ಟೂರ್ ಪ್ರಾರಂಭಿಸಲು. ಇದು ಪ್ರತಿಯೊಂದು ಫೀಚರ್ ಹೈಲೈಟ್ ಮಾಡಿ ವಿವರಿಸುತ್ತದೆ.' },
  backBtn: { title: '← ಹಿಂದಕ್ಕೆ ಬಟನ್', description: 'ಈ ಬಟನ್‌ನಲ್ಲಿ ಟ್ಯಾಪ್ ಮಾಡಿ ಲ್ಯಾಂಡಿಂಗ್ ಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಲು. ನೀವು ಲಾಬಿ ಬ್ರೌಜರ್ ಅನ್ನು ತೊರೆದು ಪ್ರಧಾನ ಮೆನುವಿಗೆ ಹಿಂತಿರುಗುತ್ತೀರಿ.' },
  joinCode: { title: '🔑 ಕೋಡ್‌ನಿಂದ ಸೇರಿ', description: 'ಸ್ನೇಹಿತ 6-ಅಕ್ಷರ ಕೋಡ್ ಕಳಿಸಿದ್ದಾರೆಯೇ? ಇಲ್ಲಿ ನಮೂದಿಸಿ ನೇರವಾಗಿ ಸೇರಿ.' },
  createCard: { title: '➕ ಲಾಬಿ ರಚಿಸಿ', description: 'ನಿಮ್ಮ ಗೇಮ್ ಪ್ರಾರಂಭಿಸಿ. ಹೆಸರು, ಆಟಗಾರರ ಸಂಖ್ಯೆ (3–5) ಆಯ್ಕೆ ಮಾಡಿ.' },
  lobbyList: { title: '🎮 ಲಭ್ಯವಿರುವ ಗೇಮ್‌ಗಳು', description: 'ತೆರೆದ ಲಾಬಿಗಳೆಲ್ಲಾ ಇಲ್ಲಿ ತೋರಿಸುತ್ತವೆ. ಯಾವ ಕಾರ್ಡ್ ಟ್ಯಾಪ್ ಮಾಡಿದರೂ ಸೇರಬಹುದು.' },
  lobbyCode: { title: '📋 ಲಾಬಿ ಕೋಡ್', description: 'ಈ 6-ಅಕ್ಷರ ಕೋಡ್ ನಿಮ್ಮ ಲಾಬಿಯ ಆಮಂತ್ರಣ ಲಿಂಕ್. ಸ್ನೇಹಿತರಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ.' },
  playerSlots: { title: '👥 ಆಟಗಾರರ ಸ್ಲಾಟ್‌ಗಳು', description: 'ಹಸಿರು ಪಟ್ಟಿ = ಸಿದ್ಧ. ಹಳದಿ ಪಟ್ಟಿ = ಸಿದ್ಧವಿಲ್ಲ. "ನೀವು" = ನಿಮ್ಮ ಸ್ಲಾಟ್.' },
  actionButtons: { title: '🎮 ಆಕ್ಷನ್ ಬಟನ್‌ಗಳು', description: '▶ ಗೇಮ್ ಪ್ರಾರಂಭಿಸು — ಹೋಸ್ಟ್ ಮಾತ್ರ.\n🚪 ಲಾಬಿ ಬಿಡು.\n🗑 ಲಾಬಿ ಅಳಿಸು — ಹೋಸ್ಟ್ ಮಾತ್ರ.' },
  chat: { title: '💬 ಚಾಟ್', description: 'ಗೇಮ್ ಪ್ರಾರಂಭವಾಗುವವರೆಗೆ ಮಾತನಾಡಿ. ಮೊಬೈಲ್‌ನಲ್ಲಿ 💬 ಟ್ಯಾಪ್ ಮಾಡಿ.' },
  topBar: { title: '🕹️ ಟಾಪ್ ಬಾರ್', description: 'ರೂಮ್ ID, ಸಂಪರ್ಕ, ರೌಂಡ್, ಯಾರ ಸರದಿ ಎಂದು ಇಲ್ಲಿ ತೋರಿಸುತ್ತದೆ.' },
  settingsBtn: { title: '≡ ಸೆಟ್ಟಿಂಗ್ಸ್ (ಮೊಬೈಲ್)', description: '• 🔊 ಧ್ವನಿ\n• 🌙/☀️ ಥೀಮ್\n• 🌐 ಭಾಷೆ\n• 🚪 ಗೇಮ್ ಬಿಡು' },
  turnIndicator: { title: '▶ ಸರದಿ ಸೂಚಕ', description: '"ನಿಮ್ಮ ಸರದಿ" ಮತ್ತು ಹಸಿರು ಮಿನುಗು — ಈಗ ಆಡಿ! ಸಮಯ ಮಿತಿ ಇದೆ.' },
  trumpLed: { title: '🃏 ಟ್ರಂಪ್ & ಲೆಡ್ ಸೂಟ್', description: 'ಟ್ರಂಪ್ ಸೂಟ್: ಅತ್ಯಂತ ಶಕ್ತಿಶಾಲಿ ಸೂಟ್.\nಲೆಡ್ ಸೂಟ್: ಮೊದಲು ಆಡಿದ ಸೂಟ್ — ಇದ್ದರೆ ಅದನ್ನೇ ಆಡಬೇಕು.' },
  playerHand: { title: '✋ ನಿಮ್ಮ ಎಲೆಗಳು', description: 'ಇವು ನಿಮ್ಮ ಎಲೆಗಳು — ನೀವು ಮಾತ್ರ ನೋಡಬಹುದು. ಸರದಿಯಲ್ಲಿ ಯಾವ ಎಲೆಯನ್ನಾದರೂ ಟ್ಯಾಪ್ ಮಾಡಿ.' },
}

const bho: GuideSteps = {
  menuBtn: { title: '☰ मेनू — भाषा अउर थीम', description: 'मेनू खोले खातिर ई दबाईं:\n• 🌐 भाषा बदलीं\n• 🌙/☀️ लाइट/डार्क मोड\n• 👤 प्रोफाइल, सेटिंग्स' },
  helpBtn: { title: '? सहायता बटन', description: 'ई बटन दबाईं के वर्तमान पेज के एगो निर्देशित भ्रमण सुरू करीं। ई हर एगो सुविधा के हाइलाइट करके समझावेगा।' },
  backBtn: { title: '← वापस बटन', description: 'ई बटन दबाईं के लैंडिंग पेज पर जाईं। आप लॉबी ब्राउजर छोड़के मुख्य मेनु में लौट जाईब।' },
  joinCode: { title: '🔑 कोड से जुड़ीं', description: 'कोनो दोस्त 6-अक्षर के कोड भेजलस? इहाँ डालीं आ सीधे उनकर लॉबी में जाईं।' },
  createCard: { title: '➕ लॉबी बनाईं', description: 'आपन गेम सुरू करीं। नाम, खेलाड़ी (3–5) चुनीं। रउवाँ होस्ट बनब।' },
  lobbyList: { title: '🎮 उपलब्ध गेम्स', description: 'सभ खुलल लॉबी इहाँ देखाई। कवनो कार्ड पर टैप करीं आ जुड़ जाईं।' },
  lobbyCode: { title: '📋 लॉबी कोड', description: 'ई 6-अक्षर के कोड रउवाँ के लॉबी के दावत लिंक बा। दोस्तन के शेयर करीं।' },
  playerSlots: { title: '👥 खेलाड़ी स्लॉट', description: 'हरियर पट्टी = तैयार। पियर पट्टी = तैयार नइखे। "रउवाँ" = आपन स्लॉट।' },
  actionButtons: { title: '🎮 एक्शन बटन', description: '▶ गेम सुरू करीं — सिर्फ होस्ट।\n🚪 लॉबी छोड़ीं।\n🗑 लॉबी मेटाईं — सिर्फ होस्ट।' },
  chat: { title: '💬 चैट', description: 'गेम सुरू होखे के पहिले बात करीं। मोबाइल पर 💬 दबाईं।' },
  topBar: { title: '🕹️ टॉप बार', description: 'रूम ID, कनेक्शन, राउंड, आ केकर बारी बा — ई सब इहाँ देखाई।' },
  settingsBtn: { title: '≡ सेटिंग्स (मोबाइल)', description: '• 🔊 आवाज\n• 🌙/☀️ थीम\n• 🌐 भाषा\n• 🚪 गेम छोड़ीं' },
  turnIndicator: { title: '▶ बारी संकेत', description: '"रउवाँ के बारी" आ हरियर चमक — अब चाल चलीं! समय सीमा बा।' },
  trumpLed: { title: '🃏 ट्रंप आ लेड सूट', description: 'ट्रंप सूट: सबसे ताकतवर सूट।\nलेड सूट: पहिले चलल सूट — होखे त ओही खेलल जाई।' },
  playerHand: { title: '✋ रउवाँ के पत्ता', description: 'ई रउवाँ के पत्ता बा — सिर्फ रउवाँ देख सकत बानी। आपन बारी में कवनो सही पत्ता टैप करीं।' },
}

const GUIDE_TRANSLATIONS: Record<string, GuideSteps> = { en, hi, bn, ta, te, ml, kn, bho }

export function getGuideSteps(language: string): GuideSteps {
  return GUIDE_TRANSLATIONS[language] ?? en
}
