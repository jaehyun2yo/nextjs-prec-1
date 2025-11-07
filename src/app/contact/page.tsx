import ContactForm from './ContactForm';
import { getSessionUser } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function ContactPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const params = (await searchParams) || {};
  const success = params.success === '1';
  const error = params.error;

  // 업체 로그인 상태 확인 및 정보 가져오기
  let initialValues: {
    companyName?: string;
    name?: string;
    position?: string;
    phone?: string;
    email?: string;
  } | null = null;

  const user = await getSessionUser();
  if (user?.userType === 'company' && user?.userId) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: companyData } = await supabase
        .from('companies')
        .select('company_name, manager_name, manager_position, manager_phone, manager_email')
        .eq('id', user.userId)
        .single();

      if (companyData) {
        initialValues = {
          companyName: companyData.company_name || '',
          name: companyData.manager_name || '',
          position: companyData.manager_position || '',
          phone: companyData.manager_phone || '',
          email: companyData.manager_email || '',
        };
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    }
  }

  return <ContactForm success={success} error={error} initialValues={initialValues} />;
}

