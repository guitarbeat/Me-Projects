## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.

## 2024-05-30 - [Timezone Bug & Performance: toISOString Object Allocation]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` inside loops is both a performance bottleneck (unnecessary Date allocations and string manipulation) and a source of subtle timezone bugs (toISOString converts to UTC, shifting dates backwards for users east of UTC).
**Action:** Use a centralized helper like `formatLocalDate(date: Date): string` that manually pads `getFullYear`, `getMonth() + 1`, and `getDate()` to ensure safe local date serialization without extra overhead.
