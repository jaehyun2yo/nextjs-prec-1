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

  const isAlreadyConfirmed = currentStatus === 'read' || currentStatus === 'in_progress' || currentStatus === 'revision_in_progress' || currentStatus === 'completed';

  return (
    <div className="space-y-2">
      {isAlreadyConfirmed ? (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
            ✓ {currentStatus === 'completed' ? '완료됨' : '확인완료됨'}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            {currentStatus === 'completed' 
              ? '이 문의는 완료 처리되었습니다.' 
              : '이 문의는 확인 완료되었습니다. 공정 단계를 관리할 수 있습니다.'}
          </p>
        </div>
      ) : (
        <button
          onClick={handleConfirm}
          disabled={isUpdating}
          className="w-full px-4 py-3 bg-[#ED6C00] hover:bg-[#d15f00] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? '처리중...' : '확인완료'}
        </button>
      )}
    </div>
  );
}

