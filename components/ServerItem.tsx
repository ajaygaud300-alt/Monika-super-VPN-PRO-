
import React from 'react';
import { Server } from '../types';

interface ServerItemProps {
  server: Server;
  isSelected: boolean;
  onSelect: (server: Server) => void;
}

export const ServerItem: React.FC<ServerItemProps> = ({ server, isSelected, onSelect }) => {
  const loadColorClass = server.load > 70 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : server.load > 40 ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';

  return (
    <button
      onClick={() => onSelect(server)}
      className={`w-full flex items-center justify-between p-4 mb-2 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
        isSelected 
          ? 'bg-blue-600/20 border border-blue-500/50 shadow-lg shadow-blue-900/20 scale-[1.02] z-10' 
          : 'bg-slate-800/40 hover:bg-slate-800/80 border border-white/5 hover:border-white/10'
      }`}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
      )}
      
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl bg-slate-900 border border-white/5 shadow-inner transition-transform group-hover:scale-110 ${isSelected ? 'border-blue-500/30' : ''}`}>
          {server.flag}
        </div>
        <div className="text-left">
          <div className="font-black text-sm text-slate-100 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{server.name}</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{server.country} <span className="mx-1 opacity-30">•</span> {server.ip}</div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
             <span className="text-[9px] font-black text-slate-400 font-mono tracking-tighter">{server.ping}ms</span>
          </div>
          <div className="w-12 h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5">
             <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max(10, 100 - server.ping/1.5)}%` }}></div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/50 px-2 py-0.5 rounded-full border border-white/5">
           <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Load {server.load}%</span>
           <div className={`w-1.5 h-1.5 rounded-full ${loadColorClass}`}></div>
        </div>
      </div>
    </button>
  );
};
