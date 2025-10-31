'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import { transparentBlurDataURL } from '@/lib/images/placeholder';
import { X } from 'lucide-react';

interface PortfolioItem {
  id: string;
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
  images: any[];
  created_at: string;
}

interface PortfolioCardProps {
  item: PortfolioItem;
}

export function PortfolioCard({ item }: PortfolioCardProps) {
  const firstImage = Array.isArray(item.images) && item.images[0] 
    ? (typeof item.images[0] === "string" 
        ? item.images[0] 
        : (item.images[0].medium || item.images[0].thumb || item.images[0].original))
    : null;

  const allImages = Array.isArray(item.images) 
    ? item.images.map(img => typeof img === "string" ? img : (img.medium || img.original || img.thumb))
    : [];

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <div className="group relative bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-orange-500 dark:hover:border-orange-500 transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer">
          {/* 이미지 */}
          {firstImage && (
            <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <Image
                src={firstImage}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                placeholder="blur"
                blurDataURL={transparentBlurDataURL}
              />
              {/* 그라데이션 오버레이 - 호버 시 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}
          
          {/* 호버 시 나타나는 텍스트 콘텐츠 */}
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/90 to-transparent">
            <h2 className="text-lg font-semibold mb-2 text-white line-clamp-1">
              {item.title}
            </h2>
            
            <div className="space-y-1 mb-2">
              <p className="text-xs text-gray-200">
                <span className="font-medium">분야:</span> {item.field}
              </p>
              <p className="text-xs text-gray-200">
                <span className="font-medium">목적:</span> {item.purpose} · <span className="font-medium">종류:</span> {item.type}
              </p>
              <p className="text-xs text-gray-200">
                <span className="font-medium">형태:</span> {item.format} · <span className="font-medium">규격:</span> {item.size}
              </p>
            </div>

            <div className="border-t border-white/20 pt-2 mt-2">
              <p className="text-xs text-gray-300">
                <span>지류: {item.paper}</span>
                <span className="mx-1.5">·</span>
                <span>인쇄: {item.printing}</span>
                <span className="mx-1.5">·</span>
                <span>후가공: {item.finishing}</span>
              </p>
            </div>

            {item.description && (
              <p className="text-xs text-gray-300 mt-2 line-clamp-2">
                {item.description}
              </p>
            )}

            {allImages.length > 1 && (
              <p className="text-xs text-orange-400 mt-2 font-medium">
                이미지 {allImages.length}개 보기
              </p>
            )}
          </div>
        </div>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[90vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg focus:outline-none data-[state=open]:animate-contentShow overflow-y-auto">
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </Dialog.Close>

          <Dialog.Title className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            {item.title}
          </Dialog.Title>

          {/* 이미지 갤러리 */}
          {allImages.length > 0 && (
            <div className="mb-6">
              {allImages.length === 1 ? (
                <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <Image
                    src={allImages[0]}
                    alt={item.title}
                    fill
                    className="object-contain"
                    sizes="90vw"
                    placeholder="blur"
                    blurDataURL={transparentBlurDataURL}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {allImages.map((img, idx) => (
                    <div key={idx} className="relative w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <Image
                        src={img}
                        alt={`${item.title} - ${idx + 1}`}
                        fill
                        className="object-contain"
                        sizes="90vw"
                        placeholder="blur"
                        blurDataURL={transparentBlurDataURL}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 상세 정보 */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">분야</p>
                <p className="text-base text-gray-900 dark:text-gray-100">{item.field}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">목적</p>
                <p className="text-base text-gray-900 dark:text-gray-100">{item.purpose}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">종류</p>
                <p className="text-base text-gray-900 dark:text-gray-100">{item.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">형태</p>
                <p className="text-base text-gray-900 dark:text-gray-100">{item.format}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">규격</p>
                <p className="text-base text-gray-900 dark:text-gray-100">{item.size}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">지류</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">{item.paper}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">인쇄</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">{item.printing}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">후가공</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">{item.finishing}</p>
                </div>
              </div>
            </div>

            {item.description && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">설명</p>
                <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                등록일: {new Date(item.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}