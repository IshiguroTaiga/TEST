import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- TYPES ---
type Tab = 'home' | 'chat' | 'courses' | 'tourism' | 'settings';

interface TourismSpot {
  name: string;
  category: string;
  description: string;
  map_link: string;
}

// --- LEGACY TOURISM DATA (Imported from your PHP file) ---
const TOURISM_SPOTS: TourismSpot[] = [
  {name: 'Paoay Church', category: 'Historical', description: 'A UNESCO World Heritage Baroque Church famous for its unique architecture.', map_link: 'https://maps.google.com/?q=Paoay+Church'},
  {name: 'Cape Bojeador Lighthouse', category: 'Historical', description: 'An old Spanish-era lighthouse overlooking Burgos, offering panoramic sea views.', map_link: 'https://maps.google.com/?q=Cape+Bojeador+Lighthouse+Burgos'},
  {name: 'Kapurpurawan Rock Formation', category: 'Natural Wonder', description: 'White limestone formations sculpted by natural forces.', map_link: 'https://maps.google.com/?q=Kapurpurawan+Rock+Formation'},
  {name: 'Pagudpud Beach', category: 'Beach', description: 'White sand and blue waters – a must-visit for swimming and relaxation.', map_link: 'https://maps.google.com/?q=Pagudpud+Beach+Ilocos+Norte'},
  {name: 'Bangui Windmills', category: 'Landmark', description: 'Iconic line of wind turbines along the shores of Bangui Bay.', map_link: 'https://maps.google.com/?q=Bangui+Windmills'},
  {name: 'Batac Riverside Empanadaan', category: 'Food Spot', description: 'Famous riverside stalls serving authentic Ilocano empanada.', map_link: 'https://maps.google.com/?q=Batac+Riverside+Empanadaan'},
  {name: 'Paoay Sand Dunes', category: 'Adventure', description: 'Try 4x4 rides and sandboarding on the iconic dunes near Paoay.', map_link: 'https://maps.google.com/?q=Paoay+Sand+Dunes'},
  {name: 'Malacanang of the North', category: 'Historical', description: 'Former presidential rest house of Ferdinand Marcos turned museum.', map_link: 'https://maps.google.com/?q=Malacanang+of+the+North+Paoay'},
  {name: 'Sinking Bell Tower', category: 'Historical', description: 'A centuries-old bell tower that has been slowly sinking into the ground.', map_link: 'https://maps.google.com/?q=Sinking+Bell+Tower+Laoag'},
  {name: 'Patapat Viaduct', category: 'Landmark', description: 'Coastal bridge connecting Ilocos Norte and Cagayan – scenic ocean view.', map_link: 'https://maps.google.com/?q=Patapat+Viaduct+Pagudpud'},
  {name: 'Blue Lagoon', category: 'Beach', description: 'Also known as Maira-ira Beach, famous for its turquoise waters.', map_link: 'https://maps.google.com/?q=Blue+Lagoon+Pagudpud'},
  {name: 'Madongan Dam', category: 'Nature', description: 'A scenic river dam in Dingras, popular for swimming.', map_link: 'https://maps.google.com/?q=Madongan+Dam+Dingras'},
  {name: 'San Nicolas Pottery Village', category: 'Cultural', description: 'Home of traditional Ilocano pottery craftsmanship.', map_link: 'https://maps.google.com/?q=San+Nicolas+Pottery+Village'},
  // ... adding more from your legacy list to ensure AI knows them
  {name: 'MMSU Batac Campus', category: 'Institutional', description: 'Main campus of Mariano Marcos State University located in Batac City.', map_link: 'https://maps.google.com/?q=MMSU+Batac+Campus'},
  {name: 'Fort Ilocandia Resort Hotel', category: 'Accommodation', description: 'Premier beachfront resort in Laoag with casino and spa.', map_link: 'https://maps.google.com/?q=Fort+Ilocandia+Resort+Hotel'},
  {name: 'Sarrat Church', category: 'Historical', description: 'Beautiful baroque church where Ferdinand and Imelda Marcos were married.', map_link: 'https://maps.google.com/?q=Sarrat+Church+Ilocos+Norte'}
];

// --- MOCK COURSE DATA ---
const COURSES = [
  { code: 'IT 101', title: 'Introduction to Computing', credits: 3, college: 'CCIS' },
  { code: 'CS 211', title: 'Data Structures', credits: 3, college: 'CCIS' },
  { code: 'ENGG 101', title: 'Engineering Graphics', credits: 2, college: 'COE' },
  { code: 'ACCTG 101', title: 'Basic Accounting', credits: 3, college: 'CBEA' }
];

// --- MAIN COMPONENT ---
const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('stallion_user');
    return saved ? JSON.parse(saved) : { name: 'Stallion Guest', college: 'CCIS', theme: 'light', studentId: '' };
  });

  useEffect(() => {
    localStorage.setItem('stallion_user', JSON.stringify(user));
    document.documentElement.classList.toggle('dark', user.theme === 'dark');
  }, [user]);

  return (
    <div className="min-h-screen pb-20 md:pb-0 transition-all duration-300">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50 text-white p-4 border-b border-mmsu-gold/20 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 bg-mmsu-gold rounded-xl flex items-center justify-center text-mmsu-green shadow-xl transform hover:rotate-6 transition-transform">
              <i className="fas fa-horse-head text-lg"></i>
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight uppercase leading-none">MMSU Stallion</h1>
              <p className="text-[9px] text-mmsu-gold font-bold uppercase tracking-widest">AI Companion v4</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setUser({...user, theme: user.theme === 'light' ? 'dark' : 'light'})}
              className="p-2 w-10 h-10 rounded-full hover:bg-white/10 transition-colors"
            >
              <i className={`fas ${user.theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <div 
              onClick={() => setActiveTab('settings')}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full border border-white/10 cursor-pointer transition-all"
            >
              <div className="w-6 h-6 bg-mmsu-gold rounded-full flex items-center justify-center text-mmsu-green font-black text-[10px]">
                {user.name.charAt(0)}
              </div>
              <span className="text-xs font-bold hidden sm:inline">{user.name.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-8 animate-fadeIn">
        {activeTab === 'home' && <HomeView user={user} onNavigate={setActiveTab} />}
        {activeTab === 'chat' && <ChatView user={user} />}
        {activeTab === 'courses' && <CourseView user={user} />}
        {activeTab === 'tourism' && <TourismView />}
        {activeTab === 'settings' && <SettingsView user={user} setUser={setUser} />}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-40 md:relative md:bg-transparent md:border-none">
        <div className="max-w-xl mx-auto flex justify-around py-3">
          {[
            { id: 'home', icon: 'fa-home', label: 'Home' },
            { id: 'chat', icon: 'fa-comments', label: 'AI Chat' },
            { id: 'courses', icon: 'fa-book-open', label: 'Courses' },
            { id: 'tourism', icon: 'fa-map-marked-alt', label: 'Tourism' }
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

// --- SUB-VIEWS ---

const HomeView = ({ user, onNavigate }: any) => (
  <div className="space-y-8">
    <div className="bg-gradient-to-br from-mmsu-green to-mmsu-darkGreen p-8 md:p-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
      <div className="relative z-10 space-y-4">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
          Unleash Excellence, <br/>
          <span className="text-mmsu-gold italic">Stallion {user.name.split(' ')[0]}!</span>
        </h2>
        <p className="opacity-80 text-sm md:text-base font-medium max-w-lg">
          Your centralized hub for academic support, university resources, and Ilocos Norte exploration.
        </p>
        <div className="flex gap-4 pt-4">
          <button onClick={() => onNavigate('chat')} className="bg-mmsu-gold text-mmsu-green px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-105 transition-all">Start Consult</button>
          <button onClick={() => onNavigate('tourism')} className="bg-white/10 border border-white/20 px-8 py-3 rounded-2xl font-black uppercase text-xs backdrop-blur-md hover:bg-white/20 transition-all">Explore Ilocos</button>
        </div>
      </div>
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <i className="fas fa-graduation-cap text-[15rem] transform -rotate-12 translate-x-12"></i>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="font-black text-lg mb-4 flex items-center">
          <i className="fas fa-bullhorn text-mmsu-green mr-3"></i>
          Campus Bulletins
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <p className="text-[10px] font-black text-mmsu-green uppercase tracking-widest">Enrollment</p>
            <h4 className="font-bold text-sm">2nd Semester SY 2025-2026 is Open!</h4>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <p className="text-[10px] font-black text-mmsu-green uppercase tracking-widest">Event</p>
            <h4 className="font-bold text-sm">48th MMSU Foundation Anniversary Celebration</h4>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="font-black text-lg mb-4 flex items-center">
          <i className="fas fa-link text-mmsu-gold mr-3"></i>
          Quick Portals
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <a href="https://mvle4.mmsu.edu.ph/" target="_blank" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-center hover:border-mmsu-green transition-all">
            <i className="fas fa-chalkboard-teacher text-mmsu-green mb-2"></i>
            <p className="text-[10px] font-bold uppercase">MVLE</p>
          </a>
          <a href="https://my.mmsu.edu.ph/" target="_blank" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-center hover:border-mmsu-green transition-all">
            <i className="fas fa-user-circle text-mmsu-green mb-2"></i>
            <p className="text-[10px] font-bold uppercase">Portal</p>
          </a>
        </div>
      </div>
    </div>
  </div>
);

const ChatView = ({ user }: any) => {
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', text: `Greetings, Stallion! I am your AI companion for ${user.college}. How can I help you with your academics or Ilocos exploration today?`, date: new Date() }
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
          User Info: ${user.name}, from ${user.college}. 
          Knowledge: You have deep knowledge of MMSU policies and Ilocos Norte Tourism (Paoay, Pagudpud, etc.). 
          Tone: Professional, supportive, and scholarly.`,
          tools: [{ googleSearch: {} }]
        }
      });
      setMessages(prev => [...prev, { role: 'assistant', text: response.text, date: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Stallion servers are busy. Please try again.", date: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="bg-mmsu-green p-4 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <i className="fas fa-robot"></i>
          <span className="font-black text-xs uppercase tracking-widest">Stallion Intelligence</span>
        </div>
        <span className="text-[8px] bg-white/20 px-2 py-1 rounded-full uppercase font-bold">Live</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-950/20 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm ${
              m.role === 'user' ? 'bg-mmsu-green text-white rounded-tr-none shadow-lg' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm'
            }`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && <p className="text-[10px] text-gray-400 font-bold italic animate-pulse">Assistant is thinking...</p>}
        <div ref={scrollRef} />
      </div>
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about MMSU or Ilocos Norte..."
          className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-mmsu-green outline-none"
        />
        <button onClick={handleSend} className="bg-mmsu-green text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:bg-mmsu-darkGreen transition-colors"><i className="fas fa-paper-plane"></i></button>
      </div>
    </div>
  );
};

const CourseView = ({ user }: any) => {
  const [search, setSearch] = useState('');
  const filtered = COURSES.filter(c => c.college === user.college && (c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())));
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Course Explorer</h2>
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input 
            type="text" 
            placeholder="Search catalog..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm focus:ring-2 focus:ring-mmsu-green outline-none w-48 md:w-64"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((c, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-mmsu-gold transition-all">
            <span className="text-[10px] font-black bg-mmsu-gold/10 text-mmsu-green dark:text-mmsu-gold px-2 py-1 rounded-lg mb-4 inline-block">{c.code}</span>
            <h4 className="font-bold mb-2">{c.title}</h4>
            <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-gray-800">
              <span className="text-[10px] text-gray-400 font-bold uppercase">{c.credits} Units</span>
              <button className="text-[10px] font-black uppercase text-mmsu-green dark:text-mmsu-gold underline">Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TourismView = () => {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...new Set(TOURISM_SPOTS.map(s => s.category))];
  const filtered = filter === 'All' ? TOURISM_SPOTS : TOURISM_SPOTS.filter(s => s.category === filter);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black mb-2">Ilocos Heritage</h2>
        <p className="text-gray-400 font-medium text-sm italic">Legacy Tourism Knowledge Base from Ilocos Norte Tours</p>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {categories.map(c => (
          <button 
            key={c}
            onClick={() => setFilter(c)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === c ? 'bg-mmsu-green text-white shadow-lg' : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-mmsu-green'}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black bg-mmsu-gold/10 text-mmsu-green dark:text-mmsu-gold px-3 py-1 rounded-lg uppercase tracking-tighter">{s.category}</span>
              <a href={s.map_link} target="_blank" className="text-gray-400 hover:text-mmsu-green"><i className="fas fa-external-link-alt text-xs"></i></a>
            </div>
            <h4 className="font-black text-xl mb-4 group-hover:text-mmsu-green transition-colors">{s.name}</h4>
            <p className="text-xs text-gray-500 leading-relaxed italic line-clamp-3">"{s.description}"</p>
            <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
              <span className="text-[9px] font-black uppercase text-gray-300">Verified Location</span>
              <button onClick={() => window.open(s.map_link, '_blank')} className="text-[10px] font-black uppercase text-mmsu-green dark:text-mmsu-gold hover:underline">📍 View Map</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsView = ({ user, setUser }: any) => {
  const colleges = ['CCIS', 'COE', 'CBEA', 'CAS', 'CHS', 'CTE'];
  
  return (
    <div className="max-w-md mx-auto space-y-8 animate-fadeIn">
      <div className="text-center">
        <div className="w-24 h-24 bg-mmsu-green rounded-[2rem] flex items-center justify-center text-white text-4xl mx-auto mb-6 shadow-2xl">
          <i className="fas fa-id-card"></i>
        </div>
        <h2 className="text-3xl font-black">Student Profile</h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">MMSU Digital Identity</p>
      </div>
      <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Display Name</label>
          <input 
            type="text" 
            value={user.name} 
            onChange={e => setUser({...user, name: e.target.value})}
            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold focus:ring-2 focus:ring-mmsu-green outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Primary College</label>
          <div className="grid grid-cols-3 gap-2">
            {colleges.map(c => (
              <button 
                key={c}
                onClick={() => setUser({...user, college: c})}
                className={`p-2 rounded-xl border text-[10px] font-black uppercase transition-all ${user.college === c ? 'bg-mmsu-green text-white border-mmsu-green shadow-lg' : 'hover:border-mmsu-gold'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="pt-4">
          <button className="w-full bg-mmsu-green text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-mmsu-green/20 hover:scale-105 active:scale-95 transition-all">Sync Cloud Profile</button>
          <p className="text-center text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-4">Local encryption active for Student Safety</p>
        </div>
      </div>
    </div>
  );
};

// --- RENDER ---
const root = createRoot(document.getElementById('root')!);
root.render(<App />);