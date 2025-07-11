'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Video, Mic, Camera, Monitor, Settings, Users } from 'lucide-react';

export interface DailyConfig {
  disableVideo: boolean;
  disableAudio: boolean;
  enableScreenShare: boolean;
  enableChat: boolean;
  enableRecording: boolean;
  enableClosedCaptions: boolean;
  enableBackgroundBlur: boolean;
  enableNoiseSuppression: boolean;
  enableEchoCancellation: boolean;
  enableLowBandwidthMode: boolean;
  maxParticipants: number;
  videoQuality: 'low' | 'medium' | 'high';
}

interface DailyConfigProps {
  config: DailyConfig;
  onConfigChange: (config: DailyConfig) => void;
  onCreateMeeting: () => void;
  isLoading: boolean;
}

export default function DailyConfig({ config, onConfigChange, onCreateMeeting, isLoading }: DailyConfigProps) {
  const handleCheckboxChange = (key: keyof DailyConfig, value: boolean | 'indeterminate') => {
    onConfigChange({
      ...config,
      [key]: value === true,
    });
  };

  const handleNumberChange = (key: keyof DailyConfig, value: number) => {
    onConfigChange({
      ...config,
      [key]: value,
    });
  };

  const handleQualityChange = (value: 'low' | 'medium' | 'high') => {
    onConfigChange({
      ...config,
      videoQuality: value,
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Conversation Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video & Audio Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video & Audio Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="disableVideo"
                checked={config.disableVideo}
                onCheckedChange={(checked) => handleCheckboxChange('disableVideo', checked as boolean)}
              />
              <Label htmlFor="disableVideo" className="flex items-center gap-2">
                Disable Video
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="disableAudio"
                checked={config.disableAudio}
                onCheckedChange={(checked) => handleCheckboxChange('disableAudio', checked as boolean)}
              />
              <Label htmlFor="disableAudio" className="flex items-center gap-2">
                Disable Audio
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableScreenShare"
                checked={config.enableScreenShare}
                onCheckedChange={(checked) => handleCheckboxChange('enableScreenShare', checked as boolean)}
              />
              <Label htmlFor="enableScreenShare" className="flex items-center gap-2">
                Enable Screen Share
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableChat"
                checked={config.enableChat}
                onCheckedChange={(checked) => handleCheckboxChange('enableChat', checked as boolean)}
              />
              <Label htmlFor="enableChat" className="flex items-center gap-2">
                Enable Chat
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableRecording"
                checked={config.enableRecording}
                onCheckedChange={(checked) => handleCheckboxChange('enableRecording', checked as boolean)}
              />
              <Label htmlFor="enableRecording">Enable Recording</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableClosedCaptions"
                checked={config.enableClosedCaptions}
                onCheckedChange={(checked) => handleCheckboxChange('enableClosedCaptions', checked as boolean)}
              />
              <Label htmlFor="enableClosedCaptions">Enable Closed Captions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableBackgroundBlur"
                checked={config.enableBackgroundBlur}
                onCheckedChange={(checked) => handleCheckboxChange('enableBackgroundBlur', checked as boolean)}
              />
              <Label htmlFor="enableBackgroundBlur">Background Blur</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableNoiseSuppression"
                checked={config.enableNoiseSuppression}
                onCheckedChange={(checked) => handleCheckboxChange('enableNoiseSuppression', checked as boolean)}
              />
              <Label htmlFor="enableNoiseSuppression">Noise Suppression</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableEchoCancellation"
                checked={config.enableEchoCancellation}
                onCheckedChange={(checked) => handleCheckboxChange('enableEchoCancellation', checked as boolean)}
              />
              <Label htmlFor="enableEchoCancellation">Echo Cancellation</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableLowBandwidthMode"
                checked={config.enableLowBandwidthMode}
                onCheckedChange={(checked) => handleCheckboxChange('enableLowBandwidthMode', checked as boolean)}
              />
              <Label htmlFor="enableLowBandwidthMode">Low Bandwidth Mode</Label>
            </div>
          </div>
        </div>

        {/* Quality & Participants */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Quality & Participants</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="videoQuality">Video Quality</Label>
              <select
                id="videoQuality"
                value={config.videoQuality}
                onChange={(e) => handleQualityChange(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="low">Low (480p)</option>
                <option value="medium">Medium (720p)</option>
                <option value="high">High (1080p)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <input
                id="maxParticipants"
                type="number"
                min="1"
                max="50"
                value={config.maxParticipants}
                onChange={(e) => handleNumberChange('maxParticipants', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Create Meeting Button */}
        <div className="pt-4">
          <Button
            onClick={onCreateMeeting}
            disabled={isLoading}
            size="lg"
            className="w-full text-lg px-8 py-6 h-auto"
          >
            {isLoading ? 'Creating Meeting...' : 'Create Meeting with Tavus'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 