'use client';

import { useState } from 'react';
import { FaFileInvoice, FaFileAlt, FaCalendarAlt } from 'react-icons/fa';
import { BUTTON_STYLES } from '@/lib/styles';

interface Contact {
  id: number;
  company_name: string;
  inquiry_number: string | null;
  inquiry_title: string | null;
  created_at: string;
  completed_at?: string | null;
}

interface BillingListProps {
  contacts: Contact[];
}

export function BillingList({ contacts }: BillingListProps) {
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // 월별 발행 핸들러
  const handleMonthlyInvoice = () => {
    // TODO: 월별 청구서 발행 로직 구현
    alert('월별 청구서 발행 기능은 준비 중입니다.');
  };

  const handleMonthlyTaxInvoice = () => {
    // TODO: 월별 전자세금계산서 발행 로직 구현
    alert('월별 전자세금계산서 발행 기능은 준비 중입니다.');
  };

  // 월별 발행 섹션 (항상 표시)
  const monthlyBillingSection = (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">월별 발행</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          특정 월의 모든 완료된 주문에 대한 청구서 및 전자세금계산서를 일괄 발행할 수 있습니다.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="month-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            월 선택:
          </label>
          <input
            id="month-select"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#ED6C00] focus:border-[#ED6C00] transition-colors"
          />
        </div>
        <button
          onClick={handleMonthlyInvoice}
          disabled={!selectedMonth}
          className="bg-[#ED6C00] hover:bg-[#d15f00] text-white text-sm py-2 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaFileInvoice className="text-xs" />
          월별 청구서 발행
        </button>
        <button
          onClick={handleMonthlyTaxInvoice}
          disabled={!selectedMonth}
          className="bg-[#ED6C00] hover:bg-[#d15f00] text-white text-sm py-2 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaFileAlt className="text-xs" />
          월별 전자세금계산서 발행
        </button>
      </div>
    </div>
  );

  if (contacts.length === 0) {
    return (
      <div className="space-y-6">
        {monthlyBillingSection}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="text-center py-12">
            <FaFileInvoice className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              청구서 발행 가능한 완료된 주문이 없습니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 월별 발행 버튼 섹션 */}
      {monthlyBillingSection}

      {/* 개별 발행 섹션 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">개별 발행</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              총 {contacts.length}개의 완료된 주문
            </p>
          </div>

          <div className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {contact.inquiry_title || contact.company_name || `문의 #${contact.id}`}
                    </h3>
                    {contact.inquiry_number && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({contact.inquiry_number})
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-xs" />
                      <span>주문일: {new Date(contact.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                    {contact.completed_at && (
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-xs" />
                        <span>완료일: {new Date(contact.completed_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSelectedContact(contact.id)}
                      className="bg-[#ED6C00] hover:bg-[#d15f00] text-white text-sm py-2 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <FaFileInvoice className="text-xs" />
                      청구서 발행
                    </button>
                    <button
                      onClick={() => setSelectedContact(contact.id)}
                      className="bg-[#ED6C00] hover:bg-[#d15f00] text-white text-sm py-2 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <FaFileAlt className="text-xs" />
                      전자세금계산서 발행
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

