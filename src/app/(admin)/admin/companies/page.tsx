import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { CompaniesList } from './CompaniesList';

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
      companiesLogger.error('Error fetching companies', error);
    } else {
      companies = (data || []) as Company[];
      stats.total = companies.length;
      stats.active = companies.filter((c) => c.status === 'active').length;
      stats.inactive = companies.filter((c) => c.status === 'inactive').length;
      stats.pending = companies.filter((c) => c.status === 'pending').length;
    }
  } catch (error) {
    companiesLogger.error('Supabase connection error', error);
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">업체관리</h1>
        <p className="text-gray-600 dark:text-gray-400">등록된 업체들을 관리하고 모니터링하세요</p>
      </div>

      <CompaniesList companies={companies} stats={stats} />
    </div>
  );
}
