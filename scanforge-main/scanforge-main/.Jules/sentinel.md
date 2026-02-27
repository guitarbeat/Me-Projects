## 2025-05-21 - Missing Centralized Input Validation
**Vulnerability:** The application accepted raw user input (prompts) and file uploads without validation, passing them directly to AI models and image processing utilities.
**Learning:** Reliance on UI-layer restrictions (like `accept` attribute) is insufficient. Direct API calls or bypassed UI could feed malicious data.
**Prevention:** Established `services/security.ts` as a mandatory gate for all external inputs (files, text) before processing.

## 2025-05-21 - File Extension Spoofing
**Vulnerability:** The application relied solely on the `file.type` property (MIME type string) provided by the browser/client to validate uploaded images. This allowed an attacker to upload a non-image file (e.g., an executable or script) by simply renaming it with a `.png` extension.
**Learning:** The `File` object's metadata is user-controlled and untrustworthy. True file type validation requires inspecting the file's content (magic bytes).
**Prevention:** Implemented `checkFileSignature` in `services/security.ts` to verify the first few bytes of the file against known signatures for JPEG, PNG, and WebP before processing.
