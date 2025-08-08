'use client';

import { Button } from '@/components/ui/button';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { StatefulButton } from '@/components/ui/stateful-button';
import { useMessages } from '@/lib/hooks';
import { generateChatTranscript } from '@/lib/utils';
import type { DailyEventObject } from '@daily-co/daily-js';
import {
  DailyAudio,
  DailyVideo,
  useDaily,
  useDailyEvent,
  useLocalParticipant,
  useParticipantIds
} from '@daily-co/daily-react';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Daily React hooks
  const daily = useDaily();
  const localParticipant = useLocalParticipant();
  const participantIds = useParticipantIds();

  // Message management
  const { messages, addUtteranceMessage, clearMessages } = useMessages();

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
  });

  useDailyEvent('left-meeting', () => {
    console.log('Left Daily meeting');
    handleEndCall();
  });

  useDailyEvent('error', (event) => {
    console.error('Daily error:', event);
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

  // Listen for transcription events
  useDailyEvent('transcription-started', (event) => {
    console.log('🟢 Transcription started:', event);
  });

  useDailyEvent('transcription-stopped', (event) => {
    console.log('🔴 Transcription stopped:', event);
  });

  useDailyEvent('transcription-error', (event) => {
    console.error('❌ Transcription error:', event);
  });

  useDailyEvent('transcription-message', (event: DailyEventObject<'transcription-message'>) => {
    console.log('📝 Transcription message received:', event);

    // Log the transcript data to console with proper typing
    const transcriptData = {
      text: event.text,
      speaker: event.participantId || 'Unknown',
      timestamp: event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : 'Unknown',
      isFinal: event.rawResponse?.is_final || false
    };

    console.log('🗣️  Transcript:', transcriptData);

    // If it's a final transcript, log it more prominently
    if (transcriptData.isFinal) {
      console.log(`🎯 FINAL TRANSCRIPT [${transcriptData.speaker}]: "${transcriptData.text}"`);
    }
  });


  const handleStartConversation = async () => {
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
    setConversationUrl(null);
    console.log('Setting showFeedback to true, conversationId:', conversationId);
    setShowFeedback(true);
    // Don't clear conversationId until after feedback is submitted
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

  const handleFeedbackSubmit = async (feedback: 'yes' | 'no', additionalFeedback?: string, email?: string) => {
    if (!conversationId) {
      throw new Error('No conversation ID available');
    }

    const chatTranscript = generateChatTranscript(messages);

    const response = await fetch('/api/send-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        IssueResolved: feedback,
        ConversationID: conversationId,
        Feedback: additionalFeedback || '',
        TavusUserAccount: email || '', // Using email as user account for now
        ChatTranscript: chatTranscript,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit feedback');
    }

    console.log('Feedback submitted successfully:', { feedback, conversationId, additionalFeedback, email });
  };

  const handleFeedbackClose = () => {
    setShowFeedback(false);
    setIsInChat(false);
    setShowOverlay(true);
    setConversationId(null); // Clear conversation ID after feedback is done
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
                priority
                className="object-cover"
                unoptimized
              />
            )}
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

        {/* Feedback Dialog */}
        {showFeedback && (
          <FeedbackDialog
            conversationId={conversationId || 'debug-conversation-id'}
            onClose={handleFeedbackClose}
            onFeedbackSubmit={handleFeedbackSubmit}
          />
        )}

        {/* Preview Overlay */}
        {showOverlay && !isInChat && (
          <div className="absolute inset-6 bg-black/30 flex flex-col justify-end z-30 rounded-2xl">
            {/* Bottom section with button */}
            <div className="flex justify-center pb-8">
              <StatefulButton
                onClick={handleStartConversation}
                loadingText="Connecting..."
                successText="Connected!"
                className="min-w-[180px] backdrop-blur-sm shadow-lg"
              >
                Let&apos;s Chat
              </StatefulButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 