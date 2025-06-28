# Tavus Meeting Integration

A Next.js application that integrates with the Tavus API to create AI-powered meetings and conversations.

## Features

- Create meetings with Tavus AI replicas
- Secure API key management using environment variables
- Real-time meeting creation and status feedback
- Responsive design for desktop and mobile

## Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd example-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp env.local.example .env.local
   ```
   
   Edit `.env.local` and add your Tavus API key:
   ```env
   TAVUS_API_KEY=your_actual_tavus_api_key_here
   
   # Optional: Override default conversation settings
   TAVUS_REPLICA_ID=r79e1c033f
   TAVUS_PERSONA_ID=p5317866
   TAVUS_CALLBACK_URL=https://yourwebsite.com/webhook
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

1. Click the "Create Meeting with Tavus" button
2. The application will use your configured API key to create a meeting
3. Once created, you'll see the conversation details and a link to join the meeting
4. Click "Join Meeting" to access the Tavus conversation

## Environment Variables

- `TAVUS_API_KEY` (required): Your Tavus API key
- `TAVUS_REPLICA_ID` (optional): The replica ID for the AI persona
- `TAVUS_PERSONA_ID` (optional): The persona ID for the conversation
- `TAVUS_CALLBACK_URL` (optional): Webhook URL for conversation events

## API Endpoints

- `POST /api/create-conversation`: Creates a new conversation with Tavus

## Technologies Used

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Tavus API

## Security

- API keys are stored securely in environment variables
- No sensitive data is exposed to the client-side
- All API calls are made server-side for security

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
