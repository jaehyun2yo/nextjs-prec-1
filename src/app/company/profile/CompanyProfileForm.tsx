'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { INPUT_STYLES, BUTTON_STYLES } from '@/lib/styles';
import { FaSave, FaTrash, FaPaperclip } from 'react-icons/fa';
import { DownloadButton } from '@/components/DownloadButton';

interface Company {
  id: number;
  username: string;
  company_name: string;
  business_registration_number: string;
  representative_name: string;
  business_type: string | null;
  business_category: string | null;
  business_address: string;
  business_registration_file_url: string | null;
  business_registration_file_name: string | null;
  manager_name: string;
  manager_position: string;
  manager_phone: string;
  manager_email: string;
  accountant_name: string | null;
  accountant_phone: string | null;
  accountant_email: string | null;
  accountant_fax: string | null;
  quote_method_email: boolean;
  quote_method_fax: boolean;
  quote_method_sms: boolean;
}

interface CompanyProfileFormProps {
  company: Company;
}

export function CompanyProfileForm({ company }: CompanyProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData(e.currentTarget);
      
      const response = await fetch('/api/company/profile', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setError(result.error || '정보 수정에 실패했습니다.');
      }
    } catch (err) {
      setError('정보 수정 중 오류가 발생했습니다.');
      console.error('Error updating company profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 성공 메시지 */}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">
            정보가 성공적으로 수정되었습니다.
          </p>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* 업체 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          업체 정보
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              업체명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="company_name"
              defaultValue={company.company_name}
              required
              className={INPUT_STYLES.base}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              사업자등록번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="business_registration_number"
              defaultValue={company.business_registration_number}
              required
              className={INPUT_STYLES.base}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              대표자명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="representative_name"
              defaultValue={company.representative_name}
              required
              className={INPUT_STYLES.base}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              업태
            </label>
            <input
              type="text"
              name="business_type"
              defaultValue={company.business_type || ''}
              className={INPUT_STYLES.base}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              업종
            </label>
            <input
              type="text"
              name="business_category"
              defaultValue={company.business_category || ''}
              className={INPUT_STYLES.base}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              사업장 주소 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="business_address"
              defaultValue={company.business_address}
              required
              className={INPUT_STYLES.base}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              사업자등록증 <span className="text-gray-500 text-xs">(선택사항)</span>
            </label>
            <div className="space-y-3">
              {company.business_registration_file_url && !selectedFile ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FaPaperclip className="text-gray-500 dark:text-gray-400 flex-shrink-0 text-base" />
                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate font-medium">
                      {company.business_registration_file_name || '파일명 없음'}
                    </span>
                  </div>
                  <DownloadButton
                    url={company.business_registration_file_url}
                    fileName={company.business_registration_file_name}
                  />
                </div>
              ) : null}
              <input
                type="file"
                name="business_registration_file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      setError('파일 크기는 10MB 이하여야 합니다.');
                      return;
                    }
                    setSelectedFile(file);
                    setError(null);
                  }
                }}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="w-full px-6 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FaPaperclip className="text-base" />
                <span className="text-sm font-medium">파일 선택 (최대 10MB)</span>
              </button>
              {selectedFile && (
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FaPaperclip className="text-gray-500 dark:text-gray-400 flex-shrink-0 text-base" />
                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate font-medium">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    disabled={isSubmitting}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                새 파일을 업로드하면 기존 파일이 교체됩니다. PDF, JPG, PNG 파일만 업로드 가능합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 실무담당자 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          실무담당자 정보
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              담당자명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="manager_name"
              defaultValue={company.manager_name}
              required
              className={INPUT_STYLES.base}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              직책 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="manager_position"
              defaultValue={company.manager_position}
              required
              className={INPUT_STYLES.base}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="manager_phone"
              defaultValue={company.manager_phone}
              required
              className={INPUT_STYLES.base}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="manager_email"
              defaultValue={company.manager_email}
              required
              className={INPUT_STYLES.base}
            />
          </div>
        </div>
      </div>

      {/* 회계담당자 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          회계담당자 정보
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              담당자명
            </label>
            <input
              type="text"
              name="accountant_name"
              defaultValue={company.accountant_name || ''}
              className={INPUT_STYLES.base}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              연락처
            </label>
            <input
              type="tel"
              name="accountant_phone"
              defaultValue={company.accountant_phone || ''}
              className={INPUT_STYLES.base}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이메일 (세금계산서 발행용)
            </label>
            <input
              type="email"
              name="accountant_email"
              defaultValue={company.accountant_email || ''}
              className={INPUT_STYLES.base}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              팩스번호
            </label>
            <input
              type="tel"
              name="accountant_fax"
              defaultValue={company.accountant_fax || ''}
              className={INPUT_STYLES.base}
            />
          </div>
        </div>
      </div>

      {/* 견적서 제공 방법 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          견적서 제공 방법
        </h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="quote_method"
              value="email"
              defaultChecked={company.quote_method_email}
              className="w-4 h-4 text-[#ED6C00] border-gray-300 focus:ring-[#ED6C00]"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">이메일</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="quote_method"
              value="fax"
              defaultChecked={company.quote_method_fax}
              className="w-4 h-4 text-[#ED6C00] border-gray-300 focus:ring-[#ED6C00]"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">팩스</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="quote_method"
              value="sms"
              defaultChecked={company.quote_method_sms}
              className="w-4 h-4 text-[#ED6C00] border-gray-300 focus:ring-[#ED6C00]"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">SMS</span>
          </label>
        </div>
      </div>

      {/* 비밀번호 변경 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          비밀번호 변경 (선택사항)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              새 비밀번호
            </label>
            <input
              type="password"
              name="new_password"
              className={INPUT_STYLES.base}
              placeholder="변경하지 않으려면 비워두세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              새 비밀번호 확인
            </label>
            <input
              type="password"
              name="new_password_confirm"
              className={INPUT_STYLES.base}
              placeholder="변경하지 않으려면 비워두세요"
            />
          </div>
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${BUTTON_STYLES.primary} flex items-center gap-2`}
        >
          <FaSave className="text-sm" />
          {isSubmitting ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  );
}

