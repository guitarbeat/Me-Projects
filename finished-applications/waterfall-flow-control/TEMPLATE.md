# Dashboard Template & Features Library

This project is structured as a **reusable template** and **features library**. The features (`transactions`, `charts`, and `csv-import`) are designed to be completely self-contained and modular. You can easily port any of these features into another React, TypeScript, and Tailwind CSS application by following the guidelines below.

---

## 📂 Feature Directory Map

```text
src/features/
├── transactions/                 # Transactions Feature (100% self-contained)
│   ├── components/               # Presentation elements (Form, Row, Swipeable Cards, DataTable)
│   ├── data/                     # Mock data seed generators
│   ├── hooks/                    # Business logic (filtering, sorting, stats calculation, state)
│   ├── types.ts                  # Domain models (Transaction, Chart)
│   └── index.ts                  # Entrypoint (exports all public hooks, components, types)
│
├── charts/                       # Interactive Charts Feature (depends on transactions types)
│   ├── components/               # SankeyChart, WaterfallChart, ChartSelector, ChartsSection
│   ├── utils/                    # SVG-to-PNG export, D3 layout processors, color scales
│   └── index.ts                  # Entrypoint (exports ChartsSection, charts)
│
└── csv-import/                   # Smart CSV Importer Feature (depends on transactions types)
    ├── components/               # CSVMappingDialog, FieldMappingCard, DataPreviewTable
    ├── hooks/                    # useCSVImport workflow hook
    ├── utils/                    # Parsers, auto-mappers, and header detection engines
    ├── types.ts                  # Feature mapping schemas
    └── index.ts                  # Entrypoint (exports CSVMappingDialog, useCSVImport)
```

---

## 🛠 Prerequisites for Porting Features

To copy any feature into a new React application, ensure your target project has the following base setup:

### 1. Tailwind CSS Class Utility (`cn`)
All components use the standard class-merging helper. Place this utility in your project (e.g., `src/lib/utils.ts`):
```typescript
import { clsx, type ClassValue } from "clsx"
import { merge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return merge(clsx(inputs))
}
```

### 2. Required Packages
Install the core dependencies used by the features:
```bash
# Core styling & icons
npm install lucide-react clsx tailwind-merge framer-motion sonner

# Transactions & Tables
npm install react-hook-form @hookform/resolvers zod

# Charts (Recharts & D3)
npm install recharts d3 d3-sankey
npm install --save-dev @types/d3 @types/d3-sankey
```

### 3. Tailwind CSS Theme Config
Ensure your `tailwind.config.js` or `tailwind.config.ts` includes shadcn-compatible variables (for borders, backgrounds, inputs) and custom animations:
```typescript
// Required keyframes in tailwind.config.ts:
theme: {
  extend: {
    keyframes: {
      "fade-in": {
        "0%": { opacity: "0", transform: "translateY(4px)" },
        "100%": { opacity: "1", transform: "translateY(0)" }
      },
      "fade-up": {
        "0%": { opacity: "0", transform: "translateY(10px)" },
        "100%": { opacity: "1", transform: "translateY(0)" }
      }
    },
    animation: {
      "fade-in": "fade-in 0.3s ease-out forwards",
      "fade-up": "fade-up 0.4s ease-out forwards"
    }
  }
}
```

---

## 🚀 How to Port a Feature

### Step 1: Copy the Feature Folder
Simply copy the desired folder from `src/features/` into the `src/features/` directory of your target project.

### Step 2: Resolve Imports
* Absolute alias `@/` is configured to point to your target project's `src/` folder.
* Sibling imports within the copied features are fully relative (e.g. `import { x } from '../hooks/y'`), ensuring that the feature runs autonomously.

### Step 3: Render on a Page
Import the components/hooks directly from the feature's entrypoint index:
```tsx
import { 
  useTransactions, 
  useTransactionFilters, 
  DataTable 
} from "@/features/transactions";

export default function MyPage() {
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  
  return (
    <div>
      <DataTable 
        transactions={transactions} 
        onAdd={addTransaction}
        onDelete={deleteTransaction}
      />
    </div>
  );
}
```
