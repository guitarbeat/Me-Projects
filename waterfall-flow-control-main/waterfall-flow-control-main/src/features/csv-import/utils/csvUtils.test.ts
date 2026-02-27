import { describe, it, expect } from 'vitest';
import { generateCSVContent, parseCSVWithMapping } from './csvUtils';
import { Transaction } from '@/types';

describe('generateCSVContent', () => {
  it('should generate valid CSV for normal transactions', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2023-01-01',
        name: 'Grocery',
        person: 'John',
        inflow: 0,
        outflow: 100,
        enabled: true,
        created_at: '',
        updated_at: '',
        balance: 0,
        user_id: 'user1',
      },
    ];

    const csv = generateCSVContent(transactions);
    expect(csv).toContain('"Grocery"');
    expect(csv).toContain('2023-01-01');
    expect(csv).toContain('"John"');
  });

  it('should escape quotes in content', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2023-01-01',
        name: 'My "Special" Item',
        person: 'John',
        inflow: 0,
        outflow: 100,
        enabled: true,
        created_at: '',
        updated_at: '',
        balance: 0,
        user_id: 'user1',
      },
    ];

    const csv = generateCSVContent(transactions);
    expect(csv).toContain('"My ""Special"" Item"');
  });

  it('should escape malicious characters (security fix)', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2023-01-01',
        name: '=1+1',
        person: '+Dangerous',
        inflow: 0,
        outflow: 100,
        enabled: true,
        created_at: '',
        updated_at: '',
        balance: 0,
        user_id: 'user1',
      },
    ];

    const csv = generateCSVContent(transactions);
    // Expect the characters to be escaped with a single quote
    expect(csv).toContain('"\'=1+1"');
    expect(csv).toContain('"\'+Dangerous"');
  });
});

describe('parseCSVWithMapping', () => {
  it('should truncate long fields to 100 characters', () => {
    const longString = 'a'.repeat(150);
    const expectedString = 'a'.repeat(100);

    const csvData = [
      ['Date', 'Name', 'Person', 'Inflow', 'Outflow', 'Enabled'],
      ['2023-01-01', longString, longString, '0', '100', 'true'],
    ];

    const mapping = {
      date: 0,
      name: 1,
      person: 2,
      inflow: 3,
      outflow: 4,
      enabled: 5,
    };

    const options = {
      skipFirstRow: true,
      enableAllByDefault: true,
    };

    const result = parseCSVWithMapping(csvData, mapping, options);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe(expectedString);
    expect(result[0].person).toBe(expectedString);
    expect(result[0].name.length).toBe(100);
    expect(result[0].person.length).toBe(100);
  });

  it('should handle missing columns gracefully without crashing', () => {
    const csvData = [
      ['Date', 'Name'], // Missing other columns
      ['2023-01-01', 'Grocery'],
    ];

    const mapping = {
      date: 0,
      name: 1,
      person: 2, // Index 2 doesn't exist in data
      inflow: 3,
      outflow: 4,
      enabled: 5,
    };

    const options = {
      skipFirstRow: true,
      enableAllByDefault: true,
    };

    const result = parseCSVWithMapping(csvData, mapping, options);

    // Should skip the row because 'person' is required but missing
    expect(result).toHaveLength(0);
  });
});
