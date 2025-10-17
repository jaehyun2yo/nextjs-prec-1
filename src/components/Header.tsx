import Link from "next/link";



export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 md:p-6 bg-white border-b shadow-sm">
      <Link href="/" className="text-xl font-bold text-gray-800">
        <strong>My Company</strong>
      </Link>
      <nav className="flex gap-4 md:gap-6">
        <Link
          href="/"
          className="text-gray-600 hover:text-blue-500 transition-colors"
        >
          홈
        </Link>
        <Link
          href="/about"
          className="text-gray-600 hover:text-blue-500 transition-colors"
        >
          회사 소개
        </Link>
        <Link
          href="/products"
          className="text-gray-600 hover:text-blue-500 transition-colors"
        >
          제품
        </Link>
        <Link
          href="/notice"
          className="text-gray-600 hover:text-blue-500 transition-colors"
        >
          공지사항
        </Link>
      </nav>
    </header>
  );
}
