import { lazy, Suspense, memo, useCallback, useState } from "react";
import { useIsMobile } from "@/hooks";
import { CommandPalette, MobileNavigation } from "@/components/features/navigation";
import { NewsprintPage } from "@/components/layout";
import { useRetrospectives, useViewManagement, useKeyboardShortcuts } from "@/hooks/features/index";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";
import { Header } from "./index/Header";
import type { Message } from "@/types";

// Lazy load components
const ComposeInterface = lazy(() => import("@/components/features/compose").then(module => ({ default: module.ComposeInterface })));
const NewspaperRetrospective = lazy(() => import("@/components/features/newspaper").then(module => ({ default: module.NewspaperRetrospective })));
const ArchiveManager = lazy(() => import("@/components/features/archive").then(module => ({ default: module.ArchiveManager })));

const ComponentLoader = memo(() => (
  <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div 
          key={i}
          className="w-2 h-2 bg-newsprint-foreground sharp-corners animate-bounce"
          style={{ animationDelay: `${i * 100}ms`, animationDuration: '0.8s' }}
        />
      ))}
    </div>
    <span className="font-newsprint-mono text-xs uppercase tracking-widest text-newsprint-neutral-500">
      Loading...
    </span>
  </div>
));

ComponentLoader.displayName = 'ComponentLoader';

const Index = memo(() => {
  const isMobile = useIsMobile();
  const [isCmdkOpen, setIsCmdkOpen] = useState(false);

  const {
    currentRetrospective,
    messages,
    structuredData,
    isEditing,
    isUpdating,
    setMessages,
    setStructuredData,
    setCurrentRetrospective,
    saveRetrospective,
    saveRetrospectiveEdit,
  } = useRetrospectives();

  const {
    viewMode,
    handleViewChange,
    handleNewEntry: handleNewEntryBase,
  } = useViewManagement();

  const handleNewEntry = useCallback(() => {
    handleNewEntryBase(
      () => setCurrentRetrospective(null),
      () => setMessages([]),
      () => setStructuredData(null)
    );
  }, [handleNewEntryBase, setCurrentRetrospective, setMessages, setStructuredData]);

  useKeyboardShortcuts({
    onCommandK: () => setIsCmdkOpen((prev) => !prev),
    onViewChange: handleViewChange,
    onNewEntry: handleNewEntry,
  });

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeNavigation({
    currentView: viewMode,
    onViewChange: handleViewChange,
  });

  const handleGenerateRetrospective = useCallback(async (chatMessages: Message[], newStructuredData?: any) => {
    await saveRetrospective(chatMessages, newStructuredData);
    handleViewChange('archive');
  }, [saveRetrospective, handleViewChange]);

  const renderContent = () => {
    switch (viewMode) {
      case 'compose':
        return (
          <div className={isMobile ? 'container-mobile py-4' : 'container mx-auto px-6 py-6'}>
            <div className="flex justify-center">
              <div className={`w-full ${isMobile ? '' : 'max-w-3xl'}`}>
                <Suspense fallback={<ComponentLoader />}>
                  <ComposeInterface 
                    onGenerateRetrospective={handleGenerateRetrospective}
                    isMobile={isMobile}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        );
      
      case 'archive':
        return (
          <Suspense fallback={<ComponentLoader />}>
            {currentRetrospective ? (
              <NewspaperRetrospective 
                messages={messages}
                structuredData={structuredData}
                isMobile={isMobile}
                isEditing={isEditing}
                isSaving={isUpdating}
                onSaveEdit={saveRetrospectiveEdit}
              />
            ) : (
              <ArchiveManager isMobile={isMobile} />
            )}
          </Suspense>
        );
      
      default:
        return null;
    }
  };

  return (
    <NewsprintPage 
      container={false}
      className={isMobile ? '' : ''}
    >
      <div
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
      >
        <Header
          isMobile={isMobile}
          viewMode={viewMode}
          onViewChange={handleViewChange}
          onOpenCommandPalette={() => setIsCmdkOpen(true)}
        />

        <CommandPalette
          open={isCmdkOpen}
          onOpenChange={setIsCmdkOpen}
          onViewChange={handleViewChange}
          onNewEntry={handleNewEntry}
        />

        <main className={`${isMobile ? 'min-h-[calc(100vh-120px)] pb-16' : 'min-h-[calc(100vh-6rem)]'}`}>
          {renderContent()}
        </main>

        {isMobile && (
          <MobileNavigation
            currentView={viewMode}
            onViewChange={handleViewChange}
            className="safe-bottom"
          />
        )}
      </div>
    </NewsprintPage>
  );
});

Index.displayName = 'Index';

export default Index;
