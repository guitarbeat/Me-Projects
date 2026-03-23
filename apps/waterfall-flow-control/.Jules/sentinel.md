## 2024-05-22 - CSV Import Crash
**Vulnerability:** CSV import logic was vulnerable to crashes if required columns were missing when accessing `row[index]`.
**Learning:** `row[index]` can be undefined in ragged CSVs.
**Prevention:** Use optional chaining or default values when accessing array elements, especially in data import logic.
