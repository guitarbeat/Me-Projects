

export interface ProcessedImage {
  originalUrl: string;
  processedUrl: string | null;
  prompt: string;
}

export interface GenerationCandidate {
  id: string;
  url: string;
  debugPrompt?: string;
  critique?: string;
  refinedPrompts?: string[];
}

export interface ProcessingState {
  isProcessing: boolean;
  status: 'idle' | 'planning' | 'generating' | 'reviewing' | 'critiquing';
  error: string | null;
  candidates: GenerationCandidate[];
  selectedCandidateId: string | null;
}

export interface Layer {
  id: string;
  assetId?: string; // Reference to stored blob
  type: 'image' | 'group';
  name: string;
  url?: string; // Blob URL for display (transient)
  children?: Layer[]; // Required if type is 'group'
  isVisible: boolean;
  opacity: number; // 0 to 1
  expanded?: boolean; // For group UI state
  blendMode?: string; // reserved for future use
  x: number;
  y: number;
  width?: number;
  height?: number;
  // Transforms
  rotation?: number; // degrees
  scaleX?: number;
  scaleY?: number;
  locked?: boolean;
}

export interface HistoryItem {
  id: string;
  layers: Layer[];
  activeLayerId: string;
  prompt: string;
  timestamp: number;
  model: string;
  analysis?: string | null;
  suggestions?: string[];
}

export interface Page {
  id: string;
  name: string;
  history: HistoryItem[];
  currentIndex: number;
}

export interface EditState {
  prompt: string;
  guideImage?: string | null; // Keep for UI preview
  maskBoundingBox?: number[]; // [ymin, xmin, ymax, xmax] in pixels (layer-relative coordinates)
  sourceText?: string;
  locationHint?: string;
  model?: string;
  variationCount?: number;
}