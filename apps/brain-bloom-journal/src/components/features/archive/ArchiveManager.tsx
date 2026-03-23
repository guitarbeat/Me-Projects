import { memo, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TimelineView } from './TimelineView';
import { EntryDetailView } from './EntryDetailView';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { PullToRefreshIndicator } from '@/components/common/PullToRefreshIndicator';
import { BookOpen, Calendar } from '@/lib/icons/icon-imports';
import { WeeklyDigest } from '@/components/features/digest';
import { BreakingNewsTicker, generateTickerItems } from '@/components/features/newspaper';
import { 
  useRetrospectivesQuery, 
  useDeleteRetrospective, 
  useUpdateRetrospective,
  retrospectivesKeys 
} from '@/hooks/queries';
import type { Retrospective } from '@/types';

interface ArchiveManagerProps {
  isMobile?: boolean;
}

export const ArchiveManager = memo<ArchiveManagerProps>(({ isMobile = false }) => {
  const [selectedRetrospective, setSelectedRetrospective] = useState<Retrospective | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'weekly'>('timeline');
  const queryClient = useQueryClient();

  // React Query hooks
  const { data: retrospectives = [], isLoading, refetch } = useRetrospectivesQuery();
  const deleteMutation = useDeleteRetrospective();
  const updateMutation = useUpdateRetrospective();

  const { containerRef, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: async () => { await refetch(); },
    threshold: 80,
  });

  // Set up realtime subscription for updates
  useEffect(() => {
    const channel = supabase
      .channel('retrospectives-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reflect_retrospectives' },
        () => queryClient.invalidateQueries({ queryKey: retrospectivesKeys.all })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const deleteRetrospective = useCallback((retrospective: Retrospective) => {
    if (selectedRetrospective?.id === retrospective.id) {
      setSelectedRetrospective(null);
    }
    deleteMutation.mutate(retrospective.id);
  }, [selectedRetrospective, deleteMutation]);

  const updateTitle = useCallback((id: string, newTitle: string) => {
    updateMutation.mutate({ id, updates: { title: newTitle } });
    if (selectedRetrospective?.id === id) {
      setSelectedRetrospective(prev => prev ? { ...prev, title: newTitle } : null);
    }
  }, [selectedRetrospective, updateMutation]);

  const updateContent = useCallback((id: string, updatedMessages: any[]) => {
    updateMutation.mutate({ id, updates: { content: { messages: updatedMessages } } });
    setIsEditing(false);
    if (selectedRetrospective?.id === id) {
      setSelectedRetrospective(prev => 
        prev ? { ...prev, content: { messages: updatedMessages } } : null
      );
    }
  }, [selectedRetrospective, updateMutation]);

  const tickerItems = generateTickerItems(retrospectives);

  return (
    <div 
      ref={isMobile ? containerRef : undefined}
      className={isMobile ? 'px-4 py-4 overflow-auto' : 'max-w-screen-xl mx-auto px-6 py-6'}
    >
      {isMobile && <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />}
      
      {/* Breaking News Ticker - shows insights from retrospectives */}
      <BreakingNewsTicker items={tickerItems} className="mb-4" />
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'timeline' | 'weekly')}>
        <TabsList className="mb-4 h-8">
          <TabsTrigger value="timeline" className="text-xs gap-1.5 px-3">
            <BookOpen className="h-3 w-3" />
            Entries
          </TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs gap-1.5 px-3">
            <Calendar className="h-3 w-3" />
            Weekly
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-0">
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-3 gap-6'}`}>
            <div className={isMobile ? '' : 'col-span-1'}>
              <TimelineView 
                retrospectives={retrospectives}
                selectedRetrospective={selectedRetrospective}
                onSelectRetrospective={setSelectedRetrospective}
                onDeleteRetrospective={deleteRetrospective}
                isLoading={isLoading}
              />
            </div>
            {(!isMobile || selectedRetrospective) && (
              <div className={isMobile ? '' : 'col-span-2'}>
                <EntryDetailView 
                  retrospective={selectedRetrospective}
                  isEditing={isEditing}
                  onEdit={() => setIsEditing(true)}
                  onCancelEdit={() => setIsEditing(false)}
                  onDelete={deleteRetrospective}
                  onUpdateTitle={updateTitle}
                  onUpdateContent={updateContent}
                  onBack={isMobile ? () => setSelectedRetrospective(null) : undefined}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="mt-0">
          <WeeklyDigest isMobile={isMobile} />
        </TabsContent>
      </Tabs>
    </div>
  );
});

ArchiveManager.displayName = 'ArchiveManager';
