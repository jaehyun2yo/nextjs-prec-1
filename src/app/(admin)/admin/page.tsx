import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FaEnvelope, FaBuilding, FaChartLine } from "react-icons/fa";
import Link from "next/link";
import { logger } from "@/lib/utils/logger";
import { DashboardClient } from "./DashboardClient";

interface Company {
  id: number;
  company_name: string;
  created_at: string;
  referrer?: string | null;
}

interface ContactReferral {
  referral_source: string | null;
  count: number;
}

export default async function AdminDashboardPage() {
  const adminLogger = logger.createLogger('ADMIN');
  let newContactCount = 0;
  let newCompanyCount = 0;
  let yesterdayContactCount = 0;
  let yesterdayCompanyCount = 0;
  let todayContactCount = 0;
  let dailyContactsData: { date: string; count: number; fullDate: string }[] = [];
  let newCompanies: Company[] = [];
  let referralSources: ContactReferral[] = [];
  
  try {
    const supabase = await createSupabaseServerClient();

    // 신규 문의 개수
    const { count: newContacts } = await supabase
      .from("contacts")
      .select("*", { count: 'exact', head: true })
      .eq('status', 'new')
      .neq('status', 'deleting');
    
    newContactCount = newContacts || 0;

    // 어제 생성된 문의 개수 (어제 대비 비교용)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const { count: yesterdayContacts } = await supabase
      .from("contacts")
      .select("*", { count: 'exact', head: true })
      .gte("created_at", yesterday.toISOString())
      .lte("created_at", yesterdayEnd.toISOString())
      .neq('status', 'deleting');
    
    yesterdayContactCount = yesterdayContacts || 0;

    // 오늘 생성된 문의 개수
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const { count: todayContacts } = await supabase
      .from("contacts")
      .select("*", { count: 'exact', head: true })
      .gte("created_at", today.toISOString())
      .lte("created_at", todayEnd.toISOString())
      .neq('status', 'deleting');
    
    todayContactCount = todayContacts || 0;

    // 최근 30일간 신규 업체 등록
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const { data: companiesData } = await supabase
      .from("companies")
      .select("id, company_name, created_at, referrer")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false });
    
    newCompanies = (companiesData || []) as Company[];
    newCompanyCount = newCompanies.length;

    // 어제 업체 등록 개수
    const { count: yesterdayCompanies } = await supabase
      .from("companies")
      .select("*", { count: 'exact', head: true })
      .gte("created_at", yesterday.toISOString())
      .lte("created_at", yesterdayEnd.toISOString());
    
    yesterdayCompanyCount = yesterdayCompanies || 0;

    // 최근 30일간의 날짜별 문의 건수 조회 (위에서 정의한 thirtyDaysAgo 사용)
    const { data: contactsData, error: contactsError } = await supabase
      .from("contacts")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .neq('status', 'deleting')
      .order("created_at", { ascending: true });

    if (contactsError) {
      adminLogger.error("Error fetching contacts for chart", contactsError);
    } else if (contactsData) {
      // 날짜별로 그룹화
      const dateMap = new Map<string, number>();
      
      contactsData.forEach((contact) => {
        const date = new Date(contact.created_at);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
      });

      // 최근 30일의 모든 날짜 생성
      const dates: { date: string; count: number; fullDate: string }[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
        dates.push({
          date: formattedDate,
          count: dateMap.get(dateKey) || 0,
          fullDate: dateKey,
        });
      }

      dailyContactsData = dates;
    }

    // 최근 30일간 유입경로별 통계
    const { data: referralData, error: referralError } = await supabase
      .from("contacts")
      .select("referral_source")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .neq('status', 'deleting');

    if (!referralError && referralData) {
      // 유입경로별 집계
      const referralMap = new Map<string, number>();
      referralData.forEach((contact) => {
        const source = contact.referral_source || '기타';
        referralMap.set(source, (referralMap.get(source) || 0) + 1);
      });

      referralSources = Array.from(referralMap.entries())
        .map(([referral_source, count]) => ({ referral_source, count }))
        .sort((a, b) => b.count - a.count);
    }
  } catch (error) {
    adminLogger.error("Supabase connection error", error);
  }

  // 어제 대비 변화 계산 (오늘 생성된 문의 - 어제 생성된 문의)
  const contactChange = todayContactCount - yesterdayContactCount;
  
  // 어제 대비 업체 등록 변화 계산
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  
  // 오늘 등록된 업체 개수는 이미 계산됨 (newCompanies에서 오늘 것만 필터링)
  const todayCompanies = newCompanies.filter(company => {
    const createdDate = new Date(company.created_at);
    return createdDate >= today && createdDate <= todayEnd;
  }).length;
  
  const companyChange = todayCompanies - yesterdayCompanyCount;

  return (
    <DashboardClient
      newContactCount={newContactCount}
      todayContactCount={todayContactCount}
      newCompanyCount={newCompanyCount}
      contactChange={contactChange}
      companyChange={companyChange}
      dailyContactsData={dailyContactsData}
      newCompanies={newCompanies}
      referralSources={referralSources}
    />
  );
}
