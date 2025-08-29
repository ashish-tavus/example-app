'use client';

import { StreamingMessage } from '@/components/ui/streaming-message';
import { useMessages } from '@/lib/hooks';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface ConversationProps {
  className?: string;
  isUserSpeaking?: boolean;
  isReplicaSpeaking?: boolean;
}

export function Conversation({ className, isUserSpeaking = false, isReplicaSpeaking = false }: ConversationProps) {
  const { messages } = useMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showListeningIndicator, setShowListeningIndicator] = useState(false);
  const [showSpeakingIndicator, setShowSpeakingIndicator] = useState(false);

  // Smooth auto-scroll function
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const scrollContainer = messagesContainerRef.current;
      const scrollHeight = scrollContainer.scrollHeight;
      const height = scrollContainer.clientHeight;
      const maxScrollTop = scrollHeight - height;

      scrollContainer.scrollTo({
        top: maxScrollTop,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Also scroll during streaming by setting up an interval when messages are being streamed
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // If there are messages and the last message might be streaming
    if (messages.length > 0) {
      intervalId = setInterval(() => {
        scrollToBottom();
      }, 100); // Check every 100ms during potential streaming

      // Clear interval after a reasonable time
      setTimeout(() => {
        clearInterval(intervalId);
      }, 5000); // Clear after 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [messages.length]); // Re-run when number of messages changes

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
    <div className={`flex flex-col h-full relative ${className || ''}`} style={{ backgroundColor: '#F3EEE7' }}>
      {/* Messages Container */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 relative z-20">
        {/* TAVUS Logo Watermark - Right Side */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden" style={{ width: '120px' }}>
          <div
            className="opacity-10"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
            }}
          >
            <Image
              src="/TAVUS-LOGO=DARK.png"
              alt="Tavus Logo"
              width={800}
              height={84}
              className="select-none"
              priority={false}
              style={{
                height: 'auto',
                maxHeight: '100vh',
                width: 'auto'
              }}
            />
          </div>
        </div>
        {messages.length === 0 ? (
          <div className=""></div>
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
