'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface MeetingResultProps {
  result: { success?: boolean; error?: string; conversation?: any } | null;
}

export default function MeetingResult({ result }: MeetingResultProps) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {result.success ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              Meeting Created Successfully!
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-red-600" />
              Error
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.success ? (
          <>
            {/* Meeting URL Section */}
            {result.conversation?.conversation_url && (
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Meeting URL:</h4>
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-3 break-all font-mono">
                      {result.conversation.conversation_url}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCopyUrl(result.conversation.conversation_url)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? 'Copied!' : 'Copy URL'}
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <a
                          href={result.conversation.conversation_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Join Meeting
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}


          </>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
} 