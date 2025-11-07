'use client';

import { useState, useEffect } from 'react';
import { PROCESS_STAGES_ARRAY, getProcessStageInfo, getProcessProgress, type ProcessStage } from '@/lib/utils/processStages';
import { isProcessStarted } from '@/lib/utils/processStages';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface ProcessStageIndicatorToggleProps {
  currentStage: ProcessStage;
  status: string;
  defaultExpanded?: boolean;
}

export function ProcessStageIndicatorToggle({ currentStage, status, defaultExpanded = false }: ProcessStageIndicatorToggleProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  // defaultExpanded가 변경되면 내부 상태도 업데이트
  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);
  const isStarted = isProcessStarted(status);
  
  if (!isStarted) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">공정 단계</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">공정이 아직 시작되지 않았습니다.</p>
      </div>
    );
  }

  const currentStageInfo = getProcessStageInfo(currentStage);
  const currentOrder = currentStageInfo?.order || 0;
  const progress = getProcessProgress(currentStage);

  // 요약본: 현재 단계만 표시
  const SummaryView = () => (
    <div className="flex items-center gap-2 flex-wrap">
      {PROCESS_STAGES_ARRAY.map((stageInfo, index) => {
        const isCompleted = stageInfo.order < currentOrder;
        const isCurrent = stageInfo.order === currentOrder;

        return (
          <div key={stageInfo.id} className="flex items-center">
            <div
              className={`
                flex items-center gap-1.5 px-2 py-1.5 rounded-lg
                ${isCompleted 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                  : isCurrent
                  ? 'bg-[#ED6C00] text-white border-2 border-[#ED6C00] font-medium'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }
              `}
            >
              <span className="text-xs whitespace-nowrap">
                {isCompleted && '✓ '}
                {stageInfo.label}
              </span>
            </div>
            {index < PROCESS_STAGES_ARRAY.length - 1 && (
              <div className="w-2 h-0.5 bg-gray-300 dark:bg-gray-600 mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );

  // 상세보기: 전체 단계 목록
  const DetailedView = () => (
    <>
      {/* 진행 바 */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-[#ED6C00] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">{progress}%</p>
      </div>

      {/* 단계 목록 */}
      <div className="space-y-2">
        {PROCESS_STAGES_ARRAY.map((stage) => {
          const isCompleted = stage.order < currentOrder;
          const isCurrent = stage.order === currentOrder;

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                isCurrent
                  ? 'bg-[#ED6C00]/10 border-l-4 border-[#ED6C00]'
                  : isCompleted
                  ? 'bg-gray-50 dark:bg-gray-800/50'
                  : 'bg-transparent'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-[#ED6C00] text-white border-2 border-[#ED6C00]'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                }`}
              >
                {isCompleted ? '✓' : ''}
              </div>
              <span
                className={`text-sm ${
                  isCompleted
                    ? 'text-gray-500 dark:text-gray-400 line-through'
                    : isCurrent
                    ? 'text-[#ED6C00] font-medium'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );

  // 카드가 펼쳐져 있으면 자동으로 상세보기 표시 (토글 버튼 숨김)
  if (defaultExpanded) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">공정 단계</p>
        <DetailedView />
      </div>
    );
  }

  // 카드가 접혀있을 때만 토글 버튼 표시
  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button
        type="button"
        className="w-full flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 py-2 rounded transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">공정 단계</p>
        {isExpanded ? (
          <FaChevronUp className="text-xs text-gray-500 dark:text-gray-400" />
        ) : (
          <FaChevronDown className="text-xs text-gray-500 dark:text-gray-400" />
        )}
      </button>
      
      <div className="mt-3">
        {isExpanded ? <DetailedView /> : <SummaryView />}
      </div>
    </div>
  );
}

