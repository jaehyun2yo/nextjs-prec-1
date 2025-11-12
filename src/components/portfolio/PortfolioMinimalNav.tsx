'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function PortfolioMinimalNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  // 포트폴리오 페이지에서는 항상 표시
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const navItems = [
    { href: "/about", label: "소개" },
    { href: "/portfolio", label: "포트폴리오" },
    { href: "/notice", label: "공지사항" },
    { href: "/contact", label: "문의하기" },
  ];
  
  // 포트폴리오 페이지가 아니면 렌더링하지 않음
  if (pathname !== '/portfolio') {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[80] pointer-events-auto"
    >
          <motion.div 
            className="bg-black/80 backdrop-blur-xl rounded-full px-8 py-4 shadow-2xl border border-white/10"
            whileHover={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              borderColor: 'rgba(255, 255, 255, 0.2)'
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between gap-10">
              {/* 로고 */}
              <Link href="/" className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-8 w-auto overflow-hidden flex items-center"
                >
                  <Image 
                    src="/mainLogo.svg" 
                    alt="My Company Logo" 
                    width={120} 
                    height={40}
                    className="max-h-full max-w-full object-contain"
                    priority
                  />
                </motion.div>
              </Link>
              
              {/* 구분선 */}
              <div className="h-6 w-px bg-white/20" />
              
              {/* 메뉴 항목들 */}
              <div className="flex items-center gap-8">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      className="relative group"
                    >
                      <span
                        className={`text-sm font-medium transition-colors duration-300 ${
                          pathname === item.href
                            ? 'text-white'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </span>
                      {pathname === item.href && (
                        <motion.div
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white"
                          layoutId="activeTab"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/50 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
                      />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.nav>
  );
}

