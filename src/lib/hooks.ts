import { useAtom } from 'jotai';
import type { ChatMessage, Conversation } from './store';
import { conversationAtom, errorAtom, isLoadingAtom, meetingResultAtom, messagesAtom } from './store';

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

export const useMessages = () => {
  const [messages, setMessages] = useAtom(messagesAtom);

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  interface UtteranceEvent {
    message_type: string;
    event_type: string;
    conversation_id: string;
    inference_id?: string;
    properties: {
      role: 'user' | 'replica';
      speech: string;
      visual_context?: string;
    };
  }

  const addUtteranceMessage = (utteranceEvent: UtteranceEvent) => {
    const { properties } = utteranceEvent;
    if (properties?.role && properties?.speech) {
      addMessage({
        role: properties.role,
        text: properties.speech,
        visualContext: properties.visual_context,
      });
    }
  };

  return {
    messages,
    addMessage,
    addUtteranceMessage,
    clearMessages,
  };
}; 