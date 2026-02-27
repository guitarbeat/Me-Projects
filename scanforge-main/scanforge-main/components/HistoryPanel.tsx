import React from 'react';
import { Clock } from 'lucide-react';
import { shallow } from 'zustand/shallow';
import { useStore } from '../store';

const HistoryPanel: React.FC = () => {
  const { pages, activePageId, jumpToHistory } = useStore(state => ({
    pages: state.pages,
    activePageId: state.activePageId,
    jumpToHistory: state.jumpToHistory
  }), shallow);
  const activePage = pages.find(p => p.id === activePageId);

  return (
    <div className="w-64 bg-black border-l border-zinc-800 flex flex-col z-20 h-full shadow-xl">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between h-14 bg-zinc-900/10">
           <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center">
               <Clock className="w-3.5 h-3.5 mr-2" />
               History
           </h3>
           {activePage && <span className="text-[9px] text-zinc-600 font-mono">V{activePage.history.length}.0</span>}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-black">
          <div className="relative pt-4 pb-12">
             <div className="absolute top-6 bottom-0 left-[23px] w-px bg-zinc-800"></div>
             
             {activePage?.history.map((item, idx) => {
                 const isActive = idx === activePage.currentIndex;
                 
                 return (
                  <div 
                      key={item.id}
                      onClick={() => jumpToHistory(idx)}
                      className={`relative pl-12 pr-4 py-3 cursor-pointer transition-all duration-200 group border-l-2 ${isActive ? 'bg-zinc-900/40 border-l-white' : 'border-l-transparent hover:bg-zinc-900/20'}`}
                  >
                      <div className={`absolute left-[19px] top-[18px] w-2.5 h-2.5 rounded-full border-2 transition-all z-10 box-content ${isActive ? 'bg-white border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'bg-black border-zinc-700 group-hover:border-zinc-500'}`}>
                          {isActive && <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>}
                      </div>
                      
                      <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                             {idx === 0 ? 'ORIGINAL' : `VERSION ${idx}.0`}
                          </span>
                          <span className="text-[9px] text-zinc-700 font-mono opacity-60">
                             {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                      </div>
                      
                      <div className={`text-[11px] leading-snug line-clamp-2 ${isActive ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          {idx === 0 ? 'Source Upload' : item.prompt}
                      </div>
                  </div>
                 );
             })}
          </div>
      </div>
    </div>
  );
};

export default HistoryPanel;