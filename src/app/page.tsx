'use client';

import { Conversation } from '@/components/conversation';
import { VideoBox } from '@/components/video-box';
import { useState } from 'react';

export default function Home() {
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isReplicaSpeaking, setIsReplicaSpeaking] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="h-screen flex gap-4 p-4">
        {/* Left Section - Video Display Area (60%) */}
        <div className="w-3/5 bg-gray-50 relative">
          <div className="h-full rounded-2xl overflow-hidden border border-gray-200 bg-white">
            <VideoBox
              onUserSpeakingChange={setIsUserSpeaking}
              onReplicaSpeakingChange={setIsReplicaSpeaking}
            />
          </div>
        </div>

        {/* Right Section - Conversation Panel (40%) */}
        <div className="w-2/5 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <Conversation
            isUserSpeaking={isUserSpeaking}
            isReplicaSpeaking={isReplicaSpeaking}
          />
        </div>
      </div>
    </div>
  );
}
