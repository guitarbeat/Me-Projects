import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Retrospective, Message, StructuredRetrospectiveData } from '@/types';

// Query keys for cache management
export const retrospectivesKeys = {
  all: ['retrospectives'] as const,
  lists: () => [...retrospectivesKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...retrospectivesKeys.lists(), filters] as const,
  details: () => [...retrospectivesKeys.all, 'detail'] as const,
  detail: (id: string) => [...retrospectivesKeys.details(), id] as const,
};

// Fetch all retrospectives
const fetchRetrospectives = async (): Promise<Retrospective[]> => {
  // Note: reflect_retrospectives table not in generated types - using type assertion
  const { data, error } = await (supabase as any)
    .from('reflect_retrospectives')
    .select('*')
    .order('retrospective_date', { ascending: false });

  if (error) throw error;
  return (data || []) as Retrospective[];
};

// Hook to fetch all retrospectives with caching
export const useRetrospectivesQuery = () => {
  return useQuery({
    queryKey: retrospectivesKeys.lists(),
    queryFn: fetchRetrospectives,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to save a new retrospective
export const useSaveRetrospective = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      messages, 
      structuredData 
    }: { 
      messages: Message[]; 
      structuredData?: StructuredRetrospectiveData;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';

      const messagesForStorage = messages.map(msg => ({
        id: msg.id,
        text: msg.text,
        isUser: msg.isUser,
        timestamp: msg.timestamp.toISOString()
      }));

      const retrospectiveData = {
        user_id: userId,
        retrospective_date: new Date().toISOString().split('T')[0],
        title: `Reflection - ${new Date().toLocaleDateString()}`,
        retrospective_type: 'daily' as const,
        content: {
          messages: messagesForStorage,
          structuredData,
          generated_at: new Date().toISOString()
        } as any
      };

      const { data, error } = await (supabase as any)
        .from('reflect_retrospectives')
        .insert(retrospectiveData)
        .select()
        .single();

      if (error) throw error;
      return data as Retrospective;
    },
    onSuccess: (newRetro) => {
      // Optimistically add to cache
      queryClient.setQueryData<Retrospective[]>(retrospectivesKeys.lists(), (old) => {
        return old ? [newRetro, ...old] : [newRetro];
      });
      toast({ title: 'Saved', description: 'Reflection saved successfully' });
    },
    onError: (error) => {
      console.error('Error saving retrospective:', error);
      toast({ title: 'Error', description: 'Failed to save reflection', variant: 'destructive' });
    },
  });
};

// Hook to update a retrospective with optimistic updates
export const useUpdateRetrospective = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<{ title: string; content: any }>;
    }) => {
      const { data, error } = await (supabase as any)
        .from('reflect_retrospectives')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Retrospective;
    },
    // Optimistic update
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: retrospectivesKeys.lists() });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<Retrospective[]>(retrospectivesKeys.lists());

      // Optimistically update cache
      queryClient.setQueryData<Retrospective[]>(retrospectivesKeys.lists(), (old) => {
        if (!old) return old;
        return old.map(retro => 
          retro.id === id ? { ...retro, ...updates } : retro
        );
      });

      // Return context for rollback
      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(retrospectivesKeys.lists(), context.previousData);
      }
      console.error('Error updating retrospective:', error);
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' });
    },
    onSuccess: () => {
      toast({ title: 'Updated', description: 'Changes saved' });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: retrospectivesKeys.lists() });
    },
  });
};

// Hook to delete a retrospective with optimistic updates
export const useDeleteRetrospective = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('reflect_retrospectives')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    // Optimistic update
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: retrospectivesKeys.lists() });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<Retrospective[]>(retrospectivesKeys.lists());

      // Optimistically remove from cache
      queryClient.setQueryData<Retrospective[]>(retrospectivesKeys.lists(), (old) => {
        if (!old) return old;
        return old.filter(retro => retro.id !== id);
      });

      // Return context for rollback
      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(retrospectivesKeys.lists(), context.previousData);
      }
      console.error('Error deleting retrospective:', error);
      toast({ title: 'Error', description: 'Failed to delete entry', variant: 'destructive' });
    },
    onSuccess: () => {
      toast({ title: 'Deleted', description: 'Entry removed' });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: retrospectivesKeys.lists() });
    },
  });
};
