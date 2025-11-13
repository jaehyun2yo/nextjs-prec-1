'use client';

import { useState, Suspense } from 'react';
import { registerCompany, createTestAccount } from '@/app/actions/register';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SuccessModal from '@/components/SuccessModal';
import { INPUT_STYLES, BUTTON_STYLES, CHECKBOX_STYLES } from '@/lib/styles';
import { FileUpload } from '@/components/FileUpload';
import { RadioButton } from '@/components/RadioButton';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const success = searchParams.get('success');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [quoteMethod, setQuoteMethod] = useState<string>('email');

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'missing_fields':
        return '필수 항목을 모두 입력해주세요.';
      case 'password_mismatch':
        return '비밀번호와 비밀번호 확인이 일치하지 않습니다.';
      case 'password_too_short':
        return '비밀번호는 최소 8자 이상이어야 합니다.';
      case 'username_exists':
        return '이미 사용 중인 아이디입니다.';
      case 'business_number_exists':
        return '이미 등록된 사업자등록번호입니다.';
      case 'missing_company_info':
        return '업체 정보를 모두 입력해주세요.';
      case 'missing_manager_info':
        return '실무담당자 정보를 모두 입력해주세요.';
      case 'file_upload_failed':
        return '파일 업로드에 실패했습니다. 다시 시도해주세요.';
      case 'database_error':
        return '데이터베이스 오류가 발생했습니다. 다시 시도해주세요.';
      case 'server_error':
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        return null;
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await registerCompany(formData);
      // registerCompany는 redirect를 사용하므로 여기까지 오지 않음
      // 하지만 에러가 발생하면 catch로 이동
    } catch (error) {
      console.error('Registration error:', error);
      // 에러는 registerCompany 내부에서 redirect로 처리됨
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTestAccount = async () => {
    setIsCreatingTest(true);
    try {
      const result = await createTestAccount();
      console.log('Test account creation result:', result);
      
      if (result && result.success) {
        setShowSuccessModal(true);
      } else {
        // 실패한 경우 에러 메시지 표시
        alert('테스트 계정 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Test account creation error:', error);
      alert('테스트 계정 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsCreatingTest(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            업체등록
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            업체 정보를 입력하여 업체등록을 진행해주세요.
          </p>
        </div>

        {error && getErrorMessage(error) && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              {getErrorMessage(error)}
            </p>
          </div>
        )}

        {success === 'registered' && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">
              업체등록이 완료되었습니다. 관리자 승인 후 로그인하실 수 있습니다.
            </p>
          </div>
        )}

        <form action={handleSubmit} className="space-y-8">
          {/* 로그인 정보 섹션 */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
              로그인 정보
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  아이디 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                  placeholder="아이디를 입력하세요"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  minLength={8}
                  className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                  placeholder="비밀번호를 입력하세요 (최소 8자)"
                />
              </div>
              <div>
                <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password_confirm"
                  name="password_confirm"
                  required
                  minLength={8}
                  className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                  placeholder="비밀번호를 다시 입력하세요"
                />
              </div>
            </div>
          </div>

          {/* 업체 정보 섹션 */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
              업체 정보
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  업체명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  required
                  className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                  placeholder="업체명을 입력하세요"
                />
              </div>
              <div>
                <label htmlFor="business_registration_number" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  사업자등록번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="business_registration_number"
                  name="business_registration_number"
                  required
                  className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                  placeholder="000-00-00000"
                />
              </div>
              <div>
                <label htmlFor="representative_name" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  대표자명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="representative_name"
                  name="representative_name"
                  required
                  className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                  placeholder="대표자명을 입력하세요"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="business_type" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    업태 <span className="text-gray-500 text-xs">(선택사항)</span>
                  </label>
                  <input
                    type="text"
                    id="business_type"
                    name="business_type"
                    className={`${INPUT_STYLES.full} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                    placeholder="업태를 입력하세요"
                  />
                </div>
                <div>
                  <label htmlFor="business_category" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    업종 <span className="text-gray-500 text-xs">(선택사항)</span>
                  </label>
                  <input
                    type="text"
                    id="business_category"
                    name="business_category"
                    className={`${INPUT_STYLES.full} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                    placeholder="업종을 입력하세요"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="business_address" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  사업자주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="business_address"
                  name="business_address"
                  required
                  className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                  placeholder="사업자주소를 입력하세요"
                />
              </div>
              <div className="my-6">
                <FileUpload
                  name="business_registration_file"
                    id="business_registration_file"
                    accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={10 * 1024 * 1024}
                  disabled={isSubmitting}
                  files={selectedFiles}
                  onChange={setSelectedFiles}
                  label="사업자등록증"
                  helpText="PDF, JPG, PNG 파일만 업로드 가능합니다."
                />
              </div>
            </div>
          </div>

          {/* 실무담당자 섹션 */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
              실무담당자
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="manager_name" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    성함 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="manager_name"
                    name="manager_name"
                    required
                    className={`${INPUT_STYLES.full} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                    placeholder="성함을 입력하세요"
                  />
                </div>
                <div>
                  <label htmlFor="manager_position" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    직함 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="manager_position"
                    name="manager_position"
                    required
                    className={`${INPUT_STYLES.full} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                    placeholder="직함을 입력하세요"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="manager_phone" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="manager_phone"
                    name="manager_phone"
                    required
                    className={`${INPUT_STYLES.full} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                    placeholder="010-1234-5678"
                  />
                </div>
                <div>
                  <label htmlFor="manager_email" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="manager_email"
                    name="manager_email"
                    required
                    className={`${INPUT_STYLES.full} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 회계담당자 섹션 */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
              회계담당자
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="accountant_name" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    성함 <span className="text-gray-500 text-xs">(선택사항)</span>
                  </label>
                  <input
                    type="text"
                    id="accountant_name"
                    name="accountant_name"
                    className={`${INPUT_STYLES.full} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                    placeholder="성함을 입력하세요"
                  />
                </div>
                <div>
                  <label htmlFor="accountant_phone" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    연락처 <span className="text-gray-500 text-xs">(선택사항)</span>
                  </label>
                  <input
                    type="tel"
                    id="accountant_phone"
                    name="accountant_phone"
                    className={`${INPUT_STYLES.full} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="accountant_email" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    세금계산서 발행할 이메일 <span className="text-gray-500 text-xs">(선택사항)</span>
                  </label>
                  <input
                    type="email"
                    id="accountant_email"
                    name="accountant_email"
                    className={`${INPUT_STYLES.full} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="accountant_fax" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    팩스번호 <span className="text-gray-500 text-xs">(선택사항)</span>
                  </label>
                  <input
                    type="text"
                    id="accountant_fax"
                    name="accountant_fax"
                    className={`${INPUT_STYLES.full} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                    placeholder="02-1234-5678"
                  />
                </div>
              </div>
              
              {/* 견적서 제공받을 방법 */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  견적서 제공받을 방법
                </h3>
                <div className="flex flex-wrap gap-6">
                  <RadioButton
                    name="quote_method"
                    value="email"
                    checked={quoteMethod === 'email'}
                    onChange={(e) => setQuoteMethod(e.target.value)}
                    label="이메일"
                    showUnderline={false}
                  />
                  <RadioButton
                    name="quote_method"
                    value="fax"
                    checked={quoteMethod === 'fax'}
                    onChange={(e) => setQuoteMethod(e.target.value)}
                    label="팩스"
                    showUnderline={false}
                  />
                  <RadioButton
                    name="quote_method"
                    value="sms"
                    checked={quoteMethod === 'sms'}
                    onChange={(e) => setQuoteMethod(e.target.value)}
                    label="휴대폰문자"
                    showUnderline={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 테스트 계정 생성 버튼 */}
          <div className="mt-4 mb-6">
            <button
              type="button"
              onClick={handleCreateTestAccount}
              disabled={isCreatingTest}
              className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-8 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              {isCreatingTest ? '테스트 계정 생성 중...' : '테스트 계정 생성'}
            </button>
            <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
              테스트용 계정을 자동으로 생성합니다. (아이디: test_xxx, 비밀번호: test1234)
            </p>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-between items-center">
            <Link
              href="/login"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              이미 계정이 있으신가요? 로그인
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={BUTTON_STYLES.primaryDisabled}
            >
              {isSubmitting ? '처리 중...' : '업체등록'}
            </button>
          </div>
        </form>

        {/* 성공 모달 */}
        {showSuccessModal && (
          <SuccessModal
            isOpen={showSuccessModal}
            onClose={() => {
              setShowSuccessModal(false);
              router.push('/login');
            }}
            title="업체등록이 완료되었습니다!"
            message="귀사의 무궁한 발전을 기원합니다!"
            redirectUrl="/login"
          />
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
          </div>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}

