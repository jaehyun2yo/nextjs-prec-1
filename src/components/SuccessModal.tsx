'use client';

import { motion } from 'framer-motion';
import { ConfirmModal } from './modals/ConfirmModal';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  redirectUrl?: string;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title = '문의가 전송되었습니다',
  message = '빠른 시일 내에 연락드리겠습니다.',
  redirectUrl,
}: SuccessModalProps) {
  const handleConfirm = () => {
    onClose();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={title}
      message={message}
      confirmLabel="확인"
      showCancelButton={false}
      icon={
        <motion.svg
          className="h-7 w-7 text-green-600 dark:text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            duration: 0.5,
          }}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: 0.6, ease: 'easeInOut', delay: 0.2 },
              opacity: { duration: 0.3, delay: 0.2 },
            }}
          />
        </motion.svg>
      }
      iconBgColor="bg-green-100 dark:bg-green-900"
    />
  );
}

