'use client';

import { StreamingMessage } from '@/components/ui/streaming-message';
import { useMessages } from '@/lib/hooks';
import { useEffect, useRef, useState } from 'react';

interface ConversationProps {
  className?: string;
  isUserSpeaking?: boolean;
  isReplicaSpeaking?: boolean;
}

export function Conversation({ className, isUserSpeaking = false, isReplicaSpeaking = false }: ConversationProps) {
  const { messages } = useMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showListeningIndicator, setShowListeningIndicator] = useState(false);
  const [showSpeakingIndicator, setShowSpeakingIndicator] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle listening indicator - show while user is speaking, hide when they stop
  useEffect(() => {
    if (isUserSpeaking) {
      setShowListeningIndicator(true);
    } else {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowListeningIndicator(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isUserSpeaking]);

  // Handle speaking indicator - show while replica is speaking
  useEffect(() => {
    if (isReplicaSpeaking) {
      setShowSpeakingIndicator(true);
    } else {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowSpeakingIndicator(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isReplicaSpeaking]);

  return (
    <div className={`bg-white flex flex-col h-full ${className || ''}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Conversation</h2>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Start a conversation to see the transcript here.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => (
              <StreamingMessage
                key={message.id}
                text={message.text}
                role={message.role}
                delay={message.role === 'replica' ? 300 : 0}
                typingSpeed={25}
              />
            ))}

            {/* Subtle listening indicator - like AI thinking */}
            {showListeningIndicator && (
              <div className="flex items-center gap-2 py-2 text-gray-600">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-gray-600 font-medium">Listening...</span>
              </div>
            )}

            {/* Subtle speaking indicator - like AI typing */}
            {showSpeakingIndicator && (
              <div className="flex items-center gap-2 py-2 text-gray-600">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600 font-medium">Speaking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
