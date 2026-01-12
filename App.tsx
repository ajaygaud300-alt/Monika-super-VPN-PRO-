
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ConnectionStatus, Server, TrafficData } from './types';
import { SERVERS } from './constants';
import { ServerItem } from './components/ServerItem';
import { TrafficGraph } from './components/TrafficGraph';
import { getSmartRecommendation } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [selectedServer, setSelectedServer] = useState<Server>(SERVERS[0]);
  const [traffic, setTraffic] = useState<TrafficData[]>([]);
  const [activeTab, setActiveTab] = useState<'servers' | 'settings' | 'ai'>('servers');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<{ serverId: string; reason: string } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Timer for connection duration
  const [duration, setDuration] = useState(0);
  const durationInterval = useRef<number | null>(null);

  // Filter servers based on search query
  const filteredServers = useMemo(() => {
    return SERVERS.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ip.includes(searchQuery)
    );
  }, [searchQuery]);

  const toggleConnection = () => {
    if (status === ConnectionStatus.DISCONNECTED) {
      setStatus(ConnectionStatus.CONNECTING);
      // Simulate network handshake
      setTimeout(() => {
        setStatus(ConnectionStatus.CONNECTED);
        setDuration(0);
        durationInterval.current = window.setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
      }, 2500);
    } else {
      setStatus(ConnectionStatus.DISCONNECTED);
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (status === ConnectionStatus.CONNECTED) {
        const newPoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          down: Math.floor(Math.random() * 85) + 15,
          up: Math.floor(Math.random() * 25) + 5
        };
        setTraffic(prev => [...prev.slice(-19), newPoint]);
      } else {
        // Keeps the graph showing a "flatline" rather than just being empty
        const emptyPoint = { time: '', down: 0, up: 0 };
        setTraffic(prev => [...prev.slice(-19), emptyPoint]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const handleAiRecommend = async () => {
    if (!aiPrompt) return;
    setLoadingAi(true);
    try {
      const result = await getSmartRecommendation(aiPrompt, SERVERS);
      setAiResult(result);
      const server = SERVERS.find(s => s.id === result.serverId);
      if (server) setSelectedServer(server);
    } catch (err) {
      console.error("AI Recommendation failed", err);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0f172a] overflow-hidden text-slate-200">
      {/* Sidebar Navigation */}
      <nav className="w-16 md:w-20 bg-slate-900 flex flex-col items-center py-8 gap-8 border-r border-slate-800 z-50">
        <div className={`w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg shadow-blue-900/40 transition-all ${status === ConnectionStatus.CONNECTED ? 'animate-pulse scale-110' : ''}`}>
          M
        </div>
        <div className="flex flex-col gap-6 mt-12">
          <button 
            title="Servers"
            onClick={() => setActiveTab('servers')} 
            className={`p-3 rounded-xl transition-all ${activeTab === 'servers' ? 'bg-blue-600/20 text-blue-500 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          <button 
            title="AI Support"
            onClick={() => setActiveTab('ai')} 
            className={`p-3 rounded-xl transition-all ${activeTab === 'ai' ? 'bg-blue-600/20 text-blue-500 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </button>
          <button 
            title="Settings"
            onClick={() => setActiveTab('settings')} 
            className={`p-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-blue-600/20 text-blue-500 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-6 gap-6 overflow-y-auto custom-scrollbar">
        
        {/* Left Side: Connection & Stats */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Main Control Card */}
          <div className="glass-effect rounded-[2.5rem] p-8 md:p-10 flex flex-col items-center justify-between relative overflow-hidden flex-grow min-h-[450px] shadow-2xl">
            {/* Background Glows */}
            <div className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[100px] transition-all duration-1000 ${status === ConnectionStatus.CONNECTED ? 'bg-emerald-600/20' : 'bg-blue-600/20'}`}></div>
            <div className={`absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-[100px] transition-all duration-1000 ${status === ConnectionStatus.CONNECTED ? 'bg-blue-600/20' : 'bg-indigo-600/10'}`}></div>

            {/* Connection Button Section */}
            <div className="relative mt-4 group">
              {/* Outer Ring Decoration */}
              <div className={`absolute -inset-8 rounded-full border border-dashed border-slate-700 transition-all duration-1000 ${status === ConnectionStatus.CONNECTED ? 'rotate-180 scale-110 opacity-100' : 'opacity-20'}`}></div>
              
              <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-700 ${
                status === ConnectionStatus.CONNECTED ? 'bg-emerald-500/30 scale-110' : 
                status === ConnectionStatus.CONNECTING ? 'bg-blue-400/20 animate-pulse' : 'bg-blue-500/10 scale-90'
              }`}></div>
              
              <button 
                onClick={toggleConnection}
                className={`w-40 h-40 md:w-48 md:h-48 rounded-full flex flex-col items-center justify-center relative z-10 transition-all duration-500 transform hover:scale-105 active:scale-95 group-hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)] ${
                  status === ConnectionStatus.CONNECTED 
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white glow-green' 
                    : status === ConnectionStatus.CONNECTING 
                      ? 'bg-slate-800 text-blue-400' 
                      : 'bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400 border border-slate-700/50'
                }`}
              >
                {status === ConnectionStatus.CONNECTING ? (
                  <div className="flex flex-col items-center">
                    <svg className="w-14 h-14 mb-2 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <svg className={`w-14 h-14 md:w-16 md:h-16 mb-2 transition-transform duration-500 ${status === ConnectionStatus.CONNECTED ? 'rotate-12' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                <span className="font-black text-sm md:text-base uppercase tracking-[0.2em]">
                  {status === ConnectionStatus.CONNECTING ? 'Shielding' : status === ConnectionStatus.CONNECTED ? 'Secure' : 'Connect'}
                </span>
              </button>
            </div>

            {/* App Branding */}
            <div className="text-center mt-6">
              <h1 className="text-3xl md:text-4xl font-black mb-1 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                MONIKA SUPAR VPN PRO
              </h1>
              <div className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Premium Military Encryption</p>
              </div>
            </div>

            {/* Bottom Info Grid */}
            <div className="grid grid-cols-2 gap-10 w-full max-w-md bg-slate-800/20 rounded-3xl p-6 border border-white/5 mt-8">
              <div className="flex flex-col items-start px-4 border-r border-white/10">
                <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest font-black">Connection Status</div>
                <div className={`font-black text-xl transition-colors duration-500 ${status === ConnectionStatus.CONNECTED ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {status === ConnectionStatus.CONNECTED ? 'ENCRYPTED' : 'READY'}
                </div>
              </div>
              <div className="flex flex-col items-start px-4">
                <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest font-black">Active Session</div>
                <div className="font-black text-xl text-slate-300 font-mono">
                  {status === ConnectionStatus.CONNECTED ? formatDuration(duration) : '00:00:00'}
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Visualization Card */}
          <div className="glass-effect rounded-[2rem] p-6 shadow-xl border border-white/5">
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="font-bold text-sm uppercase tracking-widest text-slate-400">Real-Time Throughput</h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">DL Speed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">UL Speed</span>
                </div>
              </div>
            </div>
            <TrafficGraph data={traffic} />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-black mb-1">Downstream</span>
                <span className="text-blue-400 font-black text-2xl font-mono">{traffic[traffic.length - 1]?.down || 0}<small className="text-xs ml-1 opacity-50">MB/s</small></span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-black mb-1">Upstream</span>
                <span className="text-emerald-400 font-black text-2xl font-mono">{traffic[traffic.length - 1]?.up || 0}<small className="text-xs ml-1 opacity-50">MB/s</small></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Navigation Tabs Content */}
        <div className="w-full md:w-[400px] flex flex-col gap-6 h-full">
          {activeTab === 'servers' && (
            <div className="glass-effect rounded-[2rem] p-6 flex flex-col h-full shadow-xl border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                  <h2 className="text-xl font-black tracking-tight">Node Selection</h2>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Global Network Coverage</p>
                </div>
                <div className="bg-blue-600/10 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-black text-blue-400 uppercase">
                  {filteredServers.length} Active
                </div>
              </div>
              
              <div className="relative mb-6">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by country, city or IP..."
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600 transition-all"
                />
                <svg className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>

              <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {filteredServers.length > 0 ? (
                  filteredServers.map(server => (
                    <ServerItem 
                      key={server.id} 
                      server={server} 
                      isSelected={selectedServer.id === server.id}
                      onSelect={setSelectedServer}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                    <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.387a2 2 0 01-1.782 0l-.691-.387a6 6 0 00-3.86-.517l-2.387.477a2 2 0 00-1.022.547l-1.022 1.022a2 2 0 000 2.828l1.022 1.022a2 2 0 002.828 0l.345-.345a2 2 0 011.414-.586h.172a2 2 0 011.414.586l.345.345a2 2 0 002.828 0l1.022-1.022a2 2 0 000-2.828l-1.022-1.022z" /></svg>
                    <p className="text-xs uppercase font-bold tracking-widest">No matching nodes found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="glass-effect rounded-[2.5rem] p-8 flex flex-col h-full bg-gradient-to-br from-blue-900/10 via-[#0f172a] to-indigo-900/10 border border-blue-500/10 shadow-2xl">
              <div className="mb-8">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-900/50">
                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h2 className="text-2xl font-black mb-1">Gemini AI Engine</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Smart Server Optimization</p>
              </div>

              <div className="mb-8">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe your current activity (e.g., Gaming in Asia, Streaming US Netflix, Secure Banking)..."
                  className="w-full h-36 bg-slate-900/80 border border-white/5 rounded-3xl p-5 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-700 transition-all leading-relaxed"
                />
                <button 
                  onClick={handleAiRecommend}
                  disabled={loadingAi || !aiPrompt}
                  className={`w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 mt-4 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3`}
                >
                  {loadingAi ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Analyze Performance</>
                  )}
                </button>
              </div>

              {aiResult && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-[2rem] p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 text-blue-400 font-black text-xs uppercase tracking-widest mb-3">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    AI Insights Generated
                  </div>
                  <div className="flex items-center gap-3 mb-4 bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                    <span className="text-2xl">{SERVERS.find(s => s.id === aiResult.serverId)?.flag}</span>
                    <div className="font-black text-slate-200">
                      {SERVERS.find(s => s.id === aiResult.serverId)?.name}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-blue-500/30 pl-4">
                    "{aiResult.reason}"
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="glass-effect rounded-[2rem] p-8 flex flex-col h-full shadow-xl border border-white/5">
              <h2 className="text-2xl font-black mb-8 tracking-tight">Configuration</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Transmission Protocol</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['WireGuard', 'OpenVPN TCP', 'OpenVPN UDP', 'Shadowsocks'].map(p => (
                      <button key={p} className={`text-center py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border ${p === 'WireGuard' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-900/50 border-white/5 text-slate-500 hover:text-slate-300'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Security Modules</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Advanced Kill Switch', active: true },
                      { name: 'Ad-Blocker & Tracking', active: true },
                      { name: 'Split Tunneling', active: false },
                      { name: 'Automated Connect', active: false }
                    ].map(feat => (
                      <div key={feat.name} className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                        <span className="text-xs font-bold text-slate-300">{feat.name}</span>
                        <div className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${feat.active ? 'bg-blue-600' : 'bg-slate-700'}`}>
                          <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${feat.active ? 'translate-x-4.5' : ''}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Connected Device Info */}
          <div className="glass-effect rounded-3xl p-4 flex items-center gap-4 border border-white/5 shadow-lg mt-auto">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-white/5">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
            <div className="flex flex-col">
              <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Active Device</div>
              <div className="text-xs font-bold text-slate-300">Monika-Super-Admin</div>
            </div>
            <div className="ml-auto">
              <div className="flex items-center gap-2 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span className="text-[8px] font-black text-emerald-400 uppercase">Live</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
