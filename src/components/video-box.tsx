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
import { useCallback, useEffect, useRef, useState } from 'react';

interface VideoBoxProps {
  posterUrl?: string;
  videoUrls?: string[];
  onStartConversation?: () => void;
  forceGif?: boolean;
  onUserSpeakingChange?: (isSpeaking: boolean) => void;
  onReplicaSpeakingChange?: (isSpeaking: boolean) => void;
}

export function VideoBox({
  posterUrl = "https://cdn.prod.website-files.com/63b2f566abde4cad39ba419f%2F67b5222642c2133d9163ce80_newmike-poster-00001.jpg",
  videoUrls = [
    "https://cdn.prod.website-files.com/63b2f566abde4cad39ba419f%2F67b5222642c2133d9163ce80_newmike-transcode.mp4",
    "https://cdn.prod.website-files.com/63b5222642c2133d9163ce80_newmike-transcode.webm"
  ],
  onStartConversation,
  forceGif = false,
  onUserSpeakingChange,
  onReplicaSpeakingChange
}: VideoBoxProps) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isInChat, setIsInChat] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isReplicaSpeaking, setIsReplicaSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Daily React hooks
  const daily = useDaily();
  const localParticipant = useLocalParticipant();
  const participantIds = useParticipantIds();

  // Message management
  const { messages, addUtteranceMessage, clearMessages } = useMessages();

  // Debug logging and connection state management
  useEffect(() => {
    if (participantIds.length > 0) {
      console.log('Participant IDs:', participantIds);
      console.log('Local participant:', localParticipant);

      // If we have participants and we're in chat mode, we should be connected
      if (isInChat && participantIds.length > 0 && !isConnected) {
        console.log('Setting isConnected to true based on participant count');
        setIsConnected(true);
      }
    }
  }, [participantIds, localParticipant, isInChat, isConnected]);

  // Notify parent component when user speaking state changes
  useEffect(() => {
    if (onUserSpeakingChange) {
      onUserSpeakingChange(isUserSpeaking);
    }
  }, [isUserSpeaking, onUserSpeakingChange]);

  // Notify parent component when replica speaking state changes
  useEffect(() => {
    if (onReplicaSpeakingChange) {
      onReplicaSpeakingChange(isReplicaSpeaking);
    }
  }, [isReplicaSpeaking, onReplicaSpeakingChange]);

  // Debug logging for replica speaking state
  useEffect(() => {
    console.log('🔄 isReplicaSpeaking state changed:', isReplicaSpeaking);
  }, [isReplicaSpeaking]);

  // Daily React event handlers
  useDailyEvent('joined-meeting', () => {
    console.log('Joined Daily meeting successfully');
    setIsConnected(true);

    // Enable noise cancellation when joining the meeting
    if (daily) {
      setTimeout(async () => {
        try {
          await daily.updateInputSettings({
            audio: {
              processor: {
                type: 'noise-cancellation',
              },
            },
          });
          console.log('✅ Noise cancellation enabled successfully');
        } catch (error) {
          console.error('❌ Failed to enable noise cancellation:', error);
        }
      }, 1000); // Small delay to ensure call frame is fully ready
    }
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

    const { message_type, event_type } = event.data || {};

    if (message_type === 'conversation') {
      switch (event_type) {
        case 'conversation.utterance':
          console.log('Utterance event received:', event.data);
          addUtteranceMessage(event.data);
          break;

        case 'conversation.replica.started_speaking':
          console.log('🟢 Replica started speaking:', event.data);
          setIsReplicaSpeaking(true);
          break;

        case 'conversation.replica.stopped_speaking':
          console.log('🔴 Replica stopped speaking:', event.data);
          setIsReplicaSpeaking(false);
          break;

        case 'conversation.user.started_speaking':
          console.log('🎤 User started speaking:', event.data);
          setIsUserSpeaking(true);
          break;

        case 'conversation.user.stopped_speaking':
          console.log('🔇 User stopped speaking:', event.data);
          setIsUserSpeaking(false);
          break;
      }
    } else if (message_type === 'system') {
      switch (event_type) {
        case 'system.replica_joined':
          console.log('🤖 Replica joined the conversation:', event.data);
          break;
      }
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

  // Function to append conversation context to Tavus
  const appendConversationContext = useCallback(async (context: string) => {
    if (!daily || !conversationId) return;

    try {
      await daily.sendAppMessage({
        message_type: 'conversation',
        event_type: 'conversation.append_llm_context',
        conversation_id: conversationId,
        properties: {
          context: context
        }
      });
      console.log('✅ Conversation context appended successfully:', context);
    } catch (error) {
      console.error('❌ Failed to append conversation context:', error);
    }
  }, [daily, conversationId]);

  // Append context whenever messages change
  useEffect(() => {
    if (messages.length > 0 && conversationId) {
      // Only append the latest message to avoid sending duplicate context
      const latestMessage = messages[messages.length - 1];

      console.log('🔄 New message added, appending latest message to context...');
      console.log('📝 Latest message:', latestMessage);

      // Format just the latest message
      const formattedContext = `${latestMessage.role === 'user' ? 'User' : 'Assistant'}: ${latestMessage.text}`;

      console.log('📋 Formatted context to append:', formattedContext);
      appendConversationContext(formattedContext);
    }
  }, [messages, conversationId, appendConversationContext]);


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
      <div className="relative w-full h-full overflow-hidden p-0">
        {/* Video Element or Daily Video */}
        {isInChat && conversationUrl ? (
          // Daily Video Call
          <div className="w-full h-full relative overflow-hidden">
            {/* Animated gradient overlay when replica is speaking */}
            {isReplicaSpeaking && (
              <div className="absolute inset-0 z-15 pointer-events-none">
                {/* Top edge gradient */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-gradient-move" />
                {/* Right edge gradient */}
                <div className="absolute top-0 right-0 bottom-0 w-2 bg-gradient-to-b from-blue-500 via-cyan-500 to-purple-500 animate-gradient-move-reverse" />
                {/* Bottom edge gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-l from-purple-500 via-pink-500 to-blue-500 animate-gradient-move" />
                {/* Left edge gradient */}
                <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-t from-blue-500 via-cyan-500 to-purple-500 animate-gradient-move-reverse" />
              </div>
            )}

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
          <div className="w-full h-full relative overflow-hidden">
            {/* Animated gradient overlay when replica is speaking */}
            {isReplicaSpeaking && (
              <div className="absolute inset-0 z-15 pointer-events-none">
                {/* Top edge gradient */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-gradient-move" />
                {/* Right edge gradient */}
                <div className="absolute top-0 right-0 bottom-0 w-2 bg-gradient-to-b from-blue-500 via-cyan-500 to-purple-500 animate-gradient-move-reverse" />
                {/* Bottom edge gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-l from-purple-500 via-pink-500 to-blue-500 animate-gradient-move" />
                {/* Left edge gradient */}
                <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-t from-blue-500 via-cyan-500 to-purple-500 animate-gradient-move-reverse" />
              </div>
            )}

            {!videoError && !forceGif ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster={posterUrl}
                muted
                autoPlay
                loop
                preload="auto"
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
                src="https://cdn.prod.website-files.com/63b2f566abde4cad39ba419f%2F67bf72cdf131ec10cbd8c67b_newmike%20(1).gif"
                alt="Charlie calling"
                fill
                className="object-cover"
                priority={false}
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
          <div className="absolute inset-0 bg-black/20 flex flex-col justify-end z-30">
            {/* Bottom section with button */}
            <div className="flex justify-center pb-6">
              <StatefulButton
                onClick={handleStartConversation}
                loadingText="Connecting..."
                successText="Connected!"
                className="min-w-[180px] backdrop-blur-sm shadow-lg"
                idleColor="hsla(322, 88%, 57%, 0.5)"
              >
                Let&apos;s Talk
              </StatefulButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 