'use client';

import { BaseModal } from '@/components/modals/BaseModal';
import { DailyContactsChart } from './DailyContactsChart';

interface ContactsChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { date: string; count: number; fullDate: string }[];
  yesterdayChange: number;
}

export function ContactsChartModal({
  isOpen,
  onClose,
  data,
  yesterdayChange,
}: ContactsChartModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="문의건수 상세" maxWidth="4xl">
      <div className="space-y-4">
        {/* 어제 대비 변화 */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">어제 대비</p>
          <p
            className={`text-2xl font-bold ${yesterdayChange > 0 ? 'text-red-600 dark:text-red-400' : yesterdayChange < 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            {yesterdayChange > 0
              ? `+${yesterdayChange}`
              : yesterdayChange < 0
                ? `${yesterdayChange}`
                : '0'}
          </p>
        </div>

        {/* 그래프 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <DailyContactsChart data={data} />
        </div>
      </div>
    </BaseModal>
  );
}
