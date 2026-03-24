import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldKey, FieldMapping } from '../types';
import { FIELD_CONFIG } from '../utils/fieldConfig';

interface FieldMappingCardProps {
  field: FieldKey;
  mapping: FieldMapping;
  columnOptions: { value: number; label: string; preview: string }[];
  onMappingChange: (field: FieldKey, value: number | null) => void;
}

export function FieldMappingCard({
  field,
  mapping,
  columnOptions,
  onMappingChange,
}: FieldMappingCardProps) {
  const config = FIELD_CONFIG[field];
  const Icon = config.icon;
  const isMapped = mapping[field] !== null;
  const mappedValue = mapping[field];
  const preview =
    mappedValue !== null ? columnOptions[mappedValue]?.preview : null;

  return (
    <div
      className={cn(
        'bg-card p-4 rounded-lg border-2 transition-all',
        isMapped ? 'border-primary/50 bg-primary/5 shadow-sm' : 'border-border'
      )}
    >
      <div className="space-y-3">
        {/* Field Header */}
        <div className="flex items-start gap-3">
          <div className={cn('mt-0.5 flex-shrink-0', config.color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Label className="font-semibold text-sm">{config.label}</Label>
              {config.required && (
                <Badge variant="secondary" className="h-5 text-xs">
                  Required
                </Badge>
              )}
              {isMapped && (
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {config.description}
            </p>
          </div>
        </div>

        {/* Mapping Selector */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <Select
              value={mapping[field]?.toString() ?? 'none'}
              onValueChange={value =>
                onMappingChange(
                  field,
                  value === 'none' ? null : parseInt(value)
                )
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select column..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">Not mapped</span>
                </SelectItem>
                {columnOptions.map(option => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{option.label}</span>
                      {option.preview && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          e.g., {option.preview}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview of mapped data */}
          {preview && (
            <div className="bg-muted/50 rounded px-3 py-2 border">
              <p className="text-xs text-muted-foreground mb-0.5">Preview:</p>
              <p className="text-sm font-mono truncate">{preview}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
