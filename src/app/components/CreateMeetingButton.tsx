'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

export default function CreateMeetingButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; conversation?: any } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateMeeting = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/create-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (response.ok) {
        setResult({ success: true, conversation: data.conversation });
        console.log('Conversation data:', data.conversation);
        console.log('Conversation URL:', data.conversation?.conversation_url);
      } else {
        setResult({ error: data.error || 'Failed to create meeting' });
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      setResult({ 
        success: false, 
        error: 'Network error occurred' 
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="flex flex-col gap-6 items-center w-full max-w-2xl">
      <Button
        onClick={handleCreateMeeting}
        disabled={isLoading}
        size="lg"
        className="text-lg px-8 py-6 h-auto"
      >
        {isLoading ? 'Creating Meeting...' : 'Create Meeting with Tavus'}
      </Button>

      {result && (
        <Card className="w-full">
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

                {/* Conversation Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Conversation Details:</h4>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Status:</span>
                          <span>{result.conversation?.status || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Created At:</span>
                          <span>
                            {result.conversation?.created_at 
                              ? new Date(result.conversation.created_at).toLocaleString() 
                              : 'N/A'
                            }
                          </span>
                        </div>
                        {result.conversation?.conversation_name && (
                          <div className="flex justify-between">
                            <span className="font-medium">Name:</span>
                            <span>{result.conversation.conversation_name}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 