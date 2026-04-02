import { Transaction } from '@/types';

export const generateCSVContent = (transactions: Transaction[]): string => {
  const headers = ['Date', 'Name', 'Person', 'Inflow', 'Outflow', 'Enabled'];

  // Helper to escape CSV injection (Formula Injection)
  // If a field starts with =, +, -, @, tab or carriage return, it can be executed as a formula in Excel
  const escapeField = (value: string): string => {
    if (/^[=+\-@\t\r]/.test(value)) {
      return `'${value}`;
    }
    return value;
  };

  return [
    headers.join(','),
    ...transactions.map(t =>
      [
        t.date,
        `"${escapeField(t.name).replace(/"/g, '""')}"`, // Escape quotes in names
        `"${escapeField(t.person).replace(/"/g, '""')}"`,
        t.inflow.toString(),
        t.outflow.toString(),
        t.enabled ? 'true' : 'false',
      ].join(',')
    ),
  ].join('\n');
};

export const exportToCSV = (
  transactions: Transaction[],
  filename: string = 'transactions.csv'
) => {
  const csvContent = generateCSVContent(transactions);

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSVToArray = (csvText: string): string[][] => {
  const lines = csvText.trim().split('\n');
  const result: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    result.push(values);
  }

  return result;
};

interface FieldMapping {
  date: number | null;
  name: number | null;
  person: number | null;
  inflow: number | null;
  outflow: number | null;
  enabled: number | null;
}

interface ImportOptions {
  skipFirstRow: boolean;
  enableAllByDefault: boolean;
}

export const parseCSVWithMapping = (
  csvData: string[][],
  mapping: FieldMapping,
  options: ImportOptions
): Omit<Transaction, 'id' | 'balance'>[] => {
  const transactions: Omit<Transaction, 'id' | 'balance'>[] = [];
  const startIndex = options.skipFirstRow ? 1 : 0;

  for (let i = startIndex; i < csvData.length; i++) {
    const row = csvData[i];

    // Extract mapped fields
    const date = mapping.date !== null ? row[mapping.date]?.trim() : '';
    const name =
      mapping.name !== null
        ? (row[mapping.name]?.trim() || '').substring(0, 100)
        : '';
    const person =
      mapping.person !== null
        ? (row[mapping.person]?.trim() || '').substring(0, 100)
        : '';
    const inflowStr =
      mapping.inflow !== null ? row[mapping.inflow]?.trim() : '0';
    const outflowStr =
      mapping.outflow !== null ? row[mapping.outflow]?.trim() : '0';
    const enabledStr =
      mapping.enabled !== null ? row[mapping.enabled]?.trim() : '';

    // Validate required fields
    if (!date || !name || !person) {
      console.warn(`Skipping row ${i + 1}: missing required fields`);
      continue;
    }

    transactions.push({
      date,
      name,
      person,
      inflow: parseFloat(inflowStr) || 0,
      outflow: parseFloat(outflowStr) || 0,
      enabled: enabledStr
        ? enabledStr.toLowerCase() === 'true'
        : options.enableAllByDefault,
    });
  }

  return transactions;
};

export const importCSVFile = (file: File): Promise<string[][]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const text = e.target?.result as string;
        const csvData = parseCSVToArray(text);
        resolve(csvData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};
