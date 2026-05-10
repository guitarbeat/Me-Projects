## 2024-05-10 - Timezone shift bugs and significant performance overhead

**Learning:** Avoid using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops, as it introduces timezone shift bugs and significant performance overhead.
**Action:** Use string concatenation and manual formatting instead.
