

import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import { Plus, BrainCircuit, ScanLine, Trash2, Wand2, Sparkles, Loader2, AlertCircle, Undo2, Redo2, Crop, CheckCircle2, Paintbrush, Pipette, X, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import Button from './Button';
import { HistoryItem, Layer } from '../types';
import { optimizeEditPrompt, refineEditIntent, analyzeImage } from '../services/geminiService';
import { flattenLayers } from '../services/layerUtils';

interface SidebarProps {
  activeHistoryItem: HistoryItem | null;
  activeLayers: Layer[];
  activeLayerId: string;
  onNewPage: () => void;
  setMode: (mode: 'view' | 'mask' | 'erase') => void;
  handleProcess: () => void;
}

const CollapsibleSection = ({ label, icon: Icon, children, defaultOpen = false, className = "" }: any) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`border-t border-zinc-800 ${className}`}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors">
        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
          <Icon className="w-3.5 h-3.5" /> {label}
        </div>
        {open ? <ChevronDown className="w-3 h-3 text-zinc-600"/> : <ChevronRight className="w-3 h-3 text-zinc-600"/>}
      </button>
      {open && <div className="px-4 pb-4 pt-2 bg-black/20">{children}</div>}
    </div>
  );
};

export default function EditorSidebar(props: SidebarProps) {
  const store = useStore();
  const {
    pages,
    activePageId,
    setActivePageId,
    clearProject,
    undo,
    redo,
    editParams,
    setEditParams,
    processing,
    setProcessingStatus,
    updateAnalysis,
    activeTool,
    setActiveTool,
    brushSettings,
    setBrushSettings
  } = store;

  const canUndo = useMemo(() => {
    const page = pages.find(p => p.id === activePageId);
    return !!(page && page.currentIndex > 0);
  }, [pages, activePageId]);

  const canRedo = useMemo(() => {
    const page = pages.find(p => p.id === activePageId);
    return !!(page && page.currentIndex < page.history.length - 1);
  }, [pages, activePageId]);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [useAnalysisContext, setUseAnalysisContext] = useState(false);

  const handleMagicEnhance = async () => {
    if (!editParams.prompt) return;
    setIsOptimizing(true);
    const refined = await optimizeEditPrompt(editParams.prompt);
    setEditParams({ prompt: refined });
    setIsOptimizing(false);
  };

  const handleAnalyze = async () => {
    const composite = await flattenLayers(props.activeLayers);
    if (!composite) return;
    setIsAnalyzing(true);
    const res = await analyzeImage(composite);
    updateAnalysis(res.analysis, res.suggestions);
    setIsAnalyzing(false);
  };

  return (
    <div className="w-[320px] bg-black border-r border-zinc-800 flex flex-col h-full z-20 shadow-2xl">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-2 font-mono text-sm font-bold tracking-tight text-white">
          <div className="w-4 h-4 bg-zinc-100 rounded-sm"></div> SCANFORGE
        </div>
        
        {/* Undo/Redo Global Actions */}
        <div className="flex items-center gap-1">
             <button onClick={undo} disabled={!canUndo} className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-800 transition-colors" title="Undo" aria-label="Undo">
               <Undo2 className="w-4 h-4"/>
             </button>
             <button onClick={redo} disabled={!canRedo} className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-800 transition-colors" title="Redo" aria-label="Redo">
               <Redo2 className="w-4 h-4"/>
             </button>
             <div className="w-px h-4 bg-zinc-800 mx-1"></div>
             <button onClick={clearProject} className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors" title="Clear Project" aria-label="Clear Project">
               <Trash2 className="w-4 h-4"/>
             </button>
        </div>
      </div>

      {/* Pages Scroller */}
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/20">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Pages</span>
          <button onClick={props.onNewPage} className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded transition-colors" aria-label="New Page"><Plus className="w-3.5 h-3.5"/></button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {pages.map((p, index) => (
            <button key={p.id} onClick={() => setActivePageId(p.id)} aria-label={`Switch to Page ${index + 1}`}
               className={`w-10 h-14 rounded-md border flex-shrink-0 overflow-hidden transition-all ${activePageId === p.id ? 'border-zinc-400 ring-2 ring-zinc-500/20 opacity-100' : 'border-zinc-800 opacity-50 hover:opacity-100'}`}>
              <img src={p.history[p.currentIndex].layers[0]?.url || ''} className="w-full h-full object-cover" alt="" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {/* Generative Edit Workflow - Hero Section */}
        <div className="p-4 space-y-4">
            
            {/* 1. Prompt Input & Text Replacement */}
            <div className="relative group">
               <div className="flex justify-between items-center mb-2">
                   <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Edit Instruction</label>
                   <button onClick={handleMagicEnhance} disabled={isOptimizing || !editParams.prompt} className="flex items-center gap-1 text-[9px] text-purple-400 hover:text-purple-300 disabled:opacity-30 transition-colors px-2 py-0.5 rounded bg-purple-900/10 border border-purple-500/20">
                      {isOptimizing ? <Loader2 className="w-2.5 h-2.5 animate-spin"/> : <Sparkles className="w-2.5 h-2.5"/>}
                      Enhance
                   </button>
               </div>
               
               <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-inner focus-within:ring-1 focus-within:ring-zinc-600 transition-all">
                   <textarea 
                     value={editParams.prompt} 
                     onChange={e => setEditParams({ prompt: e.target.value })} 
                     placeholder="Describe exactly what to change..." 
                     className="w-full h-24 p-3 bg-transparent border-none text-sm text-zinc-200 focus:outline-none resize-none placeholder:text-zinc-600 leading-relaxed block"
                   />
                   <div className="px-3 pb-3 pt-0">
                       <input 
                          type="text" 
                          value={editParams.sourceText || ''} 
                          onChange={e => setEditParams({ sourceText: e.target.value })} 
                          placeholder='Optional: Exact text to replace (e.g. "Draft" -> "Final")' 
                          className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:bg-zinc-950 focus:border-zinc-600 transition-colors"
                       />
                   </div>
               </div>
               
               {/* Context Suggestions (Mini) */}
               {props.activeHistoryItem?.suggestions && !editParams.prompt && (
                 <div className="mt-2 flex flex-wrap gap-1.5">
                    {props.activeHistoryItem.suggestions.slice(0,2).map((s,i) => (
                      <button key={i} onClick={() => setEditParams({ prompt: s })} className="text-[9px] text-zinc-500 hover:text-zinc-300 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded px-2 py-1 truncate max-w-full transition-colors">
                        "{s}"
                      </button>
                    ))}
                 </div>
               )}
            </div>

            {/* 2. Region Selection */}
            <div>
               <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Target Area</label>
               {editParams.maskBoundingBox ? (
                 <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                          <CheckCircle2 className="w-5 h-5 text-blue-400"/>
                       </div>
                       <div>
                          <div className="text-xs font-bold text-blue-200">Region Active</div>
                          <div className="text-[10px] text-blue-400/70">Only this area will change</div>
                       </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => props.setMode('mask')} className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-300 transition-colors" title="Adjust Region" aria-label="Adjust Region">
                         <ScanLine className="w-4 h-4"/>
                      </button>
                      <button onClick={() => setEditParams({ maskBoundingBox: undefined })} className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-400 transition-colors" title="Clear Region" aria-label="Clear Region">
                         <X className="w-4 h-4"/>
                      </button>
                    </div>
                 </div>
               ) : (
                 <button 
                   onClick={() => props.setMode('mask')}
                   className="w-full p-4 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl bg-zinc-900/20 hover:bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 transition-all flex flex-col items-center justify-center gap-2 group"
                 >
                    <div className="w-10 h-10 bg-zinc-800 group-hover:bg-zinc-700 rounded-full flex items-center justify-center transition-colors">
                       <ScanLine className="w-5 h-5"/>
                    </div>
                    <span className="text-xs font-medium">Select Region to Edit</span>
                 </button>
               )}
            </div>

            {/* 3. Generate Action */}
            <div className="pt-2">
               {processing.error && <div className="mb-3 p-3 bg-red-950/30 border border-red-900/30 text-red-400 text-xs rounded-lg flex gap-2 items-start"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0"/> {processing.error}</div>}
               
               <div className="flex justify-between items-center mb-2 px-1">
                   <div className="flex gap-1">
                      {[1, 2, 3].map(n => (
                        <button 
                          key={n}
                          onClick={() => setEditParams({ variationCount: n })}
                          aria-label={`${n} variation${n > 1 ? 's' : ''}`}
                          className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border transition-colors ${editParams.variationCount === n ? 'bg-zinc-100 text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}
                        >
                          {n}
                        </button>
                      ))}
                   </div>
                   <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Variations</span>
               </div>

               <Button onClick={props.handleProcess} isLoading={processing.status === 'generating'} disabled={processing.status === 'planning'} className="w-full py-3 h-12 text-sm shadow-lg shadow-white/5">
                 {processing.status === 'planning' ? 'Planning...' : 'Generate Edit'}
               </Button>

               <div className="mt-3 flex gap-2 justify-center">
                  {['gemini-2.5-flash-image', 'gemini-3-pro-image-preview'].map(m => (
                    <button key={m} onClick={() => setEditParams({ model: m })} className={`px-3 py-1 text-[9px] font-bold uppercase rounded-full transition-all border ${editParams.model === m ? 'bg-zinc-800 border-zinc-600 text-white' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}>
                      {m.includes('flash') ? 'Fast' : 'Quality'}
                    </button>
                  ))}
               </div>
            </div>
        </div>

        {/* Collapsible Utilities */}
        <CollapsibleSection label="Manual Tools" icon={Paintbrush} className="mt-2">
             <div className="grid grid-cols-2 gap-2">
                 <button 
                    onClick={() => setActiveTool(activeTool === 'crop' ? 'hand' : 'crop')} 
                    className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-all ${activeTool === 'crop' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 text-zinc-400'}`}
                 >
                    <Crop className="w-4 h-4"/>
                    <span className="text-[10px] font-bold uppercase">Crop</span>
                 </button>
                 
                 <button 
                    onClick={() => setActiveTool(activeTool === 'paint' ? 'hand' : 'paint')} 
                    className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-all ${activeTool === 'paint' || activeTool === 'eyedropper' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 text-zinc-400'}`}
                 >
                    <Paintbrush className="w-4 h-4"/>
                    <span className="text-[10px] font-bold uppercase">Paint</span>
                 </button>
             </div>

             {(activeTool === 'paint' || activeTool === 'eyedropper') && (
               <div className="mt-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800 space-y-3">
                   <div className="flex items-center gap-2">
                      <div className="relative">
                        <input 
                           type="color" 
                           value={brushSettings.color}
                           onChange={(e) => setBrushSettings({ color: e.target.value })}
                           className="w-8 h-8 rounded cursor-pointer opacity-0 absolute inset-0"
                        />
                        <div className="w-8 h-8 rounded border border-zinc-600" style={{ backgroundColor: brushSettings.color }}></div>
                      </div>
                      <div className="flex-1 space-y-1">
                         <div className="flex justify-between text-[9px] text-zinc-500 font-bold uppercase">
                            <span>Brush Size</span>
                            <span>{brushSettings.size}px</span>
                         </div>
                         <input 
                            type="range" min="1" max="100" 
                            value={brushSettings.size} 
                            onChange={(e) => setBrushSettings({ size: +e.target.value })}
                            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
                         />
                      </div>
                      <button 
                        onClick={() => setActiveTool(activeTool === 'eyedropper' ? 'paint' : 'eyedropper')}
                        className={`p-2 rounded border ${activeTool === 'eyedropper' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}
                        title="Eyedropper"
                        aria-label="Eyedropper"
                      >
                         <Pipette className="w-3.5 h-3.5"/>
                      </button>
                   </div>
               </div>
             )}
        </CollapsibleSection>
        
        {/* Collapsible Analysis */}
        <CollapsibleSection label="AI Assistant" icon={BrainCircuit}>
             {props.activeHistoryItem?.analysis ? (
               <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                 <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-[10px] text-zinc-400 leading-relaxed max-h-40 overflow-y-auto">{props.activeHistoryItem.analysis}</div>
                 <div className="flex justify-between items-center pt-1">
                    <label className="flex gap-2 cursor-pointer text-[10px] text-zinc-500 font-medium select-none items-center hover:text-zinc-300">
                      <input type="checkbox" checked={useAnalysisContext} onChange={e => setUseAnalysisContext(e.target.checked)} className="rounded border-zinc-700 bg-zinc-900 text-white focus:ring-0 w-3 h-3"/> Use as Context
                    </label>
                    <button onClick={handleAnalyze} className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1"><BrainCircuit className="w-3 h-3"/> Re-Analyze</button>
                 </div>
               </div>
             ) : (
                <Button variant="secondary" onClick={handleAnalyze} isLoading={isAnalyzing} className="w-full h-9 text-xs">Analyze Document</Button>
             )}
        </CollapsibleSection>
      </div>
    </div>
  );
}