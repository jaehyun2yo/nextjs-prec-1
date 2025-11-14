'use client';

import { INPUT_STYLES } from '@/lib/styles';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  showClearButton?: boolean;
  size?: 'default' | 'small';
  className?: string;
  icon?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder = '검색...',
  onClear,
  showClearButton = true,
  size = 'default',
  className = '',
  icon = false,
}: SearchInputProps) {
  const handleClear = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
  };

  const baseStyles =
    size === 'small'
      ? `${INPUT_STYLES.searchSmall} ${INPUT_STYLES.searchSmallWidth}`
      : `${INPUT_STYLES.base} ${INPUT_STYLES.full}`;

  const focusStyles = size === 'small' ? '' : INPUT_STYLES.focus;

  return (
    <div
      className={`${icon ? 'relative' : size === 'small' ? 'flex items-center gap-2' : 'relative'} ${className}`}
    >
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400 dark:text-gray-500" />
        </div>
      )}
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${baseStyles} ${focusStyles} ${icon ? 'pl-10' : ''} ${size === 'small' && value && showClearButton ? 'pr-8' : ''} ${size !== 'small' && value && showClearButton ? 'pr-10' : ''}`}
        />
        {showClearButton && value && size !== 'small' && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="검색어 지우기"
          >
            <FaTimes className="text-sm" />
          </button>
        )}
      </div>
      {showClearButton && value && size === 'small' && (
        <button
          type="button"
          onClick={handleClear}
          className="px-2.5 sm:px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs transition-colors"
          aria-label="검색어 지우기"
        >
          <FaTimes className="text-xs" />
        </button>
      )}
    </div>
  );
}
