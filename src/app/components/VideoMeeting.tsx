'use client';

import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Mic, MicOff, Camera, CameraOff, Captions, Square, Circle, Phone } from 'lucide-react';
import DailyIframe from '@daily-co/daily-js';
import { DailyConfig } from './Daily/DailyConfig';
import { useConversation } from '@/lib/hooks';

// Global call object management to prevent duplicates
let globalCallObject: any = null;

const getOrCreateCallObject = () => {
  if (!globalCallObject) {
    globalCallObject = DailyIframe.createCallObject();
  }
  return globalCallObject;
};

// Function to destroy the global call object
const destroyCallObject = async () => {
  console.log('VideoMeeting - Destroying call object');
  if (globalCallObject) {
    try {
      await globalCallObject.leave();
      console.log('VideoMeeting - Successfully left call during destroy');
    } catch (err) {
      console.log('Error leaving call during destroy:', err);
    }
    try {
      globalCallObject.destroy();
      console.log('VideoMeeting - Successfully destroyed call object');
    } catch (err) {
      console.log('Error destroying call object:', err);
    }
    globalCallObject = null;
    console.log('VideoMeeting - Call object destroyed');
  } else {
    console.log('VideoMeeting - No call object to destroy');
  }
};

interface VideoMeetingProps {
  onReset: () => void;
  dailyConfig?: DailyConfig;
}

export default function VideoMeeting({ onReset, dailyConfig }: VideoMeetingProps) {
  const { conversation, getConversationId } = useConversation();
  const videoRef = useRef<HTMLDivElement>(null);
  
  // Debug: Log conversation data when component mounts or conversation changes
  useEffect(() => {
    console.log('VideoMeeting - Component mounted/updated');
    if (conversation) {
      console.log('VideoMeeting - Conversation data:', conversation);
      console.log('VideoMeeting - Conversation ID:', getConversationId());
      console.log('VideoMeeting - Conversation URL:', conversation.conversation_url);
    } else {
      console.log('VideoMeeting - No conversation data available');
    }
  }, [conversation, getConversationId]);
  const callRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<any>({});
  const [localParticipant, setLocalParticipant] = useState<any>(null);
  
  // Control states - camera on by default
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCaptionsOn, setIsCaptionsOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isEndingConversation, setIsEndingConversation] = useState(false);

  useEffect(() => {
    console.log('VideoMeeting - useEffect triggered for video call');
    console.log('VideoMeeting - conversation?.conversation_url:', conversation?.conversation_url);
    console.log('VideoMeeting - conversation?.conversation_id:', conversation?.conversation_id);
    
    if (!conversation?.conversation_url || !videoRef.current) {
      console.log('VideoMeeting - Skipping video call setup - missing URL or video ref');
      return;
    }

    const startVideoCall = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Clear the container
        if (videoRef.current) {
          videoRef.current.innerHTML = '';
        }

        // Destroy any existing call object first
        await destroyCallObject();

        // Create a fresh call object
        const call = getOrCreateCallObject();
        callRef.current = call;
        console.log('VideoMeeting - Created fresh call object');

        // Handle remote participants
        const updateRemoteParticipants = () => {
          const participants = call.participants();
          const remotes: any = {};
          let local: any = null;
          Object.entries(participants).forEach(([id, p]: [string, any]) => {
            if (id === 'local') local = p;
            else remotes[id] = p;
          });
          setRemoteParticipants(remotes);
          setLocalParticipant(local);
        };

        // Set up event listeners
        call.on('participant-joined', updateRemoteParticipants);
        call.on('participant-updated', updateRemoteParticipants);
        call.on('participant-left', updateRemoteParticipants);

        // Join the Tavus CVI meeting
        console.log('VideoMeeting - Joining meeting:', conversation.conversation_url);
        await call.join({ url: conversation.conversation_url });
        console.log('VideoMeeting - Successfully joined meeting');
        setIsLoading(false);
      } catch (err) {
        console.error('Error starting video call:', err);
        setError('Failed to start video call');
        setIsLoading(false);
      }
    };

    startVideoCall();

    // Cleanup function
    return () => {
      if (callRef.current) {
        try {
          callRef.current.leave();
        } catch (err) {
          console.log('Error leaving call:', err);
        }
      }
      if (videoRef.current) {
        videoRef.current.innerHTML = '';
      }
    };
  }, [conversation?.conversation_url, conversation?.conversation_id]); // Added conversation_id as dependency



  // Attach remote and local video and audio tracks
  useEffect(() => {
    // Local participant
    if (localParticipant) {
      const videoEl = document.getElementById('local-video') as HTMLVideoElement;
      if (videoEl && localParticipant.tracks.video && localParticipant.tracks.video.state === 'playable' && localParticipant.tracks.video.persistentTrack) {
        videoEl.srcObject = new MediaStream([localParticipant.tracks.video.persistentTrack]);
      }
      const audioEl = document.getElementById('local-audio') as HTMLAudioElement;
      if (audioEl && localParticipant.tracks.audio && localParticipant.tracks.audio.state === 'playable' && localParticipant.tracks.audio.persistentTrack) {
        audioEl.srcObject = new MediaStream([localParticipant.tracks.audio.persistentTrack]);
      }
    }
    // Remote participants
    Object.entries(remoteParticipants).forEach(([id, p]: [string, any]) => {
      // Video
      const videoEl = document.getElementById(`remote-video-${id}`) as HTMLVideoElement;
      if (videoEl && p.tracks.video && p.tracks.video.state === 'playable' && p.tracks.video.persistentTrack) {
        videoEl.srcObject = new MediaStream([p.tracks.video.persistentTrack]);
      }
      // Audio
      const audioEl = document.getElementById(`remote-audio-${id}`) as HTMLAudioElement;
      if (audioEl && p.tracks.audio && p.tracks.audio.state === 'playable' && p.tracks.audio.persistentTrack) {
        audioEl.srcObject = new MediaStream([p.tracks.audio.persistentTrack]);
      }
    });
  }, [localParticipant, remoteParticipants]);

  // Control functions
  const toggleCamera = async () => {
    if (!callRef.current) return;
    
    try {
      if (isCameraOn) {
        await callRef.current.setLocalVideo(false);
        setIsCameraOn(false);
      } else {
        await callRef.current.setLocalVideo(true);
        setIsCameraOn(true);
      }
    } catch (err) {
      console.error('Error toggling camera:', err);
    }
  };

  const toggleMic = async () => {
    if (!callRef.current) return;
    
    try {
      if (isMicOn) {
        await callRef.current.setLocalAudio(false);
        setIsMicOn(false);
      } else {
        await callRef.current.setLocalAudio(true);
        setIsMicOn(true);
      }
    } catch (err) {
      console.error('Error toggling microphone:', err);
    }
  };

  const toggleCaptions = async () => {
    if (!callRef.current) return;
    
    // Toggle captions state (UI only since Daily.js doesn't support client-side captions control)
    setIsCaptionsOn(!isCaptionsOn);
  };

  const toggleRecording = async () => {
    if (!callRef.current) return;
    
    try {
      if (isRecording) {
        await callRef.current.stopRecording();
        setIsRecording(false);
      } else {
        await callRef.current.startRecording();
        setIsRecording(true);
      }
    } catch (err) {
      console.error('Error toggling recording:', err);
    }
  };

  const endConversation = async () => {
    const conversationId = getConversationId();
    if (!conversationId) {
      console.error('No conversation ID available');
      return;
    }

    try {
      setIsEndingConversation(true);
      
      // Call the Tavus API to end the conversation
      const response = await fetch('/api/end-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to end conversation');
      }

      // Leave the Daily call and destroy the call object
      if (callRef.current) {
        await callRef.current.leave();
      }
      await destroyCallObject();

      // Call the onReset callback to return to the initial state
      onReset();
    } catch (err) {
      console.error('Error ending conversation:', err);
      setError('Failed to end conversation');
    } finally {
      setIsEndingConversation(false);
    }
  };

  return (
    <Card className="w-full h-fit bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="text-center pb-4">
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Video Container */}
        <div className="space-y-4">
          <div className="bg-black rounded-lg flex items-center justify-center relative w-full h-full" style={{ minHeight: 300 }}>
            {isLoading && (
              <div className="text-center text-white absolute inset-0 flex items-center justify-center z-10">
                <div>
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
                  <p className="text-lg font-semibold">Starting Video Meeting...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="text-center text-white absolute inset-0 flex items-center justify-center z-10">
                <div>
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold text-red-400">Failed to start meeting</p>
                  <p className="text-sm opacity-75">{error}</p>
                </div>
              </div>
            )}
            {/* Video Participants */}
            <div
              ref={videoRef}
              className="w-full h-full flex flex-col gap-y-4"
            >
              {/* Remote participants first (top) */}
              {Object.entries(remoteParticipants).map(([id, p]: [string, any]) => (
                <div
                  key={id}
                  className="relative bg-gray-800 rounded-lg overflow-hidden w-full flex-1"
                >
                  <video
                    id={`remote-video-${id}`}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <audio id={`remote-audio-${id}`} autoPlay playsInline />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm text-white">
                    {p.user_name || id.slice(-4)}
                  </div>
                </div>
              ))}
              {/* Local participant last (bottom) */}
              {localParticipant && (
                <div
                  key={localParticipant.session_id || 'local'}
                  className="relative bg-gray-800 rounded-lg overflow-hidden w-full flex-1"
                >
                  <video
                    id="local-video"
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <audio id="local-audio" autoPlay playsInline muted />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm text-white">
                    {localParticipant.user_name || 'You'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Control Bar */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-center gap-4">
              {/* Show all controls if closed captions are not enabled, otherwise show only captions */}
              {!dailyConfig?.enableClosedCaptions ? (
                <>
                  {/* Camera Toggle */}
                  <Button
                    onClick={toggleCamera}
                    variant={isCameraOn ? "default" : "destructive"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {isCameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                    {isCameraOn ? 'Camera On' : 'Camera Off'}
                  </Button>

                  {/* Microphone Toggle */}
                  <Button
                    onClick={toggleMic}
                    variant={isMicOn ? "default" : "destructive"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    {isMicOn ? 'Mic On' : 'Mic Off'}
                  </Button>

                  {/* Captions Toggle */}
                  <Button
                    onClick={toggleCaptions}
                    variant={isCaptionsOn ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Captions className="h-4 w-4" />
                    {isCaptionsOn ? 'Captions On' : 'Captions Off'}
                  </Button>

                  {/* Recording Toggle */}
                  <Button
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {isRecording ? <Square className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </Button>

                  {/* End Conversation Button */}
                  <Button
                    onClick={endConversation}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={isEndingConversation}
                  >
                    <Phone className="h-4 w-4" />
                    {isEndingConversation ? 'Ending...' : 'End Conversation'}
                  </Button>
                </>
              ) : (
                <>
                  {/* Show only captions when closed captions are enabled */}
                  <Button
                    onClick={toggleCaptions}
                    variant={isCaptionsOn ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Captions className="h-4 w-4" />
                    {isCaptionsOn ? 'Captions On' : 'Captions Off'}
                  </Button>

                  {/* End Conversation Button */}
                  <Button
                    onClick={endConversation}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={isEndingConversation}
                  >
                    <Phone className="h-4 w-4" />
                    {isEndingConversation ? 'Ending...' : 'End Conversation'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Meeting URL Section */}
        {conversation?.conversation_url && (
          <div className="space-y-3 pt-4 border-t border-blue-200">
            <h4 className="font-semibold text-lg text-gray-900">Meeting URL:</h4>
            <Card className="bg-white border-blue-200">
              <CardContent className="pt-4">
                <p className="text-xs text-gray-600 mb-3 break-all font-mono bg-gray-50 p-2 rounded">
                  {conversation.conversation_url}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 