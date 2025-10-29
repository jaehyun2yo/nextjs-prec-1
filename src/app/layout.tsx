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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const root = document.documentElement;
                  // 기존 클래스와 스타일 완전 초기화
                  root.classList.remove('dark');
                  root.style.colorScheme = '';
                  
                  const theme = localStorage.getItem('app-storage');
                  if (theme) {
                    const parsed = JSON.parse(theme);
                    if (parsed.state && parsed.state.theme === 'dark') {
                      root.classList.add('dark');
                      root.style.colorScheme = 'dark';
                    } else {
                      // 라이트 모드 확실히 적용
                      root.classList.remove('dark');
                      root.style.colorScheme = 'light';
                    }
                  } else {
                    // 기본값: 라이트 모드
                    root.classList.remove('dark');
                    root.style.colorScheme = 'light';
                  }
                } catch (e) {
                  // 에러 발생 시 라이트 모드로 설정
                  const root = document.documentElement;
                  root.classList.remove('dark');
                  root.style.colorScheme = 'light';
                }
              })();
            `,
          }}
        />
        <Providers>
          <Header />
          <main className="flex-1 bg-white dark:bg-gray-900 min-h-[calc(100vh-80px)] transition-colors duration-300" suppressHydrationWarning>
            {children}
          </main>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
