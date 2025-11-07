import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FaBuilding, FaCheckCircle, FaTimesCircle, FaEye } from "react-icons/fa";
import { QuickApproveButton } from "./quick-approve-button";
import { logger } from "@/lib/utils/logger";

interface Company {
  id: number;
  company_name: string;
  business_registration_number: string;
  representative_name: string;
  username: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

export default async function CompaniesPage() {
  const supabase = await createSupabaseServerClient();
  const companiesLogger = logger.createLogger('COMPANIES');
  
  let companies: Company[] = [];
  const stats = {
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
  };

  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      companiesLogger.error("Error fetching companies", error);
    } else {
      companies = (data || []) as Company[];
      stats.total = companies.length;
      stats.active = companies.filter(c => c.status === 'active').length;
      stats.inactive = companies.filter(c => c.status === 'inactive').length;
      stats.pending = companies.filter(c => c.status === 'pending').length;
    }
  } catch (error) {
    companiesLogger.error("Supabase connection error", error);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <FaCheckCircle className="text-xs" />
            활성
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <FaTimesCircle className="text-xs" />
            비활성
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            대기중
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">업체관리</h1>
        <p className="text-gray-600 dark:text-gray-400">
          등록된 업체들을 관리하고 모니터링하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-blue-500 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">전체 업체</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
            <div className="bg-blue-500 p-4 rounded-full">
              <FaBuilding className="text-white text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-green-500 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">활성 업체</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.active}</p>
            </div>
            <div className="bg-green-500 p-4 rounded-full">
              <FaCheckCircle className="text-white text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-red-500 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">비활성 업체</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.inactive}</p>
            </div>
            <div className="bg-red-500 p-4 rounded-full">
              <FaTimesCircle className="text-white text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-yellow-500 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">대기중</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.pending}</p>
            </div>
            <div className="bg-yellow-500 p-4 rounded-full">
              <FaBuilding className="text-white text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* 업체 목록 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">업체 목록</h2>
        
        {companies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">업체명</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">사업자등록번호</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">대표자명</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">아이디</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">상태</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">등록일</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">관리</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{company.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 font-medium">{company.company_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{company.business_registration_number}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{company.representative_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{company.username}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(company.status)}
                        <QuickApproveButton companyId={company.id} currentStatus={company.status} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(company.created_at).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <Link
                        href={`/admin/companies/${company.id}`}
                        className="inline-flex items-center gap-1 text-[#ED6C00] hover:text-[#d15f00] font-medium transition-colors"
                      >
                        <FaEye className="text-xs" />
                        상세보기
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FaBuilding className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">등록된 업체가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}

