'use client';

import { VideoBox } from '@/components/video-box';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
            Tavus AI Solution Engineer
          </h1>
        </div>
        
        <VideoBox forceGif={true} />
      </div>
    </div>
  );
}
