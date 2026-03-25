import { useState, useCallback, memo } from "react";
import { Button, Popover, PopoverTrigger, PopoverContent } from "@/components/ui";
import { Settings, Check } from "@/lib/icons/icon-imports";

export interface ModelConfig {
  provider: 'gemini' | 'openai' | 'anthropic';
  model: string;
  displayName: string;
}

const MODELS: ModelConfig[] = [
  { provider: 'gemini', model: 'gemini-1.5-flash', displayName: 'Gemini Flash' },
  { provider: 'gemini', model: 'gemini-1.5-pro', displayName: 'Gemini Pro' },
  { provider: 'openai', model: 'gpt-5-2025-08-07', displayName: 'GPT-5' },
  { provider: 'openai', model: 'gpt-5-mini-2025-08-07', displayName: 'GPT-5 Mini' },
  { provider: 'anthropic', model: 'claude-opus-4-1-20250805', displayName: 'Claude Opus' },
  { provider: 'anthropic', model: 'claude-sonnet-4-20250514', displayName: 'Claude Sonnet' },
];

interface ModelSelectorProps {
  selectedModel: ModelConfig;
  onModelChange: (model: ModelConfig) => void;
  className?: string;
}

const ModelSelectorComponent = ({ selectedModel, onModelChange, className }: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback((model: ModelConfig) => {
    onModelChange(model);
    setOpen(false);
  }, [onModelChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 px-2 gap-1.5 font-mono text-xs ${className}`}
        >
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{selectedModel.displayName}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1">
        {MODELS.map(model => {
          const isSelected = selectedModel.model === model.model;
          return (
            <button
              key={model.model}
              onClick={() => handleSelect(model)}
              className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-sm transition-colors ${
                isSelected 
                  ? 'bg-accent text-accent-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              <span>{model.displayName}</span>
              {isSelected && <Check className="h-3 w-3" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};

export const ModelSelector = memo(ModelSelectorComponent);
ModelSelector.displayName = 'ModelSelector';

export { MODELS as AI_MODELS };
