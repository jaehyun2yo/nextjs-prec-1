'use client';

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
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 p-12 max-w-md w-full mx-8 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 dark:bg-green-900 mb-5">
            <svg className="h-7 w-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            {message}
          </p>
          <button
            onClick={handleClose}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors duration-300"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

