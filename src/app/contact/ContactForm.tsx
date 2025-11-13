'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { submitContact } from '@/app/actions/contact';
import SuccessModal from '@/components/SuccessModal';
import ErrorModal from '@/components/ErrorModal';
import StepIndicator from '@/components/contact/StepIndicator';
import { INPUT_STYLES, BUTTON_STYLES, CHECKBOX_STYLES, FILE_INPUT_STYLES } from '@/lib/styles';
import { getErrorMessage } from '@/lib/utils/contactValidation';
import type { ContactFormProps } from '@/types/contact';
import { FileUpload } from '@/components/FileUpload';
import { RadioButton } from '@/components/RadioButton';
import { InfoBox } from '@/components/InfoBox';

export default function ContactForm({ success, error, initialValues }: ContactFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [contactType, setContactType] = useState<'company' | 'individual'>('company');
  const [serviceType, setServiceType] = useState<'moldRequest' | 'deliveryBrokerage' | ''>('');
  
  // 도면 및 샘플 섹션 state
  const [drawingType, setDrawingType] = useState<'create' | 'have' | ''>('');
  const [hasPhysicalSample, setHasPhysicalSample] = useState(false);
  const [hasReferencePhotos, setHasReferencePhotos] = useState(false);
  const [drawingModification, setDrawingModification] = useState<'needed' | 'not_needed' | ''>('');
  
  // 일정 조율 섹션 state
  // const [selectedDate, setSelectedDate] = useState<string>(''); // 미사용
  // const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(''); // 미사용
  
  // 수령방법 선택 state
  const [receiptMethod, setReceiptMethod] = useState<'visit' | 'delivery' | ''>('');
  const [visitLocation] = useState<string>('');
  
  // 납품업체 state (모두 준비되었을 경우)
  const [deliveryMethod, setDeliveryMethod] = useState<'company_address' | 'delivery_company'>('company_address');
  const [savedDeliveryCompanies, setSavedDeliveryCompanies] = useState<Array<{
    id: number;
    name: string;
    phone: string;
    address: string;
  }>>([]);
  const [selectedDeliveryCompanyId, setSelectedDeliveryCompanyId] = useState<number | ''>('');
  const [newDeliveryCompany, setNewDeliveryCompany] = useState<{
    name: string;
    phone: string;
    address: string;
  }>({
    name: '',
    phone: '',
    address: '',
  });
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [companyAddress, setCompanyAddress] = useState<string>('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string>('');
  const [isCompanyLoggedIn, setIsCompanyLoggedIn] = useState<boolean | null>(null);
  
  // 업체 주소 가져오기 및 로그인 상태 확인, 저장된 납품업체 불러오기
  useEffect(() => {
    const fetchCompanyAddress = async () => {
      setIsLoadingAddress(true);
      setAddressError('');
      try {
        const response = await fetch('/api/company/address');
        if (response.ok) {
          const data = await response.json();
          setIsCompanyLoggedIn(true);
          if (data.address) {
            setCompanyAddress(data.address);
          } else {
            setAddressError('no_address');
          }
          
          // 로그인 성공 시 저장된 납품업체 불러오기
          try {
            const deliveryResponse = await fetch('/api/company/delivery-companies');
            if (deliveryResponse.ok) {
              const deliveryData = await deliveryResponse.json();
              setSavedDeliveryCompanies(deliveryData.deliveryCompanies || []);
            }
          } catch (error) {
            console.error('Error fetching delivery companies:', error);
          }
        } else {
          if (response.status === 401 || response.status === 403) {
            setIsCompanyLoggedIn(false);
            setAddressError('not_logged_in');
          } else {
            setIsCompanyLoggedIn(false);
            setAddressError('error');
          }
        }
      } catch (error) {
        console.error('Error fetching company address:', error);
        setIsCompanyLoggedIn(false);
        setAddressError('error');
      } finally {
        setIsLoadingAddress(false);
      }
    };
    
    if (drawingType === 'have') {
      fetchCompanyAddress();
    }
  }, [drawingType]);
  
  // 오늘 + 2일 날짜 계산 (평일인 경우)
  // 주말이면 평일이 나올 때까지 +1일씩 더함
  const getDefaultVisitDate = (): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const defaultDate = new Date(today);
    defaultDate.setDate(defaultDate.getDate() + 2);
    
    // 주말(일요일=0, 토요일=6)이면 평일이 나올 때까지 +1일씩 더함
    while (defaultDate.getDay() === 0 || defaultDate.getDay() === 6) {
      defaultDate.setDate(defaultDate.getDate() + 1);
    }
    
    return defaultDate.toISOString().split('T')[0];
  };
  
  // 최소 날짜 계산 (오늘 + 2일, 주말 제외)
  const getMinVisitDate = (): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 2);
    
    // 주말이면 평일이 나올 때까지 +1일씩 더함
    while (minDate.getDay() === 0 || minDate.getDay() === 6) {
      minDate.setDate(minDate.getDate() + 1);
    }
    
    return minDate.toISOString().split('T')[0];
  };
  
  const [visitDate, setVisitDate] = useState<string>(getDefaultVisitDate());
  const [visitTimeSlot, setVisitTimeSlot] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryName, setDeliveryName] = useState<string>('');
  const [deliveryPhone, setDeliveryPhone] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<'parcel' | 'quick' | ''>('');

  // Step 1, 2의 입력값을 state로 관리 (초기값 설정)
  const [inquiryTitle, setInquiryTitle] = useState('');
  const [companyName, setCompanyName] = useState(initialValues?.companyName || '');
  const [name, setName] = useState(initialValues?.name || '');
  const [position, setPosition] = useState(initialValues?.position || '');
  const [phone, setPhone] = useState(initialValues?.phone || '');
  const [email, setEmail] = useState(initialValues?.email || '');
  // 업체 로그인 시 "기존업체"를 기본값으로 설정
  const [referralSource, setReferralSource] = useState<string>(initialValues ? '기존업체' : '');
  const [referralSourceOther, setReferralSourceOther] = useState('');
  const [boxShape, setBoxShape] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [material, setMaterial] = useState('');
  const [drawingNotes, setDrawingNotes] = useState('');
  const [sampleNotes, setSampleNotes] = useState('');
  const [referencePhotosFiles, setReferencePhotosFiles] = useState<File[]>([]);
  const [drawingFile, setDrawingFile] = useState<File[]>([]);
  
  // 모달 상태
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [, setIsSubmitting] = useState(false); // isSubmitting은 내부에서만 사용

  // 초기값이 변경되면 state 업데이트 (업체 로그인 시 자동 채우기)
  useEffect(() => {
    if (initialValues) {
      if (initialValues.companyName) setCompanyName(initialValues.companyName);
      if (initialValues.name) setName(initialValues.name);
      if (initialValues.position) setPosition(initialValues.position);
      if (initialValues.phone) setPhone(initialValues.phone);
      if (initialValues.email) setEmail(initialValues.email);
      // 업체 정보가 있으면 contactType을 'company'로 설정
      setContactType('company');
      // 업체 로그인 시 유입경로를 "기존업체"로 설정
      setReferralSource('기존업체');
    }
  }, [initialValues]);
  
  // 내용 확인 페이지에서 파일 정보만 읽기 (나머지는 state에서 직접 사용)
  useEffect(() => {
    if (currentStep === 4) {
      // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 읽기
      setTimeout(() => {
        const form = document.querySelector('form') as HTMLFormElement;
        if (form) {
          // Step 2: 도면 파일 정보 읽기
          const drawingFilesEl = document.getElementById('review_drawing_files');
          if (drawingFilesEl && drawingFile.length > 0) {
            drawingFilesEl.textContent = drawingFile.map(f => f.name).join(', ');
          } else if (drawingFilesEl && drawingType === 'have') {
            drawingFilesEl.textContent = '파일 업로드 필요';
          }
        }
      }, 100);
    }
  }, [currentStep, drawingType, drawingFile]);



  return (
    <div className="w-full py-8 px-4 md:px-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">문의하기</h1>
        {/* 테스트 버튼 - 개발 환경에서만 표시 */}
        {process.env.NODE_ENV === 'development' && (
          <button
            type="button"
            onClick={() => setShowSuccessModal(true)}
            className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            모달 테스트
          </button>
        )}
      </div>
      
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
      <StepIndicator currentStep={currentStep} drawingType={drawingType} />
      
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-8 rounded-xl shadow-md">
        <form className="space-y-6">
          {/* 첫 번째 섹션: 패키지명 */}
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }} className="space-y-8">
              {/* 패키지명 섹션 */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                {/* 패키지명 입력 */}
                <div>
                  <label htmlFor="inquiry_title" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    패키지명 <span className="text-red-500">*</span>
                  </label>
                  
                  <input
                    type="text"
                    id="inquiry_title"
                    name="inquiry_title"
                    value={inquiryTitle}
                    onChange={(e) => setInquiryTitle(e.target.value)}
                    placeholder="제작하고자하는 패키지명"
                    className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                    required
                  />
                  
                  {/* 패키지명 작성 힌트 */}
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    패키지명을 작성시에는 추후에 작업현황을 확인하실수있도록 알아보기쉽게 작성하면 편리합니다!
                  </p>
                </div>
              </div>
              
              {/* 연락처 정보 섹션 */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">연락처 정보</h2>
              
              {/* 업체/개인 선택 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  문의 유형 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <RadioButton
                    name="contact_type"
                    value="company"
                    checked={contactType === 'company'}
                    onChange={(e) => setContactType(e.target.value as 'company' | 'individual')}
                    label="업체"
                    underlineKey="contact-type-company"
                  />
                  <RadioButton
                    name="contact_type"
                    value="individual"
                    checked={contactType === 'individual'}
                    onChange={(e) => setContactType(e.target.value as 'company' | 'individual')}
                    label="개인"
                    underlineKey="contact-type-individual"
                  />
                </div>
              </div>

              {/* 개인 선택 시 서비스 유형 */}
              {contactType === 'individual' && (
                <div className="pl-4 border-l-2 border-[#ED6C00] dark:border-[#ED6C00] mb-6">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    서비스 유형 <span className="text-gray-500 text-xs">(선택사항)</span>
                  </label>
                  <div className="space-y-3">
                    <RadioButton
                      name="service_type"
                      value="moldRequest"
                      checked={serviceType === 'moldRequest'}
                      onChange={(e) => setServiceType(e.target.value as 'moldRequest' | 'deliveryBrokerage' | '')}
                      label="목형 만 제작 의뢰합니다."
                      underlineKey="service-type-mold"
                    />
                    <RadioButton
                      name="service_type"
                      value="deliveryBrokerage"
                      checked={serviceType === 'deliveryBrokerage'}
                      onChange={(e) => setServiceType(e.target.value as 'moldRequest' | 'deliveryBrokerage' | '')}
                      label="목형제작 및 납품까지 중개 를 원합니다."
                      underlineKey="service-type-delivery"
                    />
                  </div>
                </div>
              )}

              <div className="mb-6">
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
                  className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                  placeholder={contactType === 'company' ? '업체명을 입력하세요' : '이름을 입력하세요'}
                />
              </div>

              {contactType === 'company' && (
                <>
                  <div className="mb-6">
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
                      className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                      placeholder="담당자명을 입력하세요"
                    />
                  </div>

                  <div className="mb-6">
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
                      className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                      placeholder="예: 대표, 팀장, 매니저 등"
                    />
                  </div>
                </>
              )}


              <div className="mb-6">
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
                  className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                  placeholder="010-1234-5678"
                />
              </div>
              
              <div className="mb-6">
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
                  className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                  placeholder="email@example.com"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="referralSource" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  유입경로 <span className="text-red-500">*</span>
                </label>
                <select
                  id="referralSource"
                  name="referralSource"
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  required
                  className={`${INPUT_STYLES.oneThird} ${INPUT_STYLES.base} ${INPUT_STYLES.focus} text-sm`}
                >
                  <option value="">선택해주세요</option>
                  {initialValues && <option value="기존업체">기존업체</option>}
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
                <div className="mb-6">
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
                    className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                    placeholder={referralSource === '기타' ? '유입경로를 입력해주세요' : '거래처명을 입력해주세요'}
                  />
                </div>
              )}

              {/* 숨겨진 필드 (서비스 유형 정보 전달용) */}
              <input type="hidden" name="contact_type" value={contactType} />
              <input type="hidden" name="service_mold_request" value={serviceType === 'moldRequest' ? '1' : '0'} />
              <input type="hidden" name="service_delivery_brokerage" value={serviceType === 'deliveryBrokerage' ? '1' : '0'} />
              </div>

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
                    // 화면 상단으로 스크롤
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                  className={BUTTON_STYLES.primary}
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
                  <RadioButton
                    name="drawing_type"
                    value="create"
                    checked={drawingType === 'create'}
                    onChange={(e) => {
                      setDrawingType(e.target.value as 'create');
                      // 초기화
                      setHasPhysicalSample(false);
                      setHasReferencePhotos(false);
                    }}
                    label="샘플 제작이 필요합니다."
                    underlineKey="drawing-type-create"
                  />
                  <RadioButton
                    name="drawing_type"
                    value="have"
                    checked={drawingType === 'have'}
                    onChange={(e) => {
                      setDrawingType(e.target.value as 'have');
                      // 초기화
                      setDrawingModification('');
                    }}
                    label="모두 준비되었으니, 바로 목형 의뢰할께요."
                    underlineKey="drawing-type-have"
                  />
                </div>
              </div>

              {/* 샘플 제작이 필요합니다 선택 시 */}
              <AnimatePresence mode="wait">
                {drawingType === 'create' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -30 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -30 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="pl-4 border-l-2 border-[#ED6C00] dark:border-[#ED6C00] space-y-4 overflow-hidden"
                  >
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                      <span className="text-gray-500 text-xs">(선택사항)</span>
                    </label>
                    <div className="space-y-4">
                      {/* 샘플 제작에 필요한 실물이 있습니다 */}
                      <div className={`overflow-hidden transition-all duration-300 ${
                        hasPhysicalSample 
                          ? 'border border-[#fb923c] dark:border-[#ED6C00]/50 rounded-lg' 
                          : ''
                      }`}>
                        <button
                          type="button"
                          onClick={() => {
                            setHasPhysicalSample(!hasPhysicalSample);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 transition-all duration-300 ${
                            hasPhysicalSample
                              ? 'bg-[#fff7ed] border-b border-[#ED6C00] dark:bg-[#ED6C00]/20 dark:border-[#ED6C00]'
                              : 'bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                              hasPhysicalSample
                                ? 'bg-[#ED6C00] border-[#ED6C00]'
                                : 'border-gray-300 dark:border-gray-500'
                            }`}>
                              {hasPhysicalSample && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">샘플 제작에 필요한 실물이 있습니다.</span>
                          </div>
                          <svg
                            className={`w-5 h-5 text-gray-900 dark:text-gray-100 transition-transform duration-200 ${
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
                          <div className="space-y-4 p-4 bg-[#fff7ed]/50 dark:bg-[#ED6C00]/10 transition-all duration-300">
                            <InfoBox label="샘플 발송 주소">
                              <p className="text-sm font-medium mb-1">서울 중구 퇴계로39길 20, 2층 유진레이저목형 사무실</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">우편번호 : 04557</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">전화: 02-2264-8070</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                명함, 업체를 확인할 수 있는 서류 동봉 부탁드립니다.
                              </p>
                            </InfoBox>
                            
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
                                className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus} resize-none`}
                                placeholder="샘플에 대한 특이사항이나 주의사항을 입력해주세요"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 샘플 제작에 필요한 도면이나 사진이 있습니다 */}
                      <div className={`overflow-hidden transition-all duration-300 ${
                        hasReferencePhotos 
                          ? 'border border-[#fb923c] dark:border-[#ED6C00]/50 rounded-lg' 
                          : ''
                      }`}>
                        <button
                          type="button"
                          onClick={() => {
                            setHasReferencePhotos(!hasReferencePhotos);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 transition-all duration-300 ${
                            hasReferencePhotos
                              ? 'bg-[#fff7ed] border-b border-[#ED6C00] dark:bg-[#ED6C00]/20 dark:border-[#ED6C00]'
                              : 'bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                              hasReferencePhotos
                                ? 'bg-[#ED6C00] border-[#ED6C00]'
                                : 'border-gray-300 dark:border-gray-500'
                            }`}>
                              {hasReferencePhotos && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">샘플 제작에 필요한 도면이나 사진이 있습니다.</span>
                          </div>
                          <svg
                            className={`w-5 h-5 text-gray-900 dark:text-gray-100 transition-transform duration-200 ${
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
                          <div className="space-y-4 p-4 bg-[#fff7ed]/50 dark:bg-[#ED6C00]/10 transition-all duration-300">
                            <FileUpload
                              name="reference_photos"
                              id="reference_photos"
                              multiple
                              accept="image/*,.pdf,.doc,.docx"
                              maxSize={10 * 1024 * 1024}
                              files={referencePhotosFiles}
                              onChange={setReferencePhotosFiles}
                              label="제작에 필요한 내용 자료 업로드"
                              helpText="이미지 파일 또는 문서 파일 업로드 가능 (JPG, PNG, GIF, PDF, DOC, DOCX 등)"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 모두 준비되었으니 바로 목형 의뢰할께요 선택 시 */}
              <AnimatePresence mode="wait">
                {drawingType === 'have' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -30 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -30 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="pl-4 border-l-2 border-[#ED6C00] dark:border-[#ED6C00] space-y-4 overflow-hidden"
                  >
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                      도면 수정 필요 여부 <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      <RadioButton
                        name="drawing_modification"
                        value="needed"
                        checked={drawingModification === 'needed'}
                        onChange={(e) => setDrawingModification(e.target.value as 'needed')}
                        label="도면의 수정이 필요합니다"
                        underlineKey="drawing-modification-needed"
                      />
                      <RadioButton
                        name="drawing_modification"
                        value="not_needed"
                        checked={drawingModification === 'not_needed'}
                        onChange={(e) => setDrawingModification(e.target.value as 'not_needed')}
                        label="도면의 수정이 필요없습니다"
                        underlineKey="drawing-modification-not-needed"
                      />
                    </div>
                  </div>
                  
                  <FileUpload
                    name="drawing_file"
                    id="drawing_file"
                    accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.gif,.zip,.rar"
                    maxSize={10 * 1024 * 1024}
                    required={drawingType === 'have'}
                    files={drawingFile}
                    onChange={setDrawingFile}
                    label="도면 파일 업로드"
                  />
                  </motion.div>
                )}
              </AnimatePresence>

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
                    className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                    placeholder="예: 직사각형, 정사각형, 원형 등"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    장폭고 <span className="text-gray-500 text-xs">(선택사항)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
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
                        className={`${INPUT_STYLES.full} px-3 py-2 ${INPUT_STYLES.base.replace('px-4', '')} ${INPUT_STYLES.focus}`}
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
                        className={`${INPUT_STYLES.full} px-3 py-2 ${INPUT_STYLES.base.replace('px-4', '')} ${INPUT_STYLES.focus}`}
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
                        className={`${INPUT_STYLES.full} px-3 py-2 ${INPUT_STYLES.base.replace('px-4', '')} ${INPUT_STYLES.focus}`}
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
                    className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
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
                  className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus} resize-none`}
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
                  className={BUTTON_STYLES.secondary}
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
                      if (drawingFile.length === 0) {
                        alert('도면 파일을 업로드해주세요.');
                        return;
                      }
                      // 모두 준비되었으니 바로 목형 의뢰할께요 선택 시 납품업체 단계로 이동
                      setCurrentStep(3);
                    } else {
                      // 샘플 제작이 필요한 경우 일정 조율 단계로 이동
                      setCurrentStep(3);
                    }
                    // 화면 상단으로 스크롤
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                  className={BUTTON_STYLES.primary}
                >
                  다음 단계
                </button>
              </div>
          </div>

          {/* 세 번째 섹션: 일정 조율 또는 납품업체 */}
          <div style={{ display: currentStep === 3 ? 'block' : 'none' }} className="space-y-6">
              {drawingType === 'have' ? (
                <>
                  <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">납품업체</h2>
                  
                  {/* 납품 방법 선택 (라디오) */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                      납품 방법 <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      <RadioButton
                        name="delivery_method"
                        value="company_address"
                        checked={deliveryMethod === 'company_address'}
                        onChange={(e) => {
                          setDeliveryMethod(e.target.value as 'company_address' | 'delivery_company');
                          setSelectedDeliveryCompanyId('');
                          setNewDeliveryCompany({ name: '', phone: '', address: '' });
                        }}
                        label="회사주소로 납품받겠습니다."
                        underlineKey="delivery-method-company"
                      />
                      <RadioButton
                        name="delivery_method"
                        value="delivery_company"
                        checked={deliveryMethod === 'delivery_company'}
                        onChange={(e) => {
                          setDeliveryMethod(e.target.value as 'company_address' | 'delivery_company');
                        }}
                        label="납품받을 업체가 있습니다."
                        underlineKey="delivery-method-company-select"
                      />
                    </div>
                  </div>

                  {/* 회사주소 선택 시 */}
                  {deliveryMethod === 'company_address' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        납품 주소
                      </label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        업체 등록했던 사업장 주소로 보내드리겠습니다!
                      </p>
                      {isLoadingAddress ? (
                        <InfoBox>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            업체정보에 등록된 주소를 불러오는 중...
                          </p>
                        </InfoBox>
                      ) : addressError === 'not_logged_in' ? (
                        <InfoBox>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            현재 로그인을 하지않아서 업체주소가 없습니다.
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            업체등록을 먼저 해주시면 편하게 사용가능하십니다!
                          </p>
                        </InfoBox>
                      ) : companyAddress ? (
                        <InfoBox>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {companyAddress}
                          </p>
                        </InfoBox>
                      ) : (
                        <InfoBox>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            업체정보에 등록된 주소를 불러올 수 없습니다.
                          </p>
                        </InfoBox>
                      )}
                    </div>
                  )}

                  {/* 납품업체 선택 시 */}
                  {deliveryMethod === 'delivery_company' && (
                    <div className="space-y-6">
                      {/* 저장된 납품처 드롭다운 - 로그인한 업체만 표시 */}
                      {isCompanyLoggedIn === true && (
                        <div className="mb-6">
                          <label htmlFor="saved_delivery_company" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            저장된 납품처
                          </label>
                          <select
                            id="saved_delivery_company"
                            value={selectedDeliveryCompanyId}
                            onChange={(e) => {
                              const id = e.target.value ? Number(e.target.value) : '';
                              setSelectedDeliveryCompanyId(id);
                              if (id) {
                                const company = savedDeliveryCompanies.find(c => c.id === id);
                                if (company) {
                                  setNewDeliveryCompany({
                                    name: company.name,
                                    phone: company.phone,
                                    address: company.address,
                                  });
                                }
                              } else {
                                setNewDeliveryCompany({ name: '', phone: '', address: '' });
                              }
                            }}
                            className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus} text-sm appearance-none pr-10 bg-no-repeat bg-[length:12px_12px] bg-[right_0.75rem_center] dark:bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23d1d5db' d='M6 9L1 4h10z'/%3E%3C/svg%3E")] bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")]`}
                          >
                            <option value="">{savedDeliveryCompanies.length === 0 ? '아직 저장한 업체가 없습니다.' : '납품처를 선택하세요'}</option>
                            {savedDeliveryCompanies.map((company) => (
                              <option key={company.id} value={company.id}>
                                {company.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* 로그인하지 않은 경우 안내 메시지 */}
                      {isCompanyLoggedIn === false && (
                        <div className="my-6">
                          <InfoBox>
                            <p className="text-xs text-gray-900 dark:text-gray-100">
                              <Link href="/register" className="underline !text-[#ED6C00] dark:!text-[#ff8533] hover:!text-[#d15f00] dark:hover:!text-[#ff8533] transition-colors font-medium">
                                업체 등록
                              </Link>
                              을 하면 납품처를 저장하여 쉽게 작성하실수있습니다.
                            </p>
                          </InfoBox>
                        </div>
                      )}

                      {/* 납품업체 입력 폼 */}
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="delivery_company_name" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            납품업체명 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="delivery_company_name"
                            value={newDeliveryCompany.name}
                            onChange={(e) => setNewDeliveryCompany(prev => ({ ...prev, name: e.target.value }))}
                            className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                            placeholder="납품업체명을 입력해주세요"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="delivery_company_phone" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            연락처 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            id="delivery_company_phone"
                            value={newDeliveryCompany.phone}
                            onChange={(e) => setNewDeliveryCompany(prev => ({ ...prev, phone: e.target.value }))}
                            className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                            placeholder="010-1234-5678"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="delivery_company_address" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            주소 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="delivery_company_address"
                            value={newDeliveryCompany.address}
                            onChange={(e) => setNewDeliveryCompany(prev => ({ ...prev, address: e.target.value }))}
                            className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
                            placeholder="주소를 입력해주세요"
                            required
                          />
                        </div>

                        {/* 거래처 저장 버튼 - 로그인한 업체만 표시 */}
                        {isCompanyLoggedIn === true && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={async () => {
                                if (!newDeliveryCompany.name.trim() || !newDeliveryCompany.phone.trim() || !newDeliveryCompany.address.trim()) {
                                  alert('납품업체명, 연락처, 주소를 모두 입력해주세요.');
                                  return;
                                }
                                
                                setIsSavingCompany(true);
                                try {
                                  const response = await fetch('/api/company/delivery-companies', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(newDeliveryCompany),
                                  });
                                  
                                  const result = await response.json();
                                  
                                  if (result.success) {
                                    setSavedDeliveryCompanies(prev => [result.deliveryCompany, ...prev]);
                                    setSelectedDeliveryCompanyId(result.deliveryCompany.id);
                                    // 폼 데이터 유지 (초기화하지 않음)
                                    alert('거래처가 저장되었습니다.');
                                  } else {
                                    alert(result.error || '거래처 저장에 실패했습니다.');
                                  }
                                } catch (error) {
                                  console.error('Error saving company:', error);
                                  alert('거래처 저장 중 오류가 발생했습니다.');
                                } finally {
                                  setIsSavingCompany(false);
                                }
                              }}
                              disabled={isSavingCompany}
                              className={`${BUTTON_STYLES.secondary} ${isSavingCompany ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {isSavingCompany ? '저장 중...' : '거래처 저장'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 네비게이션 버튼 */}
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className={BUTTON_STYLES.secondary}
                    >
                      이전
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (deliveryMethod === 'delivery_company') {
                          if (!newDeliveryCompany.name?.trim() || !newDeliveryCompany.phone?.trim() || !newDeliveryCompany.address?.trim()) {
                            alert('납품업체명, 연락처, 주소를 모두 입력해주세요.');
                            return;
                          }
                        }
                        setCurrentStep(4);
                        // 화면 상단으로 스크롤
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                      }}
                      className={BUTTON_STYLES.primary}
                    >
                      다음 단계
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">일정 조율</h2>
              
              {/* 샘플 완료후 수령방법 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  샘플 완료후 수령방법 선택 <span className="text-red-500">*</span>
                </label>
                
                {/* 안내사항 */}
                <InfoBox label="안내사항" className="mb-4" labelInside={true}>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-900 dark:text-gray-100">• 샘플제작은 대략 1~2일 정도 소요되며, 고객사에 따라 도면의 유무, 당사 일정관계상 더 소요될수있습니다.</p>
                    <p className="text-xs text-gray-900 dark:text-gray-100">• 즉시 수정 피드백을 원하시면 방문수령을, 그렇지않으시면 택배 및 퀵으로 수령하시면 원할한 진행이 되십니다.</p>
                  </div>
                </InfoBox>

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
                        className={`w-5 h-5 text-gray-900 dark:text-gray-100 transition-transform duration-200 ${
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
                        <InfoBox label="회사위치">
                          <p className="text-sm font-medium mb-1">서울 중구 퇴계로39길 20, 2층 유진레이져목형 사무실</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">(평일 9:00 ~ 19:00 주말 및 공휴일 휴무)</p>
                        </InfoBox>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 날짜 선택 - 왼쪽 */}
                          <div>
                            <label htmlFor="visit_date" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                              날짜 선택 <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              id="visit_date"
                              name="visit_date"
                              value={visitDate}
                              className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus} date-input-white`}
                              style={{
                                colorScheme: 'dark',
                              }}
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
                                const startDate = new Date(today);
                                startDate.setDate(startDate.getDate() + 2);
                                while (startDate.getDay() === 0 || startDate.getDay() === 6) {
                                  startDate.setDate(startDate.getDate() + 1);
                                }
                                
                                // 평일 7일 범위 계산 (주말 제외)
                                const endDate = new Date(startDate);
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
                              min={getMinVisitDate()}
                              max={(() => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                
                                // 현재 날짜 + 2일 이후의 첫 번째 평일 찾기
                                const startDate = new Date(today);
                                startDate.setDate(startDate.getDate() + 2);
                                while (startDate.getDay() === 0 || startDate.getDay() === 6) {
                                  startDate.setDate(startDate.getDate() + 1);
                                }
                                
                                // 평일 7일 범위 계산 (주말 제외)
                                const endDate = new Date(startDate);
                                let weekdaysCount = 0;
                                while (weekdaysCount < 6) { // 7일이므로 6일 더 추가
                                  endDate.setDate(endDate.getDate() + 1);
                                  if (endDate.getDay() !== 0 && endDate.getDay() !== 6) {
                                    weekdaysCount++;
                                  }
                                }
                                
                                return endDate.toISOString().split('T')[0];
                              })()}
                              className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
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
                        className={`w-5 h-5 text-gray-900 dark:text-gray-100 transition-transform duration-200 ${
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
                            <RadioButton
                              name="delivery_type"
                              value="parcel"
                              checked={deliveryType === 'parcel'}
                              onChange={(e) => setDeliveryType(e.target.value as 'parcel' | 'quick')}
                              label="택배"
                              underlineKey="delivery-type-parcel"
                            />
                            <RadioButton
                              name="delivery_type"
                              value="quick"
                              checked={deliveryType === 'quick'}
                              onChange={(e) => setDeliveryType(e.target.value as 'parcel' | 'quick')}
                              label="퀵"
                              underlineKey="delivery-type-quick"
                            />
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
                            className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
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
                            className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
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
                            className={`${INPUT_STYLES.twoThirds} ${INPUT_STYLES.base} ${INPUT_STYLES.focus}`}
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
                  className={BUTTON_STYLES.secondary}
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (drawingType === 'have') {
                      // 납품업체 검증
                      if (deliveryMethod === 'delivery_company') {
                        if (!newDeliveryCompany.name?.trim() || !newDeliveryCompany.phone?.trim() || !newDeliveryCompany.address?.trim()) {
                          alert('납품업체명, 연락처, 주소를 모두 입력해주세요.');
                          return;
                        }
                      }
                      // deliveryMethod === 'company_address'인 경우는 검증 불필요
                    } else {
                      // 일정 조율 검증
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
                    }
                    setCurrentStep(4);
                    // 화면 상단으로 스크롤
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                  className={BUTTON_STYLES.primary}
                >
                  다음 단계
                </button>
              </div>
                </>
              )}
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
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">패키지명:</span>
                    <span className="ml-2">{inquiryTitle || '-'}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">문의 유형:</span>
                      <span className="ml-2">{contactType === 'company' ? '업체' : '개인'}</span>
                    </div>
                    {contactType === 'individual' && (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">서비스 유형:</span>
                        <span className="ml-2">
                          {serviceType === 'moldRequest' 
                            ? '목형 만 제작 의뢰합니다.'
                            : serviceType === 'deliveryBrokerage'
                            ? '목형제작 및 납품까지 중개 를 원합니다.'
                            : '없음'}
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

              {/* Step 3: 일정 조율 또는 납품업체 */}
              {drawingType === 'have' ? (
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">3. 납품업체</h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium underline"
                    >
                      수정
                    </button>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {deliveryMethod === 'company_address' ? (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">납품 방법:</span>
                        <span className="ml-2">회사주소로 납품</span>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">납품업체명:</span>
                          <span className="ml-2">{newDeliveryCompany.name || '-'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">연락처:</span>
                          <span className="ml-2">{newDeliveryCompany.phone || '-'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">주소:</span>
                          <span className="ml-2">{newDeliveryCompany.address || '-'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
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
              )}

              {/* 네비게이션 버튼 */}
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => {
                    // 모두 준비되었을 경우 Step 2로, 아니면 Step 3으로 이동
                    if (drawingType === 'have') {
                      setCurrentStep(2);
                    } else {
                      setCurrentStep(3);
                    }
                  }}
                  className={BUTTON_STYLES.secondary}
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
                      errorMessage = '필요한 사항을 선택해주세요.';
                      errorStep = 2;
                    } else if (drawingType === 'have' && !drawingModification) {
                      errorMessage = '도면 수정 필요 여부를 선택해주세요.';
                      errorStep = 2;
                    } else if (drawingType === 'have') {
                      if (drawingFile.length === 0) {
                        errorMessage = '도면 파일을 업로드해주세요.';
                        firstErrorField = null;
                        errorStep = 2;
                      }
                    } else if (drawingType === 'have' && deliveryMethod === 'delivery_company') {
                      // Step 3: 납품업체 검증
                      if (!newDeliveryCompany.name?.trim() || !newDeliveryCompany.phone?.trim() || !newDeliveryCompany.address?.trim()) {
                        errorMessage = '납품업체명, 연락처, 주소를 모두 입력해주세요.';
                        errorStep = 3;
                      }
                    } else if (drawingType !== 'have' && !receiptMethod) {
                      // Step 3: 일정 조율 검증 (모두 준비되었을 경우 제외)
                      errorMessage = '수령방법을 선택해주세요.';
                      errorStep = 3;
                    } else if (drawingType !== 'have' && receiptMethod === 'visit') {
                      if (!visitDate) {
                        errorMessage = '방문 날짜를 선택해주세요.';
                        errorStep = 3;
                      } else if (!visitTimeSlot) {
                        errorMessage = '방문 시간을 선택해주세요.';
                        errorStep = 3;
                      }
                    } else if (drawingType !== 'have' && receiptMethod === 'delivery') {
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
                          // 직접 단계별 헤더 찾기
                          const headings = document.querySelectorAll('h2');
                          let targetHeading: Element | null = null;
                          if (errorStep === 1) {
                            targetHeading = Array.from(headings).find(h => h.textContent?.includes('연락처 정보')) || null;
                          } else if (errorStep === 2) {
                            targetHeading = Array.from(headings).find(h => h.textContent?.includes('도면 및 샘플')) || null;
                          } else if (errorStep === 3) {
                            targetHeading = Array.from(headings).find(h => h.textContent?.includes('일정 조율') || h.textContent?.includes('납품업체')) || null;
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
                      formData.append('inquiry_title', inquiryTitle);
                      formData.append('contact_type', contactType);
                      formData.append('service_mold_request', serviceType === 'moldRequest' ? '1' : '0');
                      formData.append('service_delivery_brokerage', serviceType === 'deliveryBrokerage' ? '1' : '0');
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
                      
                      // Step 3: 일정 조율 또는 납품업체
                      if (drawingType === 'have') {
                        formData.append('delivery_method', deliveryMethod);
                        if (deliveryMethod === 'company_address') {
                          formData.append('delivery_company_address', 'company_address');
                        } else {
                          formData.append('delivery_company_name', newDeliveryCompany.name || '');
                          formData.append('delivery_company_phone', newDeliveryCompany.phone || '');
                          formData.append('delivery_company_address', newDeliveryCompany.address || '');
                        }
                      } else {
                        formData.append('receipt_method', receiptMethod || '');
                        formData.append('visit_location', visitLocation || '');
                        formData.append('visit_date', visitDate || '');
                        formData.append('visit_time_slot', visitTimeSlot || '');
                        formData.append('delivery_address', deliveryAddress || '');
                        formData.append('delivery_name', deliveryName || '');
                        formData.append('delivery_phone', deliveryPhone || '');
                        formData.append('delivery_type', deliveryType || '');
                      }
                      
                      // 파일 업로드 필드 (form에서 가져오기)
                      const attachmentInput = form.querySelector('input[name="attachment"]') as HTMLInputElement;
                      
                      if (attachmentInput?.files?.[0]) {
                        formData.append('attachment', attachmentInput.files[0]);
                      }
                      // FileUpload 컴포넌트에서 관리하는 파일들 추가
                      if (drawingFile.length > 0) {
                        formData.append('drawing_file', drawingFile[0]);
                      }
                      referencePhotosFiles.forEach(file => {
                        formData.append('reference_photos', file);
                      });
                      
                      // submitContact 호출
                      const result = await submitContact(formData);
                      
                      if (result && result.success) {
                        // 성공 모달 표시
                        setShowSuccessModal(true);
                      } else {
                        // 실패 시 에러 모달 표시
                        setErrorMessage(result?.error || '문의 제출에 실패했습니다. 다시 시도해주세요.');
                        setShowErrorModal(true);
                        setIsSubmitting(false);
                      }
                    } catch (error) {
                      // Next.js redirect 에러는 무시 (정상적인 리다이렉트)
                      if (error instanceof Error && (error.message === 'NEXT_REDIRECT' || (error as { digest?: string }).digest?.startsWith('NEXT_REDIRECT'))) {
                        // 리다이렉트는 정상 동작이므로 에러로 처리하지 않음
                        return;
                      }
                      console.error('[CONTACT FORM] Form submission error:', error);
                      setErrorMessage(`폼 제출 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
                      setShowErrorModal(true);
                      setIsSubmitting(false);
                    }
                  }}
                  className={BUTTON_STYLES.primary}
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

      {/* 에러 모달 */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
        }}
        title="문의 제출 실패"
        message={errorMessage}
      />
    </div>
  );
}

