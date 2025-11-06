'use client';

import { useState, useEffect } from 'react';
import { submitContact } from '@/app/actions/contact';
import SuccessModal from '@/components/SuccessModal';

interface ContactFormProps {
  success?: boolean;
  error?: string;
}

export default function ContactForm({ success, error }: ContactFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [contactType, setContactType] = useState<'company' | 'individual'>('company');
  const [serviceTypes, setServiceTypes] = useState<{
    moldRequest: boolean;
    deliveryBrokerage: boolean;
  }>({
    moldRequest: false,
    deliveryBrokerage: false,
  });
  
  // 도면 및 샘플 섹션 state
  const [drawingType, setDrawingType] = useState<'create' | 'have' | ''>('');
  const [hasPhysicalSample, setHasPhysicalSample] = useState(false);
  const [hasReferencePhotos, setHasReferencePhotos] = useState(false);
  const [drawingModification, setDrawingModification] = useState<'needed' | 'not_needed' | ''>('');
  
  // 일정 조율 섹션 state
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  
  // 수령방법 선택 state
  const [receiptMethod, setReceiptMethod] = useState<'visit' | 'delivery' | ''>('');
  const [visitLocation, setVisitLocation] = useState<string>('');
  const [visitDate, setVisitDate] = useState<string>('');
  const [visitTimeSlot, setVisitTimeSlot] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryName, setDeliveryName] = useState<string>('');
  const [deliveryPhone, setDeliveryPhone] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<'parcel' | 'quick' | ''>('');

  // Step 1, 2의 입력값을 state로 관리
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [referralSource, setReferralSource] = useState<string>('');
  const [referralSourceOther, setReferralSourceOther] = useState('');
  const [boxShape, setBoxShape] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [material, setMaterial] = useState('');
  const [drawingNotes, setDrawingNotes] = useState('');
  const [sampleNotes, setSampleNotes] = useState('');
  
  // 모달 상태
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 내용 확인 페이지에서 파일 정보만 읽기 (나머지는 state에서 직접 사용)
  useEffect(() => {
    if (currentStep === 4) {
      // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 읽기
      setTimeout(() => {
        const form = document.querySelector('form') as HTMLFormElement;
        if (form) {
          // Step 2: 도면 파일 정보 읽기
          const drawingFileInput = form.querySelector('input[name="drawing_file"]') as HTMLInputElement;
          const drawingFilesEl = document.getElementById('review_drawing_files');
          if (drawingFilesEl && drawingFileInput?.files && drawingFileInput.files.length > 0) {
            drawingFilesEl.textContent = Array.from(drawingFileInput.files).map(f => f.name).join(', ');
          } else if (drawingFilesEl && drawingType === 'have') {
            drawingFilesEl.textContent = '파일 업로드 필요';
          }
        }
      }, 100);
    }
  }, [currentStep, drawingType]);

  const getErrorMessage = (errorType?: string) => {
    switch (errorType) {
      case 'invalid':
        return '모든 필드를 올바르게 입력해주세요.';
      case 'invalid_email':
        return '올바른 이메일 주소를 입력해주세요.';
      case 'db_failed':
        return '저장 중 오류가 발생했습니다. 이메일은 전송되었을 수 있습니다.';
      case 'email_failed':
        return '이메일 전송에 실패했습니다. 문의 내용은 저장되었습니다.';
      case 'both_failed':
        return '저장 및 이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.';
      case 'exception':
        return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      case 'file_too_large':
        return '파일 크기가 10MB를 초과합니다. 더 작은 파일을 선택해주세요.';
      case 'file_read_error':
        return '파일을 읽는 중 오류가 발생했습니다. 다시 시도해주세요.';
      default:
        return null;
    }
  };

  const handleServiceTypeChange = (type: 'moldRequest' | 'deliveryBrokerage') => {
    setServiceTypes(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <div className="w-full py-8 px-4 md:px-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-gray-100">문의하기</h1>
      
      {success && (
        <div className="rounded-md border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-4 text-sm text-green-700 dark:text-green-300 mb-6">
          문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.
        </div>
      )}
      
      {error && getErrorMessage(error) && (
        <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300 mb-6">
          {getErrorMessage(error)}
        </div>
      )}

      {/* 진행 단계 표시 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep >= 1 ? 'bg-orange-600 text-white dark:bg-orange-500' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
              1
            </div>
            <span className="ml-2 font-medium">연락처</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-4"></div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep >= 2 ? 'bg-orange-600 text-white dark:bg-orange-500' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
              2
            </div>
            <span className="ml-2 font-medium">도면 및 샘플</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-4"></div>
          <div className={`flex items-center ${currentStep >= 3 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep >= 3 ? 'bg-orange-600 text-white dark:bg-orange-500' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
              3
            </div>
            <span className="ml-2 font-medium">일정 조율</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-4"></div>
          <div className={`flex items-center ${currentStep >= 4 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep >= 4 ? 'bg-orange-600 text-white dark:bg-orange-500' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
              4
            </div>
            <span className="ml-2 font-medium">내용 확인</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-8 rounded-xl shadow-md">
        <form className="space-y-6">
          {/* 첫 번째 섹션: 연락처 */}
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }} className="space-y-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">연락처 정보</h2>
              
              {/* 업체/개인 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  문의 유형 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="contact_type"
                      value="company"
                      checked={contactType === 'company'}
                      onChange={(e) => setContactType(e.target.value as 'company' | 'individual')}
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">업체</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="contact_type"
                      value="individual"
                      checked={contactType === 'individual'}
                      onChange={(e) => setContactType(e.target.value as 'company' | 'individual')}
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">개인</span>
                  </label>
                </div>
              </div>

              {/* 개인 선택 시 서비스 유형 */}
              {contactType === 'individual' && (
                <div className="pl-4 border-l-2 border-orange-200 dark:border-orange-800/50">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    서비스 유형 <span className="text-gray-500 text-xs">(선택사항)</span>
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={serviceTypes.moldRequest}
                        onChange={() => handleServiceTypeChange('moldRequest')}
                        className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">목형 제작 의뢰</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={serviceTypes.deliveryBrokerage}
                        onChange={() => handleServiceTypeChange('deliveryBrokerage')}
                        className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">납품까지 중개</span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {contactType === 'company' ? '업체명' : '이름'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300"
                  placeholder={contactType === 'company' ? '업체명을 입력하세요' : '이름을 입력하세요'}
                />
              </div>

              {contactType === 'company' && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      담당자명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300"
                      placeholder="담당자명을 입력하세요"
                    />
                  </div>

                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      담당자 직책 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      required
                      className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300"
                      placeholder="예: 대표, 팀장, 매니저 등"
                    />
                  </div>
                </>
              )}


              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300"
                  placeholder="010-1234-5678"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label htmlFor="referralSource" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  유입경로 <span className="text-red-500">*</span>
                </label>
                <select
                  id="referralSource"
                  name="referralSource"
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  required
                  className="w-1/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300"
                >
                  <option value="">선택해주세요</option>
                  <option value="구글">구글</option>
                  <option value="네이버">네이버</option>
                  <option value="블로그">블로그</option>
                  <option value="인스타그램">인스타그램</option>
                  <option value="인공지능">인공지능</option>
                  <option value="거래처 소개">거래처 소개</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              {(referralSource === '기타' || referralSource === '거래처 소개') && (
                <div>
                  <label htmlFor="referralSourceOther" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {referralSource === '기타' ? '유입경로 (기타)' : '거래처명'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="referralSourceOther"
                    name="referralSourceOther"
                    value={referralSourceOther}
                    onChange={(e) => setReferralSourceOther(e.target.value)}
                    required
                    className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300"
                    placeholder={referralSource === '기타' ? '유입경로를 입력해주세요' : '거래처명을 입력해주세요'}
                  />
                </div>
              )}

              {/* 숨겨진 필드 (서비스 유형 정보 전달용) */}
              <input type="hidden" name="contact_type" value={contactType} />
              <input type="hidden" name="service_mold_request" value={serviceTypes.moldRequest ? '1' : '0'} />
              <input type="hidden" name="service_delivery_brokerage" value={serviceTypes.deliveryBrokerage ? '1' : '0'} />

              {/* 다음 단계 버튼 */}
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    // 유입경로 검증
                    if (!referralSource) {
                      alert('유입경로를 선택해주세요.');
                      return;
                    }
                    if ((referralSource === '기타' || referralSource === '거래처 소개') && !referralSourceOther.trim()) {
                      alert(referralSource === '기타' ? '유입경로(기타)를 입력해주세요.' : '거래처명을 입력해주세요.');
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  다음 단계
                </button>
              </div>
          </div>

          {/* 두 번째 섹션: 도면 및 샘플 */}
          <div style={{ display: currentStep === 2 ? 'block' : 'none' }} className="space-y-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">도면 및 샘플</h2>
              
              {/* 필요한 사항 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  필요한 사항 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="drawing_type"
                      value="create"
                      checked={drawingType === 'create'}
                      onChange={(e) => {
                        setDrawingType(e.target.value as 'create');
                        // 초기화
                        setHasPhysicalSample(false);
                        setHasReferencePhotos(false);
                      }}
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">도면 제작이 필요합니다</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="drawing_type"
                      value="have"
                      checked={drawingType === 'have'}
                      onChange={(e) => {
                        setDrawingType(e.target.value as 'have');
                        // 초기화
                        setDrawingModification('');
                      }}
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">도면을 가지고 있습니다</span>
                  </label>
                </div>
              </div>

              {/* 도면 제작이 필요합니다 선택 시 */}
              {drawingType === 'create' && (
                <div className="pl-4 border-l-2 border-orange-200 dark:border-orange-800 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                      샘플/사진 정보 <span className="text-gray-500 text-xs">(선택사항)</span>
                    </label>
                    <div className="space-y-4">
                      {/* 실물 샘플이 있습니다 - 레이아웃 연장되는 느낌으로 */}
                      <div className={`overflow-hidden transition-all duration-300 ${
                        hasPhysicalSample 
                          ? 'border border-orange-300 dark:border-orange-800/50 rounded-lg' 
                          : ''
                      }`}>
                        {/* 실물 샘플이 있습니다 토글 버튼 */}
                        <button
                          type="button"
                          onClick={() => {
                            setHasPhysicalSample(!hasPhysicalSample);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 transition-all duration-300 ${
                            hasPhysicalSample
                              ? 'bg-orange-50 border-b border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/50'
                              : 'bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                              hasPhysicalSample
                                ? 'bg-orange-600 border-orange-600'
                                : 'border-gray-300 dark:border-gray-500'
                            }`}>
                              {hasPhysicalSample && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">실물 샘플이 있습니다</span>
                          </div>
                          <svg
                            className={`w-5 h-5 text-orange-600 dark:text-orange-400 transition-transform duration-200 ${
                              hasPhysicalSample ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* 실물 샘플이 있습니다 선택 시 - 체크되면 바로 아래 내용 표시 */}
                        {hasPhysicalSample && (
                          <div className="space-y-4 p-4 bg-orange-50/50 dark:bg-orange-900/10 transition-all duration-300">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">샘플 발송 주소</h4>
                              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                <p className="font-medium">서울 중구 퇴계로39길 20, 2층</p>
                                <p>전화: 02-2264-8070</p>
                                <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                                  명함, 업체를 확인할 수 있는 서류 동봉 부탁드립니다.
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <label htmlFor="sample_notes" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                샘플에 대한 특이사항 <span className="text-gray-500 text-xs">(선택사항)</span>
                              </label>
                              <textarea
                                id="sample_notes"
                                name="sample_notes"
                                value={sampleNotes}
                                onChange={(e) => setSampleNotes(e.target.value)}
                                rows={3}
                                className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300 resize-none"
                                placeholder="샘플에 대한 특이사항이나 주의사항을 입력해주세요"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 제작에 필요한 내용 자료가 있을까요 - 동일한 레이아웃으로 */}
                      <div className={`overflow-hidden transition-all duration-300 ${
                        hasReferencePhotos 
                          ? 'border border-orange-300 dark:border-orange-800/50 rounded-lg' 
                          : ''
                      }`}>
                        {/* 제작에 필요한 내용 자료가 있을까요 토글 버튼 */}
                        <button
                          type="button"
                          onClick={() => {
                            setHasReferencePhotos(!hasReferencePhotos);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 transition-all duration-300 ${
                            hasReferencePhotos
                              ? 'bg-orange-50 border-b border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/50'
                              : 'bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                              hasReferencePhotos
                                ? 'bg-orange-600 border-orange-600'
                                : 'border-gray-300 dark:border-gray-500'
                            }`}>
                              {hasReferencePhotos && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">제작에 필요한 내용 자료가 있을까요?</span>
                          </div>
                          <svg
                            className={`w-5 h-5 text-orange-600 dark:text-orange-400 transition-transform duration-200 ${
                              hasReferencePhotos ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* 제작에 필요한 내용 자료 업로드 - 체크되면 바로 아래 내용 표시 */}
                        {hasReferencePhotos && (
                          <div className="space-y-4 p-4 bg-orange-50/50 dark:bg-orange-900/10 transition-all duration-300">
                            <div>
                              <label htmlFor="reference_photos" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                제작에 필요한 내용 자료 업로드 <span className="text-gray-500 text-xs">(선택사항)</span>
                              </label>
                              <input
                                type="file"
                                id="reference_photos"
                                name="reference_photos"
                                multiple
                                accept="image/*,.pdf,.doc,.docx"
                                className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-orange-900/20 dark:file:text-orange-300"
                              />
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                이미지 파일 또는 문서 파일 업로드 가능 (JPG, PNG, GIF, PDF, DOC, DOCX 등)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 도면을 가지고 있습니다 선택 시 */}
              {drawingType === 'have' && (
                <div className="pl-4 border-l-2 border-orange-200 dark:border-orange-800 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                      도면 수정 필요 여부 <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="drawing_modification"
                          value="needed"
                          checked={drawingModification === 'needed'}
                          onChange={(e) => setDrawingModification(e.target.value as 'needed')}
                          className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">도면의 수정이 필요합니다</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="drawing_modification"
                          value="not_needed"
                          checked={drawingModification === 'not_needed'}
                          onChange={(e) => setDrawingModification(e.target.value as 'not_needed')}
                          className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">도면의 수정이 필요없습니다</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="drawing_file" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      도면 파일 업로드 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      id="drawing_file"
                      name="drawing_file"
                      accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.gif,.zip,.rar"
                      required={drawingType === 'have'}
                      className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-orange-900/20 dark:file:text-orange-300"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      지원 형식: PDF, DWG, DXF, JPG, PNG, GIF, ZIP, RAR (최대 10MB)
                    </p>
                  </div>
                </div>
              )}

              {/* 공통 부분: 박스 형태, 장폭고, 원단 재질 */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">제품 정보</h3>
                
                <div>
                  <label htmlFor="box_shape" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    박스 형태 <span className="text-gray-500 text-xs">(선택사항)</span>
                  </label>
                  <input
                    type="text"
                    id="box_shape"
                    name="box_shape"
                    value={boxShape}
                    onChange={(e) => setBoxShape(e.target.value)}
                    className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300"
                    placeholder="예: 직사각형, 정사각형, 원형 등"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    장폭고 <span className="text-gray-500 text-xs">(선택사항)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="length" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        장 (길이)
                      </label>
                      <input
                        type="text"
                        id="length"
                        name="length"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300"
                        placeholder="mm"
                      />
                    </div>
                    <div>
                      <label htmlFor="width" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        폭 (너비)
                      </label>
                      <input
                        type="text"
                        id="width"
                        name="width"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300"
                        placeholder="mm"
                      />
                    </div>
                    <div>
                      <label htmlFor="height" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        고 (높이)
                      </label>
                      <input
                        type="text"
                        id="height"
                        name="height"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300"
                        placeholder="mm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="material" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    원단 재질 <span className="text-gray-500 text-xs">(선택사항)</span>
                  </label>
                  <input
                    type="text"
                    id="material"
                    name="material"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300"
                    placeholder="예: 종이, 플라스틱, 천 등"
                  />
                </div>
              </div>

              {/* 도면 및 샘플 제작시 유의사항 */}
              <div>
                <label htmlFor="drawing_notes" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  도면 및 샘플 제작시 유의사항 <span className="text-gray-500 text-xs">(선택사항)</span>
                </label>
                <textarea
                  id="drawing_notes"
                  name="drawing_notes"
                  value={drawingNotes}
                  onChange={(e) => setDrawingNotes(e.target.value)}
                  rows={4}
                  className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300 resize-none"
                  placeholder="도면 및 샘플 제작시 특별히 주의해야 할 사항을 입력해주세요"
                />
              </div>

              {/* 숨겨진 필드 (도면 관련 정보 전달용) */}
              <input type="hidden" name="drawing_type" value={drawingType || ''} />
              <input type="hidden" name="has_physical_sample" value={hasPhysicalSample ? '1' : '0'} />
              <input type="hidden" name="has_reference_photos" value={hasReferencePhotos ? '1' : '0'} />
              <input type="hidden" name="drawing_modification" value={drawingModification || ''} />
              <input type="hidden" name="box_shape" value={boxShape || ''} />
              <input type="hidden" name="length" value={length || ''} />
              <input type="hidden" name="width" value={width || ''} />
              <input type="hidden" name="height" value={height || ''} />
              <input type="hidden" name="material" value={material || ''} />
              <input type="hidden" name="drawing_notes" value={drawingNotes || ''} />
              <input type="hidden" name="sample_notes" value={sampleNotes || ''} />

              {/* 네비게이션 버튼 */}
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-300"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!drawingType) {
                      alert('필요한 사항을 선택해주세요.');
                      return;
                    }
                    if (drawingType === 'have') {
                      if (!drawingModification) {
                        alert('도면 수정 필요 여부를 선택해주세요.');
                        return;
                      }
                      // 도면 파일 업로드 필수 검증
                      const drawingFileInput = document.getElementById('drawing_file') as HTMLInputElement;
                      if (!drawingFileInput || !drawingFileInput.files || drawingFileInput.files.length === 0) {
                        alert('도면 파일을 업로드해주세요.');
                        return;
                      }
                    }
                    setCurrentStep(3);
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  다음 단계
                </button>
              </div>
          </div>

          {/* 세 번째 섹션: 일정 조율 */}
          <div style={{ display: currentStep === 3 ? 'block' : 'none' }} className="space-y-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">일정 조율</h2>
              
              {/* 샘플 완료후 수령방법 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  샘플 완료후 수령방법 선택 <span className="text-red-500">*</span>
                </label>
                
                {/* 안내사항 */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">안내사항</h4>
                  <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                    <p>• 샘플제작은 대략 1~2일 정도 소요되며, 고객사에 따라 도면의 유무, 당사 일정관계상 더 소요될수있습니다.</p>
                    <p>• 즉시 수정 피드백을 원하시면 방문수령을, 그렇지않으시면 택배 및 퀵으로 수령하시면 원할한 진행이 되십니다.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* 방문 수령 */}
                  <div className={`overflow-hidden transition-all duration-300 ${
                    receiptMethod === 'visit' 
                      ? 'border border-orange-300 dark:border-orange-800/50 rounded-lg' 
                      : ''
                  }`}>
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptMethod(receiptMethod === 'visit' ? '' : 'visit');
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 transition-all duration-300 ${
                        receiptMethod === 'visit'
                          ? 'bg-orange-50 border-b border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/50'
                          : 'bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                          receiptMethod === 'visit'
                            ? 'bg-orange-600 border-orange-600'
                            : 'border-gray-300 dark:border-gray-500'
                        }`}>
                          {receiptMethod === 'visit' && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">방문 수령</span>
                      </div>
                      <svg
                        className={`w-5 h-5 text-orange-600 dark:text-orange-400 transition-transform duration-200 ${
                          receiptMethod === 'visit' ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {receiptMethod === 'visit' && (
                      <div className="space-y-4 p-4 bg-orange-50/50 dark:bg-orange-900/10 transition-all duration-300">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            회사위치
                          </label>
                          <div className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                            <p className="text-sm font-medium mb-1">서울 중구 퇴계로39길 20, 2층 유진레이져목형 사무실</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">(평일 9:00 ~ 19:00 주말 및 공휴일 휴무)</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 날짜 선택 - 왼쪽 */}
                          <div>
                            <label htmlFor="visit_date" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                              날짜 선택 <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              id="visit_date"
                              value={visitDate}
                              onChange={(e) => {
                                const selectedDate = new Date(e.target.value);
                                const dayOfWeek = selectedDate.getDay(); // 0 = 일요일, 6 = 토요일
                                
                                // 주말 체크 (토요일=6, 일요일=0)
                                if (dayOfWeek === 0 || dayOfWeek === 6) {
                                  alert('평일만 선택 가능합니다. (주말 제외)');
                                  setVisitDate('');
                                  setVisitTimeSlot('');
                                  return;
                                }
                                
                                // 평일 7일 범위 체크
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                
                                // 현재 날짜 + 2일 이후의 첫 번째 평일 찾기
                                let startDate = new Date(today);
                                startDate.setDate(startDate.getDate() + 2);
                                while (startDate.getDay() === 0 || startDate.getDay() === 6) {
                                  startDate.setDate(startDate.getDate() + 1);
                                }
                                
                                // 평일 7일 범위 계산 (주말 제외)
                                let endDate = new Date(startDate);
                                let weekdaysCount = 0;
                                while (weekdaysCount < 6) { // 7일이므로 6일 더 추가
                                  endDate.setDate(endDate.getDate() + 1);
                                  if (endDate.getDay() !== 0 && endDate.getDay() !== 6) {
                                    weekdaysCount++;
                                  }
                                }
                                
                                // 선택한 날짜가 범위 내에 있는지 확인
                                if (selectedDate < startDate || selectedDate > endDate) {
                                  alert('선택 가능한 평일 범위를 벗어났습니다.');
                                  setVisitDate('');
                                  setVisitTimeSlot('');
                                  return;
                                }
                                
                                setVisitDate(e.target.value);
                                setVisitTimeSlot(''); // 날짜 변경 시 시간 슬롯 초기화
                              }}
                              min={(() => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                let date = new Date(today);
                                date.setDate(date.getDate() + 2); // 현재 날짜 + 2일
                                
                                // 첫 번째 평일 찾기
                                while (date.getDay() === 0 || date.getDay() === 6) {
                                  date.setDate(date.getDate() + 1);
                                }
                                
                                return date.toISOString().split('T')[0];
                              })()}
                              max={(() => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                
                                // 현재 날짜 + 2일 이후의 첫 번째 평일 찾기
                                let startDate = new Date(today);
                                startDate.setDate(startDate.getDate() + 2);
                                while (startDate.getDay() === 0 || startDate.getDay() === 6) {
                                  startDate.setDate(startDate.getDate() + 1);
                                }
                                
                                // 평일 7일 범위 계산 (주말 제외)
                                let endDate = new Date(startDate);
                                let weekdaysCount = 0;
                                while (weekdaysCount < 6) { // 7일이므로 6일 더 추가
                                  endDate.setDate(endDate.getDate() + 1);
                                  if (endDate.getDay() !== 0 && endDate.getDay() !== 6) {
                                    weekdaysCount++;
                                  }
                                }
                                
                                return endDate.toISOString().split('T')[0];
                              })()}
                              className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300"
                              required
                            />
                          </div>

                          {/* 시간 슬롯 선택 - 오른쪽, 세로 배치 */}
                          {visitDate && (
                            <div>
                              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                                시간 선택 <span className="text-red-500">*</span>
                              </label>
                              <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-2">
                                {(() => {
                                  // 9시부터 17시까지, 12시는 제외
                                  const hours = [9, 10, 11, 13, 14, 15, 16, 17];
                                  return hours.map((startHour) => {
                                    const endHour = startHour + 1;
                                    const timeSlot = `${startHour}:00~${endHour}:00`;
                                    const isSelected = visitTimeSlot === timeSlot;
                                    
                                    return (
                                      <button
                                        key={timeSlot}
                                        type="button"
                                        onClick={() => {
                                          setVisitTimeSlot(isSelected ? '' : timeSlot);
                                        }}
                                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 text-left ${
                                          isSelected
                                            ? 'bg-orange-600 border-orange-600 text-white dark:bg-orange-500 dark:border-orange-500'
                                            : 'bg-white border-gray-300 text-gray-700 hover:border-orange-300 hover:bg-orange-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-orange-600 dark:hover:bg-orange-900/20'
                                        }`}
                                      >
                                        <span className="text-sm font-medium">{timeSlot}</span>
                                      </button>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 택배 및 퀵으로 수령 */}
                  <div className={`overflow-hidden transition-all duration-300 ${
                    receiptMethod === 'delivery' 
                      ? 'border border-orange-300 dark:border-orange-800/50 rounded-lg' 
                      : ''
                  }`}>
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptMethod(receiptMethod === 'delivery' ? '' : 'delivery');
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 transition-all duration-300 ${
                        receiptMethod === 'delivery'
                          ? 'bg-orange-50 border-b border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/50'
                          : 'bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                          receiptMethod === 'delivery'
                            ? 'bg-orange-600 border-orange-600'
                            : 'border-gray-300 dark:border-gray-500'
                        }`}>
                          {receiptMethod === 'delivery' && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">택배 및 퀵으로 수령</span>
                      </div>
                      <svg
                        className={`w-5 h-5 text-orange-600 dark:text-orange-400 transition-transform duration-200 ${
                          receiptMethod === 'delivery' ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {receiptMethod === 'delivery' && (
                      <div className="space-y-4 p-4 bg-orange-50/50 dark:bg-orange-900/10 transition-all duration-300">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                            배송 방법 <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-6">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="delivery_type"
                                value="parcel"
                                checked={deliveryType === 'parcel'}
                                onChange={(e) => setDeliveryType(e.target.value as 'parcel' | 'quick')}
                                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">택배</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="delivery_type"
                                value="quick"
                                checked={deliveryType === 'quick'}
                                onChange={(e) => setDeliveryType(e.target.value as 'parcel' | 'quick')}
                                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">퀵</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="delivery_address" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            택배 받을 주소 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="delivery_address"
                            name="delivery_address"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300"
                            placeholder="택배 받을 주소를 입력해주세요"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="delivery_name" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            이름 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="delivery_name"
                            name="delivery_name"
                            value={deliveryName}
                            onChange={(e) => setDeliveryName(e.target.value)}
                            className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300"
                            placeholder="이름을 입력해주세요"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="delivery_phone" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            연락처 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            id="delivery_phone"
                            name="delivery_phone"
                            value={deliveryPhone}
                            onChange={(e) => setDeliveryPhone(e.target.value)}
                            className="w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300"
                            placeholder="010-1234-5678"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 네비게이션 버튼 */}
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-300"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!receiptMethod) {
                      alert('수령방법을 선택해주세요.');
                      return;
                    }
                    if (receiptMethod === 'visit') {
                      if (!visitDate) {
                        alert('날짜를 선택해주세요.');
                        return;
                      }
                      if (!visitTimeSlot) {
                        alert('시간을 선택해주세요.');
                        return;
                      }
                    } else if (receiptMethod === 'delivery') {
                      if (!deliveryAddress) {
                        alert('택배 받을 주소를 입력해주세요.');
                        return;
                      }
                      if (!deliveryName) {
                        alert('이름을 입력해주세요.');
                        return;
                      }
                      if (!deliveryPhone) {
                        alert('연락처를 입력해주세요.');
                        return;
                      }
                      if (!deliveryType) {
                        alert('배송 방법을 선택해주세요.');
                        return;
                      }
                    }
                    setCurrentStep(4);
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  다음 단계
                </button>
              </div>
          </div>

          {/* 네 번째 섹션: 내용 확인 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">내용 확인</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">입력하신 내용을 확인해주세요. 수정이 필요하시면 해당 섹션의 수정 버튼을 클릭해주세요.</p>
              
              {/* Step 1: 연락처 정보 */}
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">1. 연락처 정보</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium underline"
                  >
                    수정
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">문의 유형:</span>
                      <span className="ml-2">{contactType === 'company' ? '업체' : '개인'}</span>
                    </div>
                    {contactType === 'individual' && (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">서비스 유형:</span>
                        <span className="ml-2">
                          {[
                            serviceTypes.moldRequest && '목형 제작 의뢰',
                            serviceTypes.deliveryBrokerage && '납품까지 중개'
                          ].filter(Boolean).join(', ') || '없음'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">{contactType === 'company' ? '업체명' : '이름'}:</span>
                      <span className="ml-2">{companyName || '-'}</span>
                    </div>
                    {contactType === 'company' && (
                      <>
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">담당자명:</span>
                          <span className="ml-2">{name || '-'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">직책:</span>
                          <span className="ml-2">{position || '-'}</span>
                        </div>
                      </>
                    )}
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">연락처:</span>
                      <span className="ml-2">{phone || '-'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">이메일:</span>
                      <span className="ml-2">{email || '-'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">유입경로:</span>
                      <span className="ml-2">{(referralSource === '기타' || referralSource === '거래처 소개') ? referralSourceOther : referralSource || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: 도면 및 샘플 */}
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">2. 도면 및 샘플</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium underline"
                  >
                    수정
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {drawingType ? (
                    <>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">도면 상태:</span>
                        <span className="ml-2">{drawingType === 'create' ? '도면 제작이 필요합니다' : '도면을 가지고 있습니다'}</span>
                      </div>
                      
                      {drawingType === 'create' && (
                        <div className="mt-3 space-y-2 pl-4 border-l-2 border-orange-200 dark:border-orange-800">
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">실물 샘플:</span>
                            <span className="ml-2">{hasPhysicalSample ? '있음' : '없음'}</span>
                          </div>
                          {hasPhysicalSample && (
                            <div className="mt-2">
                              <span className="font-medium text-gray-600 dark:text-gray-400">샘플 특이사항:</span>
                              <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{sampleNotes || '-'}</p>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">제작 자료:</span>
                            <span className="ml-2">{hasReferencePhotos ? '있음' : '없음'}</span>
                          </div>
                        </div>
                      )}
                      
                      {drawingType === 'have' && (
                        <div className="mt-3 space-y-2 pl-4 border-l-2 border-orange-200 dark:border-orange-800">
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">도면 수정:</span>
                            <span className="ml-2">
                              {drawingModification === 'needed' ? '도면의 수정이 필요합니다' : 
                               drawingModification === 'not_needed' ? '도면의 수정이 필요없습니다' : '-'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">도면 파일:</span>
                            <span className="ml-2" id="review_drawing_files">파일 업로드 필요</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">박스 형태:</span>
                          <span className="ml-2">{boxShape || '-'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">재질:</span>
                          <span className="ml-2">{material || '-'}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-600 dark:text-gray-400">크기 (장×폭×고):</span>
                          <span className="ml-2">
                            {length || '-'} mm × {width || '-'} mm × {height || '-'} mm
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-600 dark:text-gray-400">도면 및 샘플 제작 시 유의사항:</span>
                          <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{drawingNotes || '-'}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">입력된 정보가 없습니다.</p>
                  )}
                </div>
              </div>

              {/* Step 3: 일정 조율 */}
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">3. 일정 조율</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium underline"
                  >
                    수정
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {receiptMethod ? (
                    <>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">수령 방법:</span>
                        <span className="ml-2">{receiptMethod === 'visit' ? '방문 수령' : '택배 및 퀵으로 수령'}</span>
                      </div>
                      
                      {receiptMethod === 'visit' && (
                        <div className="mt-3 space-y-2 pl-4 border-l-2 border-orange-200 dark:border-orange-800">
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">회사위치:</span>
                            <p className="mt-1 text-gray-700 dark:text-gray-300">서울 중구 퇴계로39길 20, 2층 유진레이져목형 사무실</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">(평일 9:00 ~ 19:00 주말 및 공휴일 휴무)</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">방문 날짜:</span>
                            <span className="ml-2">{visitDate || '-'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">방문 시간:</span>
                            <span className="ml-2">{visitTimeSlot || '-'}</span>
                          </div>
                        </div>
                      )}
                      
                      {receiptMethod === 'delivery' && (
                        <div className="mt-3 space-y-2 pl-4 border-l-2 border-orange-200 dark:border-orange-800">
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">배송 방법:</span>
                            <span className="ml-2">{deliveryType === 'parcel' ? '택배' : deliveryType === 'quick' ? '퀵' : '-'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">배송 주소:</span>
                            <span className="ml-2">{deliveryAddress || '-'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">수령인:</span>
                            <span className="ml-2">{deliveryName || '-'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">연락처:</span>
                            <span className="ml-2">{deliveryPhone || '-'}</span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">입력된 정보가 없습니다.</p>
                  )}
                </div>
              </div>

              {/* 네비게이션 버튼 */}
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-300"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    console.log('[CONTACT FORM] Submit button clicked');
                    const form = e.currentTarget.closest('form') as HTMLFormElement;
                    if (!form) {
                      console.error('[CONTACT FORM] Form element not found');
                      return;
                    }
                    console.log('[CONTACT FORM] Form element found:', form);

                    // 전체 필드 검증
                    let firstErrorField: HTMLElement | null = null;
                    let errorStep = 1;
                    let errorMessage = '';

                    // Step 1: 연락처 정보 검증
                    const companyNameInput = form.querySelector('input[name="company_name"]') as HTMLInputElement;
                    const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
                    const positionInput = form.querySelector('input[name="position"]') as HTMLInputElement;
                    const phoneInput = form.querySelector('input[name="phone"]') as HTMLInputElement;
                    const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;

                    if (!companyNameInput?.value?.trim()) {
                      errorMessage = '업체명(또는 이름)을 입력해주세요.';
                      firstErrorField = companyNameInput;
                      errorStep = 1;
                    } else if (contactType === 'company' && (!nameInput?.value?.trim() || !positionInput?.value?.trim())) {
                      errorMessage = '담당자명과 직책을 입력해주세요.';
                      firstErrorField = nameInput?.value?.trim() ? positionInput : nameInput;
                      errorStep = 1;
                    } else if (!phoneInput?.value?.trim()) {
                      errorMessage = '연락처를 입력해주세요.';
                      firstErrorField = phoneInput;
                      errorStep = 1;
                    } else if (!emailInput?.value?.trim()) {
                      errorMessage = '이메일을 입력해주세요.';
                      firstErrorField = emailInput;
                      errorStep = 1;
                    } else if (!drawingType) {
                      // Step 2: 도면 및 샘플 검증
                      errorMessage = '도면 제작 필요 여부를 선택해주세요.';
                      errorStep = 2;
                    } else if (drawingType === 'have' && !drawingModification) {
                      errorMessage = '도면 수정 필요 여부를 선택해주세요.';
                      errorStep = 2;
                    } else if (drawingType === 'have') {
                      const drawingFileInput = form.querySelector('input[name="drawing_file"]') as HTMLInputElement;
                      if (!drawingFileInput?.files || drawingFileInput.files.length === 0) {
                        errorMessage = '도면 파일을 업로드해주세요.';
                        firstErrorField = drawingFileInput;
                        errorStep = 2;
                      }
                    } else if (!receiptMethod) {
                      // Step 3: 일정 조율 검증
                      errorMessage = '수령방법을 선택해주세요.';
                      errorStep = 3;
                    } else if (receiptMethod === 'visit') {
                      if (!visitDate) {
                        errorMessage = '방문 날짜를 선택해주세요.';
                        errorStep = 3;
                      } else if (!visitTimeSlot) {
                        errorMessage = '방문 시간을 선택해주세요.';
                        errorStep = 3;
                      }
                    } else if (receiptMethod === 'delivery') {
                      if (!deliveryType) {
                        errorMessage = '배송 방법을 선택해주세요.';
                        errorStep = 3;
                      } else if (!deliveryAddress?.trim()) {
                        errorMessage = '배송 주소를 입력해주세요.';
                        errorStep = 3;
                      } else if (!deliveryName?.trim()) {
                        errorMessage = '수령인 이름을 입력해주세요.';
                        errorStep = 3;
                      } else if (!deliveryPhone?.trim()) {
                        errorMessage = '수령인 연락처를 입력해주세요.';
                        errorStep = 3;
                      }
                    }

                    if (errorMessage) {
                      console.log('[CONTACT FORM] Validation failed:', errorMessage);
                      alert(errorMessage);
                      // 해당 단계로 이동
                      setCurrentStep(errorStep);
                      // 해당 필드로 스크롤 및 포커스
                      setTimeout(() => {
                        if (firstErrorField) {
                          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          setTimeout(() => firstErrorField.focus(), 300);
                        } else {
                          // 해당 단계의 섹션으로 이동
                          const stepSelectors: { [key: number]: string } = {
                            1: 'h2:contains("연락처 정보")',
                            2: 'h2:contains("도면 및 샘플")',
                            3: 'h2:contains("일정 조율")',
                          };
                          // 직접 단계별 헤더 찾기
                          const headings = document.querySelectorAll('h2');
                          let targetHeading: Element | null = null;
                          if (errorStep === 1) {
                            targetHeading = Array.from(headings).find(h => h.textContent?.includes('연락처 정보')) || null;
                          } else if (errorStep === 2) {
                            targetHeading = Array.from(headings).find(h => h.textContent?.includes('도면 및 샘플')) || null;
                          } else if (errorStep === 3) {
                            targetHeading = Array.from(headings).find(h => h.textContent?.includes('일정 조율')) || null;
                          }
                          if (targetHeading) {
                            targetHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }
                      }, 100);
                      return;
                    }

                    // 모든 검증 통과 시 폼 제출
                    setIsSubmitting(true);
                    
                    try {
                      // FormData를 명시적으로 생성하고 모든 필드 포함
                      const formData = new FormData();
                      
                      // Step 1: 연락처 정보
                      formData.append('contact_type', contactType);
                      formData.append('service_mold_request', serviceTypes.moldRequest ? '1' : '0');
                      formData.append('service_delivery_brokerage', serviceTypes.deliveryBrokerage ? '1' : '0');
                      formData.append('company_name', companyName);
                      formData.append('name', name);
                      formData.append('position', position);
                      formData.append('phone', phone);
                      formData.append('email', email);
                      formData.append('referral_source', (referralSource === '기타' || referralSource === '거래처 소개') ? referralSourceOther : referralSource);
                      
                      // Step 2: 도면 및 샘플
                      formData.append('drawing_type', drawingType || '');
                      formData.append('has_physical_sample', hasPhysicalSample ? '1' : '0');
                      formData.append('has_reference_photos', hasReferencePhotos ? '1' : '0');
                      formData.append('drawing_modification', drawingModification || '');
                      formData.append('box_shape', boxShape || '');
                      formData.append('length', length || '');
                      formData.append('width', width || '');
                      formData.append('height', height || '');
                      formData.append('material', material || '');
                      formData.append('drawing_notes', drawingNotes || '');
                      formData.append('sample_notes', sampleNotes || '');
                      
                      // Step 3: 일정 조율 (명시적으로 추가)
                      formData.append('receipt_method', receiptMethod || '');
                      formData.append('visit_location', visitLocation || '');
                      formData.append('visit_date', visitDate || '');
                      formData.append('visit_time_slot', visitTimeSlot || '');
                      formData.append('delivery_address', deliveryAddress || '');
                      formData.append('delivery_name', deliveryName || '');
                      formData.append('delivery_phone', deliveryPhone || '');
                      formData.append('delivery_type', deliveryType || '');
                      
                      // 파일 업로드 필드 (form에서 가져오기)
                      const attachmentInput = form.querySelector('input[name="attachment"]') as HTMLInputElement;
                      const drawingFileInput = form.querySelector('input[name="drawing_file"]') as HTMLInputElement;
                      const referencePhotosInputs = form.querySelectorAll('input[name="reference_photos"]') as NodeListOf<HTMLInputElement>;
                      
                      if (attachmentInput?.files?.[0]) {
                        formData.append('attachment', attachmentInput.files[0]);
                      }
                      if (drawingFileInput?.files?.[0]) {
                        formData.append('drawing_file', drawingFileInput.files[0]);
                      }
                      referencePhotosInputs.forEach(input => {
                        if (input.files?.[0]) {
                          formData.append('reference_photos', input.files[0]);
                        }
                      });
                      
                      // submitContact 호출
                      const result = await submitContact(formData);
                      
                      if (result && result.success) {
                        // 성공 모달 표시
                        setShowSuccessModal(true);
                      } else {
                        // 실패 시 에러 메시지 표시
                        alert(result?.error || '문의 제출에 실패했습니다. 다시 시도해주세요.');
                        setIsSubmitting(false);
                      }
                    } catch (error) {
                      console.error('[CONTACT FORM] Form submission error:', error);
                      alert(`폼 제출 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
                      setIsSubmitting(false);
                    }
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  문의하기
                </button>
              </div>
            </div>
          )}

          {/* 모든 섹션의 hidden input을 form 태그 바로 안에 배치 */}
          <input type="hidden" name="referral_source" value={(referralSource === '기타' || referralSource === '거래처 소개') ? referralSourceOther : referralSource} />
          <input type="hidden" name="receipt_method" value={receiptMethod || ''} />
          <input type="hidden" name="visit_location" value={visitLocation || ''} />
          <input type="hidden" name="visit_date" value={visitDate || ''} />
          <input type="hidden" name="visit_time_slot" value={visitTimeSlot || ''} />
          <input type="hidden" name="delivery_address" value={deliveryAddress || ''} />
          <input type="hidden" name="delivery_name" value={deliveryName || ''} />
          <input type="hidden" name="delivery_phone" value={deliveryPhone || ''} />
          <input type="hidden" name="delivery_type" value={deliveryType || ''} />
        </form>
      </div>

      {/* 성공 모달 */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
        }}
        title="문의가 전송되었습니다"
        message="빠른 시일 내에 연락드리겠습니다."
        redirectUrl="/contact"
      />
    </div>
  );
}

