'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { FaHome, FaBuilding, FaBox, FaBullhorn } from "react-icons/fa";
import { useTheme } from '@/store/useStore';
import { useEffect } from 'react';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  
  const navItems = [
    { href: "/", label: "홈", icon: FaHome },
    { href: "/about", label: "회사 소개", icon: FaBuilding },
    { href: "/products", label: "제품", icon: FaBox },
    { href: "/notice", label: "공지사항", icon: FaBullhorn },
  ];

  // 테마 변경 시 html 클래스 업데이트
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="flex justify-between items-center p-4 md:p-6 bg-white border-b shadow-sm sticky top-0 z-50"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link href="/" className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <strong>My Company</strong>
        </Link>
      </motion.div>
      <nav className="flex gap-4 md:gap-6 items-center">
        {navItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={item.href}
                className="text-gray-600 hover:text-blue-500 transition-colors flex items-center gap-1"
              >
                <IconComponent />
                {item.label}
              </Link>
            </motion.div>
          );
        })}
        
        {/* 테마 토글 버튼 */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="ml-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          aria-label="테마 변경"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </motion.button>
      </nav>
    </motion.header>
  );
}
