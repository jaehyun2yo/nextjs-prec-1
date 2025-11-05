// src/app/(admin)/layout.tsx

import Link from "next/link";
import { verifySession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 세션 검증
  const isAuthenticated = await verifySession();
  
  if (!isAuthenticated) {
    redirect("/login");
  }
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <aside className="hidden lg:block w-64 bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-100 p-4 lg:p-6 border-r border-gray-700 dark:border-gray-700 flex-shrink-0">
        <h1 className="text-xl lg:text-2xl font-bold mb-6 lg:mb-8">Admin Panel</h1>
        <nav className="flex flex-col space-y-2 lg:space-y-4">
          <Link
            href="/admin"
            className="hover:bg-gray-700 dark:hover:bg-gray-800 p-2 rounded transition-colors duration-300 text-sm lg:text-base"
          >
            대시보드
          </Link>
          <Link
            href="/admin/posts"
            className="hover:bg-gray-700 dark:hover:bg-gray-800 p-2 rounded transition-colors duration-300 text-sm lg:text-base"
          >
            공지사항 관리
          </Link>
          <Link
            href="/admin/portfolio"
            className="hover:bg-gray-700 dark:hover:bg-gray-800 p-2 rounded transition-colors duration-300 text-sm lg:text-base"
          >
            포트폴리오 관리
          </Link>
          <Link
            href="/admin/contacts"
            className="hover:bg-gray-700 dark:hover:bg-gray-800 p-2 rounded transition-colors duration-300 text-sm lg:text-base"
          >
            문의하기 관리
          </Link>
          <Link
            href="/"
            className="hover:bg-gray-700 dark:hover:bg-gray-800 p-2 rounded mt-auto transition-colors duration-300 text-sm lg:text-base"
          >
            사이트로 돌아가기
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-w-0">{children}</main>
    </div>
  );
}
