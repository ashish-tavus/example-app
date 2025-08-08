import { NextRequest, NextResponse } from 'next/server';

interface FeedbackRequest {
  IssueResolved: 'yes' | 'no';
  ConversationID: string;
  Feedback?: string;
  TavusUserAccount?: string;
  ChatTranscript?: object;
}

export async function POST(request: NextRequest) {
  try {
    const feedbackData: FeedbackRequest = await request.json();

    // Validate required fields
    if (!feedbackData.IssueResolved || !feedbackData.ConversationID) {
      return NextResponse.json(
        { error: 'Missing required fields: IssueResolved and ConversationID are required' },
        { status: 400 }
      );
    }

    // Get webhook URL from environment variables
    const webhookUrl = process.env.FEEDBACK_WEBHOOK_URL;
    
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Feedback webhook URL not configured. Please set FEEDBACK_WEBHOOK_URL in environment variables.' },
        { status: 500 }
      );
    }

    // Prepare the payload
    const payload = {
      IssueResolved: feedbackData.IssueResolved,
      ConversationID: feedbackData.ConversationID,
      Feedback: feedbackData.Feedback || '',
      TavusUserAccount: feedbackData.TavusUserAccount || '',
      ChatTranscript: feedbackData.ChatTranscript || { user: [], assistant: [] },
      timestamp: new Date().toISOString(),
    };

    console.log('ChatTranscript:', payload.ChatTranscript);

    // Create debug payload for logging (without the full transcript)
    const debugPayload = {
      IssueResolved: payload.IssueResolved,
      ConversationID: payload.ConversationID,
      Feedback: payload.Feedback,
      TavusUserAccount: payload.TavusUserAccount,
      ChatTranscript: Object.keys(payload.ChatTranscript as object).length > 0 ? '[TRANSCRIPT_INCLUDED]' : '[NO_TRANSCRIPT]',
      timestamp: payload.timestamp
    };
    
    console.log('Sending feedback to webhook:', { 
      url: webhookUrl, 
      payload: debugPayload
    });

    // Send to webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Webhook response error:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        body: errorText
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to send feedback to webhook',
          details: `Webhook returned ${webhookResponse.status}: ${webhookResponse.statusText}`
        },
        { status: 500 }
      );
    }

    const webhookResult = await webhookResponse.json().catch(() => ({}));
    console.log('Feedback sent successfully to webhook:', webhookResult);

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback sent successfully to webhook',
      webhookResponse: webhookResult
    });

  } catch (error) {
    console.error('Error sending feedback to webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error while sending feedback' },
      { status: 500 }
    );
  }
}
