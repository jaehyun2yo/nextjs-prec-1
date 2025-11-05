'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeleteButtonProps {
  contactId: number;
  contactName: string;
}

export function DeleteButton({ contactId, contactName }: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`정말로 "${contactName}" 문의를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('문의가 삭제되었습니다.');
        router.refresh();
      } else {
        const error = await response.json();
        alert(`삭제 실패: ${error.error || '알 수 없는 오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? '삭제 중...' : '삭제'}
    </button>
  );
}

