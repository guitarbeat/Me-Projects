import React, { useState, useCallback, useEffect } from 'react';
import { useStore } from './store';
import { editDocumentImage, critiqueGeneration } from './services/geminiService';
import { flattenLayers, findLayerById } from './services/layerUtils';
import { fileToBase64, cropImage, compressAndResizeImage } from './services/utils';
import { validateImageFile } from './services/security';
import ImageUploader from './components/ImageUploader';
import ComparisonView from './components/ComparisonView';
import CanvasEditor from './components/CanvasMaskEditor';
import EditorSidebar from './components/EditorSidebar';
import LayerSidebar from './components/LayerSidebar';
import ProcessingOverlay from './components/ProcessingOverlay';
import { GenerationCandidate, Layer, Page } from './types';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { 
    pages, activePageId, addPages, addLayer, updateLayer,
    editParams, setEditParams, 
    processing, setProcessingStatus, setCandidates, selectCandidate,
    hydrateAssets
  } = useStore();
  
  // Hydrate assets on mount
  useEffect(() => {
    hydrateAssets();
  }, [hydrateAssets]);
  
  // Select active state derived from store
  const activePage = pages.find(p => p.id === activePageId);
  const activeHistoryItem = activePage ? activePage.history[activePage.currentIndex] : null;
  const activeLayers = activeHistoryItem?.layers || [];
  const activeLayerId = activeHistoryItem?.activeLayerId || '';

  const [editorMode, setEditorMode] = useState<'view' | 'mask' | 'erase'>('view');

  // Initialize new page
  const handleImagesSelected = useCallback(async (images: { base64: string, file: File }[]) => {
    const newPages: Page[] = images.map((img) => {
      const layerId = crypto.randomUUID();
      const baseLayer: Layer = { 
        id: layerId, 
        type: 'image',
        name: img.file.name, 
        url: img.base64, // Store will convert this to assetId
        isVisible: true, 
        opacity: 1, 
        x: 0,
        y: 0
      };
      
      return {
        id: crypto.randomUUID(),
        name: img.file.name,
        currentIndex: 0,
        history: [{ 
           id: crypto.randomUUID(), 
           layers: [baseLayer], 
           activeLayerId: layerId,
           prompt: "Original Upload", 
           timestamp: Date.now(), 
           model: "upload" 
        }]
      };
    });
    await addPages(newPages);
  }, [addPages]);

  // Find active layer object
  const activeLayer = findLayerById(activeLayers, activeLayerId);

  const processingMessage = processing.status === 'critiquing' 
    ? 'Reviewing and critiquing your result...'
    : processing.status === 'planning'
      ? 'Planning the edit...'
      : 'Generating your edit...';

  const handleProcess = async () => {
    if (!activeHistoryItem) return;
    setProcessingStatus('generating');
    
    try {
      const compositeImage = await flattenLayers(activeLayers);
      if (!compositeImage) throw new Error("No visible layers to process");

      let finalImage = compositeImage;
      let finalParams = { ...editParams };

      // PATCH LOGIC: If a bounding box is set, crop the image first.
      if (editParams.maskBoundingBox) {
         const layerX = activeLayer?.x || 0;
         const layerY = activeLayer?.y || 0;
         
         const [ymin, xmin, ymax, xmax] = editParams.maskBoundingBox;
         
         // Absolute coordinates on the composite canvas
         const absY1 = ymin + layerY;
         const absX1 = xmin + layerX;
         const absY2 = ymax + layerY;
         const absX2 = xmax + layerX;
         
         // Use absolute box to crop the composite
         finalImage = await cropImage(compositeImage, [absY1, absX1, absY2, absX2]);
         
         // Clear bbox from params sent to backend (we already cropped locally for the API call)
         finalParams.maskBoundingBox = undefined; 
      }

      const results = await editDocumentImage(finalImage, finalParams);
      
      const candidates: GenerationCandidate[] = results.map(r => ({
          id: crypto.randomUUID(),
          url: r.url,
          debugPrompt: r.debugPrompt
      }));
      
      setCandidates(candidates);
      setProcessingStatus('reviewing');
    } catch (e: any) {
      setProcessingStatus('idle', e.message || "Generation failed");
    }
  };

  const handleCritique = async () => {
    if (processing.candidates.length === 0 || !activeHistoryItem) return;
    
    const previousStatus = processing.status;
    setProcessingStatus('critiquing');

    try {
      let contextImage = await flattenLayers(activeLayers);
      if (editParams.maskBoundingBox) {
         const layerX = activeLayer?.x || 0;
         const layerY = activeLayer?.y || 0;
         const [ymin, xmin, ymax, xmax] = editParams.maskBoundingBox;
         contextImage = await cropImage(contextImage, [ymin + layerY, xmin + layerX, ymax + layerY, xmax + layerX]);
      }

      // Send all candidates for batch analysis
      const candidateUrls = processing.candidates.map(c => c.url);
      const result = await critiqueGeneration(contextImage, candidateUrls, editParams.prompt);
      
      // Update ALL candidates with the combined critique and refined prompts
      const updatedCandidates = processing.candidates.map(c => ({ 
        ...c, 
        critique: result.critique, 
        refinedPrompts: result.refinedPrompts 
      }));
      
      setCandidates(updatedCandidates);
      
      // Preserve selection or default to first
      if (processing.selectedCandidateId) {
          selectCandidate(processing.selectedCandidateId);
      } else if (updatedCandidates.length > 0) {
          selectCandidate(updatedCandidates[0].id);
      }
      
      setProcessingStatus(previousStatus);
    } catch (e) {
      setProcessingStatus(previousStatus, "Critique failed");
    }
  };

  const handleManualEditSave = (dataUrl: string, bbox?: number[]) => {
    if (editorMode === 'mask') {
      setEditParams({ 
          guideImage: null, 
          maskBoundingBox: bbox 
      });
    } else {
      updateLayer(activeLayerId, { url: dataUrl });
    }
    setEditorMode('view');
  };

  const handleLayerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     try {
        await validateImageFile(file);
     } catch (err: any) {
        alert(err.message);
        e.target.value = '';
        return;
     }

     const url = await fileToBase64(file); // Store handles asset conversion
     addLayer({ 
         id: crypto.randomUUID(), 
         type: 'image',
         name: file.name, 
         url, 
         isVisible: true, 
         opacity: 1, 
         x: 0, 
         y: 0 
     });
     e.target.value = '';
  };

  const handleSidebarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files: File[] = e.target.files ? Array.from(e.target.files) : [];
      if (files.length === 0) return;
      
      try {
        const processed = await Promise.all(files.map(async (file) => {
           await validateImageFile(file);
           // Standardize resolution for AI processing
           const base64 = await compressAndResizeImage(file, 2560);
           return { base64, file };
        }));
        
        handleImagesSelected(processed);
      } catch (err: any) {
        console.error("Failed to process sidebar upload", err);
        alert(err.message);
      } finally {
        e.target.value = '';
      }
  };

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 p-8">
        <div className="max-w-xl w-full text-center space-y-10">
           <div>
             <h1 className="text-3xl font-bold tracking-tighter text-white">ScanForge</h1>
             <p className="text-zinc-400">AI Document Restoration & Editing</p>
           </div>
           <ImageUploader onImagesSelected={handleImagesSelected} />
        </div>
      </div>
    );
  }

  // Calculation for preview placement
  const getPreviewLayer = () => {
    if (!processing.selectedCandidateId || !editParams.maskBoundingBox) return null;
    
    const layerX = activeLayer?.x || 0;
    const layerY = activeLayer?.y || 0;
    const [ymin, xmin, ymax, xmax] = editParams.maskBoundingBox;
    const width = xmax - xmin;
    const height = ymax - ymin;
    
    return { 
       id: 'preview-patch', 
       type: 'image' as const, 
       name: 'Preview', 
       url: processing.candidates.find(c => c.id === processing.selectedCandidateId)?.url || '', 
       isVisible: true, 
       opacity: 1, 
       x: xmin + layerX, 
       y: ymin + layerY,
       width,
       height
    };
  };
  
  const getDisplayLayers = () => {
      if (processing.status === 'reviewing' || processing.status === 'critiquing') {
          const candidateUrl = processing.candidates.find(c => c.id === processing.selectedCandidateId)?.url;
          
          if (editParams.maskBoundingBox) {
              // Patch mode: Overlay patch on existing stack
              return [...activeLayers, getPreviewLayer()!].filter(Boolean);
          } else if (candidateUrl) {
              // Global mode: Overlay result on top (it should cover everything if opaque)
              return [...activeLayers, {
                  id: 'preview-global',
                  type: 'image' as const,
                  name: 'Preview',
                  url: candidateUrl,
                  isVisible: true,
                  opacity: 1,
                  x: 0,
                  y: 0
              }];
          }
      }
      return activeLayers;
  };

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden text-zinc-200 font-sans">
      <EditorSidebar
        activeHistoryItem={activeHistoryItem}
        activeLayers={activeLayers}
        activeLayerId={activeLayerId}
        onNewPage={() => document.getElementById('sidebar-upload')?.click()}
        handleProcess={handleProcess}
        setMode={setEditorMode}
      />
      
      {/* Hidden inputs for uploads */}
      <input type="file" id="sidebar-upload" className="hidden" accept="image/*" multiple onChange={handleSidebarUpload} />
      <input type="file" id="layer-upload" className="hidden" accept="image/*" onChange={handleLayerUpload} />

      <main className="flex-1 relative bg-zinc-900/50 flex flex-col min-w-0">
        {processing.isProcessing && (
          <ProcessingOverlay status={processing.status} message={processingMessage} />
        )}
        {editorMode !== 'view' && activeLayer && activeLayer.type === 'image' && activeLayer.url ? (
          <CanvasEditor
            imageUrl={activeLayer.url}
            mode={editorMode as 'mask' | 'erase'}
            onSave={handleManualEditSave}
            onCancel={() => setEditorMode('view')}
          />
        ) : activeHistoryItem ? (
           <ComparisonView 
              originalLayers={activePage?.history[0].layers || []} 
              currentLayers={getDisplayLayers()}
              activeLayerId={activeLayerId}
              onLayerUpdate={updateLayer}
           />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500 gap-2"><Loader2 className="animate-spin w-5 h-5"/></div>
        )}
      </main>

      <LayerSidebar 
        activeLayers={activeLayers}
        activeLayerId={activeLayerId}
        onAddLayer={() => document.getElementById('layer-upload')?.click()}
        handleCritique={handleCritique}
      />
    </div>
  );
}
