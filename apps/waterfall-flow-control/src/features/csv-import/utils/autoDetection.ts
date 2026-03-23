import { FieldMapping, FieldKey } from '../types';
import { FIELD_CONFIG } from './fieldConfig';

// Detect if a value looks like a date
function looksLikeDate(value: string): boolean {
  if (!value || value.trim() === '') return false;

  // Try parsing as date
  const date = new Date(value);
  if (!isNaN(date.getTime())) return true;

  // Check for common date patterns
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}/, // DD-MM-YYYY
    /^\d{1,2}\/\d{1,2}\/\d{2,4}/, // M/D/YY or M/D/YYYY
  ];

  return datePatterns.some(pattern => pattern.test(value));
}

// Detect if a value looks like a number
function looksLikeNumber(value: string): boolean {
  if (!value || value.trim() === '') return false;

  // Remove common currency symbols and formatting
  const cleaned = value.replace(/[$€£¥,\s]/g, '');

  // Check if it's a valid number
  return !isNaN(parseFloat(cleaned)) && isFinite(parseFloat(cleaned));
}

// Detect if a value looks like a boolean
function looksLikeBoolean(value: string): boolean {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  return [
    'true',
    'false',
    'yes',
    'no',
    '1',
    '0',
    'on',
    'off',
    'enabled',
    'disabled',
  ].includes(lower);
}

// Analyze column data to determine type
function analyzeColumnData(
  columnIndex: number,
  csvData: string[][],
  skipFirstRow: boolean
): {
  dateScore: number;
  numberScore: number;
  booleanScore: number;
} {
  const startIndex = skipFirstRow ? 1 : 0;
  const sampleSize = Math.min(10, csvData.length - startIndex);

  let dateCount = 0;
  let numberCount = 0;
  let booleanCount = 0;

  for (let i = startIndex; i < startIndex + sampleSize; i++) {
    const value = csvData[i]?.[columnIndex] || '';
    if (value.trim() === '') continue;

    if (looksLikeDate(value)) dateCount++;
    if (looksLikeNumber(value)) numberCount++;
    if (looksLikeBoolean(value)) booleanCount++;
  }

  return {
    dateScore: dateCount / sampleSize,
    numberScore: numberCount / sampleSize,
    booleanScore: booleanCount / sampleSize,
  };
}

// Auto-detect column mappings based on headers and data
export function autoDetectMapping(
  csvData: string[][],
  skipFirstRow: boolean
): FieldMapping {
  if (csvData.length === 0) {
    return {
      date: null,
      name: null,
      person: null,
      inflow: null,
      outflow: null,
      enabled: null,
    };
  }

  const headers = csvData[0].map(h => h.toLowerCase().trim());
  const mapping: FieldMapping = {
    date: null,
    name: null,
    person: null,
    inflow: null,
    outflow: null,
    enabled: null,
  };

  // First pass: Match by header names
  headers.forEach((header, index) => {
    (Object.keys(FIELD_CONFIG) as FieldKey[]).forEach(fieldKey => {
      const config = FIELD_CONFIG[fieldKey];

      // Check if header matches any detection pattern
      const matches = config.detectionPatterns.some(pattern =>
        header.includes(pattern.toLowerCase())
      );

      if (matches && mapping[fieldKey] === null) {
        mapping[fieldKey] = index;
      }
    });
  });

  // Second pass: Analyze data content for unmapped fields
  if (csvData.length > 1) {
    headers.forEach((_header, index) => {
      // Skip if already mapped
      if (Object.values(mapping).includes(index)) return;

      const analysis = analyzeColumnData(index, csvData, skipFirstRow);

      // Try to map based on data analysis
      if (analysis.dateScore > 0.7 && mapping.date === null) {
        mapping.date = index;
      } else if (analysis.booleanScore > 0.7 && mapping.enabled === null) {
        mapping.enabled = index;
      } else if (analysis.numberScore > 0.7) {
        // Prioritize inflow/outflow for number columns
        if (mapping.inflow === null) {
          mapping.inflow = index;
        } else if (mapping.outflow === null) {
          mapping.outflow = index;
        }
      }
    });
  }

  return mapping;
}
