'use client';

import { PROCESS_STAGES_ARRAY, getProcessStageInfo, getProcessProgress, type ProcessStage } from '@/lib/utils/processStages';
import { isProcessStarted } from '@/lib/utils/processStages';

interface ProcessStageIndicatorProps {
  currentStage: ProcessStage;
  status: string;
}

export function ProcessStageIndicator({ currentStage, status }: ProcessStageIndicatorProps) {
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

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">공정 단계</p>
        {currentStageInfo && (
          <span className={`px-2 py-1 rounded text-xs font-medium ${currentStageInfo.bgColor} ${currentStageInfo.color}`}>
            {currentStageInfo.label}
          </span>
        )}
      </div>
      
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
          const isPending = stage.order > currentOrder;

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                isCurrent
                  ? `${stage.bgColor} border-l-4 ${stage.borderColor}`
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
                    ? `${stage.bgColor} ${stage.color} border-2 ${stage.borderColor}`
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                }`}
              >
                {isCompleted ? '✓' : stage.order}
              </div>
              <span
                className={`text-sm ${
                  isCompleted
                    ? 'text-gray-500 dark:text-gray-400 line-through'
                    : isCurrent
                    ? `${stage.color} font-medium`
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

