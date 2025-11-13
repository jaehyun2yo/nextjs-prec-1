'use client';

import Link from "next/link";
import Image from "next/image";
import { FaPhone, FaFax, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="bg-gray-100 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 mt-auto transition-colors duration-300"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8">
          {/* 로고 및 연락처 정보 */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center" aria-label="홈으로 이동">
              <div className="h-8 w-auto overflow-hidden flex items-center">
                <Image
                  src="/mainLogo.svg"
                  alt="회사 로고"
                  width={120}
                  height={40}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </Link>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p className="leading-relaxed">
                서울 중구 퇴계로39길 20, 2층<br />
                <span className="text-xs">(평일 9:00 ~ 19:00 주말 및 공휴일 휴무)</span>
              </p>
              <p className="flex items-center gap-2">
                <FaPhone className="text-gray-500 dark:text-gray-500" aria-hidden="true" />
                <a href="tel:02-2264-8070" className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                  02-2264-8070
                </a>
              </p>
              <p className="flex items-center gap-2">
                <FaFax className="text-gray-500 dark:text-gray-500" aria-hidden="true" />
                <span className="text-gray-600 dark:text-gray-400">02-2264-8310</span>
              </p>
              <p className="flex items-center gap-2">
                <FaEnvelope className="text-gray-500 dark:text-gray-500" aria-hidden="true" />
                <a 
                  href="mailto:aone8070@korea.com" 
                  className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  aria-label="이메일 보내기: aone8070@korea.com"
                >
                  aone8070@korea.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* 저작권 정보 */}
        <div className="border-t border-gray-300 dark:border-gray-700 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
              © {currentYear} All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
              <Link
                href="/privacy"
                className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                aria-label="개인정보처리방침"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/terms"
                className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                aria-label="이용약관"
              >
                이용약관
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

