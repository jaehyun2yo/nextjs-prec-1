'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaChevronDown } from 'react-icons/fa';
import { DeleteButton } from './delete-button';
import { QuickProcessStageSelect } from './quick-process-stage-select';
import { ProcessStageIndicatorToggle } from '@/components/ProcessStageIndicatorToggle';
import { UpdateStatusButton } from './[id]/update-status-button';
import { ConfirmButton } from './[id]/confirm-button';
import type { ProcessStage } from '@/lib/utils/processStages';

interface Contact {
  id: number;
  company_name: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  contact_type: string | null;
  service_mold_request: boolean | null;
  service_delivery_brokerage: boolean | null;
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
  inquiry_number: string | null;
  status: string;
  process_stage: ProcessStage;
  created_at: string;
  updated_at?: string;
}

interface ContactsListProps {
  contacts: Contact[];
  statusFilter: string;
  totalCount: number;
  itemsPerPage: number;
  currentPage: number;
  searchQuery?: string;
  showFiltersOnly?: boolean;
}

export function ContactsList({ contacts, statusFilter, totalCount, itemsPerPage, currentPage, searchQuery = '', showFiltersOnly = false }: ContactsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [expandedContacts, setExpandedContacts] = useState<Set<number>>(new Set());

  // 실시간 검색 디바운스 (500ms)
  useEffect(() => {
    // 초기 마운트 시에는 실행하지 않음
    if (searchInput === searchQuery) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput.trim()) {
        params.set('search', searchInput.trim());
      } else {
        params.delete('search');
      }
      params.delete('page'); // 검색 시 첫 페이지로
      router.push(`/admin/contacts?${params.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, router, searchParams, searchQuery]);
  
  // 클라이언트 사이드 필터링
  const filteredContacts = statusFilter === 'all' 
    ? contacts 
    : contacts.filter(contact => contact.status === statusFilter);

  const offset = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = filteredContacts.slice(offset, offset + itemsPerPage);
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  const handleFilterChange = (newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('status', newStatus);
    params.delete('page'); // 필터 변경 시 첫 페이지로
    router.push(`/admin/contacts?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/admin/contacts?${params.toString()}`, { scroll: false });
  };

  const handleSearchClear = () => {
    setSearchInput('');
  };

  const handleStartWork = async (contactId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    
    try {
      const response = await fetch(`/api/contacts/${contactId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'read' }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('작업 시작에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error starting work:', error);
      alert('작업 시작 중 오류가 발생했습니다.');
    }
  };

  const toggleContact = async (contactId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    // 토글 상태 변경
    setExpandedContacts(prev => {
      const newSet = new Set(prev);
      const wasExpanded = newSet.has(contactId);
      
      if (wasExpanded) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
        
        // 신규 상태에서 토글을 열면 읽음으로 변경
        const contact = contacts.find(c => c.id === contactId);
        if (contact && contact.status === 'new') {
          // 비동기로 상태 업데이트 (UI 블로킹 방지)
          fetch(`/api/contacts/${contactId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'read' }),
          }).then(() => {
            router.refresh();
          }).catch(error => {
            console.error('Error updating status to read:', error);
          });
        }
      }
      
      return newSet;
    });
  };

  const filterButtons = (
    <div className="flex flex-wrap items-center gap-2">
      {/* 필터 버튼 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors text-xs ${
            statusFilter === 'all'
              ? 'bg-orange-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          전체 ({totalCount})
        </button>
        <button
          onClick={() => handleFilterChange('new')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors text-xs ${
            statusFilter === 'new'
              ? 'bg-orange-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          신규 ({contacts.filter(c => c.status === 'new').length})
        </button>
        <button
          onClick={() => handleFilterChange('read')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors text-xs ${
            statusFilter === 'read'
              ? 'bg-orange-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          읽음 ({contacts.filter(c => c.status === 'read').length})
        </button>
        <button
          onClick={() => handleFilterChange('in_progress')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors text-xs ${
            statusFilter === 'in_progress'
              ? 'bg-orange-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          작업중 ({contacts.filter(c => c.status === 'in_progress').length})
        </button>
        <button
          onClick={() => handleFilterChange('revision_in_progress')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors text-xs ${
            statusFilter === 'revision_in_progress'
              ? 'bg-orange-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          수정작업중 ({contacts.filter(c => c.status === 'revision_in_progress').length})
        </button>
        <button
          onClick={() => handleFilterChange('completed')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors text-xs ${
            statusFilter === 'completed'
              ? 'bg-orange-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          납품완료 ({contacts.filter(c => c.status === 'completed').length})
        </button>
        <button
          onClick={() => handleFilterChange('on_hold')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors text-xs ${
            statusFilter === 'on_hold'
              ? 'bg-orange-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          보류 ({contacts.filter(c => c.status === 'on_hold').length})
        </button>
      </div>
      {/* 문의번호 검색 */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="문의번호 검색 (예: 251107-1)"
          className="px-2.5 sm:px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 w-40 sm:w-48"
        />
        {searchInput && (
          <button
            type="button"
            onClick={handleSearchClear}
            className="px-2.5 sm:px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );

  if (showFiltersOnly) {
    return filterButtons;
  }

  return (
    <>
      {/* 문의 목록 - 카드 뷰 (모든 화면 크기) */}
      <div className="space-y-4">
        {paginatedContacts.length > 0 ? (
          paginatedContacts.map((contact, index) => {
            const isExpanded = expandedContacts.has(contact.id);
            
            return (
              <div
                key={contact.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
              >
                {/* 요약본 (항상 표시) - 카드 클릭 시 토글 */}
                <div 
                  className="p-4 md:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => toggleContact(contact.id)}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* 상태 배지 (문의명 왼쪽) */}
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs rounded font-medium flex-shrink-0 ${
                          contact.status === 'new'
                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            : contact.status === 'read'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : contact.status === 'in_progress'
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                            : contact.status === 'revision_in_progress'
                            ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                            : contact.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : contact.status === 'on_hold'
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {contact.status === 'new' ? '신규' 
                          : contact.status === 'read' ? '읽음'
                          : contact.status === 'in_progress' ? '작업중'
                          : contact.status === 'revision_in_progress' ? '수정작업중'
                          : contact.status === 'completed' ? '납품완료'
                          : contact.status === 'on_hold' ? '보류'
                          : contact.status}
                      </span>
                      {/* 문의명 */}
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {contact.company_name || '문의명 없음'}
                      </h3>
                      {/* 문의번호 */}
                      {contact.inquiry_number && (
                        <div className="text-sm font-medium text-orange-600 dark:text-orange-400 flex-shrink-0">
                          {contact.inquiry_number}
                        </div>
                      )}
                    </div>
                    {/* 토글 아이콘 */}
                    <div className={`p-1.5 md:p-2 rounded transition-all duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                      <FaChevronDown className="text-sm text-gray-500 dark:text-gray-400 transition-transform duration-300" />
                    </div>
                  </div>
                  
                  {/* 구분선 */}
                  {!isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                  )}

                  {/* 작업현황 (공정 단계) - 구분선 밑에 위치 */}
                  {!isExpanded && (contact.status === 'read' || contact.status === 'in_progress' || contact.status === 'revision_in_progress' || contact.status === 'replied' || contact.status === 'completed') && (
                    <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">작업현황</label>
                      <QuickProcessStageSelect 
                        contactId={contact.id} 
                        currentStage={contact.process_stage} 
                        status={contact.status} 
                      />
                    </div>
                  )}
                  
                  {/* 요약 정보 (접혀있을 때만 표시) */}
                  {!isExpanded && (
                    <div className="space-y-3">
                      {/* 담당자, 연락처, 이메일 */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">담당자</span>
                          <p className="text-gray-900 dark:text-gray-100 mt-0.5">
                            {contact.name} {contact.position ? `(${contact.position})` : ''}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">연락처</span>
                          <p className="text-gray-900 dark:text-gray-100 mt-0.5">
                            <a href={`tel:${contact.phone}`} className="text-orange-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                              {contact.phone}
                            </a>
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">이메일</span>
                          <p className="text-gray-900 dark:text-gray-100 mt-0.5 truncate">
                            <a href={`mailto:${contact.email}`} className="text-orange-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                              {contact.email}
                            </a>
                          </p>
                        </div>
                      </div>

                      {/* 도면 및 샘플 정보 */}
                      {contact.drawing_type && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">도면/샘플:</span>
                          {contact.drawing_type === 'create' ? (
                            <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded font-medium">
                              제작 필요
                            </span>
                          ) : contact.drawing_type === 'have' ? (
                            <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded font-medium">
                              보유
                            </span>
                          ) : null}
                          {contact.material && (
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              재질: {contact.material}
                            </span>
                          )}
                          {contact.length && contact.width && contact.height && (
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              크기: {contact.length}×{contact.width}×{contact.height}mm
                            </span>
                          )}
                        </div>
                      )}

                      {/* 일정 조율 정보 */}
                      {contact.receipt_method && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">수령방법:</span>
                          {contact.receipt_method === 'visit' ? (
                            <>
                              <span className="inline-block px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded font-medium">
                                방문
                              </span>
                              {contact.visit_date && (
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {contact.visit_date} {contact.visit_time_slot || ''}
                                </span>
                              )}
                            </>
                          ) : contact.receipt_method === 'delivery' ? (
                            <>
                              <span className="inline-block px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded font-medium">
                                {contact.delivery_type === 'parcel' ? '택배' : contact.delivery_type === 'quick' ? '퀵' : '배송'}
                              </span>
                              {contact.delivery_address && (
                                <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-xs">
                                  {contact.delivery_address}
                                </span>
                              )}
                            </>
                          ) : null}
                        </div>
                      )}

                      {/* 파일 다운로드 항목 */}
                      {(contact.attachment_url || contact.attachment_filename || 
                        contact.drawing_file_url || contact.drawing_file_name || 
                        contact.reference_photos_urls) && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">첨부파일:</span>
                          {contact.attachment_filename && (
                            <a
                              href={contact.attachment_url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={contact.attachment_filename || undefined}
                              className="text-xs text-orange-600 hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              📎 {contact.attachment_filename}
                            </a>
                          )}
                          {contact.drawing_file_name && (
                            <a
                              href={contact.drawing_file_url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={contact.drawing_file_name || undefined}
                              className="text-xs text-orange-600 hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              📐 {contact.drawing_file_name}
                            </a>
                          )}
                          {contact.reference_photos_urls && (
                            (() => {
                              try {
                                const urls = JSON.parse(contact.reference_photos_urls) as string[];
                                if (urls.length > 0) {
                                  return (
                                    <span className="text-xs text-orange-600">
                                      📷 참고사진 {urls.length}개
                                    </span>
                                  );
                                }
                              } catch {
                                return null;
                              }
                              return null;
                            })()
                          )}
                        </div>
                      )}

                      {/* 요약본 하단: 상태 변경 버튼 및 작업시작 버튼 */}
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
                        <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {/* 작업시작 버튼 */}
                          {contact.status === 'new' && (
                            <button
                              onClick={(e) => handleStartWork(contact.id, e)}
                              className="px-3 py-1.5 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
                            >
                              작업시작
                            </button>
                          )}
                          {/* 상태 변경 버튼들 */}
                          {/* 보류 상태일 때는 작업중으로 변경 버튼 표시 */}
                          {contact.status === 'on_hold' ? (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const response = await fetch(`/api/contacts/${contact.id}/status`, {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ status: 'in_progress' }),
                                  });
                                  if (response.ok) {
                                    router.refresh();
                                  } else {
                                    alert('상태 변경에 실패했습니다.');
                                  }
                                } catch (error) {
                                  console.error('Error updating status:', error);
                                  alert('상태 변경 중 오류가 발생했습니다.');
                                }
                              }}
                              className="px-3 py-1.5 text-xs bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded-lg transition-colors"
                            >
                              작업중으로 변경
                            </button>
                          ) : (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const response = await fetch(`/api/contacts/${contact.id}/status`, {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ status: 'on_hold' }),
                                  });
                                  if (response.ok) {
                                    router.refresh();
                                  } else {
                                    alert('상태 변경에 실패했습니다.');
                                  }
                                } catch (error) {
                                  console.error('Error updating status:', error);
                                  alert('상태 변경 중 오류가 발생했습니다.');
                                }
                              }}
                              className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                            >
                              보류 중으로 변경
                            </button>
                          )}
                          {/* 수정작업중 상태일 때는 작업중으로 변경 버튼 표시 */}
                          {contact.status === 'revision_in_progress' ? (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const response = await fetch(`/api/contacts/${contact.id}/status`, {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ status: 'in_progress' }),
                                  });
                                  if (response.ok) {
                                    router.refresh();
                                  } else {
                                    alert('상태 변경에 실패했습니다.');
                                  }
                                } catch (error) {
                                  console.error('Error updating status:', error);
                                  alert('상태 변경 중 오류가 발생했습니다.');
                                }
                              }}
                              className="px-3 py-1.5 text-xs bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded-lg transition-colors"
                            >
                              작업중으로 변경
                            </button>
                          ) : (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const response = await fetch(`/api/contacts/${contact.id}/status`, {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ status: 'revision_in_progress' }),
                                  });
                                  if (response.ok) {
                                    router.refresh();
                                  } else {
                                    alert('상태 변경에 실패했습니다.');
                                  }
                                } catch (error) {
                                  console.error('Error updating status:', error);
                                  alert('상태 변경 중 오류가 발생했습니다.');
                                }
                              }}
                              className="px-3 py-1.5 text-xs bg-orange-100 dark:bg-orange-900 hover:bg-orange-200 dark:hover:bg-orange-800 text-orange-700 dark:text-orange-300 rounded-lg transition-colors"
                            >
                              수정작업중으로 변경
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

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
                    {/* 연락처 정보 */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                        연락처 정보
                      </h3>
                      <div className="space-y-3">
                        {contact.contact_type && (
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">문의 유형</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                              {contact.contact_type === 'individual' ? '개인' : '업체'}
                            </p>
                          </div>
                        )}
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
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
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
                    {contact.receipt_method && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                          일정 조율 정보
                        </h3>
                        <div className="space-y-3">
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
                        </div>
                      </div>
                    )}

                    {/* 첨부 파일 */}
                    {(contact.attachment_url || contact.attachment_filename || 
                      contact.drawing_file_url || contact.drawing_file_name || 
                      contact.reference_photos_urls) && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
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
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 whitespace-nowrap"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    📥 다운로드
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
                                  <a
                                    href={contact.drawing_file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={contact.drawing_file_name || undefined}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 whitespace-nowrap"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    📥 다운로드
                                  </a>
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
                                        <a
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          download={`reference-photo-${idx + 1}.jpg`}
                                          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          📥 다운로드
                                        </a>
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
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                        상태 정보
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">상태</label>
                          <div className="mt-1">
                            <UpdateStatusButton contactId={contact.id} currentStatus={contact.status} />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">등록일</label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                            {new Date(contact.created_at).toLocaleString('ko-KR')}
                          </p>
                        </div>
                        {contact.updated_at && (
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">수정일</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                              {new Date(contact.updated_at).toLocaleString('ko-KR')}
                            </p>
                          </div>
                        )}
                        <div onClick={(e) => e.stopPropagation()}>
                          <ConfirmButton contactId={contact.id} currentStatus={contact.status} />
                        </div>
                      </div>
                    </div>

                    {/* 공정 단계 표시 */}
                    <div className="mb-4">
                      <ProcessStageIndicatorToggle 
                        currentStage={contact.process_stage} 
                        status={contact.status}
                        defaultExpanded={isExpanded}
                      />
                    </div>

                    {/* 작업시작 버튼 */}
                    {contact.status === 'new' && (
                      <div className="mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={(e) => handleStartWork(contact.id, e)}
                          className="w-full px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium text-sm"
                        >
                          작업시작
                        </button>
                      </div>
                    )}

                    {/* 하단: 상태 변경 버튼 및 삭제 버튼 */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      {/* 왼쪽: 상태 변경 버튼들 */}
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        {/* 보류 상태일 때는 작업중으로 변경 버튼 표시 */}
                        {contact.status === 'on_hold' ? (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const response = await fetch(`/api/contacts/${contact.id}/status`, {
                                  method: 'PATCH',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({ status: 'in_progress' }),
                                });
                                if (response.ok) {
                                  router.refresh();
                                } else {
                                  alert('상태 변경에 실패했습니다.');
                                }
                              } catch (error) {
                                console.error('Error updating status:', error);
                                alert('상태 변경 중 오류가 발생했습니다.');
                              }
                            }}
                            className="px-3 py-1.5 text-xs bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded-lg transition-colors"
                          >
                            작업중으로 변경
                          </button>
                        ) : (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const response = await fetch(`/api/contacts/${contact.id}/status`, {
                                  method: 'PATCH',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({ status: 'on_hold' }),
                                });
                                if (response.ok) {
                                  router.refresh();
                                } else {
                                  alert('상태 변경에 실패했습니다.');
                                }
                              } catch (error) {
                                console.error('Error updating status:', error);
                                alert('상태 변경 중 오류가 발생했습니다.');
                              }
                            }}
                            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                          >
                            보류 중으로 변경
                          </button>
                        )}
                        {/* 수정작업중 상태일 때는 작업중으로 변경 버튼 표시 */}
                        {contact.status === 'revision_in_progress' ? (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const response = await fetch(`/api/contacts/${contact.id}/status`, {
                                  method: 'PATCH',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({ status: 'in_progress' }),
                                });
                                if (response.ok) {
                                  router.refresh();
                                } else {
                                  alert('상태 변경에 실패했습니다.');
                                }
                              } catch (error) {
                                console.error('Error updating status:', error);
                                alert('상태 변경 중 오류가 발생했습니다.');
                              }
                            }}
                            className="px-3 py-1.5 text-xs bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded-lg transition-colors"
                          >
                            작업중으로 변경
                          </button>
                        ) : (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const response = await fetch(`/api/contacts/${contact.id}/status`, {
                                  method: 'PATCH',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({ status: 'revision_in_progress' }),
                                });
                                if (response.ok) {
                                  router.refresh();
                                } else {
                                  alert('상태 변경에 실패했습니다.');
                                }
                              } catch (error) {
                                console.error('Error updating status:', error);
                                alert('상태 변경 중 오류가 발생했습니다.');
                              }
                            }}
                            className="px-3 py-1.5 text-xs bg-orange-100 dark:bg-orange-900 hover:bg-orange-200 dark:hover:bg-orange-800 text-orange-700 dark:text-orange-300 rounded-lg transition-colors"
                          >
                            수정작업중으로 변경
                          </button>
                        )}
                      </div>
                      {/* 오른쪽: 삭제 버튼 */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <DeleteButton 
                          contactId={contact.id} 
                          contactName={contact.company_name || contact.name || `문의 #${contact.id}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400">
            등록된 문의가 없습니다.
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              {filteredContacts.length > 0 ? (
                <>
                  {offset + 1} - {Math.min(offset + itemsPerPage, filteredContacts.length)} / 총 {filteredContacts.length}건
                </>
              ) : (
                '0건'
              )}
            </div>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  이전
                </button>
              )}
              {currentPage < totalPages && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                  className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  다음
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

