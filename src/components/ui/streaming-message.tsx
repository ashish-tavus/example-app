'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface StreamingMessageProps {
  text: string;
  role: 'user' | 'replica';
  delay?: number;
  typingSpeed?: number;
  className?: string;
  onComplete?: () => void;
  startStreaming?: boolean;
}

export function StreamingMessage({
  text,
  role,
  delay = 0,
  typingSpeed = 30,
  className,
  onComplete
}: StreamingMessageProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const timeoutId: NodeJS.Timeout = setTimeout(() => {
      setIsStarted(true);
      let currentIndex = 0;

      intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(intervalId);
          setIsComplete(true);
          onComplete?.();
        }
      }, typingSpeed);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [text, delay, typingSpeed, onComplete]);

  const isReplica = role === 'replica';

  return (
    <div
      className={cn(
        'flex w-full mb-3',
        isReplica ? 'justify-start' : 'justify-end',
        className
      )}
    >
      <div
        className={cn(
          'max-w-[80%] px-4 py-2 rounded-2xl transition-all duration-200',
          isReplica
            ? 'bg-gray-100 text-gray-800 rounded-bl-sm'
            : 'bg-blue-500 text-white rounded-br-sm',
          isStarted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
      >
        <div className="text-sm">
          {displayedText}
          {isStarted && !isComplete && (
            <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
