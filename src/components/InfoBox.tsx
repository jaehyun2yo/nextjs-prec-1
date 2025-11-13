'use client';

import React from 'react';

interface InfoBoxProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
  labelInside?: boolean; // 레이블을 박스 내부에 표시할지 여부
}

/**
 * 공통 정보 박스 컴포넌트
 * 회사위치, 샘플 발송 주소 등 정보를 표시하는 통일된 디자인
 */
export function InfoBox({ label, children, className = '', labelInside = false }: InfoBoxProps) {
  return (
    <div className={className}>
      {label && !labelInside && (
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          {label}
        </label>
      )}
      <div className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        {label && labelInside && (
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {label}
          </h4>
        )}
        {children}
      </div>
    </div>
  );
}

