'use client';

import { useEffect, useState } from 'react';
import { ConfirmButton } from './[id]/confirm-button';
import { DeleteButton } from './delete-button';
import { UpdateStatusButton } from './[id]/update-status-button';
import { DownloadButton } from '@/components/DownloadButton';

interface Contact {
  id: number;
  company_name: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  contact_type?: string | null;
  service_mold_request?: boolean | null;
  service_delivery_brokerage?: boolean | null;
  drawing_type: string | null;
  has_physical_sample: boolean | null;
  has_reference_photos: boolean | null;
  drawing_modification: string | null;
  box_shape: string | null;
  length: string | null;
  width: string | null;
  height: string | null;
  material: string | null;
  drawing_notes: string | null;
  sample_notes: string | null;
  receipt_method: string | null;
  visit_date: string | null;
  visit_time_slot: string | null;
  delivery_type: string | null;
  delivery_address: string | null;
  delivery_name: string | null;
  delivery_phone: string | null;
  attachment_filename: string | null;
  attachment_url: string | null;
  drawing_file_url: string | null;
  drawing_file_name: string | null;
  reference_photos_urls: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ContactDetailModalProps {
  contactId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function ContactDetailModal({ contactId, isOpen, onClose }: ContactDetailModalProps) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContactDetail = async () => {
    if (!contactId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/contacts/${contactId}`);
      if (!response.ok) {
        throw new Error('문의 정보를 불러올 수 없습니다.');
      }
      const data = await response.json();
      setContact(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '문의 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && contactId) {
      fetchContactDetail();
    } else {
      setContact(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, contactId]);

  useEffect(() => {
    if (isOpen) {
      // 스크롤바 너비 계산
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // body에 padding-right를 추가하여 스크롤바 공간 확보
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
    } else {
      // 원래대로 복원
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // handleUpdate는 필요시 사용
  // const handleUpdate = () => {
  //   fetchContactDetail();
  //   onUpdate?.();
  // };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4 overflow-y-auto modal-scrollbar-hide"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-scrollbar-hide animate-scaleIn my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">문의 상세보기</h2>
          <div className="flex gap-2 items-center">
            {contact && (
              <>
                <UpdateStatusButton contactId={contact.id} currentStatus={contact.status} />
                <DeleteButton 
                  contactId={contact.id} 
                  contactName={contact.company_name || contact.name || `문의 #${contact.id}`}
                />
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 내용 */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 dark:text-red-400">{error}</div>
              <button
                onClick={fetchContactDetail}
                className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
              >
                다시 시도
              </button>
            </div>
          )}

          {contact && !loading && (
            <div className="space-y-6">
              {/* 연락처 정보 */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                  연락처 정보
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">문의 유형</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {contact.contact_type === 'individual' ? '개인' : '업체'}
                    </p>
                  </div>
                  {contact.contact_type === 'individual' && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">서비스 유형</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {contact.service_mold_request && (
                          <span className="px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            목형 제작 의뢰
                          </span>
                        )}
                        {contact.service_delivery_brokerage && (
                          <span className="px-2 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                            납품까지 중개
                          </span>
                        )}
                        {!contact.service_mold_request && !contact.service_delivery_brokerage && (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {contact.contact_type === 'individual' ? '이름' : '업체명'}
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{contact.company_name}</p>
                    </div>
                    {contact.contact_type === 'company' && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">담당자명</label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{contact.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">직책</label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{contact.position}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">연락처</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        <a href={`tel:${contact.phone}`} className="text-orange-600 hover:underline">
                          {contact.phone}
                        </a>
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">이메일</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        <a href={`mailto:${contact.email}`} className="text-orange-600 hover:underline">
                          {contact.email}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 도면 및 샘플 정보 */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                  도면 및 샘플 정보
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">도면 상태</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {contact.drawing_type === 'create' 
                        ? '도면 제작이 필요합니다' 
                        : contact.drawing_type === 'have' 
                        ? '도면을 가지고 있습니다' 
                        : '-'}
                    </p>
                  </div>

                  {contact.drawing_type === 'create' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">실물 샘플</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                          {contact.has_physical_sample ? '있음' : '없음'}
                        </p>
                      </div>
                      {contact.has_physical_sample && contact.sample_notes && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">샘플 특이사항</label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap bg-white dark:bg-gray-800 p-3 rounded">
                            {contact.sample_notes}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">제작 자료</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                          {contact.has_reference_photos ? '있음' : '없음'}
                        </p>
                      </div>
                    </>
                  )}

                  {contact.drawing_type === 'have' && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">도면 수정</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {contact.drawing_modification === 'needed'
                          ? '도면의 수정이 필요합니다'
                          : contact.drawing_modification === 'not_needed'
                          ? '도면의 수정이 필요없습니다'
                          : '-'}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">박스 형태</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{contact.box_shape || '-'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">크기 (장×폭×고)</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {contact.length || '-'} mm × {contact.width || '-'} mm × {contact.height || '-'} mm
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">재질</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{contact.material || '-'}</p>
                  </div>

                  {contact.drawing_notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">도면 및 샘플 제작 시 유의사항</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap bg-white dark:bg-gray-800 p-3 rounded">
                        {contact.drawing_notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 일정 조율 정보 */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                  일정 조율 정보
                </h3>
                <div className="space-y-3">
                  {contact.receipt_method ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">수령 방법</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                          {contact.receipt_method === 'visit' 
                            ? '방문 수령' 
                            : contact.receipt_method === 'delivery' 
                            ? '택배 및 퀵으로 수령' 
                            : contact.receipt_method || '-'}
                        </p>
                      </div>

                      {contact.receipt_method === 'visit' && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">방문 날짜</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{contact.visit_date || '-'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">방문 시간</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{contact.visit_time_slot || '-'}</p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <strong>회사위치:</strong> 서울 중구 퇴계로39길 20, 2층 유진레이져목형 사무실
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              (평일 9:00 ~ 19:00 주말 및 공휴일 휴무)
                            </p>
                          </div>
                        </>
                      )}

                      {contact.receipt_method === 'delivery' && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">배송 방법</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                              {contact.delivery_type === 'parcel' ? '택배' : contact.delivery_type === 'quick' ? '퀵' : '-'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">배송 주소</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{contact.delivery_address || '-'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">수령인</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{contact.delivery_name || '-'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">수령인 연락처</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                              {contact.delivery_phone ? (
                                <a href={`tel:${contact.delivery_phone}`} className="text-orange-600 hover:underline">
                                  {contact.delivery_phone}
                                </a>
                              ) : '-'}
                            </p>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">입력된 정보가 없습니다.</p>
                  )}
                </div>
              </div>

              {/* 첨부 파일 */}
              {(contact.attachment_url || contact.attachment_filename || 
                contact.drawing_file_url || contact.drawing_file_name || 
                contact.reference_photos_urls) && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                    첨부 파일
                  </h3>
                  <div className="space-y-3">
                    {(contact.attachment_filename || contact.attachment_url) && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">첨부 파일</label>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-900 dark:text-gray-100 flex-1 truncate mr-2">
                            {contact.attachment_filename || '파일명 없음'}
                          </p>
                          {contact.attachment_url && (
                            <a
                              href={contact.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={contact.attachment_filename || undefined}
                              className="bg-[#ED6C00] hover:bg-[#ED6C00]/90 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors duration-200 whitespace-nowrap"
                            >
                              다운로드
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {(contact.drawing_file_name || contact.drawing_file_url) && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">도면 파일</label>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-900 dark:text-gray-100 flex-1 truncate mr-2">
                            {contact.drawing_file_name || '파일명 없음'}
                          </p>
                          {contact.drawing_file_url && (
                            <DownloadButton
                              url={contact.drawing_file_url}
                              fileName={contact.drawing_file_name}
                            />
                          )}
                        </div>
                      </div>
                    )}
                    
                    {contact.reference_photos_urls && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-3">참고 사진</label>
                        <div className="space-y-2">
                          {(() => {
                            try {
                              const urls = JSON.parse(contact.reference_photos_urls) as string[];
                              if (urls.length === 0) return null;
                              return urls.map((url, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
                                  <span className="text-sm text-gray-900 dark:text-gray-100">사진 {idx + 1}</span>
                                  <DownloadButton
                                    url={url}
                                    fileName={`reference-photo-${idx + 1}.jpg`}
                                  />
                                </div>
                              ));
                            } catch {
                              return <p className="text-sm text-gray-500 dark:text-gray-400">파일 정보를 불러올 수 없습니다.</p>;
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 상태 정보 */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                  상태 정보
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">상태</label>
                    <p className="mt-1">
                      <span
                        className={`px-3 py-1 text-sm rounded ${
                          contact.status === 'new'
                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            : contact.status === 'read'
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                            : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        }`}
                      >
                        {contact.status === 'new' ? '신규' : contact.status === 'read' ? '읽음' : '완료'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">등록일</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(contact.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">수정일</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(contact.updated_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <ConfirmButton contactId={contact.id} currentStatus={contact.status} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

