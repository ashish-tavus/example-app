'use client';

import { useState } from 'react';
import DailyConfig, { DailyConfig as DailyConfigType } from "./components/Daily/DailyConfig";
import { defaultDailyConfig } from "./components/Daily/defaultConfig";
import MeetingResult from "./components/Daily/MeetingResult";
import MeetingSuccess from "./components/MeetingSuccess";
import VideoMeeting from "./components/VideoMeeting";

export default function Home() {
  const [dailyConfig, setDailyConfig] = useState<DailyConfigType>(defaultDailyConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; conversation?: any } | null>(null);

  const handleCreateMeeting = async () => {
    setIsLoading(true);
    setResult(null);

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

  const handleReset = () => {
    setResult(null);
    setDailyConfig(defaultDailyConfig);
  };

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
                  conversation={result.conversation} 
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
            {result && !result.success && <MeetingResult result={result} />}
          </div>
        )}
      </main>
    </div>
  );
}
