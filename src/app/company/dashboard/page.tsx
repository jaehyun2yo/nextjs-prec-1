import { getSessionUser } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { CompanyDashboardClient } from './CompanyDashboardClient';
import type { ProcessStage } from '@/lib/utils/processStages';
import type { RevisionRequestHistory } from '@/types/database.types';

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
  revision_request_title?: string | null;
  revision_request_content?: string | null;
  revision_requested_at?: string | null;
  revision_request_file_url?: string | null;
  revision_request_file_name?: string | null;
  revision_request_history?: RevisionRequestHistory | null;
}

export default async function CompanyDashboardPage() {
  const user = await getSessionUser();
  if (!user?.userId) {
    return null;
  }

  // 업체 정보 가져오기
  const supabase = await createSupabaseServerClient();
  const dashboardLogger = logger.createLogger('COMPANY_DASHBOARD');
  interface Booking {
    id: number;
    visit_date: string;
    visit_time_slot: string;
    company_name: string;
    status: string;
    created_at: string;
  }

  let company: Company | null = null;
  let contacts: Contact[] = [];
  let bookings: Booking[] = [];

  try {
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', user.userId)
      .single();

    if (companyError || !companyData) {
      dashboardLogger.error('Error fetching company', companyError);
      return null;
    }

    company = companyData as Company;

    // 해당 업체의 문의하기(진행상황) 가져오기 (삭제중이 아닌 것만)
    const { data: contactsData, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .eq('company_name', company.company_name)
      .neq('status', 'deleting')
      .order('created_at', { ascending: false });

    if (contactsError) {
      dashboardLogger.error('Error fetching contacts', contactsError);
    } else {
      contacts = (contactsData || []) as Contact[];
    }

    // 해당 업체의 예약 일정 가져오기
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('visit_bookings')
      .select('*')
      .eq('company_name', company.company_name)
      .eq('status', 'confirmed')
      .order('visit_date', { ascending: true })
      .order('visit_time_slot', { ascending: true });

    if (bookingsError) {
      dashboardLogger.error('Error fetching bookings', bookingsError);
    } else {
      bookings = bookingsData || [];
    }
  } catch (error) {
    dashboardLogger.error('Error', error);
    return null;
  }

  if (!company) {
    return null;
  }

  return (
    <CompanyDashboardClient
      initialCompany={company}
      initialContacts={contacts}
      initialBookings={bookings}
    />
  );
}
