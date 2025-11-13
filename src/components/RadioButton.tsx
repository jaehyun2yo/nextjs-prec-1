'use client';

import { motion, AnimatePresence } from 'framer-motion';

export interface RadioButtonProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  id?: string;
  disabled?: boolean;
  showUnderline?: boolean;
  underlineKey?: string;
}

export function RadioButton({
  name,
  value,
  checked,
  onChange,
  label,
  id,
  disabled = false,
  showUnderline = true,
  underlineKey,
}: RadioButtonProps) {
  const inputId = id || `${name}-${value}`;
  const uniqueKey = underlineKey || `${name}-${value}`;

  return (
    <label className="flex items-center cursor-pointer group">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        id={inputId}
        className="sr-only"
      />
      <div className="relative flex items-center">
        <div className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
          checked
            ? 'border-[#ED6C00]'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 group-hover:border-[#ED6C00]/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {checked && (
            <motion.svg
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#ED6C00"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </motion.svg>
          )}
        </div>
      </div>
      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100 relative inline-block">
        {showUnderline && (
          <AnimatePresence>
            {checked && (
              <motion.span
                key={uniqueKey}
                className="absolute bottom-[-4px] left-0"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                exit={{ width: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ 
                  height: '4px',
                  background: 'linear-gradient(to right, rgba(237, 108, 0, 0.8), rgba(237, 108, 0, 0.6))',
                  boxShadow: '0 2px 4px rgba(237, 108, 0, 0.4), 0 1px 2px rgba(237, 108, 0, 0.2)',
                  filter: 'blur(0.8px)',
                  borderRadius: '2px',
                  clipPath: 'polygon(0% 0%, 100% 0%, 98% 100%, 2% 100%)',
                }}
              />
            )}
          </AnimatePresence>
        )}
        <span className="relative z-10">{label}</span>
      </span>
    </label>
  );
}

