## 2025-05-20 - Hardcoded Supabase Secrets

**Vulnerability:** Hardcoded Supabase URL and Anon Key were present as fallback values in `src/integrations/supabase/client.ts` and in `test_supabase.ts`.
**Learning:** Developers often add hardcoded fallbacks for convenience during development, but this exposes secrets if the code is committed.
**Prevention:** Always use environment variables. Implement strict checks at startup to fail fast if required variables are missing, rather than falling back to insecure defaults.
