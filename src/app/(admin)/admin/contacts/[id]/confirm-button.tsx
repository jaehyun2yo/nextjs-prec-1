'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ConfirmButtonProps {
  contactId: number;
  currentStatus: string;
}

export function ConfirmButton({ contactId, currentStatus }: ConfirmButtonProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleConfirm = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/contacts/${contactId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'read' }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (currentStatus === 'read' || currentStatus === 'completed') {
    return null;
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={isUpdating}
      className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isUpdating ? '처리중...' : '확인완료'}
    </button>
  );
}

