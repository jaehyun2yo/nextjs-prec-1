// src/app/login/page.tsx

import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth/security";
import { createSession, verifySession } from "@/lib/auth/session";
import { headers } from "next/headers";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // 이미 로그인된 경우 관리자 페이지로 리디렉션
  const isAuthenticated = await verifySession();
  if (isAuthenticated) {
    redirect("/admin");
  }
  async function loginAction(formData: FormData) {
    "use server";

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
      redirect("/login?error=invalid");
    }

    try {
      // 환경 변수에서 관리자 정보 가져오기 (TEST_ADMIN 우선, 없으면 ADMIN 사용)
      const testAdminUsername = process.env.TEST_ADMIN_USERNAME;
      const testAdminPasswordHashB64 = process.env.TEST_ADMIN_PASSWORD_HASH_B64;
      // base64 디코딩
      const testAdminPasswordHash = testAdminPasswordHashB64 
        ? Buffer.from(testAdminPasswordHashB64, 'base64').toString('utf8')
        : undefined;
      const adminUsername = process.env.ADMIN_USERNAME || "test";
      const adminPasswordHash =
        process.env.ADMIN_PASSWORD_HASH ||
        "$2b$12$ynu9sCHlJmOe4FyRn4h1/Ov.5VD.OWUH.QM2a2ZfqNWmxaUywEQpq";

      // 디버깅: 환경 변수 확인
      console.log("=== Environment Variables Debug ===");
      console.log("TEST_ADMIN_USERNAME:", testAdminUsername ? `✅ "${testAdminUsername}"` : "❌ Not set");
      console.log("TEST_ADMIN_PASSWORD_HASH_B64:", testAdminPasswordHashB64 ? `✅ "${testAdminPasswordHashB64.substring(0, 30)}..."` : "❌ Not set");
      console.log("TEST_ADMIN_PASSWORD_HASH (decoded):", testAdminPasswordHash ? `✅ "${testAdminPasswordHash.substring(0, 30)}..." (length: ${testAdminPasswordHash.length})` : "❌ Not decoded");
      console.log("ADMIN_USERNAME:", adminUsername);
      console.log("ADMIN_PASSWORD_HASH:", adminPasswordHash ? `${adminPasswordHash.substring(0, 30)}...` : "Not set");

      // TEST_ADMIN이 설정되어 있으면 우선 사용, 없으면 기존 ADMIN 사용
      const currentUsername = testAdminUsername || adminUsername;
      const currentPasswordHash = testAdminPasswordHash || adminPasswordHash;
      
      console.log("=== Using Credentials ===");
      console.log("Current Username:", currentUsername);
      console.log("Current Hash (first 30 chars):", currentPasswordHash?.substring(0, 30));

      // 사용자명 검증
      const trimmedUsername = username.trim();
      console.log("Login attempt:", {
        inputUsername: trimmedUsername,
        expectedUsername: currentUsername,
        match: trimmedUsername === currentUsername,
      });

      if (trimmedUsername !== currentUsername) {
        console.log("Username mismatch:", { 
          input: trimmedUsername, 
          expected: currentUsername,
          testAdminUsername,
          adminUsername,
        });
        redirect("/login?error=invalid");
      }

      // 비밀번호 검증
      console.log("=== Password Verification ===");
      console.log("Input password length:", password.length);
      console.log("Expected hash length:", currentPasswordHash?.length);
      console.log("Hash prefix:", currentPasswordHash?.substring(0, 20));
      
      if (!currentPasswordHash) {
        console.error("❌ ERROR: Password hash is undefined!");
        redirect("/login?error=server");
      }
      
      const isValidPassword = await verifyPassword(password, currentPasswordHash);
      console.log("Password verification result:", isValidPassword ? "✅ SUCCESS" : "❌ FAILED");
      
      if (!isValidPassword) {
        console.log("=== Password Verification Failed Details ===", {
          passwordLength: password.length,
          hashUsed: testAdminPasswordHash ? "TEST_ADMIN" : "ADMIN",
          hashLength: currentPasswordHash?.length,
          hashPrefix: currentPasswordHash?.substring(0, 30),
        });
        redirect("/login?error=invalid");
      }

      // 로그인 성공 - 세션 생성
      await createSession();

      // 관리자 대시보드로 리디렉션
      redirect("/admin");
    } catch (error: unknown) {
      // Next.js의 redirect()는 NEXT_REDIRECT 에러를 throw하므로 다시 throw
      if (error instanceof Error && (error.message === "NEXT_REDIRECT" || (error as any).digest?.startsWith("NEXT_REDIRECT"))) {
        throw error;
      }
      
      // 실제 에러인 경우에만 로깅 및 리디렉션
      console.error("Login error:", error);
      redirect("/login?error=server");
    }
  }

  const params = await searchParams;
  const error = params?.error;
  let errorMessage = "";

  if (error === "invalid") {
    errorMessage = "아이디 또는 비밀번호가 올바르지 않습니다.";
  } else if (error === "server") {
      errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  } else if (error === "locked") {
    errorMessage = "너무 많은 로그인 시도로 인해 계정이 일시적으로 잠겼습니다.";
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-sm border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
          기업 로그인
        </h1>
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              {errorMessage}
            </p>
          </div>
        )}
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ED6C00] focus:border-[#ED6C00] transition-colors duration-300"
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ED6C00] focus:border-[#ED6C00] transition-colors duration-300"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-[#ED6C00] hover:bg-[#d15f00] hover:shadow-lg transition-all duration-300"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
