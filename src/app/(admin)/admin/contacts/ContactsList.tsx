'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DeleteButton } from './delete-button';
import { ContactDetailModal } from './ContactDetailModal';

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
  status: string;
  created_at: string;
}

interface ContactsListProps {
  contacts: Contact[];
  statusFilter: string;
  totalCount: number;
  itemsPerPage: number;
  currentPage: number;
  showFiltersOnly?: boolean;
}

export function ContactsList({ contacts, statusFilter, totalCount, itemsPerPage, currentPage, showFiltersOnly = false }: ContactsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  const handleContactClick = (contactId: number) => {
    setSelectedContactId(contactId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedContactId(null);
  };

  const handleModalUpdate = () => {
    router.refresh();
  };

  const filterButtons = (
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
        onClick={() => handleFilterChange('completed')}
        className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors text-xs ${
          statusFilter === 'completed'
            ? 'bg-orange-600 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        완료 ({contacts.filter(c => c.status === 'completed').length})
      </button>
    </div>
  );

  if (showFiltersOnly) {
    return filterButtons;
  }

  return (
    <>
      {/* 문의 목록 - 데스크톱 테이블 */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  번호
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  업체명/이름
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  담당자
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  연락처
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  도면/샘플 / 수령방법
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  상세정보
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  등록일
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  삭제
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedContacts.length > 0 ? (
                paginatedContacts.map((contact, index) => (
                  <tr
                    key={contact.id}
                    onClick={() => handleContactClick(contact.id)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <td className="contents">
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {filteredContacts.length - (offset + index)}
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {contact.company_name}
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {contact.name} ({contact.position})
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div>{contact.phone}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{contact.email}</div>
                      </td>
                      <td className="px-4 xl:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        <div className="space-y-2">
                          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">도면/샘플:</span>
                              {contact.drawing_type === 'create' ? (
                                <span className="px-2.5 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded font-medium">
                                  제작 필요
                                </span>
                              ) : contact.drawing_type === 'have' ? (
                                <span className="px-2.5 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded font-medium">
                                  보유
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </div>
                          </div>
                          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">수령방법:</span>
                              {contact.receipt_method === 'visit' ? (
                                <span className="px-2.5 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded font-medium">
                                  방문 {contact.visit_date ? `${contact.visit_date} ${contact.visit_time_slot || ''}` : ''}
                                </span>
                              ) : contact.receipt_method === 'delivery' ? (
                                <span className="px-2.5 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded font-medium">
                                  {contact.delivery_type === 'parcel' ? '택배' : contact.delivery_type === 'quick' ? '퀵' : '배송'}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 xl:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          {contact.box_shape && (
                            <div>형태: {contact.box_shape}</div>
                          )}
                          {(contact.length || contact.width || contact.height) && (
                            <div>
                              크기: {contact.length || '-'}×{contact.width || '-'}×{contact.height || '-'}mm
                            </div>
                          )}
                          {contact.material && (
                            <div>재질: {contact.material}</div>
                          )}
                          {contact.receipt_method === 'delivery' && contact.delivery_address && (
                            <div className="truncate max-w-xs">주소: {contact.delivery_address}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2.5 py-1 text-xs rounded font-medium ${
                            contact.status === 'new'
                              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                              : contact.status === 'read'
                              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                              : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          }`}
                        >
                          {contact.status === 'new' ? '신규' : contact.status === 'read' ? '읽음' : '완료'}
                        </span>
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(contact.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })} 
                      </td>
                    </td>
                    <td 
                      className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DeleteButton 
                        contactId={contact.id} 
                        contactName={contact.company_name || contact.name || `문의 #${contact.id}`}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    등록된 문의가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="px-4 xl:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
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
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  이전
                </button>
              )}
              {currentPage < totalPages && (
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  다음
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 모바일 카드 뷰 */}
      <div className="lg:hidden space-y-4">
        {paginatedContacts.length > 0 ? (
          paginatedContacts.map((contact, index) => (
            <div
              key={contact.id}
              onClick={() => handleContactClick(contact.id)}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-3 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2.5 py-1 text-xs rounded font-medium ${
                        contact.status === 'new'
                          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          : contact.status === 'read'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      }`}
                    >
                      {contact.status === 'new' ? '신규' : contact.status === 'read' ? '읽음' : '완료'}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {contact.company_name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {contact.name} ({contact.position})
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {contact.phone}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {contact.email}
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  #{filteredContacts.length - (offset + index)}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                <div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">도면/샘플 / 수령방법</div>
                  <div className="space-y-2">
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">도면/샘플:</span>
                        {contact.drawing_type === 'create' ? (
                          <span className="px-2.5 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded font-medium">
                            제작 필요
                          </span>
                        ) : contact.drawing_type === 'have' ? (
                          <span className="px-2.5 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded font-medium">
                            보유
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">수령방법:</span>
                        {contact.receipt_method === 'visit' ? (
                          <span className="px-2.5 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded font-medium">
                            방문 {contact.visit_date ? `${contact.visit_date} ${contact.visit_time_slot || ''}` : ''}
                          </span>
                        ) : contact.receipt_method === 'delivery' ? (
                          <span className="px-2.5 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded font-medium">
                            {contact.delivery_type === 'parcel' ? '택배' : contact.delivery_type === 'quick' ? '퀵' : '배송'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(contact.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700" onClick={(e) => e.preventDefault()}>
                <DeleteButton 
                  contactId={contact.id} 
                  contactName={contact.company_name || contact.name || `문의 #${contact.id}`}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400">
            등록된 문의가 없습니다.
          </div>
        )}

        {/* 모바일 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 pt-4">
            <div className="text-xs text-gray-700 dark:text-gray-300">
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
                  className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
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
                  className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  다음
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 상세보기 모달 */}
      <ContactDetailModal
        contactId={selectedContactId}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUpdate={handleModalUpdate}
      />
    </>
  );
}

