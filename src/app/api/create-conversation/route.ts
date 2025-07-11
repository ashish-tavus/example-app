import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    let body;
    let dailyConfig;
    
    try {
      body = await request.json();
      dailyConfig = body?.dailyConfig;
    } catch (parseError) {
      // If no body is sent, use default config
      dailyConfig = null;
    }
    
    const apiKey = process.env.TAVUS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Tavus API key not configured. Please set TAVUS_API_KEY in your environment variables.' },
        { status: 500 }
      );
    }

    // Use dailyConfig if provided, otherwise use defaults
    const enableRecording = dailyConfig?.enableRecording ?? true;
    const enableClosedCaptions = dailyConfig?.enableClosedCaptions ?? true;
    
    const tavusResponse = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        replica_id: process.env.TAVUS_REPLICA_ID || "r79e1c033f",
        persona_id: process.env.TAVUS_PERSONA_ID || "p5317866",
        callback_url: process.env.TAVUS_CALLBACK_URL || "https://yourwebsite.com/webhook",
        conversation_name: "A Meeting with Hassaan",
        conversational_context: "You are about to talk to Hassaan, one of the cofounders of Tavus. He loves to talk about AI, startups, and racing cars.",
        custom_greeting: "Hey there Hassaan, long time no see!",
        properties: {
          max_call_duration: 3600,
          participant_left_timeout: 60,
          participant_absent_timeout: 300,
          enable_recording: enableRecording,
          enable_closed_captions: enableClosedCaptions,
          apply_greenscreen: false,
          language: "english",
          recording_s3_bucket_name: "conversation-recordings",
          recording_s3_bucket_region: "us-east-1",
          aws_assume_role_arn: "",
        }
      }),
    });

    if (!tavusResponse.ok) {
      const errorData = await tavusResponse.text();
      console.error('Tavus API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create conversation', details: errorData },
        { status: tavusResponse.status }
      );
    }

    const conversationData = await tavusResponse.json();
    
    return NextResponse.json({
      success: true,
      conversation: conversationData
    });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 