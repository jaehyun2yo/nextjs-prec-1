'use client';

import { useState } from 'react';
import { FaEnvelope, FaBuilding, FaChartLine, FaRoute } from 'react-icons/fa';
import Link from 'next/link';
import { ContactsChartModal } from './ContactsChartModal';
import { NewCompaniesModal } from './NewCompaniesModal';
import { ReferralSourceModal } from './ReferralSourceModal';

interface Company {
  id: number;
  company_name: string;
  created_at: string;
  referrer?: string | null;
}

interface ContactReferral {
  referral_source: string | null;
  count: number;
}

interface DashboardClientProps {
  newContactCount: number;
  todayContactCount: number;
  newCompanyCount: number;
  contactChange: number;
  companyChange: number;
  dailyContactsData: { date: string; count: number; fullDate: string }[];
  newCompanies: Company[];
  referralSources: ContactReferral[];
}

export function DashboardClient({
  newContactCount,
  todayContactCount,
  newCompanyCount,
  contactChange,
  companyChange,
  dailyContactsData,
  newCompanies,
  referralSources,
}: DashboardClientProps) {
  const [contactsModalOpen, setContactsModalOpen] = useState(false);
  const [companiesModalOpen, setCompaniesModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);

  const totalReferrals = referralSources.reduce((sum, item) => sum + item.count, 0);
  const topReferral = referralSources.length > 0 ? referralSources[0] : null;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">관리자 대시보드</h1>
        <p className="text-gray-600 dark:text-gray-400">
          주요 현황을 한눈에 파악하세요
        </p>
      </div>

      {/* 신규 문의 카드 */}
      {newContactCount > 0 && (
        <div className="mb-6">
          <Link
            href="/admin/contacts?status=new"
            className="block bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-orange-500 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">신규 문의</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {newContactCount}건
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">
                  확인이 필요합니다
                </p>
              </div>
              <div className="bg-orange-500 p-3 rounded-full">
                <FaEnvelope className="text-white text-xl" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* 요약 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 문의건수 요약 카드 */}
        <button
          onClick={() => setContactsModalOpen(true)}
          className="text-left bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FaChartLine className="text-orange-600 dark:text-orange-400 text-lg" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">문의건수</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {todayContactCount}건
              </p>
              <p className={`text-sm font-medium ${contactChange > 0 ? 'text-red-600 dark:text-red-400' : contactChange < 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                어제 대비 {contactChange > 0 ? `+${contactChange}` : contactChange < 0 ? `${contactChange}` : '변화 없음'}
              </p>
            </div>
            <div className="text-gray-400 dark:text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>

        {/* 신규 업체 등록 요약 카드 */}
        <button
          onClick={() => setCompaniesModalOpen(true)}
          className="text-left bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FaBuilding className="text-blue-600 dark:text-blue-400 text-lg" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">신규 업체 등록</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {newCompanyCount > 0 ? `+${newCompanyCount}` : '0'}
              </p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                최근 30일간
              </p>
            </div>
            <div className="text-gray-400 dark:text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>

        {/* 트래픽 유입경로 요약 카드 */}
        <button
          onClick={() => setReferralModalOpen(true)}
          className="text-left bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FaRoute className="text-purple-600 dark:text-purple-400 text-lg" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">트래픽 유입경로</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {totalReferrals}건
              </p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {topReferral ? `최다: ${topReferral.referral_source || '기타'}` : '데이터 없음'}
              </p>
            </div>
            <div className="text-gray-400 dark:text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* 문의건수 상세 모달 */}
      <ContactsChartModal
        isOpen={contactsModalOpen}
        onClose={() => setContactsModalOpen(false)}
        data={dailyContactsData}
        yesterdayChange={contactChange}
      />

      {/* 신규 업체 등록 상세 모달 */}
      <NewCompaniesModal
        isOpen={companiesModalOpen}
        onClose={() => setCompaniesModalOpen(false)}
        companies={newCompanies}
        yesterdayChange={companyChange}
      />

      {/* 트래픽 유입경로 상세 모달 */}
      <ReferralSourceModal
        isOpen={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        referralSources={referralSources}
      />
    </div>
  );
}
