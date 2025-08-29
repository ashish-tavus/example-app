'use client';

import { Conversation } from '@/components/conversation';
import { VideoBox } from '@/components/video-box';
import { useState } from 'react';

export default function Home() {
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isReplicaSpeaking, setIsReplicaSpeaking] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E3DCD1' }}>
      <div className="h-screen flex">
        {/* Left Section - Video Display Area (60%) */}
        <div className="w-3/5 relative">
          <div className="h-full overflow-hidden bg-white">
            <VideoBox
              onUserSpeakingChange={setIsUserSpeaking}
              onReplicaSpeakingChange={setIsReplicaSpeaking}
            />
          </div>
        </div>

        {/* Right Section - Conversation Panel (40%) */}
        <div className="w-2/5 overflow-hidden">
          <Conversation
            isUserSpeaking={isUserSpeaking}
            isReplicaSpeaking={isReplicaSpeaking}
          />
        </div>
      </div>
    </div>
  );
}
