## 2024-10-24 - CLI Error Experience
**Learning:** CLI tools are "interfaces" too. Users often fail to run setup steps. A raw system error (`ENOENT`) is a bad user experience compared to a helpful guide explaining *why* it failed and *how* to fix it.
**Action:** Always wrap file system operations in CLI tools with specific error handling that translates system codes into user actions (e.g., "Run setup first" instead of "File not found").

## 2026-02-05 - Destructive Action Safety
**Learning:** CLI setup scripts that overwrite data without warning create anxiety and risk data loss. Adding a "safety latch" (checking for existing files + interactive confirmation) builds trust and prevents accidents.
**Action:** Before performing destructive file operations (like overwriting a workspace), always check if the target is non-empty and prompt for confirmation in interactive sessions.
