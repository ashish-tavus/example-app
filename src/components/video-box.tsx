'use client';

import { useState, useRef, useEffect } from 'react';
import { PhoneOff, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { 
  useDaily, 
  useDailyEvent, 
  useLocalParticipant, 
  useParticipantIds
} from '@daily-co/daily-react';
import { DailyVideo, DailyAudio } from '@daily-co/daily-react';
import { useMessages } from '@/lib/hooks';

interface VideoBoxProps {
  posterUrl?: string;
  videoUrls?: string[];
  onStartConversation?: () => void;
  forceGif?: boolean;
}

export function VideoBox({ 
  posterUrl = "https://cdn.prod.website-files.com/63b2f566abde4cad39ba419f%2F67b5222642c2133d9163ce80_newmike-poster-00001.jpg",
  videoUrls = [
    "https://cdn.prod.website-files.com/63b2f566abde4cad39ba419f%2F67b5222642c2133d9163ce80_newmike-transcode.mp4",
    "https://cdn.prod.website-files.com/63b2f566abde4cad39ba419f%2F67b5222642c2133d9163ce80_newmike-transcode.webm"
  ],
  onStartConversation,
  forceGif = false
}: VideoBoxProps) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isInChat, setIsInChat] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackAnswer, setFeedbackAnswer] = useState<'yes' | 'no' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Daily React hooks
  const daily = useDaily();
  const localParticipant = useLocalParticipant();
  const participantIds = useParticipantIds();

  // Message management
  const { addUtteranceMessage, clearMessages } = useMessages();

  // Debug logging
  useEffect(() => {
    if (participantIds.length > 0) {
      console.log('Participant IDs:', participantIds);
      console.log('Local participant:', localParticipant);
    }
  }, [participantIds, localParticipant]);

  // Daily React event handlers
  useDailyEvent('joined-meeting', () => {
    console.log('Joined Daily meeting successfully');
    setIsConnected(true);
    setIsLoading(false);
  });

  useDailyEvent('left-meeting', () => {
    console.log('Left Daily meeting');
    handleEndCall();
  });

  useDailyEvent('error', (event) => {
    console.error('Daily error:', event);
    setIsLoading(false);
  });

  // Listen for app-message events (Tavus utterance events)
  useDailyEvent('app-message', (event) => {
    console.log('App message received:', event);
    
    // Check if this is a conversation utterance event
    if (event.data?.message_type === 'conversation' && event.data?.event_type === 'conversation.utterance') {
      console.log('Utterance event received:', event.data);
      addUtteranceMessage(event.data);
    }
  });


  const handleStartConversation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create conversation:', errorData);
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      setConversationId(data.conversation.conversation_id);
      setConversationUrl(data.conversation.conversation_url);
      setIsInChat(true);
      setShowOverlay(false);
      console.log('Conversation created successfully:', data.conversation);
      
      // Clear previous messages when starting a new conversation
      clearMessages();
      
      // Join the Daily call
      if (daily && data.conversation.conversation_url) {
        await daily.join({ url: data.conversation.conversation_url });
      }
      
      if (onStartConversation) {
        onStartConversation();
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      setIsLoading(false);
    }
  };



  const handleEndCall = async () => {
    if (conversationId) {
      try {
        const response = await fetch('/api/end-conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ conversationId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to end conversation:', errorData);
        } else {
          console.log('Conversation ended successfully');
        }
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }
    
    if (daily) {
      await daily.leave();
    }
    
    setIsConnected(false);
    setConversationId(null);
    setConversationUrl(null);
    setShowFeedback(true);
  };

  const toggleAudio = () => {
    if (daily && localParticipant) {
      daily.setLocalAudio(!localParticipant.audio);
    }
  };



  const handleVideoError = () => {
    setVideoError(true);
    console.log('Video failed to load, showing GIF fallback');
  };

  const handleFeedbackSubmit = async () => {
    // Here you can send the feedback to your backend
    console.log('Feedback submitted:', { answer: feedbackAnswer, text: feedbackText });
    
    // Reset to initial state
    setShowFeedback(false);
    setFeedbackAnswer(null);
    setFeedbackText('');
    setIsInChat(false);
    setShowOverlay(true);
  };

  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full overflow-hidden p-6">
        {/* Video Element or Daily Video */}
        {isInChat && conversationUrl ? (
          // Daily Video Call
          <div className="w-full h-full relative bg-black rounded-2xl overflow-hidden shadow-2xl">
            {/* DailyAudio component handles all participants' audio */}
            <DailyAudio />
            
            {participantIds.map((participantId) => {
              const isLocal = localParticipant?.session_id === participantId;
              
              if (isLocal) {
                // Local participant (you) - small video in bottom right
                return (
                  <div key={participantId} className="absolute bottom-4 right-4 w-32 h-24 md:w-40 md:h-30 rounded-lg overflow-hidden border-2 border-white shadow-lg bg-black z-20">
                    <DailyVideo
                      sessionId={participantId}
                      type="video"
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              } else {
                // Remote participant (Tavus) - main video taking up the full screen
                return (
                  <div key={participantId} className="absolute inset-0 z-10 bg-black">
                    <DailyVideo
                      sessionId={participantId}
                      type="video"
                      className="w-full h-full object-cover"
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                  </div>
                );
              }
            })}
          </div>
        ) : (
          // Preview Video/GIF
          <div className="w-full h-full relative bg-black rounded-2xl overflow-hidden shadow-2xl">
            {!videoError && !forceGif ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster={posterUrl}
                muted
                playsInline
                onError={handleVideoError}
                style={{ width: '100%', height: '100%' }}
              >
                {videoUrls.map((url, index) => (
                  <source key={index} src={url} type={url.includes('.webm') ? 'video/webm' : 'video/mp4'} />
                ))}
                Your browser does not support the video tag.
              </video>
            ) : (
              <Image
                src="https://cdn.prod.website-files.com/63b2f566abde4cad39ba419f/67bf72cdf131ec10cbd8c67b_newmike%20(1).gif"
                alt="Charlie calling"
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </div>
        )}

        {/* Chat Overlay - Only show when joining */}
        {isInChat && !isConnected && !showFeedback && (
          <div className="absolute inset-6 bg-black/20 flex items-center justify-center z-30 rounded-2xl">
            <div className="text-center text-white">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Joining Call...</h2>
              <p className="text-white/80">Connecting to Charlie</p>
            </div>
          </div>
        )}

        {/* Call Controls - Show when connected */}
        {isInChat && isConnected && !showFeedback && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-30">
            {/* Mute/Unmute Button */}
            <Button
              onClick={toggleAudio}
              variant="ghost"
              size="icon"
              className={`
                relative w-14 h-14 rounded-full call-control-transition glass-effect
                ${localParticipant?.audio 
                  ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50' 
                  : 'bg-red-500/90 hover:bg-red-600 text-white border border-red-400/50 hover:border-red-400 shadow-lg animate-button-pulse'
                }
                hover:scale-110 active:scale-95 call-control-focus
              `}
              aria-label={localParticipant?.audio ? 'Mute microphone' : 'Unmute microphone'}
            >
              {localParticipant?.audio ? (
                <Mic className="w-6 h-6 transition-transform duration-200" />
              ) : (
                <MicOff className="w-6 h-6 transition-transform duration-200" />
              )}
              
              {/* Ripple effect for mute state */}
              {!localParticipant?.audio && (
                <div className="absolute inset-0 rounded-full bg-red-400/30 animate-ping"></div>
              )}
            </Button>

            {/* End Call Button */}
            <Button
              onClick={handleEndCall}
              variant="ghost"
              size="icon"
              className="
                relative w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white 
                border border-red-500/50 hover:border-red-400 call-control-transition glass-effect
                hover:scale-110 active:scale-95 shadow-lg call-control-focus
              "
              aria-label="End call"
            >
              <PhoneOff className="w-6 h-6 transition-transform duration-200" />
              
              {/* Pulse animation for end call button */}
              <div className="absolute inset-0 rounded-full bg-red-400/20 animate-pulse"></div>
            </Button>
          </div>
        )}

        {/* Feedback Overlay */}
        {showFeedback && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Did it solve the issue?
              </h2>
              
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setFeedbackAnswer('yes')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                    feedbackAnswer === 'yes'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setFeedbackAnswer('no')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                    feedbackAnswer === 'no'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-red-500'
                  }`}
                >
                  No
                </button>
              </div>

              {feedbackAnswer === 'no' && (
                <div className="mb-4">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Please tell us more about the issue..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                  />
                </div>
              )}

              <button
                onClick={handleFeedbackSubmit}
                disabled={!feedbackAnswer}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Preview Overlay */}
        {showOverlay && !isInChat && (
          <div className="absolute inset-6 bg-black/30 flex flex-col justify-end z-30 rounded-2xl">
            {/* Bottom section with button */}
            <div className="flex justify-center pb-8">
              <button
                onClick={handleStartConversation}
                disabled={isLoading}
                className="group relative px-8 py-3 bg-pink/20 backdrop-blur-sm text-white font-medium rounded-full hover:bg-pink/30 transition-all duration-300 border border-pink/30 hover:border-pink/50 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-pink/20 rounded-full animate-ping"></div>
                <span className="relative z-10">
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </div>
                  ) : (
                    "Start Video Chat"
                  )}
                </span>
              </button>
            </div>
          </div>
        )}


      </div>
    </div>
  );
} 