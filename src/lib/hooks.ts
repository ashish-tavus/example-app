import { useAtom } from 'jotai';
import { conversationAtom, isLoadingAtom, meetingResultAtom, errorAtom } from './store';
import type { Conversation } from './store';

export const useConversation = () => {
  const [conversation, setConversation] = useAtom(conversationAtom);
  
  const updateConversation = (updates: Partial<Conversation>) => {
    if (conversation) {
      setConversation({ ...conversation, ...updates });
    }
  };

  const clearConversation = () => {
    setConversation(null);
  };

  // Helper to get conversation ID (handles both field names for compatibility)
  const getConversationId = () => {
    return conversation?.conversation_id || conversation?.id;
  };

  return {
    conversation,
    setConversation,
    updateConversation,
    clearConversation,
    getConversationId,
  };
};

export const useMeetingState = () => {
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [result, setResult] = useAtom(meetingResultAtom);
  const [error, setError] = useAtom(errorAtom);

  return {
    isLoading,
    setIsLoading,
    result,
    setResult,
    error,
    setError,
  };
}; 