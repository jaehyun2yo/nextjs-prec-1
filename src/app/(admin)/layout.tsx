// src/app/(admin)/layout.tsx

import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <aside className="w-64 bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-100 p-6 border-r border-gray-700 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
        <nav className="flex flex-col space-y-4">
          <Link
            href="/admin"
            className="hover:bg-gray-700 dark:hover:bg-gray-800 p-2 rounded transition-colors duration-300"
          >
            대시보드
          </Link>
          <Link
            href="/admin/posts"
            className="hover:bg-gray-700 dark:hover:bg-gray-800 p-2 rounded transition-colors duration-300"
          >
            게시물 관리
          </Link>
          <Link
            href="/"
            className="hover:bg-gray-700 dark:hover:bg-gray-800 p-2 rounded mt-auto transition-colors duration-300"
          >
            사이트로 돌아가기
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">{children}</main>
    </div>
  );
}
