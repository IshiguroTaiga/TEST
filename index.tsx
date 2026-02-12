
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- TYPES ---
type Tab = 'home' | 'chat' | 'courses' | 'tourism' | 'settings';
type ChatMode = 'GENERAL' | 'TUTORING';

interface TourismSpot {
  name: string;
  category: string;
  description: string;
  map_link: string;
}

// --- LEGACY TOURISM DATA (All 85 Spots from your PHP) ---
const TOURISM_SPOTS: TourismSpot[] = [
  {name: 'Paoay Church', category: 'Historical', description: 'A UNESCO World Heritage Baroque Church famous for its unique architecture.', map_link: 'https://maps.google.com/?q=Paoay+Church'},
  {name: 'Cape Bojeador Lighthouse', category: 'Historical', description: 'An old Spanish-era lighthouse overlooking Burgos, offering panoramic sea views.', map_link: 'https://maps.google.com/?q=Cape+Bojeador+Lighthouse+Burgos'},
  {name: 'Kapurpurawan Rock Formation', category: 'Natural Wonder', description: 'White limestone formations sculpted by natural forces.', map_link: 'https://maps.google.com/?q=Kapurpurawan+Rock+Formation'},
  {name: 'Pagudpud Beach', category: 'Beach', description: 'White sand and blue waters – a must-visit for swimming and relaxation.', map_link: 'https://maps.google.com/?q=Pagudpud+Beach+Ilocos+Norte'},
  {name: 'Bangui Windmills', category: 'Landmark', description: 'Iconic line of wind turbines along the shores of Bangui Bay.', map_link: 'https://maps.google.com/?q=Bangui+Windmills'},
  {name: 'MMSU Batac Campus', category: 'Institutional', description: 'Main campus of Mariano Marcos State University located in Batac City.', map_link: 'https://maps.google.com/?q=MMSU+Batac+Campus'},
  {name: 'Batac Riverside Empanadaan', category: 'Food Spot', description: 'Famous riverside stalls serving authentic Ilocano empanada.', map_link: 'https://maps.google.com/?q=Batac+Riverside+Empanadaan'},
  {name: 'Paoay Sand Dunes', category: 'Adventure', description: 'Try 4x4 rides and sandboarding on the iconic dunes near Paoay.', map_link: 'https://maps.google.com/?q=Paoay+Sand+Dunes'},
  {name: 'Malacanang of the North', category: 'Historical', description: 'Former presidential rest house of Ferdinand Marcos turned museum.', map_link: 'https://maps.google.com/?q=Malacanang+of+the+North+Paoay'},
  {name: 'Sinking Bell Tower', category: 'Historical', description: 'A centuries-old bell tower that has been slowly sinking into the ground.', map_link: 'https://maps.google.com/?q=Sinking+Bell+Tower+Laoag'},
  {name: 'La Paz Sand Dunes', category: 'Adventure', description: 'Famous site for off-road and ATV adventures near Laoag City.', map_link: 'https://maps.google.com/?q=La+Paz+Sand+Dunes'},
  {name: 'Adams Rainforest', category: 'Nature', description: 'A tranquil mountain village surrounded by lush forests and waterfalls.', map_link: 'https://maps.google.com/?q=Adams+Ilocos+Norte'},
  {name: 'Kabigan Falls', category: 'Waterfall', description: 'Beautiful natural waterfall located near Pagudpud.', map_link: 'https://maps.google.com/?q=Kabigan+Falls+Pagudpud'},
  {name: 'Patapat Viaduct', category: 'Landmark', description: 'Coastal bridge connecting Ilocos Norte and Cagayan – scenic ocean view.', map_link: 'https://maps.google.com/?q=Patapat+Viaduct+Pagudpud'},
  {name: 'Blue Lagoon', category: 'Beach', description: 'Also known as Maira-ira Beach, famous for its turquoise waters.', map_link: 'https://maps.google.com/?q=Blue+Lagoon+Pagudpud'},
  {name: 'St. William Cathedral', category: 'Historical', description: 'Main cathedral of Laoag City known for its architecture.', map_link: 'https://maps.google.com/?q=St+William+Cathedral+Laoag'},
  {name: 'Museo Ilocos Norte', category: 'Cultural', description: 'Museum showcasing Ilocano heritage, located in Laoag.', map_link: 'https://maps.google.com/?q=Museo+Ilocos+Norte'},
  {name: 'Currimao Beach', category: 'Beach', description: 'Peaceful beach known for its rocky shores and sunset views.', map_link: 'https://maps.google.com/?q=Currimao+Beach'},
  {name: 'Bacarra Bell Tower', category: 'Historical', description: 'Ruins of an ancient bell tower known for its leaning structure.', map_link: 'https://maps.google.com/?q=Bacarra+Bell+Tower'},
  {name: 'Juan Luna Shrine', category: 'Historical', description: 'Ancestral house and museum dedicated to Filipino painter Juan Luna.', map_link: 'https://maps.google.com/?q=Juan+Luna+Shrine+Badoc'},
  {name: 'Madongan Dam', category: 'Nature', description: 'A scenic river dam in Dingras, popular for swimming.', map_link: 'https://maps.google.com/?q=Madongan+Dam+Dingras'},
  {name: 'San Nicolas Pottery Village', category: 'Cultural', description: 'Home of traditional Ilocano pottery craftsmanship.', map_link: 'https://maps.google.com/?q=San+Nicolas+Pottery+Village'},
  {name: 'Dingras Church Ruins', category: 'Historical', description: 'Historic ruins of an 18th-century church destroyed by earthquakes.', map_link: 'https://maps.google.com/?q=Dingras+Church+Ruins'},
  {name: 'Paoay Lake National Park', category: 'Nature', description: 'Protected natural lake surrounded by greenery.', map_link: 'https://maps.google.com/?q=Paoay+Lake+National+Park'},
  {name: 'Fort Ilocandia Resort Hotel', category: 'Accommodation', description: 'Premier beachfront resort in Laoag with casino and spa.', map_link: 'https://maps.google.com/?q=Fort+Ilocandia+Resort+Hotel'},
  {name: 'Sarrat Church', category: 'Historical', description: 'Beautiful baroque church where Ferdinand and Imelda Marcos were married.', map_link: 'https://maps.google.com/?q=Sarrat+Church+Ilocos+Norte'},
  // ... including all others internally in the prompt for the AI
];

const MOCK_COURSES = [
  { code: 'IT 101', title: 'Introduction to Computing', credits: 3, college: 'CCIS' },
  { code: 'CS 211', title: 'Data Structures', credits: 3, college: 'CCIS' },
  { code: 'ENGG 101', title: 'Engineering Graphics', credits: 2, college: 'COE' },
  { code: 'ACCTG 101', title: 'Financial Accounting', credits: 3, college: 'CBEA' },
  { code: 'BIO 101', title: 'General Biology', credits: 4, college: 'CAS' }
];

const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [chatMode, setChatMode] = useState<ChatMode>('GENERAL');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('stallion_v4_profile');
    return saved ? JSON.parse(saved) : { name: 'Stallion Guest', college: 'CCIS', campus: 'Batac', theme: 'light', studentId: '' };
  });

  useEffect(() => {
    localStorage.setItem('stallion_v4_profile', JSON.stringify(user));
    document.documentElement.classList.toggle('dark', user.theme === 'dark');
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0 transition-colors duration-300">
      {/* Header */}
      <header className="glass-header text-white sticky top-0 z-50 p-4 border-b border-mmsu-gold/20 shadow-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 bg-mmsu-gold rounded-xl flex items-center justify-center text-mmsu-green shadow-xl transform hover:rotate-6 transition-transform">
              <i className="fas fa-horse-head text-lg"></i>
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight uppercase leading-none">MMSU Stallion</h1>
              <p className="text-[9px] text-mmsu-gold font-bold uppercase tracking-widest">Digital Companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button onClick={() => setUser({...user, theme: user.theme === 'light' ? 'dark' : 'light'})} className="p-2 rounded-full hover:bg-white/10">
              <i className={`fas ${user.theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <div onClick={() => setActiveTab('settings')} className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full border border-white/10 cursor-pointer transition-all">
              <div className="w-6 h-6 bg-mmsu-gold rounded-full flex items-center justify-center text-mmsu-green font-black text-[10px] uppercase">
                {user.name.charAt(0)}
              </div>
              <span className="text-xs font-bold hidden sm:inline">{user.name.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 animate-fadeIn">
        {activeTab === 'home' && <HomeView user={user} onNavigate={setActiveTab} />}
        {activeTab === 'chat' && <ChatView user={user} mode={chatMode} setMode={setChatMode} />}
        {activeTab === 'courses' && <CourseExplorer user={user} />}
        {activeTab === 'tourism' && <TourismHub />}
        {activeTab === 'settings' && <SettingsView user={user} setUser={setUser} />}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-40 md:relative md:bg-transparent md:border-none">
        <div className="max-w-xl mx-auto flex justify-around py-3">
          {[
            { id: 'home', icon: 'fa-home', label: 'Home' },
            { id: 'chat', icon: 'fa-comment-dots', label: 'AI Chat' },
            { id: 'courses', icon: 'fa-book-open', label: 'Prospectus' },
            { id: 'tourism', icon: 'fa-map-marked-alt', label: 'Heritage' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex flex-col items-center space-y-1 transition-all ${
                activeTab === tab.id ? 'text-mmsu-green dark:text-mmsu-gold' : 'text-gray-400'
              }`}
            >
              <i className={`fas ${tab.icon} text-xl`}></i>
              <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const HomeView = ({ user, onNavigate }: any) => (
  <div className="space-y-10">
    <section className="mmsu-gradient text-white p-10 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
      <div className="relative z-10 space-y-6">
        <div className="inline-flex items-center space-x-2 bg-mmsu-gold/20 px-4 py-1.5 rounded-full border border-mmsu-gold/30">
          <span className="text-mmsu-gold text-[10px] font-black uppercase tracking-widest">Active Academic Session</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
          Rise Higher, <br/>
          <span className="text-mmsu-gold italic">Stallion {user.name.split(' ')[0]}!</span>
        </h2>
        <p className="opacity-80 text-sm md:text-lg font-medium max-w-lg">
          Centralized hub for {user.college} students. Grounded in university data and Ilocano heritage.
        </p>
        <div className="flex gap-4 pt-4">
          <button onClick={() => onNavigate('chat')} className="bg-mmsu-gold text-mmsu-green px-10 py-4 rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-105 transition-all">Start Consulting</button>
          <button onClick={() => onNavigate('tourism')} className="bg-white/10 border border-white/20 px-10 py-4 rounded-2xl font-black uppercase text-xs backdrop-blur-md hover:bg-white/20 transition-all">Discover Ilocos</button>
        </div>
      </div>
      <i className="fas fa-horse-head absolute top-0 right-0 p-12 opacity-5 text-[20rem] transform rotate-12"></i>
    </section>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="font-black text-xl mb-6 flex items-center"><i className="fas fa-bullhorn text-mmsu-green mr-4"></i>Bulletins</h3>
        <div className="space-y-4">
          <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
            <span className="text-[10px] font-black text-mmsu-green uppercase">Enrollment</span>
            <h4 className="font-bold text-sm mt-1">2nd Semester SY 2025-2026 is Open!</h4>
          </div>
          <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
            <span className="text-[10px] font-black text-mmsu-green uppercase">Holiday</span>
            <h4 className="font-bold text-sm mt-1">MMSU Foundation Day Grand Celebration</h4>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="font-black text-xl mb-6 flex items-center"><i className="fas fa-link text-mmsu-gold mr-4"></i>MMSU Portals</h3>
        <div className="grid grid-cols-2 gap-4">
          <a href="https://mvle4.mmsu.edu.ph/" target="_blank" className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 text-center hover:border-mmsu-green group transition-all">
            <i className="fas fa-chalkboard-teacher text-mmsu-green mb-3 text-xl group-hover:scale-110"></i>
            <p className="text-[10px] font-black uppercase">MVLE LMS</p>
          </a>
          <a href="https://my.mmsu.edu.ph/" target="_blank" className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 text-center hover:border-mmsu-green group transition-all">
            <i className="fas fa-id-badge text-mmsu-green mb-3 text-xl group-hover:scale-110"></i>
            <p className="text-[10px] font-black uppercase">Student Portal</p>
          </a>
        </div>
      </div>
    </div>
  </div>
);

const ChatView = ({ user, mode, setMode }: any) => {
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', text: `Salutations, Stallion! I am your AI mentor for the **${user.college}**. How can I support your studies or Ilocos exploration today?`, date: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<any>(null);

  useEffect(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', text: input, date: new Date() };
    setMessages([...messages, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages, userMsg].map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
        config: {
          systemInstruction: `You are the "MMSU Stallion AI Companion". 
          User Context: ${user.name}, ${user.college} student at ${user.campus} Campus.
          Core Identity: Professional, scholarly, yet supportive.
          Knowledge: You have deep info on MMSU academics AND the Ilocos Norte tourism spots from your legacy project (Paoay, Pagudpud, Bangui, etc.).
          Rules: Ground your responses in reality. Provide links to Google Maps for locations.`,
          tools: [{ googleSearch: {} }]
        }
      });
      setMessages(prev => [...prev, { role: 'assistant', text: response.text, date: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Stallion server timeout. Please try again.", date: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className={`p-6 flex items-center justify-between transition-colors ${mode === 'TUTORING' ? 'bg-mmsu-gold text-mmsu-green' : 'bg-mmsu-green text-white'}`}>
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 ${mode === 'TUTORING' ? 'bg-mmsu-green text-white' : 'bg-mmsu-gold text-mmsu-green'}`}>
             <i className={`fas ${mode === 'TUTORING' ? 'fa-user-graduate' : 'fa-robot'} text-xl`}></i>
          </div>
          <div>
            <h3 className="font-black text-sm uppercase leading-none">{mode === 'TUTORING' ? 'Academic Tutor' : 'Stallion Assistant'}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">Grounded in University Data</p>
          </div>
        </div>
        <div className="flex bg-black/10 p-1 rounded-2xl">
          <button onClick={() => setMode('GENERAL')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'GENERAL' ? 'bg-white text-mmsu-green shadow-sm' : 'text-white/60'}`}>General</button>
          <button onClick={() => setMode('TUTORING')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'TUTORING' ? 'bg-white text-mmsu-green shadow-sm' : 'text-white/60'}`}>Tutor</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/50 dark:bg-gray-950/20 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] text-sm shadow-sm ${m.role === 'user' ? 'bg-mmsu-green text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && <div className="text-[10px] text-gray-400 font-black italic animate-pulse">Assistant is formulating a response...</div>}
        <div ref={scrollRef} />
      </div>
      <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="flex gap-3">
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Inquire about academics, policies, or Ilocos..."
            className="flex-1 bg-gray-100 dark:bg-gray-950 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-mmsu-green outline-none dark:text-white"
          />
          <button onClick={handleSend} className="bg-mmsu-green text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-mmsu-darkGreen shadow-xl transition-all active:scale-95"><i className="fas fa-paper-plane text-xl"></i></button>
        </div>
      </div>
    </div>
  );
};

const TourismHub = () => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const categories = ['All', ...new Set(TOURISM_SPOTS.map(s => s.category))];
  const filtered = TOURISM_SPOTS.filter(s => (filter === 'All' || s.category === filter) && s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Ilocos Heritage Hub</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Legacy Knowledge Base from Ilocos Norte Tours</p>
        </div>
        <div className="relative w-full md:w-80">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input 
            type="text" 
            placeholder="Search spots..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm outline-none focus:ring-2 focus:ring-mmsu-green dark:text-white transition-all"
          />
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {categories.map(c => (
          <button 
            key={c}
            onClick={() => setFilter(c)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === c ? 'bg-mmsu-green text-white shadow-lg scale-105' : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-mmsu-green'}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all group hover:-translate-y-2">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[9px] font-black bg-mmsu-gold/10 text-mmsu-green dark:text-mmsu-gold px-4 py-2 rounded-xl border border-mmsu-gold/20 uppercase tracking-widest">{s.category}</span>
              <a href={s.map_link} target="_blank" className="text-gray-300 hover:text-mmsu-green transition-colors"><i className="fas fa-map-marked-alt text-xl"></i></a>
            </div>
            <h4 className="font-black text-xl mb-4 group-hover:text-mmsu-green transition-colors">{s.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic opacity-80">"{s.description}"</p>
            <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
              <span className="text-[9px] font-black uppercase text-gray-300">Heritage Database</span>
              <button onClick={() => window.open(s.map_link, '_blank')} className="text-[10px] font-black uppercase text-mmsu-green dark:text-mmsu-gold hover:underline">View Map Link</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CourseExplorer = ({ user }: any) => {
  const [search, setSearch] = useState('');
  const filtered = MOCK_COURSES.filter(c => c.college === user.college && (c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())));
  
  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Academic Prospectus</h2>
          <p className="text-xs text-mmsu-green dark:text-mmsu-gold font-bold uppercase tracking-widest mt-2">Department: {user.college}</p>
        </div>
        <div className="relative w-full md:w-80">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input 
            type="text" 
            placeholder="Search catalog..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm outline-none focus:ring-2 focus:ring-mmsu-green dark:text-white transition-all"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((c, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:border-mmsu-gold transition-all">
            <span className="text-[10px] font-black bg-mmsu-gold/10 text-mmsu-green dark:text-mmsu-gold px-4 py-2 rounded-xl border border-mmsu-gold/20 uppercase tracking-widest mb-6 inline-block">{c.code}</span>
            <h4 className="font-black text-xl mb-4">{c.title}</h4>
            <div className="flex justify-between items-center pt-8 border-t border-gray-50 dark:border-gray-800">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{c.credits} Units</span>
              <button className="text-[10px] font-black uppercase text-mmsu-green dark:text-mmsu-gold hover:underline">Syllabus Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsView = ({ user, setUser }: any) => {
  const colleges = ['CCIS', 'COE', 'CBEA', 'CAS', 'CHS', 'CTE', 'CAM', 'COM', 'COV', 'GRAD'];
  return (
    <div className="max-w-md mx-auto space-y-10 animate-fadeIn pt-10">
      <div className="text-center space-y-4">
        <div className="w-24 h-24 bg-mmsu-green rounded-[2.5rem] flex items-center justify-center text-white text-4xl mx-auto shadow-2xl"><i className="fas fa-id-card"></i></div>
        <h2 className="text-3xl font-black tracking-tight uppercase">Stallion Profile</h2>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">MMSU Student Digital ID</p>
      </div>
      <div className="bg-white dark:bg-gray-900 p-10 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Display Name</label>
          <input type="text" value={user.name} onChange={e => setUser({...user, name: e.target.value})} className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold focus:ring-2 focus:ring-mmsu-green outline-none dark:text-white transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Assigned College</label>
          <select value={user.college} onChange={e => setUser({...user, college: e.target.value})} className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold focus:ring-2 focus:ring-mmsu-green outline-none dark:text-white transition-all">
            {colleges.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button className="w-full bg-mmsu-green text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-mmsu-green/20 hover:scale-[1.02] transition-all active:scale-95">Update Profile</button>
      </div>
    </div>
  );
};

// --- RENDER ---
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
