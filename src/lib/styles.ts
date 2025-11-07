/**
 * 공통 스타일 상수
 * 메인 색상 및 재사용 가능한 스타일 클래스를 관리합니다.
 */

// 메인 색상
export const COLORS = {
  primary: '#ED6C00',
  primaryHover: '#d15f00',
  primaryLight: '#ff8533',
  primary50: '#fff7ed',
  primary100: '#ffedd5',
  primary200: '#fed7aa',
  primary300: '#fdba74',
  primary400: '#fb923c',
} as const;

// 공통 입력 필드 스타일
export const INPUT_STYLES = {
  base: 'px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm transition-colors duration-300',
  focus: 'focus:outline-none focus:ring-2 focus:ring-[#ED6C00] focus:border-[#ED6C00]',
  full: 'w-full',
  twoThirds: 'w-2/3',
  oneThird: 'w-1/3',
} as const;

// 공통 버튼 스타일
// 모든 버튼은 14px(text-sm) 글자 크기와 py-3 px-8 크기로 통일
export const BUTTON_STYLES = {
  primary: 'bg-[#ED6C00] hover:bg-[#d15f00] text-white text-sm py-3 px-8 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg',
  primaryDisabled: 'bg-[#ED6C00] hover:bg-[#d15f00] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm py-3 px-8 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg',
  secondary: 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm py-3 px-8 rounded-lg transition-colors duration-300',
  modal: 'bg-[#ED6C00] hover:bg-[#d15f00] text-white text-sm py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2',
} as const;

// 공통 체크박스/라디오 스타일
export const CHECKBOX_STYLES = {
  base: 'w-4 h-4 bg-gray-100 border-gray-300 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:ring-offset-gray-800',
  primary: 'text-[#ED6C00] focus:ring-[#ED6C00] dark:focus:ring-[#ED6C00]',
} as const;

// 스텝 인디케이터 스타일
export const STEP_STYLES = {
  active: {
    text: 'text-[#ED6C00] dark:text-[#ff8533]',
    circle: 'bg-[#ED6C00] text-white dark:bg-[#ED6C00]',
  },
  inactive: {
    text: 'text-gray-400',
    circle: 'bg-gray-200 dark:bg-gray-700 text-gray-500',
  },
} as const;

// 파일 입력 스타일
export const FILE_INPUT_STYLES = {
  base: 'w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#ED6C00] focus:border-[#ED6C00] transition-colors duration-300',
  fileButton: 'file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-[#fff7ed] file:text-[#ED6C00] hover:file:bg-[#ffedd5] dark:file:bg-[#ED6C00]/20 dark:file:text-[#ff8533]',
} as const;

// 링크 스타일
export const LINK_STYLES = {
  primary: 'text-[#ED6C00] hover:text-[#d15f00] font-medium underline',
} as const;

