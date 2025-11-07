import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaBuilding, FaUser, FaPhone, FaEnvelope, FaFileAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { ApproveButton } from "./approve-button";
import { logger } from "@/lib/utils/logger";

interface Company {
  id: number;
  username: string;
  company_name: string;
  business_registration_number: string;
  representative_name: string;
  business_type: string | null;
  business_category: string | null;
  business_address: string;
  business_registration_file_url: string | null;
  business_registration_file_name: string | null;
  manager_name: string;
  manager_position: string;
  manager_phone: string;
  manager_email: string;
  accountant_name: string | null;
  accountant_phone: string | null;
  accountant_email: string | null;
  accountant_fax: string | null;
  quote_method_email: boolean;
  quote_method_fax: boolean;
  quote_method_sms: boolean;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const companiesLogger = logger.createLogger('COMPANIES');

  let company: Company | null = null;

  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      companiesLogger.error("Error fetching company", error);
      redirect("/admin/companies");
    }

    company = data as Company;
  } catch (error) {
    companiesLogger.error("Error", error);
    redirect("/admin/companies");
  }

  if (!company) {
    redirect("/admin/companies");
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <FaCheckCircle className="text-xs" />
            활성
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <FaTimesCircle className="text-xs" />
            비활성
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            대기중
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/admin/companies"
            className="text-sm text-[#ED6C00] hover:text-[#d15f00] mb-2 inline-block"
          >
            ← 업체 목록으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">업체 상세정보</h1>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge(company.status)}
          <ApproveButton companyId={company.id} currentStatus={company.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 로그인 정보 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            로그인 정보
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">아이디</p>
              <p className="text-base text-gray-900 dark:text-gray-100">{company.username}</p>
            </div>
          </div>
        </div>

        {/* 업체 정보 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
            <FaBuilding />
            업체 정보
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">업체명</p>
              <p className="text-base text-gray-900 dark:text-gray-100 font-medium">{company.company_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">사업자등록번호</p>
              <p className="text-base text-gray-900 dark:text-gray-100">{company.business_registration_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">대표자명</p>
              <p className="text-base text-gray-900 dark:text-gray-100">{company.representative_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">업태</p>
              <p className="text-base text-gray-900 dark:text-gray-100">{company.business_type || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">업종</p>
              <p className="text-base text-gray-900 dark:text-gray-100">{company.business_category || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">사업자주소</p>
              <p className="text-base text-gray-900 dark:text-gray-100">{company.business_address}</p>
            </div>
            {company.business_registration_file_url && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">사업자등록증</p>
                <a
                  href={company.business_registration_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#ED6C00] hover:text-[#d15f00] font-medium"
                >
                  <FaFileAlt />
                  {company.business_registration_file_name || '파일 보기'}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* 실무담당자 정보 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
            <FaUser />
            실무담당자
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">성함</p>
              <p className="text-base text-gray-900 dark:text-gray-100">{company.manager_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">직함</p>
              <p className="text-base text-gray-900 dark:text-gray-100">{company.manager_position}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                <FaPhone />
                연락처
              </p>
              <p className="text-base text-gray-900 dark:text-gray-100">{company.manager_phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                <FaEnvelope />
                이메일
              </p>
              <p className="text-base text-gray-900 dark:text-gray-100">{company.manager_email}</p>
            </div>
          </div>
        </div>

        {/* 회계담당자 정보 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
            <FaUser />
            회계담당자
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">성함</p>
              <p className="text-base text-gray-900 dark:text-gray-100">{company.accountant_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                <FaPhone />
                연락처
              </p>
              <p className="text-base text-gray-900 dark:text-gray-100">{company.accountant_phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                <FaEnvelope />
                이메일 (세금계산서)
              </p>
              <p className="text-base text-gray-900 dark:text-gray-100">{company.accountant_email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">팩스번호</p>
              <p className="text-base text-gray-900 dark:text-gray-100">{company.accountant_fax || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">견적서 제공 방법</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {company.quote_method_email && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs">
                    이메일
                  </span>
                )}
                {company.quote_method_fax && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs">
                    팩스
                  </span>
                )}
                {company.quote_method_sms && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs">
                    휴대폰 문자
                  </span>
                )}
                {!company.quote_method_email && !company.quote_method_fax && !company.quote_method_sms && (
                  <span className="text-gray-500 dark:text-gray-400 text-xs">-</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 등록 정보 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          등록 정보
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">등록일</p>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {new Date(company.created_at).toLocaleString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">최종 수정일</p>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {new Date(company.updated_at).toLocaleString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

