import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FaFileAlt, FaCheckCircle, FaSpinner, FaEye, FaEnvelope } from "react-icons/fa";
import Link from "next/link";
import { BUTTON_STYLES } from "@/lib/styles";
import { logger } from "@/lib/utils/logger";
import { ContactCardToggle } from '@/components/ContactCardToggle';
import type { ProcessStage } from '@/lib/utils/processStages';

interface Company {
  id: number;
  company_name: string;
}

interface Contact {
  id: number;
  company_name: string;
  name: string;
  position?: string | null;
  phone: string;
  email: string;
  status: string;
  process_stage: ProcessStage;
  drawing_type: string | null;
  length: string | null;
  width: string | null;
  height: string | null;
  material?: string | null;
  inquiry_title?: string | null;
  created_at: string;
}

export default async function CompanyDashboardPage() {
  const user = await getSessionUser();
  if (!user?.userId) {
    return null;
  }

  // 업체 정보 가져오기
  const supabase = await createSupabaseServerClient();
  const dashboardLogger = logger.createLogger('COMPANY_DASHBOARD');
  let company: Company | null = null;
  let contacts: Contact[] = [];

  try {
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', user.userId)
      .single();

    if (companyError || !companyData) {
      dashboardLogger.error("Error fetching company", companyError);
      return null;
    }

    company = companyData as Company;

    // 해당 업체의 문의하기(진행상황) 가져오기
    const { data: contactsData, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .eq('company_name', company.company_name)
      .order('created_at', { ascending: false });

    if (contactsError) {
      dashboardLogger.error("Error fetching contacts", contactsError);
    } else {
      contacts = (contactsData || []) as Contact[];
    }
  } catch (error) {
    dashboardLogger.error("Error", error);
    return null;
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'new':
        return {
          label: '신규',
          iconName: 'spinner' as const,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        };
      case 'read':
        return {
          label: '작업중',
          iconName: 'eye' as const,
          color: 'text-[#ED6C00] dark:text-[#ED6C00]',
          bgColor: 'bg-[#ED6C00]/10 dark:bg-[#ED6C00]/20',
        };
      case 'in_progress':
        return {
          label: '작업중',
          iconName: 'eye' as const,
          color: 'text-[#ED6C00] dark:text-[#ED6C00]',
          bgColor: 'bg-[#ED6C00]/10 dark:bg-[#ED6C00]/20',
        };
      case 'revision_in_progress':
        return {
          label: '수정작업중',
          iconName: 'eye' as const,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        };
      case 'on_hold':
        return {
          label: '보류',
          iconName: 'fileAlt' as const,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-700',
        };
      case 'replied':
        return {
          label: '답변완료',
          iconName: 'checkCircle' as const,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
        };
      case 'completed':
        return {
          label: '납품완료',
          iconName: 'checkCircle' as const,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
        };
      default:
        return {
          label: status,
          iconName: 'fileAlt' as const,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-700',
        };
    }
  };

  // 통계 계산
  const stats = {
    total: contacts.length,
    new: contacts.filter(c => c.status === 'new').length,
    inProgress: contacts.filter(c => 
      c.status === 'read' || 
      c.status === 'in_progress' || 
      c.status === 'revision_in_progress'
    ).length,
    completed: contacts.filter(c => c.status === 'replied' || c.status === 'completed').length,
  };

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">진행상황</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {company.company_name}의 문의 및 주문 진행상황을 확인하실 수 있습니다.
          </p>
        </div>
        <Link
          href="/contact"
          className={`${BUTTON_STYLES.primary} flex items-center gap-2`}
        >
          <FaEnvelope className="text-sm" />
          <span>견적 / 문의하기</span>
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-blue-500 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">전체 문의</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
            <div className="bg-blue-500 p-4 rounded-full">
              <FaFileAlt className="text-white text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-yellow-500 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">신규 문의</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.new}</p>
            </div>
            <div className="bg-yellow-500 p-4 rounded-full">
              <FaSpinner className="text-white text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-orange-500 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">작업중</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.inProgress}</p>
            </div>
            <div className="bg-orange-500 p-4 rounded-full">
              <FaEye className="text-white text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-green-500 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">완료</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.completed}</p>
            </div>
            <div className="bg-green-500 p-4 rounded-full">
              <FaCheckCircle className="text-white text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* 진행상황 목록 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">문의 진행상황</h2>
        
        {contacts.length > 0 ? (
          <div className="space-y-4">
            {contacts.map((contact) => {
              const statusInfo = getStatusInfo(contact.status);
              
              return (
                <ContactCardToggle
                  key={contact.id}
                  contact={contact}
                  statusInfo={statusInfo}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaFileAlt className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">진행중인 문의가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}

