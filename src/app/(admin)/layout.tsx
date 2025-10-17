// src/app/(admin)/layout.tsx

import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
        <nav className="flex flex-col space-y-4">
          <Link href="/admin" className="hover:bg-gray-700 p-2 rounded">
            대시보드
          </Link>
          <Link href="/admin/posts" className="hover:bg-gray-700 p-2 rounded">
            게시물 관리
          </Link>
          <Link href="/" className="hover:bg-gray-700 p-2 rounded mt-auto">
            사이트로 돌아가기
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-gray-100">{children}</main>
    </div>
  );
}
