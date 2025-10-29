import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/components/Header';
import { Providers } from './providers';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "타이틀",
  description: "소개",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const root = document.documentElement;
                  const theme = localStorage.getItem('app-storage');
                  if (theme) {
                    const parsed = JSON.parse(theme);
                    if (parsed.state && parsed.state.theme === 'dark') {
                      root.classList.add('dark');
                    } else {
                      root.classList.remove('dark');
                    }
                  } else {
                    // 기본값: 라이트 모드
                    root.classList.remove('dark');
                  }
                } catch (e) {
                  // 에러 발생 시 라이트 모드로 설정
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
        <Providers>
          <Header />
          <main className="p-8 min-h-screen" >
            {children}
          </main>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
