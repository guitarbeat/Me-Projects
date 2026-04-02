export interface FieldMapping {
  date: number | null;
  name: number | null;
  person: number | null;
  inflow: number | null;
  outflow: number | null;
  enabled: number | null;
}

export interface ImportOptions {
  skipFirstRow: boolean;
  enableAllByDefault: boolean;
}

export interface FieldConfig {
  label: string;
  icon: any;
  description: string;
  required: boolean;
  color: string;
  detectionPatterns: string[];
  dataType: 'date' | 'text' | 'number' | 'boolean';
}

export type FieldKey = keyof FieldMapping;
