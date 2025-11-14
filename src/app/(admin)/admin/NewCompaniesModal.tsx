'use client';

import { BaseModal } from '@/components/modals/BaseModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useEffect, useState } from 'react';

interface Company {
  id: number;
  company_name: string;
  created_at: string;
  referrer?: string | null;
}

interface NewCompaniesModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  yesterdayChange: number;
}

export function NewCompaniesModal({
  isOpen,
  onClose,
  companies,
  yesterdayChange,
}: NewCompaniesModalProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // 유입경로별 집계
  const referrerData = companies.reduce(
    (acc, company) => {
      const referrer = company.referrer || '직접 방문';
      acc[referrer] = (acc[referrer] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const chartData = Object.entries(referrerData).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / companies.length) * 100).toFixed(1),
  }));

  const COLORS = ['#ED6C00', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const textColor = isDark ? '#e5e7eb' : '#374151';
  const tooltipBg = isDark ? '#1f2937' : '#ffffff';
  const tooltipBorder = isDark ? '#374151' : '#e5e7eb';
  const tooltipText = isDark ? '#e5e7eb' : '#374151';

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="신규 업체 등록 상세" maxWidth="4xl">
      <div className="space-y-6">
        {/* 기간 정보 */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">최근 30일간</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {companies.length}개 업체 등록
          </p>
        </div>

        {/* 등록 경로 통계 요약 */}
        {chartData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              등록 경로 통계
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {chartData.map((item, index) => (
                <div
                  key={item.name}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {item.value}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">개</span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 ml-auto">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 유입경로 차트 */}
        {chartData.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              등록 경로 분포
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '8px',
                    color: tooltipText,
                  }}
                />
                <Legend wrapperStyle={{ color: textColor }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : null}

        {/* 신규 업체 목록 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            신규 등록 업체 목록 ({companies.length}개)
          </h3>
          {companies.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {company.company_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(company.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      {company.referrer || '직접 방문'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              등록된 업체가 없습니다
            </p>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
