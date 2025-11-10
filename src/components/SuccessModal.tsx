'use client';

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
        <svg className="h-7 w-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      }
      iconBgColor="bg-green-100 dark:bg-green-900"
    />
  );
}

