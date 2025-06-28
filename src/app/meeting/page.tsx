'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DailyProvider } from '@daily-co/daily-react';
import Daily, { DailyCall } from '@daily-co/daily-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';

export default function MeetingPage() {
  const searchParams = useSearchParams();
  const meetingUrl = searchParams.get('url');
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [localAudio, setLocalAudio] = useState(true);
  const [localVideo, setLocalVideo] = useState(true);

  useEffect(() => {
    if (!meetingUrl) {
      setError('No meeting URL provided');
      return;
    }

    // Create the Daily call object
    const dailyCall = Daily.createCallObject();
    setCallObject(dailyCall);

    // Set up event listeners
    dailyCall.on('joining-meeting', () => {
      setIsJoining(true);
      setError(null);
    });

    dailyCall.on('joined-meeting', () => {
      setIsJoining(false);
      setIsJoined(true);
    });

    dailyCall.on('left-meeting', () => {
      setIsJoined(false);
    });

    dailyCall.on('error', (error: any) => {
      setError(error.errorMsg || 'Failed to join meeting');
      setIsJoining(false);
    });

    // Join the meeting
    dailyCall.join({ url: meetingUrl });

    // Cleanup function
    return () => {
      dailyCall.destroy();
    };
  }, [meetingUrl]);

  const handleLeaveMeeting = () => {
    if (callObject) {
      callObject.leave();
    }
  };

  const toggleAudio = () => {
    if (callObject) {
      callObject.setLocalAudio(!localAudio);
      setLocalAudio(!localAudio);
    }
  };

  const toggleVideo = () => {
    if (callObject) {
      callObject.setLocalVideo(!localVideo);
      setLocalVideo(!localVideo);
    }
  };

  if (!meetingUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Invalid Meeting URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No meeting URL provided. Please create a meeting first.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DailyProvider callObject={callObject}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Meeting Room</h1>
            <div className="flex gap-2">
              <Button
                onClick={toggleAudio}
                variant={localAudio ? "default" : "destructive"}
                size="sm"
                className="flex items-center gap-2"
              >
                {localAudio ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                {localAudio ? 'Mute' : 'Unmute'}
              </Button>
              <Button
                onClick={toggleVideo}
                variant={localVideo ? "default" : "destructive"}
                size="sm"
                className="flex items-center gap-2"
              >
                {localVideo ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                {localVideo ? 'Stop Video' : 'Start Video'}
              </Button>
              <Button
                onClick={handleLeaveMeeting}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <PhoneOff className="h-4 w-4" />
                Leave Meeting
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="mb-6">
              <CardContent className="pt-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isJoining && (
            <Card className="mb-6">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Joining meeting...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meeting Content */}
          {isJoined && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Video Area */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting Video</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Video will appear here when participants join</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Participants List */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Participants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                          You
                        </div>
                        <span className="text-sm">You (Host)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </DailyProvider>
  );
} 