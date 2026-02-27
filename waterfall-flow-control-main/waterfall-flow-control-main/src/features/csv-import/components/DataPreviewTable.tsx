import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FieldMapping, FieldKey } from '../types';
import { FIELD_CONFIG } from '../utils/fieldConfig';

interface DataPreviewTableProps {
  previewData: string[][];
  mapping: FieldMapping;
}

export function DataPreviewTable({
  previewData,
  mapping,
}: DataPreviewTableProps) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="min-w-max">
        <table className="w-full divide-y divide-border">
          <thead className="bg-muted sticky top-0 z-10">
            <tr>
              {(Object.keys(FIELD_CONFIG) as FieldKey[]).map(field => {
                const config = FIELD_CONFIG[field];
                const Icon = config.icon;
                const isMapped = mapping[field] !== null;

                return (
                  <th
                    key={field}
                    className={cn(
                      'px-3 py-2 text-left text-xs font-medium uppercase tracking-wider border-r last:border-r-0 w-[140px]',
                      isMapped ? 'bg-primary/10' : ''
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon
                        className={cn('h-3 w-3 flex-shrink-0', config.color)}
                      />
                      <span className="truncate">{config.label}</span>
                      {isMapped && (
                        <Badge
                          variant="secondary"
                          className="h-4 text-[10px] px-1 flex-shrink-0"
                        >
                          Col {(mapping[field] ?? 0) + 1}
                        </Badge>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {previewData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-muted/30 transition-colors"
              >
                {(Object.keys(FIELD_CONFIG) as FieldKey[]).map(field => {
                  const colIndex = mapping[field];
                  const value = colIndex !== null ? row[colIndex] : null;

                  return (
                    <td
                      key={field}
                      className="px-3 py-2 text-xs border-r last:border-r-0 w-[140px]"
                    >
                      {value ? (
                        <div className="font-mono truncate" title={value}>
                          {value}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
