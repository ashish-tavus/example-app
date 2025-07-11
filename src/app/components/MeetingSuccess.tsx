'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, CheckCircle } from 'lucide-react';

interface MeetingSuccessProps {
  conversation: any;
  onReset: () => void;
}

export default function MeetingSuccess({ conversation, onReset }: MeetingSuccessProps) {
  const [copied, setCopied] = useState(false);

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
    <Card className="w-full h-fit bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-green-800">
          Meeting Created Successfully!
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Meeting URL Section */}
        {conversation?.conversation_url && (
          <div className="space-y-3">
            <h4 className="font-semibold text-lg text-gray-900">Meeting URL:</h4>
            <Card className="bg-white border-green-200">
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-3 break-all font-mono bg-gray-50 p-2 rounded">
                  {conversation.conversation_url}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopyUrl(conversation.conversation_url)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? 'Copied!' : 'Copy URL'}
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <a
                      href={conversation.conversation_url}
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


      </CardContent>
    </Card>
  );
} 