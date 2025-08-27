'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

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
          'max-w-[85%] px-4 py-3 rounded-2xl transition-all duration-200',
          isReplica
            ? 'bg-gray-100 text-gray-800 rounded-bl-sm'
            : 'bg-blue-500 text-white rounded-br-sm',
          isStarted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
      >
        <div className="text-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
            components={{
              code: ({ inline, className, children, ...props }: any) => {
                if (inline) {
                  return (
                    <code
                      className={cn(
                        "px-1.5 py-0.5 rounded text-sm font-mono",
                        isReplica
                          ? "bg-gray-200 text-gray-800"
                          : "bg-blue-400 text-blue-50"
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                // For block code, just return the code element
                // The pre wrapper will be handled by the pre component
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';

                return (
                  <code className={`language-${language} text-gray-100 text-sm`} {...props}>
                    {children}
                  </code>
                );
              },
              pre: ({ children, ...props }: any) => (
                <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto my-3 -mx-1" {...props}>
                  {children}
                </pre>
              ),
              p: ({ children }: any) => (
                <p className="mb-2 last:mb-0">{children}</p>
              ),
              ul: ({ children }: any) => (
                <ul className="list-disc list-inside ml-4 mb-2">{children}</ul>
              ),
              ol: ({ children }: any) => (
                <ol className="list-decimal list-inside ml-4 mb-2">{children}</ol>
              ),
              li: ({ children }: any) => (
                <li className="mb-1">{children}</li>
              ),
              blockquote: ({ children }: any) => (
                <blockquote className={cn(
                  "border-l-4 pl-4 my-2 italic",
                  isReplica ? "border-gray-300 text-gray-600" : "border-blue-300 text-blue-100"
                )}>
                  {children}
                </blockquote>
              ),
              h1: ({ children }: any) => (
                <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h1>
              ),
              h2: ({ children }: any) => (
                <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>
              ),
              h3: ({ children }: any) => (
                <h3 className="text-sm font-bold mb-2 mt-3 first:mt-0">{children}</h3>
              ),
              strong: ({ children }: any) => (
                <strong className="font-semibold">{children}</strong>
              ),
              em: ({ children }: any) => (
                <em className="italic">{children}</em>
              ),
              table: ({ children }: any) => (
                <div className="overflow-x-auto my-3">
                  <table className="min-w-full border border-gray-200 rounded">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }: any) => (
                <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-left text-xs font-medium">
                  {children}
                </th>
              ),
              td: ({ children }: any) => (
                <td className="border border-gray-200 px-2 py-1 text-xs">
                  {children}
                </td>
              ),
            }}
          >
            {displayedText}
          </ReactMarkdown>
          {isStarted && !isComplete && (
            <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
