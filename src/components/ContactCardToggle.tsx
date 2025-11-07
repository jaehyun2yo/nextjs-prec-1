'use client';

import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaFileAlt, FaCheckCircle, FaSpinner, FaEye } from 'react-icons/fa';
import { ProcessStageIndicatorToggle } from './ProcessStageIndicatorToggle';
import { PROCESS_STAGES_ARRAY, getProcessStageInfo, isProcessStarted } from '@/lib/utils/processStages';
import type { ProcessStage } from '@/lib/utils/processStages';

interface ContactCardToggleProps {
  contact: {
    id: number;
    company_name: string;
    name: string;
    position?: string | null;
    phone: string;
    email: string;
    status: string;
    process_stage: ProcessStage;
    drawing_type: string | null;
    length: string | null;
    width: string | null;
    height: string | null;
    material?: string | null;
    inquiry_title?: string | null;
    created_at: string;
  };
  statusInfo: {
    label: string;
    iconName: 'spinner' | 'eye' | 'checkCircle' | 'fileAlt';
    color: string;
    bgColor: string;
  };
}

export function ContactCardToggle({ contact, statusInfo }: ContactCardToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 아이콘 매핑
  const iconMap = {
    spinner: FaSpinner,
    eye: FaEye,
    checkCircle: FaCheckCircle,
    fileAlt: FaFileAlt,
  };
  
  const StatusIcon = iconMap[statusInfo.iconName];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* 요약본 (항상 표시) */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 md:p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex flex-col gap-3">
          {/* 첫 번째 줄: 문의 번호, 상태, 토글 아이콘 */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
                {contact.inquiry_title || `문의 #${contact.id}`}
              </h3>
              <span className={`inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusInfo.bgColor} ${statusInfo.color}`}>
                <StatusIcon className="text-xs" />
                {statusInfo.label}
              </span>
            </div>
            {/* 토글 아이콘 */}
            <div className={`p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
              <FaChevronDown className="text-sm text-gray-500 dark:text-gray-400 transition-transform duration-300" />
            </div>
          </div>
          {/* 두 번째 줄: 공정 단계 요약본 (접혀있을 때만 표시) */}
          {!isExpanded && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <ProcessStageSummary currentStage={contact.process_stage} status={contact.status} />
            </div>
          )}
        </div>
      </button>

      {/* 상세 정보 (토글) */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded 
            ? 'max-h-[2000px] opacity-100' 
            : 'max-h-0 opacity-0'
        }`}
      >
        <div 
          className={`px-6 pb-6 pt-4 border-t border-gray-200 dark:border-gray-700 transition-all duration-500 ease-in-out ${
            isExpanded 
              ? 'translate-y-0 opacity-100' 
              : '-translate-y-4 opacity-0'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pt-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">담당자</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {contact.name}{contact.position ? ` (${contact.position})` : ''}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">연락처</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">{contact.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">이메일</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">{contact.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">문의일</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {new Date(contact.created_at).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {contact.drawing_type && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">도면 정보</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                  {contact.drawing_type === 'create' ? '도면 제작 필요' : '도면 보유'}
                </span>
                {contact.material && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                    재질: {contact.material}
                  </span>
                )}
                {contact.length && contact.width && contact.height && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                    크기: {contact.length} × {contact.width} × {contact.height}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 공정 단계 표시 (카드가 펼쳐지면 자동으로 펼쳐짐) */}
          <ProcessStageIndicatorToggle 
            currentStage={contact.process_stage} 
            status={contact.status}
            defaultExpanded={isExpanded}
          />
        </div>
      </div>
    </div>
  );
}

// 공정 단계 요약본 컴포넌트
function ProcessStageSummary({ currentStage, status }: { currentStage: ProcessStage; status: string }) {
  const started = isProcessStarted(status);
  if (!started) {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">공정이 아직 시작되지 않았습니다.</span>
    );
  }

  const currentStageInfo = getProcessStageInfo(currentStage);
  const currentOrder = currentStageInfo?.order || 0;

  return (
    <div className="flex items-center gap-1.5 flex-wrap w-full">
      {PROCESS_STAGES_ARRAY.map((stageInfo, index) => {
        const isCompleted = stageInfo.order < currentOrder;
        const isCurrent = stageInfo.order === currentOrder;

        return (
          <div key={stageInfo.id} className="flex items-center flex-shrink-0">
            <div
              className={`
                flex items-center gap-1 px-2 py-1 rounded text-xs
                ${isCompleted 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                  : isCurrent
                  ? 'bg-[#ED6C00] text-white font-medium'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }
              `}
              title={stageInfo.label}
            >
              <span className="whitespace-nowrap text-xs">
                {isCompleted && '✓ '}
                {stageInfo.label}
              </span>
            </div>
            {index < PROCESS_STAGES_ARRAY.length - 1 && (
              <span className="text-gray-400 dark:text-gray-500 mx-1 flex-shrink-0">-</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

