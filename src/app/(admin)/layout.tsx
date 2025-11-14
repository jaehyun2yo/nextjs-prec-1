// src/app/(admin)/layout.tsx

import Link from 'next/link';
import { verifySession, getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { ToastProvider } from '@/components/toast/ToastProvider';
import { AdminToastProvider } from './AdminToastProvider';
import { AdminNavLink } from './components/AdminNavLink';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 세션 검증
  const isAuthenticated = await verifySession();

  if (!isAuthenticated) {
    redirect('/login');
  }

  // 관리자만 접근 가능
  const user = await getSessionUser();
  if (user?.userType === 'company') {
    redirect('/company/dashboard');
  }
  return (
    <ToastProvider placement="top-center" maxVisibleToasts={10}>
      <div className="flex min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-100 p-4 lg:p-6 border-r border-gray-700 dark:border-gray-700 flex-shrink-0 overflow-y-auto">
          <h1 className="text-xl lg:text-2xl font-bold mb-6 lg:mb-8">Admin Panel</h1>
          <nav className="flex flex-col space-y-2 lg:space-y-4">
            <AdminNavLink href="/admin">대시보드</AdminNavLink>
            <AdminNavLink href="/admin/posts">공지사항 관리</AdminNavLink>
            <AdminNavLink href="/admin/portfolio">포트폴리오 관리</AdminNavLink>
            <AdminNavLink href="/admin/contacts" showBadge={true}>
              문의하기 관리
            </AdminNavLink>
            <AdminNavLink href="/admin/companies">업체관리</AdminNavLink>
            <AdminNavLink href="/admin/bookings">예약 관리</AdminNavLink>
            <AdminNavLink href="/" className="mt-auto">
              사이트로 돌아가기
            </AdminNavLink>
          </nav>
        </aside>
        <main className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-w-0">
          {children}
        </main>
        <AdminToastProvider />
      </div>
    </ToastProvider>
  );
}
