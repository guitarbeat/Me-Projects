import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FieldMapping, ImportOptions, FieldKey } from '../types';
import { FIELD_CONFIG, REQUIRED_FIELDS } from '../utils/fieldConfig';
import { autoDetectMapping } from '../utils/autoDetection';
import { FieldMappingCard } from './FieldMappingCard';
import { DataPreviewTable } from './DataPreviewTable';

interface CSVMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  csvData: string[][];
  onConfirm: (mapping: FieldMapping, options: ImportOptions) => void;
}

export function CSVMappingDialog({
  open,
  onOpenChange,
  csvData,
  onConfirm,
}: CSVMappingDialogProps) {
  const [skipFirstRow, setSkipFirstRow] = useState(true);
  const [enableAllByDefault, setEnableAllByDefault] = useState(true);
  const [mapping, setMapping] = useState<FieldMapping>({
    date: null,
    name: null,
    person: null,
    inflow: null,
    outflow: null,
    enabled: null,
  });

  // Auto-detect column mappings when dialog opens or options change
  useEffect(() => {
    if (csvData.length > 0 && open) {
      const detectedMapping = autoDetectMapping(csvData, skipFirstRow);
      setMapping(detectedMapping);
    }
  }, [csvData, skipFirstRow, open]);

  const previewData = useMemo(() => {
    const startIndex = skipFirstRow ? 1 : 0;
    return csvData.slice(startIndex, startIndex + 10);
  }, [csvData, skipFirstRow]);

  const columnOptions = useMemo(() => {
    if (csvData.length === 0) return [];
    const headers = skipFirstRow
      ? csvData[0]
      : csvData[0].map((_, i) => `Column ${i + 1}`);
    const startIndex = skipFirstRow ? 1 : 0;
    const firstDataRow = csvData[startIndex] || [];

    return headers.map((header, index) => ({
      value: index,
      label: `${header} (Col ${index + 1})`,
      preview: firstDataRow[index] || '',
    }));
  }, [csvData, skipFirstRow]);

  const mappedFieldsCount = useMemo(() => {
    return Object.values(mapping).filter(v => v !== null).length;
  }, [mapping]);

  const isValid = useMemo(() => {
    return REQUIRED_FIELDS.every(field => mapping[field] !== null);
  }, [mapping]);

  const validationMessages = useMemo(() => {
    const messages: string[] = [];
    REQUIRED_FIELDS.forEach(field => {
      if (mapping[field] === null) {
        messages.push(`${FIELD_CONFIG[field].label} is required`);
      }
    });
    return messages;
  }, [mapping]);

  const handleMappingChange = (field: FieldKey, value: number | null) => {
    setMapping(prev => ({ ...prev, [field]: value }));
  };

  const handleResetMapping = () => {
    const detectedMapping = autoDetectMapping(csvData, skipFirstRow);
    setMapping(detectedMapping);
  };

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(mapping, { skipFirstRow, enableAllByDefault });
  };

  const totalRows = skipFirstRow ? csvData.length - 1 : csvData.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[1100px] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Map CSV Columns</DialogTitle>
              <DialogDescription className="mt-1">
                Configure how your CSV data maps to transaction fields
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {mappedFieldsCount} / {Object.keys(FIELD_CONFIG).length} mapped
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetMapping}
                className="h-8"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Auto-detect
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Left Panel - Field Mapping */}
          <div className="w-full lg:w-[380px] border-r bg-muted/20">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Import Options */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Import Options
                  </h3>
                  <div className="space-y-3 bg-card p-4 rounded-lg border">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="skip-first-row"
                        checked={skipFirstRow}
                        onCheckedChange={checked =>
                          setSkipFirstRow(checked as boolean)
                        }
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="skip-first-row"
                          className="text-sm cursor-pointer font-medium"
                        >
                          First row contains headers
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Skip the first row during import
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="enable-all"
                        checked={enableAllByDefault}
                        onCheckedChange={checked =>
                          setEnableAllByDefault(checked as boolean)
                        }
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="enable-all"
                          className="text-sm cursor-pointer font-medium"
                        >
                          Enable all transactions
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          All imported transactions will be active
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Field Mapping */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Field Mapping
                  </h3>
                  <div className="space-y-3">
                    {(Object.keys(FIELD_CONFIG) as FieldKey[]).map(field => (
                      <FieldMappingCard
                        key={field}
                        field={field}
                        mapping={mapping}
                        columnOptions={columnOptions}
                        onMappingChange={handleMappingChange}
                      />
                    ))}
                  </div>
                </div>

                {/* Validation Messages */}
                {validationMessages.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        {validationMessages.map((msg, i) => (
                          <li key={i}>{msg}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {isValid && (
                  <Alert className="bg-primary/10 border-primary/20">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-xs">
                      Ready to import {totalRows} transaction
                      {totalRows !== 1 ? 's' : ''}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Data Preview */}
          <div className="flex-1 flex flex-col">
            <div className="px-6 py-4 border-b bg-muted/10">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Data Preview
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Showing first {previewData.length} of {totalRows} rows
              </p>
            </div>
            <DataPreviewTable previewData={previewData} mapping={mapping} />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/10">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-muted-foreground">
              {isValid ? (
                <span className="flex items-center gap-1.5 text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  All required fields mapped
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {validationMessages.length} required{' '}
                  {validationMessages.length === 1 ? 'field' : 'fields'} missing
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={!isValid}>
                Import {totalRows} Transaction{totalRows !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
