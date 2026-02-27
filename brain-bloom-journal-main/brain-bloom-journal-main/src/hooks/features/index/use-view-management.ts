import { useState, useCallback } from 'react';

export type ViewMode = 'compose' | 'archive';

export const useViewManagement = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('compose');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleViewChange = useCallback((view: ViewMode) => {
    setViewMode(view);
    setShowMobileMenu(false);
  }, []);

  const handleNewEntry = useCallback((
    resetCurrentRetrospective: () => void,
    resetMessages: () => void,
    resetStructuredData: () => void
  ) => {
    setViewMode('compose');
    resetCurrentRetrospective();
    resetMessages();
    resetStructuredData();
    setShowMobileMenu(false);
  }, []);

  return {
    viewMode,
    showMobileMenu,
    setShowMobileMenu,
    handleViewChange,
    handleNewEntry,
  };
};
