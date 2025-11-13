'use client';

import { useState } from 'react';
import { BaseModal } from './modals/BaseModal';
import { FileUpload } from './FileUpload';

interface RevisionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: number;
  contactTitle?: string | null;
  onSuccess?: () => void;
}

export function RevisionRequestModal({
  isOpen,
  onClose,
  contactId,
  contactTitle,
  onSuccess,
}: RevisionRequestModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!title.trim()) {
      setError('수정요청 제목을 입력해주세요.');
      return;
    }
    
    if (!content.trim()) {
      setError('수정요청 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      if (selectedFiles.length > 0) {
        formData.append('file', selectedFiles[0]);
      }

      const response = await fetch(`/api/contacts/${contactId}/revision-request`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '수정요청 제출에 실패했습니다.');
      }

      // 성공 시 폼 초기화 및 모달 닫기
      setTitle('');
      setContent('');
      setSelectedFiles([]);
      setError(null);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '수정요청 제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setTitle('');
    setContent('');
    setSelectedFiles([]);
    setError(null);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="수정요청서 작성"
      maxWidth="2xl"
      onConfirm={handleSubmit}
      confirmLabel={isSubmitting ? '제출 중...' : '수정요청 제출'}
      cancelLabel="취소"
      isSubmitting={isSubmitting}
      disabled={isSubmitting}
    >

      {/* 문의 정보 */}
      {contactTitle && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">문의 제목</p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {contactTitle}
          </p>
        </div>
      )}

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4" id="revision-request-form">
          {/* 제목 */}
          <div>
            <label
              htmlFor="revision-title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              수정요청 제목 <span className="text-red-500">*</span>
            </label>
            <input
              id="revision-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              placeholder="예: 크기 수정 요청"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#ED6C00] disabled:opacity-50"
              maxLength={100}
            />
          </div>

          {/* 내용 */}
          <div>
            <label
              htmlFor="revision-content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              수정요청 내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="revision-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              placeholder="수정이 필요한 부분을 자세히 설명해주세요."
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#ED6C00] disabled:opacity-50 resize-none"
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {content.length} / 2000자
            </p>
          </div>

          {/* 파일 업로드 */}
          <FileUpload
            name="file"
                id="revision-file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.rar"
            maxSize={10 * 1024 * 1024}
                disabled={isSubmitting}
            files={selectedFiles}
            onChange={setSelectedFiles}
            onError={setError}
            label="첨부 파일 (선택사항)"
            helpText="PDF, DOC, XLS, 이미지, ZIP 파일 지원"
          />

        {/* 에러 메시지 */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </form>
    </BaseModal>
  );
}

