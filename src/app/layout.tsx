import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Providers } from './providers';
import { Toaster } from 'sonner';
import { verifySession, getSessionUser } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 세션 확인 (관리자 페이지가 아닌 경우에도 로그인 상태 확인)
  const isAuthenticated = await verifySession();
  const user = await getSessionUser();
  
  // 현재 경로 확인 (업체 전용 페이지인지 확인)
  // middleware에서 설정한 x-pathname 헤더를 확인
  let isCompanyPage = false;
  try {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '';
    // /company/로 시작하는 모든 경로는 업체 전용 페이지 (공정관리페이지)
    // 이 경우 메인 네비게이션바(Header)를 숨김
    isCompanyPage = pathname.startsWith('/company/');
  } catch {
    // headers() 호출 실패 시 기본값 사용
    isCompanyPage = false;
  }
  
  // 업체 정보 가져오기 (업체 로그인인 경우)
  let companyName: string | null = null;
  if (user?.userType === 'company' && user?.userId) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: companyData } = await supabase
        .from('companies')
        .select('company_name')
        .eq('id', user.userId)
        .single();
      
      if (companyData) {
        companyName = companyData.company_name;
      }
    } catch (error) {
      console.error('Error fetching company name:', error);
    }
  }

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
          {/* 업체 전용 페이지가 아닐 때만 Header 표시 */}
          {!isCompanyPage && (
            <Header 
              isAuthenticated={isAuthenticated} 
              userType={user?.userType || null}
              companyName={companyName}
            />
          )}
          <main className="flex-1 bg-white dark:bg-gray-900 min-h-[calc(100vh-80px)] transition-colors duration-300" suppressHydrationWarning>
            {children}
          </main>
          {/* 업체 전용 페이지가 아닐 때만 Footer 표시 */}
          {!isCompanyPage && <Footer />}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
