'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProcessStage } from '@/app/actions/contacts';
import { PROCESS_STAGES_ARRAY, getProcessStageInfo, type ProcessStage } from '@/lib/utils/processStages';

interface QuickProcessStageSelectProps {
  contactId: number;
  currentStage: ProcessStage;
  status: string;
}

export function QuickProcessStageSelect({ contactId, currentStage, status }: QuickProcessStageSelectProps) {
  const router = useRouter();
  const [stage, setStage] = useState<ProcessStage>(currentStage);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStage, setSelectedStage] = useState<ProcessStage | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // status가 'read' 이상이면 공정 단계 변경 가능
  if (status !== 'read' && status !== 'in_progress' && status !== 'revision_in_progress' && status !== 'replied' && status !== 'completed') {
    return null;
  }

  const handleStageClick = (newStage: ProcessStage) => {
    // 현재 단계와 같으면 변경하지 않음
    if (newStage === stage) return;
    
    setSelectedStage(newStage);
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedStage || isUpdating) return;
    
    setIsUpdating(true);
    setShowConfirmModal(false);
    
    try {
      const result = await updateProcessStage(contactId, selectedStage);
      
      if (result.success) {
        setStage(selectedStage);
        router.refresh();
      } else {
        alert(`공정 단계 변경에 실패했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Error updating process stage:', error);
      alert('공정 단계 변경 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
      setSelectedStage(null);
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setSelectedStage(null);
  };

  const currentOrder = getProcessStageInfo(stage)?.order || 0;
  const selectedStageInfo = selectedStage ? getProcessStageInfo(selectedStage) : null;

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {PROCESS_STAGES_ARRAY.map((stageInfo, index) => {
          const isCompleted = stageInfo.order < currentOrder;
          const isCurrent = stageInfo.order === currentOrder;
          const isPending = stageInfo.order > currentOrder;
          const isClickable = !isUpdating;

          return (
            <div key={stageInfo.id} className="flex items-center">
              <button
                type="button"
                onClick={() => isClickable && handleStageClick(stageInfo.id)}
                disabled={!isClickable}
                className={`
                  flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-200
                  ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'}
                  ${isCompleted 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                    : isCurrent
                    ? 'bg-[#ED6C00] text-white border-2 border-[#ED6C00] font-medium'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }
                `}
                title={stageInfo.label}
              >
                <span className="text-xs whitespace-nowrap">
                  {isCompleted && '✓ '}
                  {stageInfo.label}
                </span>
              </button>
              {index < PROCESS_STAGES_ARRAY.length - 1 && (
                <div className="w-2 h-0.5 bg-gray-300 dark:bg-gray-600 mx-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* 확인 모달 */}
      {showConfirmModal && selectedStageInfo && (
        <div 
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
          onClick={handleCancel}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 p-6 max-w-md w-full mx-8 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 mb-4">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
                공정 단계 변경
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                공정 단계를 <strong className="text-orange-600 dark:text-orange-400">{selectedStageInfo.label}</strong>로 변경하시겠습니까?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-[#ED6C00] hover:bg-[#d15f00] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isUpdating ? '변경 중...' : '변경'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

