'use client';

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaMoon, FaSun, FaSignOutAlt, FaUserCog } from "react-icons/fa";
import { useTheme } from '@/store/useStore';
import { useEffect, useState } from 'react';
import { logoutAction } from '@/app/actions/auth';

interface HeaderProps {
  isAuthenticated?: boolean;
}

export default function Header({ isAuthenticated = false }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const navItems = [
    { href: "/about", label: "소개" },
    { href: "/portfolio", label: "포트폴리오" },
    { href: "/notice", label: "공지사항" },
    { href: "/contact", label: "문의하기" },
  ];

  // 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  // 테마 변경 시 html 클래스 업데이트 (마운트 후에만 처리)
  useEffect(() => {
    if (!mounted) return;
    
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
  }, [theme, mounted]);

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
      <nav className="flex gap-2 md:gap-3 items-center">
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
                className="text-sm text-gray-900 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 font-medium"
              >
                {item.label}
              </Link>
            </motion.div>
          );
        })}
        
        {/* 로그인 상태에 따른 UI */}
        {isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: navItems.length * 0.1 }}
            className="ml-6 md:ml-8 flex items-center gap-2"
          >
            <span className="text-gray-900 dark:text-gray-300 text-xs px-2 py-2">
              관리자
            </span>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-gray-900 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300 text-xs"
              title="관리자 페이지"
            >
              <FaUserCog className="text-xs" />
              <span>관리자 페이지</span>
            </Link>
            <form action={logoutAction}>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-900 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 text-xs"
                title="로그아웃"
              >
                <FaSignOutAlt className="text-xs" />
                <span>로그아웃</span>
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: navItems.length * 0.1 }}
            className="ml-6 md:ml-8"
          >
            <Link
              href="/login"
              className="text-sm transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 font-medium"
              style={{
                color: '#ED6C00',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#d15f00';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#ED6C00';
              }}
            >
              기업 로그인
            </Link>
          </motion.div>
        )}
        
        {/* 테마 토글 버튼 */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="ml-4 p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-gray-900 dark:text-gray-300 hover:text-orange-600 transition-all duration-300"
          aria-label="테마 변경"
        >
          {(!mounted || theme === 'light') ? (
            <FaMoon className="text-lg" />
          ) : (
            <FaSun className="text-lg" />
          )}
        </motion.button>
      </nav>
    </motion.header>
  );
}
