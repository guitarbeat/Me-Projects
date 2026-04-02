## 2025-02-14 - IndexedDB Connection Pooling
**Learning:** Opening a new IndexedDB connection for every request creates significant overhead when parallelizing operations.
**Action:** Always implement a connection caching mechanism (singleton promise) for IndexedDB wrappers to support high-concurrency access efficiently.
