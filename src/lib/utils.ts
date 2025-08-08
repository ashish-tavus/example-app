import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ChatMessage } from './store';
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateChatTranscript(messages: ChatMessage[]): object {
  if (messages.length === 0) {
    return {
      user: [],
      assistant: []
    };
  }

  const transcript = {
    user: messages
      .filter(message => message.role === 'user')
      .map(message => ({
        text: message.text,
        timestamp: message.timestamp.toISOString(),
        ...(message.visualContext && { visualContext: message.visualContext })
      })),
    assistant: messages
      .filter(message => message.role === 'replica')
      .map(message => ({
        text: message.text,
        timestamp: message.timestamp.toISOString(),
        ...(message.visualContext && { visualContext: message.visualContext })
      }))
  };

  return transcript;
}
