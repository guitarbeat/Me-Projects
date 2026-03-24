import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Folder, ArrowUp, ArrowDown } from 'lucide-react';
import { Layer } from '../types';
import { useStore } from '../store';
import LayerItem from './LayerItem';

interface LayerPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onAddLayer: () => void;
}

const LayerPanel: React.FC<LayerPanelProps> = ({ layers, activeLayerId, onAddLayer }) => {
  const { groupLayers, deleteLayers, moveLayer, setActiveLayer } = useStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set([activeLayerId]));
  const [editingId, setEditingId] = useState<string | null>(null);

  // Sync internal selection with external activeLayerId updates
  useEffect(() => {
     if (activeLayerId && !selectedIds.has(activeLayerId)) {
         // If active layer changes externally (e.g. from canvas click), update selection if simple single select
         if (selectedIds.size <= 1) {
             setSelectedIds(new Set([activeLayerId]));
         }
     }
  }, [activeLayerId]);

  const handleSelect = (id: string, multi: boolean) => {
    const newSet = new Set(multi ? selectedIds : []);
    if (multi && newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    
    // Ensure always one selected if click
    if (newSet.size === 0) newSet.add(id);
    setSelectedIds(newSet);

    // If single select, ensure we update the global active layer for editing tools
    if (!multi || newSet.size === 1) {
        setActiveLayer(id);
    }
  };

  const handleDelete = () => {
    deleteLayers(Array.from(selectedIds));
    setSelectedIds(new Set());
  };
  
  const handleMove = (direction: 'up' | 'down') => {
      // Only move the last selected item for simplicity in this UI
      const idToMove = Array.from(selectedIds).pop();
      if(idToMove) moveLayer(idToMove, direction);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
       <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900/10 shrink-0">
        <span className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5"/> Layers
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => handleMove('up')} title="Move Up (Front)" aria-label="Move Up (Front)" disabled={selectedIds.size === 0} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-zinc-500 focus:outline-none">
             <ArrowUp className="w-3.5 h-3.5" aria-hidden="true"/>
          </button>
          <button onClick={() => handleMove('down')} title="Move Down (Back)" aria-label="Move Down (Back)" disabled={selectedIds.size === 0} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-zinc-500 focus:outline-none">
             <ArrowDown className="w-3.5 h-3.5" aria-hidden="true"/>
          </button>
          <div className="w-px h-3 bg-zinc-800 mx-1"></div>
          
          <button onClick={() => groupLayers(Array.from(selectedIds))} title="Group Selected" aria-label="Group Selected" disabled={selectedIds.size < 1} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-zinc-500 focus:outline-none">
             <Folder className="w-3.5 h-3.5" aria-hidden="true"/>
          </button>
          <button onClick={handleDelete} title="Delete Selected" aria-label="Delete Selected" disabled={selectedIds.size === 0} className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-zinc-500 focus:outline-none">
             <Trash2 className="w-3.5 h-3.5" aria-hidden="true"/>
          </button>
          <div className="w-px h-3 bg-zinc-800 mx-1"></div>
          <button onClick={onAddLayer} title="Add Layer" aria-label="Add Layer" className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded focus-visible:ring-2 focus-visible:ring-zinc-500 focus:outline-none">
             <Plus className="w-3.5 h-3.5" aria-hidden="true"/>
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-950"
        role="list"
        aria-label="Layers"
      >
        {layers.length === 0 && <div className="p-8 text-center text-[10px] text-zinc-600 italic">No layers present</div>}
        {[...layers].reverse().map((layer) => (
           <LayerItem 
             key={layer.id} 
             layer={layer} 
             depth={0} 
             selectedIds={selectedIds}
             activeLayerId={activeLayerId}
             editingId={editingId}
             onSelect={handleSelect}
             setEditingId={setEditingId}
           />
        ))}
      </div>
    </div>
  );
};

export default LayerPanel;
