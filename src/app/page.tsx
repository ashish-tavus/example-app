'use client';

import { VideoBox } from '@/components/video-box';
import { BackgroundGradient } from '@/components/ui/background-gradient';

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
        
        {/* Right Section - Chat/Message Log (40%) */}
        <div className="w-2/5 bg-white border-l border-gray-200 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Video Chat</h2>
            <p className="text-sm text-gray-600">2 participants</p>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Other participant message */}
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
                <p className="text-sm text-gray-800">
                  Hey! Can you see and hear me clearly?
                </p>
                <p className="text-xs text-gray-500 mt-1">2:30 PM</p>
              </div>
            </div>
            
            {/* Your message */}
            <div className="flex justify-end">
              <div className="bg-blue-500 rounded-lg px-4 py-2 max-w-xs">
                <p className="text-sm text-white">
                  Yes, perfect! The video quality looks great.
                </p>
                <p className="text-xs text-blue-100 mt-1">2:31 PM</p>
              </div>
            </div>
            
            {/* Other participant message */}
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
                <p className="text-sm text-gray-800">
                  Awesome! So let&apos;s discuss the project timeline. I think we can finish the first phase by next week.
                </p>
                <p className="text-xs text-gray-500 mt-1">2:31 PM</p>
              </div>
            </div>
            
            {/* Your message */}
            <div className="flex justify-end">
              <div className="bg-blue-500 rounded-lg px-4 py-2 max-w-xs">
                <p className="text-sm text-white">
                  That sounds reasonable. Do you have the design mockups ready?
                </p>
                <p className="text-xs text-blue-100 mt-1">2:32 PM</p>
              </div>
            </div>
            
            {/* Other participant message */}
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
                <p className="text-sm text-gray-800">
                  Yes, I&apos;ll share them with you right after this call. They&apos;re looking really good!
                </p>
                <p className="text-xs text-gray-500 mt-1">2:33 PM</p>
              </div>
            </div>
            
            {/* Your message */}
            <div className="flex justify-end">
              <div className="bg-blue-500 rounded-lg px-4 py-2 max-w-xs">
                <p className="text-sm text-white">
                  Perfect! I&apos;m excited to see them. Should we schedule a follow-up meeting for Friday?
                </p>
                <p className="text-xs text-blue-100 mt-1">2:34 PM</p>
              </div>
            </div>
          </div>
          
          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
