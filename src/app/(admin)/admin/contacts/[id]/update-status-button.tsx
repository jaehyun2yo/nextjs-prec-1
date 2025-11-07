'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UpdateStatusButtonProps {
  contactId: number;
  currentStatus: string;
}

export function UpdateStatusButton({ contactId, currentStatus }: UpdateStatusButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/contacts/${contactId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
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
    <div className="flex gap-2">
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isUpdating}
        className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
      >
        <option value="new">신규</option>
        <option value="read">읽음</option>
        <option value="in_progress">작업중</option>
        <option value="revision_in_progress">수정작업중</option>
        <option value="completed">납품완료</option>
        <option value="on_hold">보류</option>
      </select>
    </div>
  );
}

