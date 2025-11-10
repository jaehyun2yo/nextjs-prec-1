'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import type { Toast } from './types';

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
  placement: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  index: number;
}

export function ToastItem({ toast, onClose, placement, index }: ToastItemProps) {
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const isRemovingRef = useRef(false);

  const handleClose = useCallback(() => {
    if (isRemovingRef.current) return;
    isRemovingRef.current = true;
    onClose(toast.id);
    toast.onClose?.();
  }, [toast.id, toast.onClose, onClose]);

  useEffect(() => {
    // 초기화
    isRemovingRef.current = false;
    setProgress(100);
    startTimeRef.current = Date.now();

    // 프로그레스 바 애니메이션
    if (toast.timeout && toast.timeout > 0) {
      const duration = toast.timeout;
      const interval = 50; // 50ms마다 업데이트

      progressRef.current = setInterval(() => {
        setProgress((prev) => {
          const elapsed = Date.now() - startTimeRef.current;
          const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
          return remaining;
        });
      }, interval);

      // 자동 닫기
      timerRef.current = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [toast.id, toast.timeout, handleClose]);

  const getDefaultIcon = () => {
    switch (toast.color) {
      case 'success':
        return <FaCheckCircle className="w-5 h-5" />;
      case 'danger':
        return <FaExclamationCircle className="w-5 h-5" />;
      case 'warning':
        return <FaExclamationTriangle className="w-5 h-5" />;
      case 'primary':
      case 'secondary':
      default:
        return <FaInfoCircle className="w-5 h-5" />;
    }
  };

  const getColorClasses = () => {
    const baseColors = {
      default: {
        solid: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700',
        flat: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700',
        bordered: 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100',
        faded: 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100',
        shadow: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg border-gray-200 dark:border-gray-700',
      },
      primary: {
        solid: 'bg-[#ED6C00] text-white border-[#ED6C00]',
        flat: 'bg-white dark:bg-gray-800 text-[#ED6C00] border-[#ED6C00]/20 dark:border-[#ED6C00]/30',
        bordered: 'bg-transparent border-[#ED6C00] text-[#ED6C00]',
        faded: 'bg-[#ED6C00]/10 dark:bg-[#ED6C00]/20 text-[#ED6C00]',
        shadow: 'bg-white dark:bg-gray-800 border-[#ED6C00] text-[#ED6C00] shadow-lg',
      },
      success: {
        solid: 'bg-green-500 text-white border-green-500',
        flat: 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        bordered: 'bg-transparent border-green-500 text-green-700 dark:text-green-300',
        faded: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        shadow: 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 shadow-lg',
      },
      warning: {
        solid: 'bg-yellow-500 text-white border-yellow-500',
        flat: 'bg-white dark:bg-gray-800 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
        bordered: 'bg-transparent border-yellow-500 text-yellow-700 dark:text-yellow-300',
        faded: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
        shadow: 'bg-white dark:bg-gray-800 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 shadow-lg',
      },
      danger: {
        solid: 'bg-red-500 text-white border-red-500',
        flat: 'bg-white dark:bg-gray-800 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        bordered: 'bg-transparent border-red-500 text-red-700 dark:text-red-300',
        faded: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        shadow: 'bg-white dark:bg-gray-800 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 shadow-lg',
      },
    };

    const variant = toast.variant || 'flat';
    return baseColors[toast.color || 'default'][variant];
  };

  const getIconColor = () => {
    switch (toast.color) {
      case 'success':
        return 'text-green-500 dark:text-green-400';
      case 'danger':
        return 'text-red-500 dark:text-red-400';
      case 'warning':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'primary':
        return 'text-[#ED6C00] dark:text-[#ff8533]';
      case 'secondary':
        return 'text-gray-500 dark:text-gray-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  // HeroUI 스타일 애니메이션 variants
  const getAnimationVariants = () => {
    const isTop = placement.startsWith('top');
    const isRight = placement.endsWith('right');
    const isLeft = placement.endsWith('left');
    const isCenter = placement.includes('center');

    let initialX = 0;
    let initialY = isTop ? -20 : 20;

    if (isRight && !isCenter) {
      initialX = 100;
    } else if (isLeft && !isCenter) {
      initialX = -100;
    }

    return {
      initial: {
        opacity: 0,
        x: initialX,
        y: initialY,
        scale: 0.95,
      },
      animate: {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        transition: {
          type: 'spring',
          stiffness: 500,
          damping: 30,
          mass: 0.8,
        },
      },
      exit: {
        opacity: 0,
        x: initialX,
        y: initialY,
        scale: 0.95,
        transition: {
          duration: 0.2,
        },
      },
    };
  };

  const variant = toast.variant || 'flat';
  const radius = toast.radius || 'md';
  const hasBorder = variant === 'bordered' || variant === 'flat' || variant === 'shadow';
  const icon = toast.icon !== undefined ? toast.icon : getDefaultIcon();
  const animationVariants = getAnimationVariants();

  const getRadiusClass = () => {
    switch (radius) {
      case 'none':
        return 'rounded-none';
      case 'sm':
        return 'rounded-sm';
      case 'md':
        return 'rounded-lg';
      case 'lg':
        return 'rounded-xl';
      case 'full':
        return 'rounded-full';
      default:
        return 'rounded-lg';
    }
  };

  const handleToastClick = useCallback((e: React.MouseEvent) => {
    // 닫기 버튼이나 action 버튼 클릭 시에는 토스트 클릭 이벤트 무시
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      return;
    }
    
    // 토스트 클릭 시 onClick 핸들러 실행
    if (toast.onClick) {
      toast.onClick();
      handleClose();
    }
  }, [toast.onClick, handleClose]);

  return (
    <motion.div
      role="alert"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={animationVariants}
      layout
      onClick={toast.onClick ? handleToastClick : undefined}
      className={`
        relative flex items-start gap-3 p-4 border min-w-[320px] max-w-md pointer-events-auto
        ${getRadiusClass()}
        ${getColorClasses()}
        ${hasBorder ? 'border' : 'border-transparent'}
        shadow-lg backdrop-blur-sm
        ${toast.onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}
        data-[has-title]:has-title
        data-[has-description]:has-description
      `}
      data-has-title={!!toast.title}
      data-has-description={!!toast.description}
      data-placement={placement}
      style={{
        zIndex: 9999 + index,
      }}
    >
      {/* 아이콘 */}
      {icon && !toast.hideIcon && (
        <div className={`flex-shrink-0 mt-0.5 ${getIconColor()}`}>
          {icon}
        </div>
      )}

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="text-sm font-semibold mb-1 leading-tight">
            {toast.title}
          </div>
        )}
        {toast.description && (
          <div className="text-sm opacity-90 leading-relaxed">
            {toast.description}
          </div>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              handleClose();
            }}
            className="mt-2 text-xs font-medium text-[#ED6C00] hover:text-[#d15f00] dark:text-[#ff8533] dark:hover:text-[#ff9933] transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* 닫기 버튼 */}
      {!toast.hideCloseButton && (
        <button
          onClick={handleClose}
          aria-label="Close"
          className="flex-shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
        >
          <FaTimes className="w-4 h-4 opacity-60" />
        </button>
      )}

      {/* 프로그레스 바 */}
      {toast.timeout && toast.timeout > 0 && toast.shouldShowTimeoutProgress && (
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/20 overflow-hidden ${radius === 'full' ? 'rounded-b-full' : radius === 'lg' ? 'rounded-b-xl' : radius === 'md' ? 'rounded-b-lg' : radius === 'sm' ? 'rounded-b-sm' : ''}`}>
          <motion.div
            className="h-full bg-[#ED6C00] dark:bg-[#ff8533]"
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.05, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  );
}
