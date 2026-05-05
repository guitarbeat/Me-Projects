## 2024-05-15 - [Intl.DateTimeFormat vs toLocaleDateString in React renders]
**Learning:** Calling `toLocaleDateString` inside a React render loop (or even inside a `useMemo` that gets called often, like for every day in a calendar) is a major performance bottleneck because it initializes a new `Intl.DateTimeFormat` object each time.
**Action:** Always pre-initialize and cache `Intl.DateTimeFormat` objects outside of components or loops and reuse their `.format()` method to dramatically reduce render time.
