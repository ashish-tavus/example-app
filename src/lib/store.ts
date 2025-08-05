import { atom } from 'jotai';

export interface Conversation {
  conversation_id: string;
  conversation_url: string;
  conversation_name?: string;
  status?: string;
  created_at?: string;
  callback_url?: string;
  [key: string]: string | number | boolean | undefined; // Allow for additional properties from Tavus API
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'replica';
  text: string;
  timestamp: Date;
  visualContext?: string;
}

// Global conversation state
export const conversationAtom = atom<Conversation | null>(null);

// Global loading state
export const isLoadingAtom = atom<boolean>(false);

// Global error state
export const errorAtom = atom<string | null>(null);

// Global meeting state (success/error)
export const meetingResultAtom = atom<{ success?: boolean; error?: string; conversation?: Conversation } | null>(null);

// Global chat messages state
export const messagesAtom = atom<ChatMessage[]>([]); 