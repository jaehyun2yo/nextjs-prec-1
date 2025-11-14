'use client';

import Link from 'next/link';
import { AdminBadge } from '@/components/AdminBadge';

interface AdminNavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  showBadge?: boolean;
}

export function AdminNavLink({
  href,
  children,
  className = '',
  showBadge = false,
}: AdminNavLinkProps) {
  return (
    <Link
      href={href}
      className={`relative hover:bg-gray-700 dark:hover:bg-gray-800 p-2 rounded transition-colors duration-300 text-sm lg:text-base ${className}`}
    >
      {children}
      {showBadge && <AdminBadge userType="admin" />}
    </Link>
  );
}
