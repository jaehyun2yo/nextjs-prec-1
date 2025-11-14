'use client';

import { loginAction } from '@/app/actions/auth';
import { INPUT_STYLES, BUTTON_STYLES } from '@/lib/styles';

export function LoginForm({ loginAction }: { loginAction: (formData: FormData) => Promise<void> }) {
  const handleSubmit = async (formData: FormData) => {
    try {
      await loginAction(formData);
      // loginAction은 redirect를 사용하므로 여기까지 오지 않음
      // 하지만 에러가 발생하면 catch로 이동
    } catch (error) {
      // NEXT_REDIRECT는 정상적인 리다이렉트이므로 무시
      const errorDigest = (error as { digest?: string })?.digest;
      if (
        error instanceof Error &&
        (error.message === 'NEXT_REDIRECT' || errorDigest?.startsWith('NEXT_REDIRECT'))
      ) {
        // redirect는 정상 동작이므로 에러로 처리하지 않음
        return;
      }
      // 다른 에러는 서버 액션 내부에서 redirect로 처리되므로 여기서는 로깅만
      console.error('Login error:', error);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-4">
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
