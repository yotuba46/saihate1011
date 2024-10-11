import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import FirebaseInitializer from '@/components/firebase-initializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '最果ての迷宮',
  description: 'オンラインマルチプレイヤー迷宮探索ゲーム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FirebaseInitializer>
            {children}
          </FirebaseInitializer>
        </ThemeProvider>
      </body>
    </html>
  );
}