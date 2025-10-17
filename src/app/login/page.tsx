// src/app/login/page.tsx

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function LoginPage() {
  async function loginAction(formData: FormData) {
    "use server"; // 1. 이 함수가 서버에서만 실행되는 '서버 액션'임을 명시합니다.

    const password = formData.get("password");

    // 2. .env.local에 저장된 비밀번호와 일치하는지 확인합니다.
    if (password === process.env.ADMIN_PASSWORD) {
      // 3. 비밀번호가 맞으면 쿠키를 설정합니다.
      (await
            // 3. 비밀번호가 맞으면 쿠키를 설정합니다.
            cookies()).set("admin-auth", "true", {
        httpOnly: true, // JavaScript에서 접근할 수 없도록 설정 (보안)
        path: "/",
        maxAge: 60 * 60 * 24, // 쿠키 유효 기간: 1일
      });
      // 4. 관리자 대시보드로 리디렉션합니다.
      redirect("/admin");
    } else {
      // 비밀번호가 틀렸을 경우 (여기서는 간단히 로그인 페이지로 다시 보냅니다)
      redirect("/login?error=InvalidPassword");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">관리자 로그인</h1>
        {/* 5. form에 action으로 서버 액션 함수를 연결합니다. */}
        <form action={loginAction} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
