'use client';

import { BaseModal } from './modals/BaseModal';
import { DownloadButton } from './DownloadButton';
import type { RevisionRequestHistory } from '@/types/database.types';

interface RevisionRequestViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  revisionRequest: {
    title: string;
    content: string;
    requestedAt: string;
    fileUrl?: string | null;
    fileName?: string | null;
    history?: RevisionRequestHistory;
  } | null;
}

export function RevisionRequestViewModal({
  isOpen,
  onClose,
  revisionRequest,
}: RevisionRequestViewModalProps) {
  if (!isOpen || !revisionRequest) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="수정요청서"
      maxWidth="2xl"
      onConfirm={onClose}
      confirmLabel="닫기"
    >
      {/* 내용 */}
      <div className="space-y-4">
        {/* 최신 수정요청 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            최신 수정요청
          </h3>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  요청 제목
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-medium">
                  {revisionRequest.title || '-'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  요청 내용
                </label>
                <div className="mt-1 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {revisionRequest.content || '-'}
                  </p>
                </div>
              </div>
              {revisionRequest.requestedAt && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    요청 일시
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(revisionRequest.requestedAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              )}
              {revisionRequest.fileUrl && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    첨부 파일
                  </label>
                  <div className="mt-1 flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-900 dark:text-gray-100 flex-1 truncate mr-2">
                      {revisionRequest.fileName || '파일명 없음'}
                    </p>
                    <DownloadButton
                      url={revisionRequest.fileUrl}
                      fileName={revisionRequest.fileName}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 이전 수정요청 히스토리 */}
        {revisionRequest.history &&
          Array.isArray(revisionRequest.history) &&
          revisionRequest.history.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                이전 수정요청 기록 ({revisionRequest.history.length}건)
              </h3>
              <div className="space-y-4">
                {revisionRequest.history
                  .slice()
                  .reverse()
                  .map((historyItem, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            요청 제목
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-medium">
                            {historyItem.title || '-'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            요청 내용
                          </label>
                          <div className="mt-1 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                              {historyItem.content || '-'}
                            </p>
                          </div>
                        </div>
                        {historyItem.requested_at && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              요청 일시
                            </label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                              {new Date(historyItem.requested_at).toLocaleString('ko-KR')}
                            </p>
                          </div>
                        )}
                        {historyItem.file_url && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              첨부 파일
                            </label>
                            <div className="mt-1 flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                              <p className="text-xs text-gray-900 dark:text-gray-100 flex-1 truncate mr-2">
                                {historyItem.file_name || '파일명 없음'}
                              </p>
                              <DownloadButton
                                url={historyItem.file_url}
                                fileName={historyItem.file_name}
                              />
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
    </BaseModal>
  );
}
