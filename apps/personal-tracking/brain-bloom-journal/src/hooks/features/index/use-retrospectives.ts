import { useState, useCallback } from 'react';
import { useSaveRetrospective, useUpdateRetrospective } from '@/hooks/queries';
import type { Message, Retrospective, StructuredRetrospectiveData } from '@/types';

/**
 * Hook for managing current retrospective state and mutations
 * Uses React Query for save/update operations
 */
export const useRetrospectives = () => {
  const [currentRetrospective, setCurrentRetrospective] = useState<Retrospective | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [structuredData, setStructuredData] = useState<StructuredRetrospectiveData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // React Query mutations
  const saveMutation = useSaveRetrospective();
  const updateMutation = useUpdateRetrospective();

  const loadRetrospective = useCallback((retrospective: Retrospective) => {
    setCurrentRetrospective(retrospective);
    const storedMessages = retrospective.content?.messages || [];
    const convertedMessages = storedMessages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
    setMessages(convertedMessages);
    setStructuredData(retrospective.content?.structuredData || null);
    setIsEditing(false);
  }, []);

  const saveRetrospective = useCallback(async (chatMessages: Message[], newStructuredData?: StructuredRetrospectiveData) => {
    const result = await saveMutation.mutateAsync({ messages: chatMessages, structuredData: newStructuredData });
    setCurrentRetrospective(result);
    setMessages(chatMessages);
    setStructuredData(newStructuredData || null);
    return result;
  }, [saveMutation]);

  const saveRetrospectiveEdit = useCallback(async (updatedMessages: Message[]) => {
    if (!currentRetrospective) return;
    
    const messagesForStorage = updatedMessages.map(msg => ({
      id: msg.id,
      text: msg.text,
      isUser: msg.isUser,
      timestamp: msg.timestamp.toISOString()
    }));

    await updateMutation.mutateAsync({
      id: currentRetrospective.id,
      updates: {
        content: {
          ...currentRetrospective.content,
          messages: messagesForStorage,
          last_edited: new Date().toISOString()
        }
      }
    });
    
    setMessages(updatedMessages);
    setIsEditing(false);
  }, [currentRetrospective, updateMutation]);

  return {
    currentRetrospective,
    messages,
    structuredData,
    isEditing,
    isSaving: saveMutation.isPending,
    isUpdating: updateMutation.isPending,
    setIsEditing,
    setMessages,
    setStructuredData,
    setCurrentRetrospective,
    loadRetrospective,
    saveRetrospective,
    saveRetrospectiveEdit,
  };
};
