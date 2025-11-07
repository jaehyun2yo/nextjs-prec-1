'use client';

import { BUTTON_STYLES } from '@/lib/styles';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function ErrorModal({
  isOpen,
  onClose,
  title = '오류가 발생했습니다',
  message = '다시 시도해주세요.',
}: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 p-12 max-w-md w-full mx-8 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 dark:bg-red-900 mb-5">
            <svg className="h-7 w-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 whitespace-pre-line">
            {message}
          </p>
          <button
            onClick={onClose}
            className={`w-full ${BUTTON_STYLES.primary}`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

