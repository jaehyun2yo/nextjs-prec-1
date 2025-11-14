'use client';

import { useState } from 'react';
import {
  FaChevronDown,
  FaChevronUp,
  FaFileAlt,
  FaCheckCircle,
  FaSpinner,
  FaEye,
  FaEdit,
  FaExclamationCircle,
} from 'react-icons/fa';
import { ProcessStageIndicatorToggle } from './ProcessStageIndicatorToggle';
import {
  PROCESS_STAGES_ARRAY,
  getProcessStageInfo,
  isProcessStarted,
} from '@/lib/utils/processStages';
import { RevisionRequestModal } from './RevisionRequestModal';
import { DownloadButton } from './DownloadButton';
import type { ProcessStage } from '@/lib/utils/processStages';
import type { RevisionRequestHistory, RevisionRequestHistoryItem } from '@/types/database.types';

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
    revision_request_title?: string | null;
    revision_request_content?: string | null;
    revision_requested_at?: string | null;
    revision_request_file_url?: string | null;
    revision_request_file_name?: string | null;
    revision_request_history?: RevisionRequestHistory | null;
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
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);

  // 아이콘 매핑
  const iconMap = {
    spinner: FaSpinner,
    eye: FaEye,
    checkCircle: FaCheckCircle,
    fileAlt: FaFileAlt,
  };

  const StatusIcon = iconMap[statusInfo.iconName];

  // 수정요청 가능한 상태인지 확인 (작업중, 완료, 수정요청중 상태에서 수정요청 가능)
  const canRequestRevision =
    contact.status === 'in_progress' ||
    contact.status === 'read' ||
    contact.status === 'completed' ||
    contact.status === 'replied' ||
    contact.status === 'revision_in_progress';

  const handleRevisionSuccess = () => {
    // 모달이 닫힌 후 페이지 새로고침
    window.location.reload();
  };

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
              <span
                className={`inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusInfo.bgColor} ${statusInfo.color}`}
              >
                <StatusIcon className="text-xs" />
                {statusInfo.label}
              </span>
            </div>
            {/* 토글 아이콘 */}
            <div
              className={`p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
            >
              <FaChevronDown className="text-sm text-gray-500 dark:text-gray-400 transition-transform duration-300" />
            </div>
          </div>
          {/* 두 번째 줄: 공정 단계 요약본 및 수정요청서 (접혀있을 때만 표시) */}
          {!isExpanded && (
            <div className="flex flex-col gap-2">
              {/* 공정 단계 */}
              <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1 -mx-2 px-2">
                <ProcessStageSummary currentStage={contact.process_stage} status={contact.status} />
              </div>
              {/* 수정요청서 요약 */}
              {contact.revision_request_title && (
                <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <FaExclamationCircle className="text-red-600 dark:text-red-400 text-xs flex-shrink-0" />
                  <span className="text-xs font-medium text-red-700 dark:text-red-300 flex-shrink-0">
                    수정요청:
                  </span>
                  <span className="text-xs text-red-600 dark:text-red-400 truncate flex-1 min-w-0">
                    {contact.revision_request_title}
                  </span>
                </div>
              )}
              {/* 수정요청 버튼 (요약본) */}
              {canRequestRevision && (
                <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRevisionModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded transition-colors text-xs font-medium"
                  >
                    <FaEdit className="text-xs" />
                    {contact.status === 'revision_in_progress' ? '추가 수정요청' : '수정요청'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </button>

      {/* 상세 정보 (토글) */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className={`px-6 pb-6 pt-4 border-t border-gray-200 dark:border-gray-700 transition-all duration-500 ease-in-out ${
            isExpanded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pt-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">담당자</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {contact.name}
                {contact.position ? ` (${contact.position})` : ''}
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
                {new Date(contact.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
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

          {/* 수정요청서 */}
          {contact.revision_request_title && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1">
                    수정요청서
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    수정요청
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      요청 제목
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {contact.revision_request_title}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      요청 내용
                    </p>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {contact.revision_request_content || '-'}
                      </p>
                    </div>
                  </div>
                  {contact.revision_requested_at && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        요청 일시
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(contact.revision_requested_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  )}
                  {contact.revision_request_file_url && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        첨부 파일
                      </p>
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-900 dark:text-gray-100 flex-1 truncate mr-2">
                          {contact.revision_request_file_name || '파일명 없음'}
                        </p>
                        <div onClick={(e) => e.stopPropagation()}>
                          <DownloadButton
                            url={contact.revision_request_file_url}
                            fileName={contact.revision_request_file_name}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 이전 수정요청 히스토리 */}
                  {contact.revision_request_history &&
                    Array.isArray(contact.revision_request_history) &&
                    contact.revision_request_history.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          이전 수정요청 기록 ({contact.revision_request_history.length}건)
                        </h4>
                        <div className="space-y-3">
                          {contact.revision_request_history
                            .slice()
                            .reverse()
                            .map((historyItem: RevisionRequestHistoryItem, index: number) => (
                              <div
                                key={index}
                                className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                              >
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                                      요청 제목
                                    </p>
                                    <p className="text-xs text-gray-900 dark:text-gray-100 font-medium">
                                      {historyItem.title || '-'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                                      요청 내용
                                    </p>
                                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                                      <p className="text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                        {historyItem.content || '-'}
                                      </p>
                                    </div>
                                  </div>
                                  {historyItem.requested_at && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                                        요청 일시
                                      </p>
                                      <p className="text-xs text-gray-900 dark:text-gray-100">
                                        {new Date(historyItem.requested_at).toLocaleString('ko-KR')}
                                      </p>
                                    </div>
                                  )}
                                  {historyItem.file_url && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                                        첨부 파일
                                      </p>
                                      <div className="flex items-center justify-between p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                                        <p className="text-xs text-gray-900 dark:text-gray-100 flex-1 truncate mr-2">
                                          {historyItem.file_name || '파일명 없음'}
                                        </p>
                                        <div onClick={(e) => e.stopPropagation()}>
                                          <DownloadButton
                                            url={historyItem.file_url}
                                            fileName={historyItem.file_name}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* 수정요청 버튼 (상세보기) */}
          {canRequestRevision && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRevisionModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded transition-colors text-xs font-medium"
              >
                <FaEdit className="text-xs" />
                {contact.status === 'revision_in_progress' ? '추가 수정요청' : '수정요청'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 수정요청 모달 */}
      <RevisionRequestModal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        contactId={contact.id}
        contactTitle={contact.inquiry_title || `문의 #${contact.id}`}
        onSuccess={handleRevisionSuccess}
      />
    </div>
  );
}

// 공정 단계 요약본 컴포넌트
function ProcessStageSummary({
  currentStage,
  status,
}: {
  currentStage: ProcessStage;
  status: string;
}) {
  const started = isProcessStarted(status);
  if (!started) {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        공정이 아직 시작되지 않았습니다.
      </span>
    );
  }

  // process_stage가 null이면 공정 단계가 설정되지 않은 상태
  if (!currentStage) {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        공정 단계가 설정되지 않았습니다.
      </span>
    );
  }

  const currentStageInfo = getProcessStageInfo(currentStage);
  if (!currentStageInfo) {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        공정 단계 정보를 불러올 수 없습니다.
      </span>
    );
  }

  const currentOrder = currentStageInfo.order;

  return (
    <div className="flex items-center gap-1.5 flex-wrap w-full overflow-x-auto">
      {PROCESS_STAGES_ARRAY.map((stageInfo, index) => {
        const isCompleted = stageInfo.order < currentOrder;
        const isCurrent = stageInfo.order === currentOrder;

        return (
          <div key={stageInfo.id} className="flex items-center flex-shrink-0">
            <div
              className={`
                flex items-center gap-1 px-2 py-1 rounded text-xs
                ${
                  isCompleted
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
