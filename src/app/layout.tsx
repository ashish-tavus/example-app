import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import StoreProvider from '@/components/providers/StoreProvider';
import { DailyProvider } from '@/components/providers/DailyProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tavus AI Solution Engineer',
  description: 'Video chat with Charlie, your AI assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <DailyProvider>
            {children}
          </DailyProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
