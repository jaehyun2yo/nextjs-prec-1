import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ContactsList } from "./ContactsList";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || 'all';
  const page = parseInt(params.page || '1', 10);
  const itemsPerPage = 20;

  const supabase = await createSupabaseServerClient();
  
  // 모든 데이터를 한 번에 가져오기 (필터링 없이)
  const { data: contacts, error, count } = await supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[ADMIN CONTACTS] ❌ Error fetching contacts:', error);
    console.error('[ADMIN CONTACTS] Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  } else {
    console.log('[ADMIN CONTACTS] ✅ Successfully fetched contacts:', contacts?.length || 0, 'items');
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">문의하기 관리</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
          등록된 문의사항을 확인하고 관리하세요
        </p>
        <div className="mt-3">
          <ContactsList 
            contacts={contacts || []} 
            statusFilter={statusFilter}
            totalCount={count || 0}
            itemsPerPage={itemsPerPage}
            currentPage={page}
            showFiltersOnly={true}
          />
        </div>
      </div>

      <ContactsList 
        contacts={contacts || []} 
        statusFilter={statusFilter}
        totalCount={count || 0}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        showFiltersOnly={false}
      />
    </div>
  );
}

