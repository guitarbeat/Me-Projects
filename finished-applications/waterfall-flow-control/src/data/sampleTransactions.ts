import type { Transaction } from '@/types';
import { formatDateToYYYYMMDD } from '@/lib';

const generateId = () => crypto.randomUUID();

// Get dates relative to today for realistic demo data
const getDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatDateToYYYYMMDD(date);
};

export const createSampleTransactions = (): Transaction[] => {
  const now = new Date().toISOString();

  return [
    {
      id: generateId(),
      date: getDate(30),
      name: 'Monthly Salary',
      inflow: 5000,
      outflow: 0,
      person: 'Aaron Woods',
      enabled: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(),
      date: getDate(28),
      name: 'Rent Payment',
      inflow: 0,
      outflow: 1500,
      person: 'Aaron Woods',
      enabled: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(),
      date: getDate(25),
      name: 'Freelance Project',
      inflow: 1200,
      outflow: 0,
      person: 'Yvonne Bledsoe',
      enabled: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(),
      date: getDate(20),
      name: 'Groceries',
      inflow: 0,
      outflow: 320,
      person: 'Brandon',
      enabled: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(),
      date: getDate(15),
      name: 'Utility Bills',
      inflow: 0,
      outflow: 180,
      person: 'Aaron Woods',
      enabled: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(),
      date: getDate(12),
      name: 'Client Payment',
      inflow: 2500,
      outflow: 0,
      person: 'Yvonne Bledsoe',
      enabled: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(),
      date: getDate(10),
      name: 'Quarterly Tax Payment',
      inflow: 0,
      outflow: 800,
      person: 'IRS/Other',
      enabled: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(),
      date: getDate(7),
      name: 'Subscription Services',
      inflow: 0,
      outflow: 50,
      person: 'Brandon',
      enabled: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(),
      date: getDate(5),
      name: 'Bonus',
      inflow: 750,
      outflow: 0,
      person: 'Aaron Woods',
      enabled: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(),
      date: getDate(2),
      name: 'Restaurant & Entertainment',
      inflow: 0,
      outflow: 150,
      person: 'Brandon',
      enabled: false, // One disabled to show the feature
      created_at: now,
      updated_at: now,
    },
  ];
};
