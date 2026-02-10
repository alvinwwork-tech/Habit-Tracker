import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  BarChart3, 
  Settings, 
  ChevronRight, 
  ChevronLeft,
  Flame,
  Clock,
  Droplets,
  MoreVertical,
  X,
  RotateCcw,
  Zap,
  Download,
  Moon,
  Sun,
  Edit2,
  Trash2,
  Play,
  Square,
  FastForward,
  Activity
} from 'lucide-react';

// --- Constants & Types ---
const CATEGORIES = [
  { id: 'health', label: 'Health', color: 'bg-emerald-500', icon: '🏃' },
  { id: 'career', label: 'Career', color: 'bg-blue-500', icon: '💼' },
  { id: 'mind', label: 'Mindfulness', color: 'bg-purple-500', icon: '🧘' },
  { id: 'bad-habit', label: 'Quit', color: 'bg-rose-500', icon: '🚫' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// --- Helper Functions ---
const getTodayKey = () => new Date().toISOString().split('T')[0];

const App = () => {
  // --- State ---
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('aura-habits');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('aura-logs');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeView, setActiveView] = useState('today'); // 'today', 'stats', 'settings'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timerActive, setTimerActive] = useState(null); // { habitId: string, seconds: number }

  // Persistent Storage
  useEffect(() => {
    localStorage.setItem('aura-habits', JSON.stringify(habits));
    localStorage.setItem('aura-logs', JSON.stringify(logs));
  }, [habits, logs]);

  // --- Habit Logic ---
  const addHabit = (habitData) => {
    const newHabit = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      streak: 0,
      ...habitData
    };
    setHabits([...habits, newHabit]);
    setIsAddModalOpen(false);
  };

  const deleteHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
    const newLogs = { ...logs };
    delete newLogs[id];
    setLogs(newLogs);
  };

  const toggleLog = (habitId, dateKey = getTodayKey(), value = true, type = 'check') => {
    const habitLogs = logs[habitId] || {};
    const existing = habitLogs[dateKey];
    
    const newHabitLogs = { ...habitLogs };
    
    if (existing && type === 'check') {
      delete newHabitLogs[dateKey];
    } else {
      newHabitLogs[dateKey] = {
        status: value === 'skipped' ? 'skipped' : 'completed',
        value: value,
        timestamp: new Date().toISOString(),
        note: ""
      };
      
      if (value !== 'skipped') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }

    setLogs({ ...logs, [habitId]: newHabitLogs });
  };

  const exportData = () => {
    const data = { habits, logs };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-export-${getTodayKey()}.json`;
    a.click();
  };

  // --- Calculations ---
  const calculateStreak = (habitId) => {
    const habitLogs = logs[habitId] || {};
    let streak = 0;
    let curr = new Date();
    
    while (true) {
      const key = curr.toISOString().split('T')[0];
      if (habitLogs[key]?.status === 'completed' || habitLogs[key]?.status === 'skipped') {
        if (habitLogs[key]?.status === 'completed') streak++;
        curr.setDate(curr.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  // --- Views ---
  const TodayView = () => (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-end px-4 pt-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Today</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="p-3 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="px-4 space-y-4">
        {habits.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <Activity className="mx-auto mb-4 text-slate-300" size={48} />
            <p className="text-slate-500">No habits tracked yet.</p>
            <button onClick={() => setIsAddModalOpen(true)} className="mt-4 text-indigo-600 font-semibold">Create your first one</button>
          </div>
        ) : habits.map(habit => {
          const log = logs[habit.id]?.[getTodayKey()];
          const isDone = log?.status === 'completed';
          const isSkipped = log?.status === 'skipped';
          const streak = calculateStreak(habit.id);

          return (
            <div 
              key={habit.id}
              className={`relative group bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-all ${isDone ? 'opacity-75' : ''}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${CATEGORIES.find(c => c.id === habit.category)?.color || 'bg-slate-200'}`}>
                {CATEGORIES.find(c => c.id === habit.category)?.icon || '✨'}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate">{habit.name}</h3>
                <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                  <span className="flex items-center gap-1">
                    <Flame size={12} className={streak > 0 ? "text-orange-500" : ""} /> {streak} day streak
                  </span>
                  {habit.type === 'timer' && (
                    <span className="flex items-center gap-1"><Clock size={12} /> {habit.goalValue}m goal</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleLog(habit.id, getTodayKey(), 'skipped')}
                  className={`p-2 rounded-lg transition-colors ${isSkipped ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  title="Skip (Keep Streak)"
                >
                  <FastForward size={20} />
                </button>
                
                <button 
                  onClick={() => toggleLog(habit.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isDone 
                      ? 'bg-indigo-600 text-white' 
                      : isSkipped ? 'bg-slate-100 dark:bg-slate-700 text-slate-400' : 'border-2 border-slate-200 dark:border-slate-600 text-transparent'
                  }`}
                >
                  <CheckCircle2 size={24} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const StatsView = () => {
    // Basic Heatmap Mockup
    const last30Days = Array.from({ length: 35 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (34 - i));
      return d.toISOString().split('T')[0];
    });

    return (
      <div className="p-4 space-y-8 pb-24">
        <header className="pt-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Insights</h1>
          <p className="text-slate-500">Your consistency at a glance</p>
        </header>

        <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Activity Map</h3>
          <div className="grid grid-cols-7 gap-2">
            {last30Days.map(date => {
              const totalCompleted = Object.values(logs).filter(hLogs => hLogs[date]?.status === 'completed').length;
              const intensity = totalCompleted === 0 ? 'bg-slate-100 dark:bg-slate-700' : 
                               totalCompleted < 2 ? 'bg-indigo-200' : 
                               totalCompleted < 4 ? 'bg-indigo-400' : 'bg-indigo-600';
              return (
                <div key={date} className={`aspect-square rounded-sm ${intensity}`} title={date} />
              );
            })}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-slate-400 font-bold uppercase">
            <span>Less</span>
            <span>More</span>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-800">
            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">Best Streak</p>
            <h4 className="text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1">12 <span className="text-lg font-normal">days</span></h4>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-800">
            <p className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">Completion</p>
            <h4 className="text-3xl font-black text-indigo-700 dark:text-indigo-300 mt-1">84<span className="text-lg font-normal">%</span></h4>
          </div>
        </div>

        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Trends</h3>
          {habits.map(h => (
            <div key={h.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-700 shadow-sm">
              <span className="font-bold text-slate-700 dark:text-slate-200">{h.name}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`w-1.5 h-6 rounded-full ${Math.random() > 0.3 ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100">
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative overflow-hidden">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {activeView === 'today' && <TodayView />}
          {activeView === 'stats' && <StatsView />}
          {activeView === 'settings' && (
             <div className="p-4 space-y-6 pt-12">
               <h1 className="text-3xl font-bold">Settings</h1>
               <div className="space-y-2">
                 <button 
                  onClick={exportData}
                  className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"
                 >
                   <span className="font-medium">Export My Data (JSON)</span>
                   <Download size={20} className="text-indigo-500" />
                 </button>
                 <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                   <span className="font-medium">Dark Mode</span>
                   <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center px-1">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                   </div>
                 </div>
                 <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-800 flex items-center justify-between text-rose-600 dark:text-rose-400">
                   <span className="font-medium">Wipe All Data</span>
                   <Trash2 size={20} />
                 </div>
               </div>
               
               <div className="p-6 bg-slate-100 dark:bg-slate-900 rounded-3xl text-xs text-slate-500 leading-relaxed">
                 <p className="font-bold mb-2 uppercase tracking-tighter">About Aura Habit</p>
                 Aura uses the "Seinfeld Strategy" (Don't Break the Chain). Skips allow for rest without demotivation. All data is stored locally for privacy.
               </div>
             </div>
          )}
        </main>

        {/* Tab Bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-40">
          <button 
            onClick={() => setActiveView('today')}
            className={`flex flex-col items-center gap-1 ${activeView === 'today' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Calendar size={22} fill={activeView === 'today' ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Today</span>
          </button>
          <button 
            onClick={() => setActiveView('stats')}
            className={`flex flex-col items-center gap-1 ${activeView === 'stats' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <BarChart3 size={22} fill={activeView === 'stats' ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Stats</span>
          </button>
          <button 
            onClick={() => setActiveView('settings')}
            className={`flex flex-col items-center gap-1 ${activeView === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Settings size={22} fill={activeView === 'settings' ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Settings</span>
          </button>
        </nav>

        {/* Add Habit Modal Overlay */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">New Habit</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={20} /></button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                addHabit({
                  name: fd.get('name'),
                  category: fd.get('category'),
                  type: fd.get('type'),
                  goalValue: fd.get('goalValue') || 1,
                  schedule: 'daily', // Simplified for demo
                  naggingMode: fd.get('nagging') === 'on'
                });
              }} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Habit Name</label>
                  <input 
                    name="name" 
                    required 
                    placeholder="E.g. Morning Meditation"
                    className="w-full mt-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 ring-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Area of Life</label>
                    <select name="category" className="w-full mt-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Type</label>
                    <select name="type" className="w-full mt-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <option value="check">Checkbox</option>
                      <option value="number">Numeric Goal</option>
                      <option value="timer">Timer (Minutes)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                  <div className="flex items-center gap-3">
                    <Zap className="text-indigo-600" size={20} />
                    <div>
                      <p className="font-bold text-sm text-indigo-900 dark:text-indigo-200">Nagging Mode</p>
                      <p className="text-xs text-indigo-700 dark:text-indigo-400">Repeated pings if not done</p>
                    </div>
                  </div>
                  <input type="checkbox" name="nagging" className="w-5 h-5 accent-indigo-600" />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors mt-2"
                >
                  Create Habit
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Celebration Confetti Component (Simple SVG particles) */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
            <div className="relative w-full h-full overflow-hidden">
               {[...Array(20)].map((_, i) => (
                 <div 
                  key={i} 
                  className="absolute animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: 0.6
                  }}
                 >
                   {['🎉', '✨', '🔥', '⭐️'][i % 4]}
                 </div>
               ))}
            </div>
          </div>
        )}

      </div>
      
      {/* Visual background details for premium feel */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/20 dark:bg-indigo-900/10 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/20 dark:bg-emerald-900/10 blur-[120px] rounded-full -z-10" />
    </div>
  );
};

export default App;