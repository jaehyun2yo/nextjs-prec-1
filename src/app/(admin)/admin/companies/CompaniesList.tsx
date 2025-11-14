'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FaBuilding, FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';
import { QuickApproveButton } from './quick-approve-button';
import { SearchInput } from '@/components/SearchInput';

interface Company {
  id: number;
  company_name: string;
  business_registration_number: string;
  representative_name: string;
  username: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

interface CompaniesListProps {
  companies: Company[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
  };
}

export function CompaniesList({
  companies: initialCompanies,
  stats: initialStats,
}: CompaniesListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <FaCheckCircle className="text-xs" />
            활성
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <FaTimesCircle className="text-xs" />
            비활성
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            대기중
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  // 검색 필터링
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialCompanies;
    }

    const query = searchQuery.toLowerCase().trim();
    return initialCompanies.filter((company) => {
      return (
        company.company_name.toLowerCase().includes(query) ||
        company.business_registration_number.toLowerCase().includes(query) ||
        company.representative_name.toLowerCase().includes(query) ||
        company.username.toLowerCase().includes(query) ||
        String(company.id).includes(query)
      );
    });
  }, [initialCompanies, searchQuery]);

  // 필터링된 통계 계산
  const filteredStats = useMemo(() => {
    return {
      total: filteredCompanies.length,
      active: filteredCompanies.filter((c) => c.status === 'active').length,
      inactive: filteredCompanies.filter((c) => c.status === 'inactive').length,
      pending: filteredCompanies.filter((c) => c.status === 'pending').length,
    };
  }, [filteredCompanies]);

  return (
    <div className="space-y-8">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-blue-500 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">전체 업체</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {searchQuery ? filteredStats.total : initialStats.total}
              </p>
            </div>
            <div className="bg-blue-500 p-4 rounded-full">
              <FaBuilding className="text-white text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-green-500 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">활성 업체</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {searchQuery ? filteredStats.active : initialStats.active}
              </p>
            </div>
            <div className="bg-green-500 p-4 rounded-full">
              <FaCheckCircle className="text-white text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-red-500 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">비활성 업체</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {searchQuery ? filteredStats.inactive : initialStats.inactive}
              </p>
            </div>
            <div className="bg-red-500 p-4 rounded-full">
              <FaTimesCircle className="text-white text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-yellow-500 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">대기중</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {searchQuery ? filteredStats.pending : initialStats.pending}
              </p>
            </div>
            <div className="bg-yellow-500 p-4 rounded-full">
              <FaBuilding className="text-white text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* 업체 목록 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">업체 목록</h2>
          <div className="w-full max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="업체명, 사업자등록번호, 대표자명, 아이디로 검색..."
              icon={true}
              size="default"
            />
            {false && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="text-sm">✕</span>
              </button>
            )}
          </div>
        </div>

        {searchQuery && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            검색 결과: <span className="font-semibold">{filteredCompanies.length}</span>개
          </div>
        )}

        {filteredCompanies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    업체명
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    사업자등록번호
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    대표자명
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    아이디
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    상태
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    등록일
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr
                    key={company.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                      {company.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {company.company_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {company.business_registration_number}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {company.representative_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {company.username}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(company.status)}
                        <QuickApproveButton companyId={company.id} currentStatus={company.status} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(company.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <Link
                        href={`/admin/companies/${company.id}`}
                        className="inline-flex items-center gap-1 text-[#ED6C00] hover:text-[#d15f00] font-medium transition-colors"
                      >
                        <FaEye className="text-xs" />
                        상세보기
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FaBuilding className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? '검색 결과가 없습니다' : '등록된 업체가 없습니다'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-sm text-[#ED6C00] hover:text-[#d15f00]"
              >
                검색어 지우기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
