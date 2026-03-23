## 2024-05-23 - Recursion Deadlock in Concurrency Limiters
**Learning:** When using a concurrency limiter (like `p-limit`) in a recursive function, simply wrapping the entire recursive call can cause a deadlock. If the parent task occupies a slot while waiting for children, and children wait for slots, the system halts once the concurrency limit is reached by the parents.
**Action:** Only limit the actual leaf resource usage (e.g., `fs.readFile`, `fetch`), not the logical task wrapper. Alternatively, ensure the limiter supports releasing the slot while awaiting (which is complex/rare).

## 2024-05-24 - Parallel File Creation Speedup
**Learning:** Switching from sequential `for...of` loops to `Promise.all` with a concurrency limiter for file system operations yielded a massive 3x speedup (1.9s -> 0.6s for 3000 files). Node.js handles async I/O efficiently, so blocking the event loop with sequential awaits is a major bottleneck.
**Action:** Always check loop structures for independent async operations that can be parallelized. Use a simple queue-based limiter to avoid `EMFILE` errors.

## 2024-05-24 - Throttling Stdout Writes
**Learning:** In CLI tools, unthrottled `process.stdout.write` calls for high-frequency events (like file processing) can degrade performance significantly, even if the I/O is async. Writing to the terminal is an expensive operation.
**Action:** Throttle progress bar updates (e.g., every 50ms) to reduce CPU usage and I/O overhead while maintaining a responsive UI.
