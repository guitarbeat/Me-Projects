## 2026-07-29 - [Avoid toLocaleDateString in React render loops]
**Learning:** Calling `toLocaleDateString` inside a React component render loop (like a map processing a calendar grid) creates massive CPU overhead because it allocates a new format instance every time. It's an O(N) allocation bottleneck.
**Action:** Always extract formatting objects like `new Intl.DateTimeFormat()` outside the component block and use `.format()` instead of relying on `toLocaleDateString()`, leading to ~100x performance improvements.
