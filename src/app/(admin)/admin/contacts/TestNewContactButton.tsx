'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function TestNewContactButton() {
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleCreateTestContacts = async () => {
    if (!confirm('신규 문의 50개를 생성하시겠습니까?')) {
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/admin/test-contacts', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || '50개의 테스트 문의사항이 생성되었습니다.');
        router.refresh();
      } else {
        alert('테스트 문의사항 생성에 실패했습니다: ' + (result.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Error creating test contacts:', error);
      alert('테스트 문의사항 생성 중 오류가 발생했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAllTestContacts = async () => {
    if (!confirm('"신규 문의 50개 생성"으로 만든 모든 테스트 문의를 영구 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/admin/test-contacts/delete-all', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || `${result.deletedCount}개의 테스트 문의가 삭제되었습니다.`);
        router.refresh();
      } else {
        alert('테스트 문의 삭제에 실패했습니다: ' + (result.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Error deleting test contacts:', error);
      alert('테스트 문의 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50 flex flex-col gap-2">
      <button
        onClick={handleCreateTestContacts}
        disabled={isCreating || isDeleting}
        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        {isCreating ? '생성 중...' : '🧪 신규 문의 50개 생성'}
      </button>
      <button
        onClick={handleDeleteAllTestContacts}
        disabled={isCreating || isDeleting}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        {isDeleting ? '삭제 중...' : '🗑️ 테스트 문의 전부 삭제'}
      </button>
    </div>
  );
}

