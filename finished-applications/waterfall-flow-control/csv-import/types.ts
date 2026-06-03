export interface CSVFieldMapping {
  date: number | null;
  name: number | null;
  person: number | null;
  inflow: number | null;
  outflow: number | null;
  enabled: number | null;
}

export interface CSVImportOptions {
  skipFirstRow: boolean;
  enableAllByDefault: boolean;
}

export interface CSVFieldConfig {
  label: string;
  icon: any;
  description: string;
  required: boolean;
  color: string;
  detectionPatterns: string[];
  dataType: 'date' | 'text' | 'number' | 'boolean';
}

export type CSVFieldKey = keyof CSVFieldMapping;
