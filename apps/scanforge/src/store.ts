import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { current } from 'immer';
import LZString from 'lz-string';
import { Page, Layer, HistoryItem, EditState, ProcessingState, GenerationCandidate } from './types';
import { assetStore } from './services/assetStore';

interface AppState {
  pages: Page[];
  activePageId: string | null;
  
  // Global Edit State
  editParams: EditState;
  processing: ProcessingState;

  // Tool State
  activeTool: 'hand' | 'move' | 'crop' | 'paint' | 'eyedropper';
  brushSettings: { color: string; size: number };

  // Actions
  hydrateAssets: () => Promise<void>;
  addPages: (newPages: Page[]) => Promise<void>;
  setActivePageId: (id: string) => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
  jumpToHistory: (index: number) => void;
  clearProject: () => void;
  
  // Layer Actions
  setActiveLayer: (id: string) => void;
  addLayer: (layer: Layer) => Promise<void>;
  updateLayer: (id: string, changes: Partial<Layer>, createSnapshot?: boolean) => Promise<void>;
  updateLayersRaw: (layers: Layer[], message?: string, activeLayerId?: string) => void;
  deleteLayers: (ids: string[]) => void;
  groupLayers: (selectedIds: string[]) => void;
  ungroupLayer: (groupId: string) => void;
  moveLayer: (id: string, direction: 'up' | 'down') => void;
  
  // Analysis
  updateAnalysis: (analysis: string, suggestions: string[]) => void;

  // Editor Actions
  setEditParams: (params: Partial<EditState>) => void;
  setProcessingStatus: (status: ProcessingState['status'], error?: string | null) => void;
  setCandidates: (candidates: GenerationCandidate[]) => void;
  selectCandidate: (id: string) => void;
  discardCandidates: () => void;
  applySelectedCandidate: (activeLayerId: string) => Promise<void>;

  // Tool Actions
  setActiveTool: (tool: 'hand' | 'move' | 'crop' | 'paint' | 'eyedropper') => void;
  setBrushSettings: (settings: Partial<{ color: string; size: number }>) => void;
}

const DEFAULT_EDIT_PARAMS: EditState = {
  prompt: '',
  model: 'gemini-2.5-flash-image',
  sourceText: '',
  guideImage: null,
  maskBoundingBox: undefined,
  variationCount: 1
};

const DEFAULT_PROCESSING: ProcessingState = {
  isProcessing: false,
  status: 'idle',
  error: null,
  candidates: [],
  selectedCandidateId: null
};

// Storage config with LZ-string compression
const storage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    try {
      return JSON.parse(LZString.decompress(str) || 'null');
    } catch { return null; }
  },
  setItem: (name: string, value: any) => {
    const replacer = (key: string, value: any) => {
      if (key === 'url' && typeof value === 'string' && value.startsWith('blob:')) {
        return undefined;
      }
      return value;
    };
    localStorage.setItem(name, LZString.compress(JSON.stringify(value, replacer)));
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

// Helper to push new history state
const pushHistory = (page: Page, message: string, newLayers: Layer[], activeLayerId?: string) => {
  const history = page.history.slice(0, page.currentIndex + 1);
  const currentItem = history[history.length - 1];
  
  const newItem: HistoryItem = {
    id: crypto.randomUUID(),
    layers: newLayers,
    activeLayerId: activeLayerId || currentItem.activeLayerId,
    prompt: message,
    timestamp: Date.now(),
    model: 'action',
    analysis: currentItem.analysis,
    suggestions: currentItem.suggestions
  };
  
  page.history = [...history, newItem];
  page.currentIndex = page.history.length - 1;
};

// Helper to find layer in draft (recursive)
const findLayer = (layers: Layer[], id: string): Layer | undefined => {
  for (const layer of layers) {
    if (layer.id === id) return layer;
    if (layer.children) {
      const found = findLayer(layer.children, id);
      if (found) return found;
    }
  }
};

// Recursive function to restore URLs from asset IDs
const restoreLayerUrls = async (layers: Layer[]) => {
    await Promise.all(layers.map(async (layer) => {
        if (layer.assetId && !layer.url) {
            const url = await assetStore.getUrl(layer.assetId);
            if (url) layer.url = url;
        }
        if (layer.children) {
            await restoreLayerUrls(layer.children);
        }
    }));
};

export const useStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      pages: [],
      activePageId: null,
      editParams: DEFAULT_EDIT_PARAMS,
      processing: DEFAULT_PROCESSING,
      activeTool: 'hand',
      brushSettings: { color: '#ef4444', size: 10 },

      hydrateAssets: async () => {
         const { pages } = get();
         if (pages.length === 0) return;
         
         console.time('hydrateAssets');
         const newPages = [...pages];
         await Promise.all(newPages.map(async (page) => {
             const current = page.history[page.currentIndex];
             await restoreLayerUrls(current.layers);
         }));
         
         set({ pages: newPages });
         console.timeEnd('hydrateAssets');
      },

      addPages: async (newPages) => {
        for (const page of newPages) {
            const layers = page.history[0].layers;
            for (const layer of layers) {
                if (layer.url && !layer.assetId) {
                    const { id, url } = await assetStore.store(layer.url);
                    layer.assetId = id;
                    layer.url = url; 
                }
            }
        }
        
        set((state) => {
            state.pages.push(...newPages);
            if (!state.activePageId && newPages.length > 0) {
              state.activePageId = newPages[0].id;
            }
        });
      },

      setActivePageId: (id) => set((state) => {
        state.activePageId = id;
        state.processing = DEFAULT_PROCESSING;
        state.editParams = { ...state.editParams, maskBoundingBox: undefined, guideImage: null };
      }),

      undo: () => set((state) => {
        const page = state.pages.find(p => p.id === state.activePageId);
        if (page && page.currentIndex > 0) {
          page.currentIndex--;
          state.processing = DEFAULT_PROCESSING; 
        }
      }),

      redo: () => set((state) => {
        const page = state.pages.find(p => p.id === state.activePageId);
        if (page && page.currentIndex < page.history.length - 1) {
          page.currentIndex++;
          state.processing = DEFAULT_PROCESSING;
        }
      }),

      jumpToHistory: (index) => set((state) => {
        const page = state.pages.find(p => p.id === state.activePageId);
        if (page && index >= 0 && index < page.history.length) {
          page.currentIndex = index;
          state.processing = DEFAULT_PROCESSING;
        }
      }),

      clearProject: () => set({ 
        pages: [], 
        activePageId: null, 
        editParams: DEFAULT_EDIT_PARAMS, 
        processing: DEFAULT_PROCESSING 
      }),
      
      setActiveLayer: (id) => set((state) => {
        const page = state.pages.find(p => p.id === state.activePageId);
        if (!page) return;
        const current = page.history[page.currentIndex];
        if (current.activeLayerId !== id) {
           current.activeLayerId = id;
        }
      }),

      addLayer: async (layer) => {
         if (layer.url && !layer.assetId) {
             const { id, url } = await assetStore.store(layer.url);
             layer.assetId = id;
             layer.url = url;
         }

         set((state) => {
            const page = state.pages.find(p => p.id === state.activePageId);
            if (!page) return;
            const current = page.history[page.currentIndex];
            const newLayers = [...current.layers, layer];
            pushHistory(page, "Add Layer", newLayers, layer.id);
         });
      },

      updateLayer: async (id, changes, createSnapshot = true) => {
         if (changes.url) {
             const { id: assetId, url } = await assetStore.store(changes.url);
             changes.assetId = assetId;
             changes.url = url;
         }

         set((state) => {
            const page = state.pages.find(p => p.id === state.activePageId);
            if (!page) return;
            
            const currentItem = page.history[page.currentIndex];
            
            if (createSnapshot) {
               const newLayers = structuredClone(current(currentItem.layers));
               
               const newItem: HistoryItem = {
                 ...currentItem,
                 id: crypto.randomUUID(),
                 layers: newLayers,
                 prompt: changes.name ? `Rename ${changes.name}` : "Update Layer",
                 timestamp: Date.now()
               };
               
               const target = findLayer(newItem.layers, id);
               if (target) Object.assign(target, changes);
               
               page.history.push(newItem);
               page.currentIndex = page.history.length - 1;
               
            } else {
               const target = findLayer(currentItem.layers, id);
               if (target) Object.assign(target, changes);
            }
         });
      },

      updateLayersRaw: (newLayers, message = "Update", activeLayerId) => set((state) => {
        const page = state.pages.find(p => p.id === state.activePageId);
        if (!page) return;
        pushHistory(page, message, newLayers, activeLayerId);
      }),

      deleteLayers: (ids) => set((state) => {
        const page = state.pages.find(p => p.id === state.activePageId);
        if (!page) return;

        const idsSet = new Set(ids);
        const filterRecursive = (list: Layer[]): Layer[] => {
            return list.filter(l => !idsSet.has(l.id)).map(l => ({
                ...l,
                children: l.children ? filterRecursive(l.children) : undefined
            }));
        };

        const current = page.history[page.currentIndex];
        const newLayers = filterRecursive(current.layers);
        pushHistory(page, "Delete Layers", newLayers);
      }),

      groupLayers: (selectedIds) => set((state) => {
        const page = state.pages.find(p => p.id === state.activePageId);
        if (!page) return;
        const currentLayers = page.history[page.currentIndex].layers;
        const selectedSet = new Set(selectedIds);
        
        let extracted: Layer[] = [];
        let insertIdx = -1;
        
        const filterRecursive = (list: Layer[]): Layer[] => {
            const res: Layer[] = [];
            list.forEach((l, idx) => {
                if (selectedSet.has(l.id)) {
                    extracted.push(l);
                    insertIdx = idx; 
                } else {
                    if (l.children) l.children = filterRecursive(l.children);
                    res.push(l);
                }
            });
            return res;
        };

        const layersClone = structuredClone(current(currentLayers));
        const filtered = filterRecursive(layersClone);
        
        if (extracted.length === 0) return;

        const group: Layer = {
            id: crypto.randomUUID(),
            type: 'group',
            name: 'Group',
            isVisible: true,
            opacity: 1,
            children: extracted,
            expanded: true,
            x: 0,
            y: 0
        };
        
        if (insertIdx >= 0) filtered.splice(Math.max(0, insertIdx - extracted.length + 1), 0, group);
        else filtered.push(group);

        pushHistory(page, "Group Layers", filtered, group.id);
      }),
      
      ungroupLayer: (groupId) => set((state) => {
         const page = state.pages.find(p => p.id === state.activePageId);
         if (!page) return;
         
         const ungroupRecursive = (list: Layer[]): Layer[] => {
             let res: Layer[] = [];
             for (const l of list) {
                 if (l.id === groupId && l.children) {
                     res.push(...l.children);
                 } else {
                     if (l.children) l.children = ungroupRecursive(l.children);
                     res.push(l);
                 }
             }
             return res;
         };
         
         const layersClone = structuredClone(current(page.history[page.currentIndex].layers));
         const newLayers = ungroupRecursive(layersClone);
         
         pushHistory(page, "Ungroup", newLayers);
      }),

      moveLayer: (id, direction) => set((state) => {
         const page = state.pages.find(p => p.id === state.activePageId);
         if (!page) return;

         const moveRecursive = (layers: Layer[]): boolean => {
             const index = layers.findIndex(l => l.id === id);
             if (index > -1) {
                 if (direction === 'up' && index < layers.length - 1) {
                     [layers[index], layers[index + 1]] = [layers[index + 1], layers[index]];
                     return true;
                 }
                 if (direction === 'down' && index > 0) {
                     [layers[index], layers[index - 1]] = [layers[index - 1], layers[index]];
                     return true;
                 }
                 return false;
             }
             for (const layer of layers) {
                 if (layer.children && moveRecursive(layer.children)) return true;
             }
             return false;
         };

         const currentItem = page.history[page.currentIndex];
         const layersClone = structuredClone(current(currentItem.layers));
         if (moveRecursive(layersClone)) {
             pushHistory(page, `Reorder Layer`, layersClone);
         }
      }),

      updateAnalysis: (analysis, suggestions) => set((state) => {
        const page = state.pages.find(p => p.id === state.activePageId);
        if (page) {
            const current = page.history[page.currentIndex];
            current.analysis = analysis;
            current.suggestions = suggestions;
        }
      }),

      setEditParams: (params) => set((state) => {
        state.editParams = { ...state.editParams, ...params };
      }),

      setProcessingStatus: (status, error = null) => set((state) => {
        state.processing.status = status;
        state.processing.isProcessing = status === 'generating' || status === 'planning' || status === 'critiquing';
        state.processing.error = error;
        // Clean slate for new runs
        if (status === 'generating' || status === 'planning') {
            state.processing.candidates = [];
            state.processing.selectedCandidateId = null;
        }
      }),

      setCandidates: (candidates) => set((state) => {
        state.processing.candidates = candidates;
        if (candidates.length > 0) {
            state.processing.selectedCandidateId = candidates[0].id;
        }
      }),

      selectCandidate: (id) => set((state) => {
        state.processing.selectedCandidateId = id;
      }),

      discardCandidates: () => set((state) => {
        state.processing = DEFAULT_PROCESSING;
      }),

      applySelectedCandidate: async (activeLayerId) => {
         const { selectedCandidateId, candidates } = get().processing;
         const selected = candidates.find(c => c.id === selectedCandidateId);
         if (!selected) return;

         const { id: assetId, url } = await assetStore.store(selected.url);

         set((state) => {
             const page = state.pages.find(p => p.id === state.activePageId);
             if (!page) return;

             const currentItem = page.history[page.currentIndex];
             const layersClone = structuredClone(current(currentItem.layers));

             const activeLayer = findLayer(layersClone, activeLayerId);
             const layerX = activeLayer?.x || 0;
             const layerY = activeLayer?.y || 0;

             // Always create a new layer for the result
             const newLayer: Layer = {
                 id: crypto.randomUUID(),
                 type: 'image',
                 name: state.editParams.maskBoundingBox ? 'AI Patch' : 'AI Edit',
                 assetId,
                 url,
                 isVisible: true,
                 opacity: 1,
                 x: 0,
                 y: 0,
                 // width/height will be auto-derived from image unless set
             };

             if (state.editParams.maskBoundingBox) {
                 // Patch: Place at the absolute position of the crop
                 const [ymin, xmin, ymax, xmax] = state.editParams.maskBoundingBox;
                 newLayer.x = xmin + layerX;
                 newLayer.y = ymin + layerY;
                 newLayer.width = xmax - xmin;
                 newLayer.height = ymax - ymin;
             } else {
                 // Global: Place at 0,0 (Composite origin)
                 newLayer.x = 0;
                 newLayer.y = 0;
             }

             layersClone.push(newLayer);
             pushHistory(page, `Applied ${newLayer.name}: ${state.editParams.prompt}`, layersClone, newLayer.id);

             state.processing = DEFAULT_PROCESSING;
             state.editParams.prompt = '';
             state.editParams.maskBoundingBox = undefined;
             state.editParams.sourceText = '';
             state.editParams.guideImage = null;
         });
      },

      setActiveTool: (tool) => set((state) => {
         state.activeTool = tool;
      }),

      setBrushSettings: (settings) => set((state) => {
         state.brushSettings = { ...state.brushSettings, ...settings };
      }),

    })),
    {
      name: 'scanforge-storage',
      storage: storage,
    }
  )
);