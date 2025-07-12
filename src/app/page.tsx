'use client';

import { useAtom } from 'jotai';
import { useState, useEffect } from 'react';
import DailyConfig, { DailyConfig as DailyConfigType } from "./components/Daily/DailyConfig";
import { defaultDailyConfig } from "./components/Daily/defaultConfig";
import MeetingSuccess from "./components/MeetingSuccess";
import VideoMeeting from "./components/VideoMeeting";
import { useConversation, useMeetingState } from "@/lib/hooks";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [dailyConfig, setDailyConfig] = useState<DailyConfigType>(defaultDailyConfig);
  const { isLoading, setIsLoading, result, setResult } = useMeetingState();
  const { conversation, setConversation } = useConversation();

  const handleCreateMeeting = async () => {
    setIsLoading(true);
    setResult(null);
    setConversation(null);

    try {
      const response = await fetch('/api/create-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dailyConfig: dailyConfig
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (response.ok) {
        const conversationData = data.conversation;
        setResult({ success: true, conversation: conversationData });
        setConversation(conversationData);
        console.log('Conversation data:', conversationData);
        console.log('Conversation URL:', conversationData?.conversation_url);
        console.log('Conversation ID:', conversationData?.conversation_id);
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

  const handleReset = () => {
    console.log('Home - handleReset called');
    setResult(null);
    setConversation(null);
    setDailyConfig(defaultDailyConfig);
    // Force a complete state reset
    setIsLoading(false);
    console.log('Home - State reset completed');
  };

  // Debug: Log state changes
  useEffect(() => {
    console.log('Home - State changed:', {
      hasResult: !!result,
      resultSuccess: result?.success,
      hasConversation: !!conversation,
      conversationId: conversation?.conversation_id,
      isLoading
    });
  }, [result, conversation, isLoading]);

  // Check if any configuration options are selected
  const hasConfigurationOptions = () => {
    return (
      dailyConfig.disableVideo ||
      dailyConfig.disableAudio ||
      dailyConfig.enableScreenShare ||
      dailyConfig.enableChat ||
      dailyConfig.enableRecording ||
      dailyConfig.enableClosedCaptions ||
      dailyConfig.enableBackgroundBlur ||
      dailyConfig.enableNoiseSuppression ||
      dailyConfig.enableEchoCancellation ||
      dailyConfig.enableLowBandwidthMode
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center w-full">
        {/* Tavus Meeting Section */}
        <div className="flex flex-col gap-6 items-center text-center">
          <h1 className="text-4xl font-bold">Tavus Meeting Integration</h1>
          <p className="text-xl text-gray-600 max-w-lg">
            Configure your Daily video settings and create a meeting with Hassaan, one of the co-founders of Tavus, using AI-powered conversation technology.
          </p>
        </div>

        {/* Main Content Area */}
        {result?.success ? (
          // Success Layout: Configuration on left, Success/Video component on right
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8">
            {/* Left: Configuration */}
            <div className="flex flex-col">
              <DailyConfig
                config={dailyConfig}
                onConfigChange={setDailyConfig}
                onCreateMeeting={handleCreateMeeting}
                isLoading={isLoading}
              />
            </div>
            
            {/* Vertical Separator */}
            <div className="hidden lg:block w-px bg-gray-200"></div>
            
            {/* Right: Success or Video Component */}
            <div className="flex flex-col">
              {hasConfigurationOptions() ? (
                <VideoMeeting 
                  key={conversation?.conversation_id || 'no-conversation'} // Force re-render when conversation changes
                  onReset={handleReset}
                  dailyConfig={dailyConfig}
                />
              ) : (
                <MeetingSuccess 
                  conversation={result.conversation} 
                  onReset={handleReset}
                />
              )}
            </div>
          </div>
        ) : (
          // Default Layout: Single column
          <div className="w-full max-w-2xl">
            <DailyConfig
              config={dailyConfig}
              onConfigChange={setDailyConfig}
              onCreateMeeting={handleCreateMeeting}
              isLoading={isLoading}
            />
            
            {/* Error Display */}
            {result && !result.success && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
