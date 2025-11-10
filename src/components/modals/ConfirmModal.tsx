'use client';

import { BaseModal } from './BaseModal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  icon?: React.ReactNode;
  iconBgColor?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '확인',
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  isSubmitting = false,
  icon,
  iconBgColor = 'bg-orange-100 dark:bg-orange-900',
}: ConfirmModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      isSubmitting={isSubmitting}
      showCloseButton={false}
      maxWidth="md"
    >
      <div className="text-center">
        {icon && (
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${iconBgColor} mb-4`}>
            {icon}
          </div>
        )}
        {title && (
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h3>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </p>
      </div>
    </BaseModal>
  );
}

