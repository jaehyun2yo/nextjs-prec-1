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

  // 테마 변경 시 html 클래스 업데이트 (초기 마운트 및 변경 시 모두 처리)
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = theme || 'light';
    
    // 기존 클래스와 스타일 초기화
    root.classList.remove('dark');
    root.style.colorScheme = '';
    
    // 현재 테마에 맞게 적용
    if (currentTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      // 라이트 모드: dark 클래스 제거 (명시적으로)
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4 bg-white/90 dark:bg-gray-900 backdrop-blur-lg border-b border-gray-300 dark:border-gray-700 sticky top-0 z-50 shadow-md dark:shadow-lg transition-all duration-300"
    >
       <motion.div
         whileHover={{ scale: 1.05 }}
         whileTap={{ scale: 0.95 }}
         className="flex-shrink-0"
       >
         <Link href="/" className="flex items-center">
           <div className="h-8 md:h-10 w-auto overflow-hidden flex items-center">
             <Image 
               src="/mainLogo.svg" 
               alt="My Company Logo" 
               width={120} 
               height={40}
               className="max-h-full max-w-full object-contain"
               priority
             />
           </div>
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
                className="text-gray-900 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 font-medium"
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
          className="ml-4 p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-gray-900 dark:text-gray-300 hover:text-orange-600 transition-all duration-300"
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
