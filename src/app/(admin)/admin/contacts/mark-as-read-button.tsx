'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface MarkAsReadButtonProps {
  contactId: number;
}

export function MarkAsReadButton({ contactId }: MarkAsReadButtonProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleMarkAsRead = async () => {
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

  return (
    <button
      onClick={handleMarkAsRead}
      disabled={isUpdating}
      className="px-3 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors disabled:opacity-50"
    >
      {isUpdating ? '처리중...' : '읽음'}
    </button>
  );
}

