'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { transparentBlurDataURL } from '@/lib/images/placeholder';

interface PortfolioItem {
  id: number;
  title: string;
  field: string;
  purpose: string;
  type: string;
  format: string;
  size: string;
  paper: string;
  printing: string;
  finishing: string;
  description: string;
  images: string[] | Array<{ original: string; thumbnail?: string; medium?: string }>;
  created_at: string;
}

interface PortfolioCardProps {
  item: PortfolioItem;
  isHovered?: boolean;
  hasHoveredCard?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function PortfolioCard({ item, isHovered = false, hasHoveredCard = false, onMouseEnter, onMouseLeave }: PortfolioCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const firstImage = Array.isArray(item.images) && item.images[0] 
    ? (typeof item.images[0] === "string" 
        ? item.images[0] 
        : (item.images[0].medium || item.images[0].thumbnail || item.images[0].original))
    : null;

  const allImages = Array.isArray(item.images) 
    ? item.images.map(img => typeof img === "string" ? img : (img.medium || img.original || img.thumbnail))
    : [];

  useEffect(() => {
    if (isOpen) {
      // 스크롤바 너비 계산
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // body에 padding-right를 추가하여 스크롤바 공간 확보
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
    } else {
      // 원래대로 복원
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`group relative bg-white dark:bg-gray-800 overflow-hidden transition-all duration-300 shadow-md cursor-pointer ${
          isHovered 
            ? 'z-10' 
            : hasHoveredCard 
              ? 'opacity-40' 
              : ''
        }`}
      >
          {/* 이미지 */}
          {firstImage && (
            <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <Image
                src={firstImage}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                placeholder="blur"
                blurDataURL={transparentBlurDataURL}
              />
            </div>
          )}
          
          {/* 호버 시 나타나는 텍스트 콘텐츠 - 오른쪽 하단에서 왼쪽으로 슬라이드 (리본 모양) */}
          <div className={`absolute bottom-0 right-0 transition-all duration-300 ${
            isHovered 
              ? 'translate-x-0 opacity-100' 
              : 'translate-x-full opacity-0'
          }`}>
            <div className="relative bg-black px-4 py-2 pr-6">
              <h2 className="text-lg font-semibold text-white line-clamp-1 whitespace-nowrap">
                {item.title}
              </h2>
              {/* 리본 끝 모양 (오른쪽 삼각형) */}
              <div className="absolute right-0 top-0 w-0 h-0 border-l-[12px] border-l-black border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent"></div>
            </div>
          </div>
        </div>

      {/* 모달 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fadeIn overflow-y-auto"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="fixed inset-0 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-scrollbar-hide">
              {/* 첫 번째 이미지 - 확대되면서 나타남 */}
              {allImages.length > 0 && (
                <div className="animate-expandFromCard">
                  <div className="relative w-full bg-gray-100 dark:bg-gray-700 rounded-t-lg overflow-hidden flex items-center justify-center max-h-[60vh]">
                    {allImages[0] && (
                      <Image
                        src={allImages[0]}
                        alt={item.title}
                        width={800}
                        height={600}
                        className="w-full h-auto max-w-full object-contain"
                        unoptimized
                      />
                    )}
                  </div>
                </div>
              )}

              {/* 헤더 */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center z-10 animate-fadeInContent">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{item.title}</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 내용 */}
              <div className="p-6 animate-fadeInContent">

                {/* 나머지 이미지들 (첫 번째 이미지 제외) */}
                {allImages.length > 1 && (
                  <div className="mb-6 space-y-4">
                    {allImages.slice(1).map((img, idx) => (
                      img && (
                        <div key={idx + 1} className="relative w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                          <Image
                            src={img}
                            width={800}
                            height={600}
                            alt={`${item.title} - 이미지 ${idx + 2}`}
                            className="w-full h-auto object-contain"
                            unoptimized
                          />
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* 상세 정보 */}
                <div className="space-y-6">
                {/* 기본 정보 */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                    기본 정보
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">분야</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{item.field}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">목적</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{item.purpose}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">종류</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{item.type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">형태</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{item.format}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">규격</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{item.size}</p>
                    </div>
                  </div>
                </div>

                {/* 제작 정보 */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                    제작 정보
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">지류</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{item.paper}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">인쇄</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{item.printing}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">후가공</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{item.finishing}</p>
                    </div>
                  </div>
                </div>

                {/* 설명 */}
                {item.description && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                      설명
                    </h3>
                    <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-line">
                      {item.description}
                    </p>
                  </div>
                )}

                {/* 등록일 */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                    등록 정보
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}