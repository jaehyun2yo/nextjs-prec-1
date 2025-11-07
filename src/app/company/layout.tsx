import { verifySession, getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/actions/auth";
import { FaSignOutAlt, FaHome } from "react-icons/fa";
import Link from "next/link";
import { logger } from "@/lib/utils/logger";

interface Company {
  id: number;
  company_name: string;
}

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 세션 검증
  const isAuthenticated = await verifySession();
  
  if (!isAuthenticated) {
    redirect("/login");
  }

  const user = await getSessionUser();
  if (user?.userType !== 'company' || !user?.userId) {
    redirect("/login");
  }

  // 업체 정보 가져오기
  const supabase = await createSupabaseServerClient();
  const layoutLogger = logger.createLogger('COMPANY_LAYOUT');
  let company: Company | null = null;

  try {
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', user.userId)
      .single();

    if (companyError || !companyData) {
      layoutLogger.error("Error fetching company", companyError);
      redirect("/login");
    }

    company = companyData as Company;
  } catch (error) {
    layoutLogger.error("Error", error);
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 독립적인 헤더 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {company.company_name}
              </h1>
              <nav className="hidden md:flex items-center gap-4">
                <Link
                  href="/company/dashboard"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-[#ED6C00] dark:hover:text-[#ff8533] font-medium transition-colors"
                >
                  진행상황
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1"
              >
                <FaHome className="text-xs" />
                <span className="hidden sm:inline">메인 사이트</span>
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FaSignOutAlt className="text-xs" />
                  <span>로그아웃</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

