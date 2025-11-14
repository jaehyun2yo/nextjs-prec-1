'use client';

import { loginAction } from '@/app/actions/auth';
import { INPUT_STYLES, BUTTON_STYLES } from '@/lib/styles';

export function LoginForm({ loginAction }: { loginAction: (formData: FormData) => Promise<void> }) {
  // Next.js 15에서는 form action에 서버 액션을 직접 바인딩하면
  // NEXT_REDIRECT 에러가 자동으로 처리됩니다.
  // 클라이언트에서 래핑하지 않고 직접 사용합니다.

  return (
    <form action={loginAction} className="space-y-4">
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
        >
          아이디
        </label>
        <input
          type="text"
          id="username"
          name="username"
          required
          autoComplete="username"
          className={`${INPUT_STYLES.full} ${INPUT_STYLES.base} ${INPUT_STYLES.focus} placeholder-gray-400 dark:placeholder-gray-500`}
          placeholder="아이디를 입력하세요"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
        >
          비밀번호
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          autoComplete="current-password"
          className={`${INPUT_STYLES.full} ${INPUT_STYLES.base} ${INPUT_STYLES.focus} placeholder-gray-400 dark:placeholder-gray-500`}
          placeholder="비밀번호를 입력하세요"
        />
      </div>
      <button type="submit" className={`${BUTTON_STYLES.primary} w-full flex justify-center`}>
        로그인
      </button>
    </form>
  );
}
