'use client';

import { useEffect, ReactNode } from 'react';
import { FaTimes } from 'react-icons/fa';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  showCloseButton?: boolean;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  showCancelButton?: boolean;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  showCloseButton = true,
  onConfirm,
  confirmLabel = '확인',
  cancelLabel = '취소',
  showCancelButton = true,
  isSubmitting = false,
  disabled = false,
  className = '',
}: BaseModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting && !disabled) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, isSubmitting, disabled]);

  // 엔터 키로 확인 처리 (textarea 내부에서는 Shift+Enter로 줄바꿈 가능)
  useEffect(() => {
    if (!isOpen || !onConfirm) return;

    const handleEnter = (e: KeyboardEvent) => {
      // textarea나 input 내부에서 Shift+Enter는 줄바꿈이므로 무시
      const target = e.target as HTMLElement;
      const isTextarea = target.tagName === 'TEXTAREA';
      const isInput = target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'submit' && (target as HTMLInputElement).type !== 'button';
      
      if (e.key === 'Enter' && !e.shiftKey && !isSubmitting && !disabled) {
        // textarea나 input 내부에서는 Enter 키를 기본 동작으로 허용
        if (isTextarea || isInput) {
          // form 내부의 input/textarea에서는 form submit을 트리거
          const form = target.closest('form');
          if (form && !isTextarea) {
            e.preventDefault();
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(submitEvent);
          }
          return;
        }
        
        e.preventDefault();
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleEnter);
    return () => document.removeEventListener('keydown', handleEnter);
  }, [isOpen, onConfirm, isSubmitting, disabled]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (!isSubmitting && !disabled) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4 overflow-y-auto modal-scrollbar-hide"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 px-3 py-12 ${maxWidthClasses[maxWidth]} w-full mx-8 animate-scaleIn max-h-[90vh] overflow-y-auto modal-scrollbar-hide ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between mb-6">
            {title && (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                disabled={isSubmitting || disabled}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <FaTimes className="text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        )}

        {/* 내용 */}
        <div className="space-y-4">
          {children}
        </div>

        {/* 버튼 */}
        {(onConfirm || showCancelButton) && (
          <div className="flex items-center justify-center gap-3 pt-4 mt-4">
            {showCancelButton && (
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || disabled}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            )}
            {onConfirm && (
              <button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting || disabled}
                className="px-4 py-2 text-sm font-medium text-white bg-[#ED6C00] hover:bg-[#ED6C00]/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '처리 중...' : confirmLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

