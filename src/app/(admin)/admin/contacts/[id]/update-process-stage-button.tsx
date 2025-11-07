'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProcessStage } from '@/app/actions/contacts';
import { PROCESS_STAGES_ARRAY, type ProcessStage } from '@/lib/utils/processStages';
import { INPUT_STYLES } from '@/lib/styles';

interface UpdateProcessStageButtonProps {
  contactId: number;
  currentStage: ProcessStage;
  status: string;
}

export function UpdateProcessStageButton({ contactId, currentStage, status }: UpdateProcessStageButtonProps) {
  const router = useRouter();
  const [stage, setStage] = useState<ProcessStage>(currentStage);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStageChange = async (newStage: ProcessStage) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const result = await updateProcessStage(contactId, newStage);
      
      if (result.success) {
        setStage(newStage);
        router.refresh();
      } else {
        alert(`공정 단계 변경에 실패했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Error updating process stage:', error);
      alert('공정 단계 변경 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  // status가 'read' 미만이면 공정 단계 변경 불가
  if (status !== 'read' && status !== 'replied' && status !== 'completed') {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        공정 단계
      </label>
      <select
        value={stage || ''}
        onChange={(e) => handleStageChange(e.target.value as ProcessStage || null)}
        disabled={isUpdating}
        className={`w-full ${INPUT_STYLES.base} ${INPUT_STYLES.focus} disabled:opacity-50`}
      >
        <option value="">공정 시작 전</option>
        {PROCESS_STAGES_ARRAY.map((stageInfo) => (
          <option key={stageInfo.id} value={stageInfo.id}>
            {stageInfo.order}. {stageInfo.label}
          </option>
        ))}
      </select>
      {isUpdating && (
        <p className="text-xs text-gray-500 dark:text-gray-400">업데이트 중...</p>
      )}
    </div>
  );
}

