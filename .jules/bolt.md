## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.
## 2024-03-24 - The Hidden Cost of toISOString()

**Learning:** Using `new Date().toISOString().split('T')[0]` inside loops for local date formatting is not only a performance bottleneck (~10x slower than string concatenation due to internal conversion and array allocation), but it also introduces subtle, time-zone dependent bugs where dates shift by one day in timezones with negative UTC offsets.
**Action:** Replace `toISOString().split('T')[0]` with explicit local date string builders (e.g., extracting year, month, date directly) when formatting local YYYY-MM-DD strings.
