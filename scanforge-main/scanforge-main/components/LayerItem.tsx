import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Folder, ChevronRight, ChevronDown, Ungroup, Lock, Unlock } from 'lucide-react';
import { Layer } from '../types';
import { useStore } from '../store';

interface LayerItemProps {
  layer: Layer;
  depth: number;
  selectedIds: Set<string>;
  activeLayerId: string;
  editingId: string | null;
  onSelect: (id: string, multi: boolean) => void;
  setEditingId: (id: string | null) => void;
}

const LayerItem: React.FC<LayerItemProps> = ({ 
  layer, depth, selectedIds, activeLayerId, editingId, onSelect, setEditingId 
}) => {
  const { updateLayer, ungroupLayer } = useStore();
  const isSelected = selectedIds.has(layer.id);
  const isActive = layer.id === activeLayerId;
  const isGroup = layer.type === 'group';
  const [thumbBroken, setThumbBroken] = useState(false);

  // Local state for slider to prevent store thrashing
  const [localOpacity, setLocalOpacity] = useState(layer.opacity);
  
  useEffect(() => {
    setLocalOpacity(layer.opacity);
  }, [layer.opacity]);

  return (
    <div className="flex flex-col" role="listitem">
      <div 
        onClick={(e) => onSelect(layer.id, e.metaKey || e.ctrlKey)}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
            e.preventDefault();
            onSelect(layer.id, e.metaKey || e.ctrlKey);
          }
        }}
        tabIndex={0}
        aria-selected={isSelected}
        aria-label={`Layer: ${layer.name}`}
        onDoubleClick={(e) => { e.stopPropagation(); setEditingId(layer.id); }}
        className={`group flex items-center gap-2 px-2 py-2 border-b border-zinc-900/50 cursor-pointer select-none transition-all outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-inset
          ${isSelected ? 'bg-zinc-800' : 'hover:bg-zinc-900'}
          ${isActive && !isSelected ? 'bg-zinc-900/60' : ''}
          ${!layer.isVisible ? 'opacity-50 grayscale' : 'opacity-100'}
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { isVisible: !layer.isVisible }); }}
          disabled={layer.locked}
          className={`shrink-0 p-1 rounded hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-500 focus:outline-none ${layer.isVisible ? 'text-zinc-400 hover:text-white' : 'text-zinc-600'} ${layer.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={layer.isVisible ? "Hide Layer" : "Show Layer"}
          aria-label={layer.isVisible ? "Hide Layer" : "Show Layer"}
        >
          {layer.isVisible ? <Eye className="w-3.5 h-3.5" aria-hidden="true"/> : <EyeOff className="w-3.5 h-3.5" aria-hidden="true"/>}
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { locked: !layer.locked }); }}
          className={`shrink-0 p-1 rounded hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-500 focus:outline-none ${layer.locked ? 'text-red-400 hover:text-red-300' : 'text-zinc-600 hover:text-zinc-400'}`}
          title={layer.locked ? "Unlock Layer" : "Lock Layer"}
          aria-label={layer.locked ? "Unlock Layer" : "Lock Layer"}
        >
          {layer.locked ? <Lock className="w-3.5 h-3.5" aria-hidden="true"/> : <Unlock className="w-3.5 h-3.5" aria-hidden="true"/>}
        </button>

        {isGroup ? (
          <button 
            onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { expanded: !layer.expanded }); }}
            className="text-zinc-400 hover:text-white p-0.5 focus-visible:ring-2 focus-visible:ring-zinc-500 focus:outline-none rounded"
            aria-label={layer.expanded ? "Collapse Group" : "Expand Group"}
            aria-expanded={layer.expanded}
          >
             {layer.expanded ? <ChevronDown className="w-3.5 h-3.5" aria-hidden="true"/> : <ChevronRight className="w-3.5 h-3.5" aria-hidden="true"/>}
          </button>
        ) : (
          <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center relative">
             <div className="absolute inset-0 bg-zinc-800/50"></div>
             {thumbBroken ? (
               <div className="w-full h-full bg-zinc-900 text-[8px] text-zinc-500 flex items-center justify-center">?</div>
             ) : (
               <img 
                 src={layer.url} 
                 className="w-full h-full object-cover" 
                 alt="Layer Thumbnail" 
                 onError={() => setThumbBroken(true)}
               />
             )}
          </div>
        )}

        <div className="flex-1 min-w-0 flex items-center gap-2">
           {isGroup && <Folder className={`w-3.5 h-3.5 ${layer.expanded ? 'text-zinc-300' : 'text-zinc-500'}`}/>}
           
           {editingId === layer.id ? (
              <input 
                autoFocus 
                type="text" 
                defaultValue={layer.name}
                onBlur={(e) => { setEditingId(null); updateLayer(layer.id, { name: e.target.value }); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingId(null);
                    updateLayer(layer.id, { name: e.currentTarget.value });
                  }
                }}
                onClick={e => e.stopPropagation()}
                className="w-full bg-black border border-blue-500 text-xs px-1 py-0.5 rounded text-white focus:outline-none"
              />
           ) : (
              <span className={`text-[11px] truncate ${isSelected ? 'text-white font-medium' : 'text-zinc-400'} ${isActive ? 'text-blue-100' : ''}`}>{layer.name}</span>
           )}
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex items-center gap-1 transition-opacity">
           {isGroup && (
             <button 
               onClick={(e) => { e.stopPropagation(); ungroupLayer(layer.id); }} 
               title="Ungroup" 
               aria-label="Ungroup"
               className="p-1 hover:text-white text-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-500 focus:outline-none rounded"
             >
               <Ungroup className="w-3 h-3" aria-hidden="true"/>
             </button>
           )}
        </div>
      </div>

      {isSelected && (
        <div className="px-2 py-1 bg-zinc-800/50 flex items-center gap-2 border-b border-zinc-900/50 pl-10">
           <span className="text-[9px] text-zinc-500 font-mono w-6">{Math.round(localOpacity * 100)}%</span>
           <input 
              type="range" min="0" max="1" step="0.01" 
              value={localOpacity}
              disabled={layer.locked}
              onClick={e => e.stopPropagation()}
              onChange={(e) => setLocalOpacity(parseFloat(e.target.value))}
              onMouseUp={(e) => updateLayer(layer.id, { opacity: parseFloat(e.currentTarget.value) }, true)}
              className="w-full h-1 bg-zinc-600 accent-zinc-300 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
           />
        </div>
      )}

      {isGroup && layer.expanded && layer.children && (
        <div
          className="flex flex-col relative before:absolute before:left-[19px] before:top-0 before:bottom-0 before:w-px before:bg-zinc-800"
          role="list"
        >
           {[...layer.children].reverse().map((child) => (
              <LayerItem 
                key={child.id} 
                layer={child} 
                depth={depth + 1} 
                selectedIds={selectedIds}
                activeLayerId={activeLayerId}
                editingId={editingId}
                onSelect={onSelect}
                setEditingId={setEditingId}
              />
           ))}
        </div>
      )}
    </div>
  );
};

export default LayerItem;
