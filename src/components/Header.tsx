'use client';

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from '@/store/useStore';
import { useEffect } from 'react';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  
  const navItems = [
    { href: "/", label: "홈" },
    { href: "/about", label: "회사 소개" },
    { href: "/products", label: "제품" },
    { href: "/notice", label: "공지사항" },
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
      className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4 bg-white/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 dark:bg-gray-900/80 shadow-sm"
    >
       <motion.div
         whileHover={{ scale: 1.05 }}
         whileTap={{ scale: 0.95 }}
         className="flex-shrink-0"
       >
         <Link href="/" className="flex items-center">
           <Image 
             src="/mainLogo.svg" 
             alt="My Company Logo" 
             width={120} 
             height={60}
             className="h-16 w-auto object-contain"
             priority
           />
         </Link>
       </motion.div>
      <nav className="flex gap-4 md:gap-6 items-center">
        {navItems.map((item, index) => {
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
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
              >
                {item.label}
              </Link>
            </motion.div>
          );
        })}
        
        {/* 테마 토글 버튼 */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="ml-4 p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          aria-label="테마 변경"
        >
          {theme === 'light' ? (
            <FaMoon className="text-lg" />
          ) : (
            <FaSun className="text-lg" />
          )}
        </motion.button>
      </nav>
    </motion.header>
  );
}
