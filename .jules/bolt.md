## 2023-10-27 - O(N²) Collision Checks in 60fps Loops

**Learning:** When executing physics simulations inside a React component (e.g., using `requestAnimationFrame` for floating bubbles), using `.forEach()` inside a nested collision loop creates thousands of callback function allocations per second. This causes high garbage collection pressure, leading to micro-stutters and frame drops.
**Action:** Always replace `.forEach()`, `.map()`, and `.filter()` with standard `for` loops in hot O(N²) paths executed inside `requestAnimationFrame` or tight continuous loops.

