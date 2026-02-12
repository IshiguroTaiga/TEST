
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- TYPES ---
export type Campus = 'Batac' | 'Laoag' | 'Currimao' | 'Dingras';
export type College = 
  | 'College of Agriculture, Food and Sustainable Development'
  | 'College of Aquatic Science and Applied Technology'
  | 'College of Arts and Sciences'
  | 'College of Business, Economics and Accountancy'
  | 'College of Computing and Information Sciences'
  | 'College of Engineering'
  | 'College of Health Sciences'
  | 'College of Industrial Technology'
  | 'College of Teacher Education'
  | 'College of Medicine'
  | 'College of Law'
  | 'College of Dentistry'
  | 'College of Veterinary Medicine'
  | 'Graduate School';
export type ChatMode = 'GENERAL' | 'TUTORING';
export type Tab = 'chat' | 'courses' | 'tutors' | 'home';

export interface GroundingLink {
  title: string;
  uri: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  college: College;
  description: string;
  credits: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  groundingLinks?: GroundingLink[];
}

export interface UserProfile {
  name: string;
  college: College;
  campus: Campus;
  theme: 'light' | 'dark';
  studentId?: string;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  category: 'Academic' | 'Event' | 'Scholarship' | 'Enrollment';
}

// --- CONSTANTS ---
const COLLEGES: College[] = [
  'College of Agriculture, Food and Sustainable Development', 'College of Aquatic Science and Applied Technology',
  'College of Arts and Sciences', 'College of Business, Economics and Accountancy',
  'College of Computing and Information Sciences', 'College of Engineering',
  'College of Health Sciences', 'College of Industrial Technology',
  'College of Teacher Education', 'College of Medicine', 'College of Law',
  'College of Dentistry', 'College of Veterinary Medicine', 'Graduate School'
];

const MOCK_COURSES: Course[] = [
  { id: 'c9', code: 'IT 101', title: 'Introduction to Computing', college: 'College of Computing and Information Sciences', description: 'Fundamental concepts of computer hardware and software.', credits: 3 },
  { id: 'c10', code: 'CMPSC 146', title: 'Software Engineering', college: 'College of Computing and Information Sciences', description: 'Systematic approach to software development.', credits: 3 },
  { id: 'c12', code: 'CE 201', title: 'Statics of Rigid Bodies', college: 'College of Engineering', description: 'Analysis of force systems in equilibrium.', credits: 3 },
  { id: 'c5', code: 'BIO 101', title: 'General Biology', college: 'College of Arts and Sciences', description: 'Study of life and living organisms.', credits: 4 }
];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'Second Semester Enrollment AY 2025-2026', date: 'January 12, 2026', content: 'Final week for adding/dropping subjects. Please visit your college registrar.', category: 'Enrollment' },
  { id: 'a2', title: '2026 Scholarship Renewal', date: 'January 18, 2026', content: 'Submit grades to Student Affairs for renewal.', category: 'Scholarship' },
  { id: 'a3', title: 'MMSU 48th Foundation Anniversary', date: 'January 20, 2026', content: 'Happy Foundation Day, Stallions! Join us for the grand celebration at the Sunken Garden.', category: 'Event' }
];

// --- AI SERVICE ---
async function getAIResponse(
  prompt: string, 
  college: string,
  mode: ChatMode = 'GENERAL',
  studentId?: string,
  history?: Array<{role: 'user' | 'assistant', content: string}>
): Promise<{ text: string; links?: GroundingLink[] }> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = `
You are the "MMSU Stallion AI Companion," the academic assistant for Mariano Marcos State University (MMSU).
Date: Jan 20, 2026. 2nd Semester AY 2025-2026. Today is Foundation Day!
Current User: ${college} Stallion (ID: ${studentId || 'Guest'}).
Scope: Strictly MMSU-based. Language: Formal English. Tone: Professional.
${mode === 'TUTORING' ? 'Mode: Academic Tutoring. Focus on helping with complex concepts and study tips.' : 'Mode: General Assistant.'}`;

    const contents: any[] = history?.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })) || [];

    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const text = response.text || "I apologize, but I am currently unable to process your inquiry.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links: GroundingLink[] = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || 'MMSU Reference',
        uri: chunk.web?.uri || ''
      }));

    return { text, links };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "The university server is experiencing high traffic. Please try again later." };
  }
}

// --- COMPONENTS ---

const Header: React.FC<{
  userCollege: College;
  onCollegeChange: (c: College) => void;
  onOpenSettings: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}> = ({ userCollege, onCollegeChange, onOpenSettings, isDark, toggleTheme }) => (
  <header className={`${isDark ? 'bg-mmsu-darkGreen' : 'bg-mmsu-green'} text-white sticky top-0 z-50 shadow-lg border-b border-mmsu-gold/30`}>
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-mmsu-gold rounded-full flex items-center justify-center text-mmsu-green font-bold text-xl shadow-inner">
          <i className="fas fa-horse"></i>
        </div>
        <div className="hidden sm:flex flex-col">
          <h1 className="font-extrabold text-lg tracking-tight leading-none uppercase">MMSU Stallion</h1>
          <p className="text-[9px] text-mmsu-gold uppercase tracking-widest font-bold">Academic Companion</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <select 
          value={userCollege}
          onChange={(e) => onCollegeChange(e.target.value as College)}
          className={`text-[10px] p-1.5 rounded-lg border-none focus:ring-1 focus:ring-mmsu-gold transition-colors ${isDark ? 'bg-black/40' : 'bg-white/10'} text-white max-w-[150px] sm:max-w-xs`}
        >
          {COLLEGES.map(c => <option key={c} value={c} className="text-gray-900">{c}</option>)}
        </select>
        <div className="flex items-center space-x-2">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 transition-all"><i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i></button>
          <button onClick={onOpenSettings} className="w-9 h-9 rounded-full border border-mmsu-gold/50 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all"><i className="fas fa-user text-xs"></i></button>
        </div>
      </div>
    </div>
  </header>
);

const Navigation: React.FC<{ activeTab: Tab; setActiveTab: (t: Tab) => void }> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: 'home', icon: 'fas fa-home', label: 'Home' },
    { id: 'chat', icon: 'fas fa-comments', label: 'AI Chat' },
    { id: 'courses', icon: 'fas fa-book', label: 'Courses' },
    { id: 'tutors', icon: 'fas fa-user-graduate', label: 'Tutors' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 md:relative md:border-t-0 md:bg-transparent">
      <div className="max-w-7xl mx-auto flex justify-around md:justify-start md:space-x-8 md:px-4 md:py-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2 py-3 px-4 transition-all ${
              activeTab === tab.id ? 'text-mmsu-green dark:text-mmsu-gold font-bold border-t-2 md:border-t-0 md:border-b-2 border-mmsu-green dark:border-mmsu-gold' : 'text-gray-500 hover:text-mmsu-green'
            }`}
          >
            <i className={`${tab.icon} text-lg md:text-sm`}></i>
            <span className="text-[10px] md:text-xs uppercase font-black">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

const QuickActions: React.FC<{ onAction: (p: string) => void; mode: ChatMode; isDark: boolean }> = ({ onAction, mode, isDark }) => {
  const actions = mode === 'TUTORING' 
    ? [ { label: 'Study Tips', prompt: 'Provide effective study techniques for my major.', icon: '📚' }, { label: 'Thesis Help', prompt: 'Explain research methodology for MMSU students.', icon: '✍️' } ]
    : [ { label: 'Enrollment', prompt: 'What are the current enrollment dates?', icon: '📝' }, { label: 'Scholarships', prompt: 'Available scholarship programs?', icon: '💰' } ];
  return (
    <div className="flex flex-wrap gap-2 py-3">
      {actions.map((action, idx) => (
        <button key={idx} onClick={() => onAction(action.prompt)} className={`flex items-center gap-2 border px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${isDark ? 'bg-gray-800 border-gray-700 hover:border-mmsu-gold' : 'bg-white border-gray-100 hover:bg-mmsu-gold hover:text-mmsu-green'}`}>
          <span>{action.icon}</span><span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};

const Home: React.FC<{ user: UserProfile; onNavigateToChat: () => void }> = ({ user, onNavigateToChat }) => (
  <div className="space-y-8 animate-fadeIn">
    <section className="bg-gradient-to-br from-mmsu-green to-mmsu-darkGreen text-white p-8 md:p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden border border-white/10">
      <div className="relative z-10 space-y-6">
        <div className="inline-flex items-center space-x-2 bg-mmsu-gold/20 px-4 py-1.5 rounded-full border border-mmsu-gold/30">
          <span className="text-mmsu-gold text-[10px] font-black uppercase tracking-widest">Academic Year 2025-2026</span>
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none opacity-90">Welcome,</h2>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-mmsu-gold">
            {user.studentId || 'Guest'} Stallion!
          </h2>
        </div>
        <p className="text-sm opacity-80 font-medium max-w-lg">Serving the <span className="font-bold text-mmsu-gold">{user.college}</span> at {user.campus} Campus.</p>
      </div>
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><i className="fas fa-horse-head text-[12rem] transform rotate-12"></i></div>
    </section>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-xl font-black flex items-center px-2"><span className="w-1.5 h-6 bg-mmsu-green rounded-full mr-3"></span>Bulletins</h3>
        <div className="grid grid-cols-1 gap-4">
          {MOCK_ANNOUNCEMENTS.map(ann => (
            <div key={ann.id} className={`p-6 rounded-3xl border transition-all hover:scale-[1.01] ${user.theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="flex justify-between items-center mb-3">
                 <span className="text-[9px] font-black uppercase bg-mmsu-gold/10 text-mmsu-green px-3 py-1 rounded-full border border-mmsu-gold/20">{ann.category}</span>
                 <span className="text-[10px] text-gray-400">{ann.date}</span>
              </div>
              <h4 className="font-bold text-base mb-2">{ann.title}</h4>
              <p className="text-xs text-gray-500 line-clamp-2">{ann.content}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <h3 className="text-xl font-black flex items-center px-2"><span className="w-1.5 h-6 bg-mmsu-gold rounded-full mr-3"></span>Quick Tools</h3>
        <div className="grid grid-cols-1 gap-3">
          <button onClick={() => window.open('https://mvle4.mmsu.edu.ph/my/', '_blank')} className={`flex items-center p-4 rounded-2xl border transition-all text-left ${user.theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="bg-orange-600 w-10 h-10 rounded-xl flex items-center justify-center text-white mr-4"><i className="fas fa-graduation-cap"></i></div>
            <div><h4 className="font-bold text-xs">MVLE Learning</h4><p className="text-[9px] text-gray-400 font-bold uppercase">Online Portal</p></div>
          </button>
          <button onClick={onNavigateToChat} className="w-full bg-mmsu-green text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest mt-4 shadow-lg">Consult Stallion AI</button>
        </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('mmsu_static_v1');
    return saved ? JSON.parse(saved) : { name: 'Guest', college: 'College of Computing and Information Sciences', campus: 'Batac', theme: 'light', studentId: '' };
  });
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [chatMode, setChatMode] = useState<ChatMode>('GENERAL');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('mmsu_static_v1', JSON.stringify(user));
    document.documentElement.classList.toggle('dark', user.theme === 'dark');
  }, [user]);

  useEffect(() => {
    setMessages([{ id: '1', role: 'assistant', content: `Welcome Stallion! I'm your assistant for **${user.college}**. How can I help you?`, timestamp: new Date() }]);
  }, [user.college]);

  useEffect(() => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    if (!text) setInput('');
    setIsTyping(true);
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const res = await getAIResponse(messageText, user.college, chatMode, user.studentId, history);
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: res.text, timestamp: new Date(), groundingLinks: res.links }]);
    setIsTyping(false);
  };

  return (
    <div className={`min-h-screen flex flex-col pb-20 md:pb-0 ${user.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header userCollege={user.college} onCollegeChange={(c) => setUser({...user, college: c})} onOpenSettings={() => setShowSettings(true)} isDark={user.theme === 'dark'} toggleTheme={() => setUser({...user, theme: user.theme === 'light' ? 'dark' : 'light'})} />
      
      <div className={`border-b sticky top-[65px] z-40 hidden md:block backdrop-blur-md ${user.theme === 'dark' ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-100'}`}>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 overflow-x-hidden">
        {activeTab === 'home' && <Home user={user} onNavigateToChat={() => setActiveTab('chat')} />}
        
        {activeTab === 'chat' && (
          <div className="flex flex-col h-[calc(100vh-220px)] md:h-[700px] bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fadeIn">
            <div className={`px-8 py-4 flex items-center justify-between shadow-lg z-10 ${chatMode === 'TUTORING' ? 'bg-mmsu-gold text-mmsu-green' : 'bg-mmsu-green text-white'}`}>
              <div className="flex items-center space-x-3">
                <i className={`fas ${chatMode === 'TUTORING' ? 'fa-user-graduate' : 'fa-robot'} text-xl`}></i>
                <h3 className="font-black text-sm uppercase">{chatMode === 'TUTORING' ? 'Stallion Tutor' : 'Stallion AI'}</h3>
              </div>
              <div className="flex bg-black/10 p-1 rounded-xl">
                <button onClick={() => setChatMode('GENERAL')} className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${chatMode === 'GENERAL' ? 'bg-white text-mmsu-green shadow' : 'text-white/70'}`}>General</button>
                <button onClick={() => setChatMode('TUTORING')} className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${chatMode === 'TUTORING' ? 'bg-mmsu-green text-white shadow' : 'text-white/70'}`}>Tutor</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900/30">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] text-sm shadow-sm ${msg.role === 'user' ? 'bg-mmsu-green text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none text-gray-800 dark:text-gray-100'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.groundingLinks?.length ? (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-2">
                        {msg.groundingLinks.map((l, i) => <a key={i} href={l.uri} target="_blank" className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg border border-blue-100 truncate max-w-[120px]">{l.title}</a>)}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {isTyping && <div className="flex justify-start"><div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl shadow-sm animate-pulse flex space-x-1"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div><div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div><div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div></div></div>}
              <div ref={msgEndRef} />
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-gray-700">
              <QuickActions onAction={handleSend} mode={chatMode} isDark={user.theme === 'dark'} />
              <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-900 p-2 rounded-2xl shadow-inner mt-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask Stallion..." className="flex-1 bg-transparent border-none py-2 px-4 text-sm focus:ring-0" />
                <button onClick={() => handleSend()} className="w-10 h-10 bg-mmsu-green text-white rounded-xl shadow-lg"><i className="fas fa-paper-plane"></i></button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-black">Course Explorer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_COURSES.filter(c => c.college === user.college).map(c => (
                <div key={c.id} className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-mmsu-gold transition-all">
                  <span className="text-[10px] font-black text-mmsu-green bg-mmsu-gold/20 px-3 py-1 rounded-full">{c.code}</span>
                  <h4 className="mt-3 font-bold text-lg">{c.title}</h4>
                  <p className="mt-2 text-xs text-gray-500 line-clamp-3">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tutors' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn text-center py-12">
            <div className="w-24 h-24 bg-mmsu-gold rounded-3xl flex items-center justify-center text-mmsu-green mx-auto shadow-2xl"><i className="fas fa-user-graduate text-4xl"></i></div>
            <h2 className="text-4xl font-black">AI Tutor Network</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Get personalized academic tutoring grounded in your specific college curriculum.</p>
            <button onClick={() => { setChatMode('TUTORING'); setActiveTab('chat'); }} className="bg-mmsu-green text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Enter AI Tutor Room</button>
          </div>
        )}
      </main>

      <div className="md:hidden"><Navigation activeTab={activeTab} setActiveTab={setActiveTab} /></div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-fadeIn">
          <div className={`rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl border ${user.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h3 className="text-2xl font-black mb-8">Profile Settings</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Student ID (YY-XXXXXX)" value={user.studentId} onChange={(e) => setUser({...user, studentId: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none font-bold" />
              <select value={user.college} onChange={(e) => setUser({...user, college: e.target.value as College})} className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none font-bold text-xs">
                {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={() => setShowSettings(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-black uppercase text-xs">Close</button>
              <button onClick={() => setShowSettings(false)} className="flex-1 py-4 bg-mmsu-green text-white rounded-2xl font-black uppercase text-xs shadow-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
