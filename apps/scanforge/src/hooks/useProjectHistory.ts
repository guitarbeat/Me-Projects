// This hook is deprecated. Please use useStore from '../store' instead.
// Keeping file to prevent immediate import crashes if any remain, but strictly logic is gone.
import { useStore } from '../store';

export const useProjectHistory = () => {
  // Bridge for compatibility during refactor if needed, but we will replace usages in App.tsx
  return {};
};
