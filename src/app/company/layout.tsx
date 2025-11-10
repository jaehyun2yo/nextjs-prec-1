import { verifySession, getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/actions/auth";
import { FaSignOutAlt } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
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
      <header className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4 bg-white/90 dark:bg-gray-900 backdrop-blur-lg border-b border-gray-300 dark:border-gray-700 sticky top-0 z-50 shadow-md dark:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/" className="flex items-center">
            <div className="h-8 md:h-10 w-auto overflow-hidden flex items-center">
              <Image 
                src="/logobox.svg" 
                alt="LOGOBOX Logo" 
                width={120} 
                height={40}
                className="max-h-full max-w-full object-contain"
                priority
              />
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-2 md:gap-3">
            <Link
              href="/company/dashboard"
              className="text-sm text-gray-900 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              진행상황
            </Link>
            <Link
              href="/company/billing"
              className="text-sm text-gray-900 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              청구서 / 전자세금계산서 발행
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-900 dark:text-gray-300 text-xs px-2 py-2">
            {company.company_name}
          </span>
          <Link
            href="/company/profile"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-gray-900 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300 text-xs"
          >
            정보 수정
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-900 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 text-xs"
            >
              <FaSignOutAlt className="text-xs" />
              <span>로그아웃</span>
            </button>
          </form>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

