'use client';

import { Conversation } from '@/components/conversation';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { VideoBox } from '@/components/video-box';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="h-screen flex">
        {/* Left Section - Video Display Area (60%) */}
        <div className="w-3/5 bg-gray-50 relative">
          <BackgroundGradient
            containerClassName="h-full"
            className="h-full"
          >
            <VideoBox forceGif={true} />
          </BackgroundGradient>
        </div>

        {/* Right Section - Conversation Panel (40%) */}
        <div className="w-2/5 bg-white">
          <Conversation />
        </div>
      </div>
    </div>
  );
}
