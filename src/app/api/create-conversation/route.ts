import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const apiKey = process.env.TAVUS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Tavus API key not configured. Please set TAVUS_API_KEY in your environment variables.' },
        { status: 500 }
      );
    }

    // Parse document IDs from environment variable
    const documentIds = process.env.TAVUS_DOCUMENT_IDS
      ? process.env.TAVUS_DOCUMENT_IDS.split(',').map(id => id.trim()).filter(id => id.length > 0)
      : [];

    const tavusResponse = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        replica_id: process.env.TAVUS_REPLICA_ID,
        persona_id: process.env.TAVUS_PERSONA_ID,
        callback_url: process.env.TAVUS_CALLBACK_URL,
        conversation_name: "Conversation with Tavus Customer",
        custom_greeting: "Hey there! How can I help you today?",
        document_ids: documentIds,
        properties: {
          max_call_duration: 1000,
          participant_left_timeout: 60,
          participant_absent_timeout: 300,
          enable_recording: true,
          enable_closed_captions: true,
          apply_greenscreen: false,
          language: "english",
          recording_s3_bucket_name: process.env.TAVUS_RECORDING_S3_BUCKET_NAME,
          recording_s3_bucket_region: process.env.TAVUS_RECORDING_S3_BUCKET_REGION,
          aws_assume_role_arn: process.env.TAVUS_AWS_ASSUME_ROLE_ARN,
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