import React from 'react';
import { useStore } from '../store';
import { Check, X, CheckCircle2, MessageSquarePlus, Sparkles, BrainCircuit } from 'lucide-react';
import LayerPanel from './LayerPanel';
import Button from './Button';
import { Layer } from '../types';

interface LayerSidebarProps {
  activeLayers: Layer[];
  activeLayerId: string;
  onAddLayer: () => void;
  handleCritique: () => void;
}

export default function LayerSidebar(props: LayerSidebarProps) {
  const { 
    processing,
    editParams,
    setEditParams,
    discardCandidates, 
    selectCandidate, 
    applySelectedCandidate,
  } = useStore();

  const isReviewing = processing.status === 'reviewing' || processing.status === 'critiquing';

  // --- REVIEW MODE (Replaces Layer Tree) ---
  if (isReviewing) {
    const selectedCandidate = processing.candidates.find(c => c.id === processing.selectedCandidateId);

    return (
      <div className="w-[300px] bg-black border-l border-zinc-800 flex flex-col h-full z-20 shadow-2xl">
        <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-800 bg-emerald-950/10">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4"/> Review Result
          </span>
          <button onClick={discardCandidates} className="text-zinc-500 hover:text-white" title="Cancel"><X className="w-4 h-4"/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">Candidates</label>
            {processing.candidates.map((cand) => (
              <div key={cand.id} onClick={() => selectCandidate(cand.id)}
                className={`group relative rounded-lg border-2 cursor-pointer overflow-hidden transition-all ${processing.selectedCandidateId === cand.id ? 'border-emerald-500 ring-2 ring-emerald-900/20 shadow-lg' : 'border-zinc-800 hover:border-zinc-600'}`}>
                <img src={cand.url} className="w-full h-auto object-contain bg-zinc-900/30" />
                {processing.selectedCandidateId === cand.id && (
                  <div className="absolute top-2 right-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]"></div></div>
                )}
              </div>
            ))}
          </div>

          {/* Critique Section */}
          {selectedCandidate && (
             <div className="pt-4 border-t border-zinc-800">
                {selectedCandidate.critique ? (
                   <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                       <div className="p-3 rounded-lg bg-yellow-950/20 border border-yellow-900/30">
                          <p className="text-[10px] font-bold text-yellow-500 mb-1 flex items-center gap-1"><BrainCircuit className="w-3 h-3"/> AI CRITIQUE</p>
                          <p className="text-[11px] text-zinc-400 leading-relaxed">{selectedCandidate.critique}</p>
                       </div>
                       
                       {selectedCandidate.refinedPrompts && selectedCandidate.refinedPrompts.length > 0 && (
                          <div className="space-y-1.5">
                              <p className="text-[10px] font-bold text-zinc-500">TRY THESE INSTEAD:</p>
                              {selectedCandidate.refinedPrompts.map((suggestion, i) => (
                                 <button 
                                   key={i} 
                                   onClick={() => {
                                      setEditParams({ prompt: suggestion });
                                      discardCandidates(); // Go back to edit mode with new prompt
                                   }}
                                   className="w-full text-left p-2 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] text-zinc-300 transition-colors flex gap-2"
                                 >
                                    <Sparkles className="w-3 h-3 text-purple-400 shrink-0 mt-0.5"/>
                                    {suggestion}
                                 </button>
                              ))}
                          </div>
                       )}
                   </div>
                ) : (
                  <Button 
                    variant="secondary" 
                    className="w-full text-xs gap-2" 
                    onClick={props.handleCritique}
                    isLoading={processing.status === 'critiquing'}
                    icon={<MessageSquarePlus className="w-3.5 h-3.5"/>}
                  >
                     Critique Result
                  </Button>
                )}
             </div>
          )}
        </div>
        
        <div className="p-4 border-t border-zinc-800 space-y-2 bg-zinc-900/10">
          <Button className="w-full text-xs h-10 bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-900/20" 
              onClick={() => applySelectedCandidate(props.activeLayerId)} 
              icon={<Check className="w-3.5 h-3.5"/>}>
             {editParams.maskBoundingBox ? 'Add Patch Layer' : 'Add New Layer'}
          </Button>
          <Button variant="ghost" className="w-full text-xs" onClick={discardCandidates}>Discard</Button>
        </div>
      </div>
    );
  }

  // --- DEFAULT LAYER TREE MODE ---
  return (
    <div className="w-[300px] bg-black border-l border-zinc-800 flex flex-col h-full z-20">
      <div className="flex-1 flex flex-col min-h-0">
          <LayerPanel 
            layers={props.activeLayers} 
            activeLayerId={props.activeLayerId} 
            onAddLayer={props.onAddLayer}
          />
      </div>
    </div>
  );
}