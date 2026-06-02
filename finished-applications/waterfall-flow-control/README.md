# Features Library & UI Templates

A clean, modular repository of advanced cash flow visualization features and premium UI components, prepared for direct porting and integration.

## 📂 Feature Directories

This workspace is organized into self-contained features and layouts:

* **`src/features/transactions/`**: Cash flow ledger containing the smart `DataTable`, filtering logic, statistics calculation, swipeable mobile card lists, and transaction creation forms.
* **`src/features/charts/`**: D3-powered cash flow visualization components including the custom **SankeyChart**, **WaterfallChart**, and a SVG-to-PNG chart exporter.
* **`src/features/csv-import/`**: A smart CSV mapping wizard with auto-header detection, field alignment cards, data preview tables, and parser logic.
* **`src/components/ui/`**: Premium, custom UI components and layout systems (such as `split-layout`, `ambient-background`, `stagger`, `currency`, `sparkline`, `stack`, `loading`, etc.).

---

## 🚀 Porting Guidelines

For detailed instructions on dependencies, Tailwind configuration settings, and copy-paste steps to integrate these features into another application (e.g. `HousingCost`), please refer to:

👉 **[TEMPLATE.md](./TEMPLATE.md)**

---

## 🛠️ Local Development

To run the local reference server:

```bash
# Install dependencies
npm install

# Start Vite reference server
npm run dev
```
