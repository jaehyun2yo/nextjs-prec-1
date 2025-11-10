import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ContactsList } from "./ContactsList";
import { TestNewContactButton } from "./TestNewContactButton";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || 'all';
  const page = parseInt(params.page || '1', 10);
  const itemsPerPage = 20;
  const searchQuery = params.search || '';

  console.log('[ADMIN CONTACTS] 📋 Request params:', {
    statusFilter,
    page,
    searchQuery,
    hasSearchQuery: !!searchQuery,
  });

  const supabase = await createSupabaseServerClient();
  
  // 각 상태별 개수 조회 (필터 버튼에 표시하기 위해)
  const getStatusCount = async (status: string) => {
    let countQuery = supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });
    
    if (status === 'all') {
      countQuery = countQuery.neq('status', 'deleting');
    } else {
      countQuery = countQuery.eq('status', status);
    }
    
    if (searchQuery) {
      countQuery = countQuery.ilike('inquiry_number', `%${searchQuery}%`);
    }
    
    const { count } = await countQuery;
    return count || 0;
  };

  // 각 상태별 개수 조회
  const [allCount, newCount, readCount, inProgressCount, revisionInProgressCount, completedCount, onHoldCount, deletingCount] = await Promise.all([
    getStatusCount('all'),
    getStatusCount('new'),
    getStatusCount('read'),
    getStatusCount('in_progress'),
    getStatusCount('revision_in_progress'),
    getStatusCount('completed'),
    getStatusCount('on_hold'),
    getStatusCount('deleting'),
  ]);

  // 검색 쿼리가 있으면 문의번호로 필터링
  // 전체 필터일 때는 삭제중이 아닌 문의만 조회, 삭제중 필터일 때는 삭제중만 조회
  let query = supabase
    .from('contacts')
    .select('*', { count: 'exact' });
  
  if (statusFilter === 'all') {
    // 전체 필터: 삭제중 제외
    query = query.neq('status', 'deleting');
  } else if (statusFilter === 'deleting') {
    // 삭제중 필터: 삭제중만
    query = query.eq('status', 'deleting');
  } else {
    // 다른 필터: 해당 상태만, 삭제중 제외
    query = query.eq('status', statusFilter);
  }
  
  if (searchQuery) {
    console.log('[ADMIN CONTACTS] 🔍 Applying search filter:', searchQuery);
    query = query.ilike('inquiry_number', `%${searchQuery}%`);
  } else {
    console.log('[ADMIN CONTACTS] 📄 No search query, fetching all contacts');
  }
  
  // 첫 페이지만 가져오기 (무한 스크롤)
  const offset = (page - 1) * itemsPerPage;
  const { data: contacts, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + itemsPerPage - 1);

  if (error) {
    console.error('[ADMIN CONTACTS] ❌ Error fetching contacts:', error);
    console.error('[ADMIN CONTACTS] Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  } else {
    console.log('[ADMIN CONTACTS] ✅ Successfully fetched contacts:', {
      count: contacts?.length || 0,
      totalCount: count || 0,
      searchQuery: searchQuery || '(none)',
      inquiryNumbers: contacts?.map(c => c.inquiry_number).filter(Boolean) || [],
    });
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <TestNewContactButton />
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
            searchQuery={searchQuery}
            showFiltersOnly={true}
            statusCounts={{
              all: allCount,
              new: newCount,
              read: readCount,
              in_progress: inProgressCount,
              revision_in_progress: revisionInProgressCount,
              completed: completedCount,
              on_hold: onHoldCount,
              deleting: deletingCount,
            }}
          />
        </div>
      </div>

      <ContactsList 
        contacts={contacts || []} 
        statusFilter={statusFilter}
        totalCount={count || 0}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        searchQuery={searchQuery}
        showFiltersOnly={false}
        statusCounts={{
          all: allCount,
          new: newCount,
          read: readCount,
          in_progress: inProgressCount,
          revision_in_progress: revisionInProgressCount,
          completed: completedCount,
          on_hold: onHoldCount,
          deleting: deletingCount,
        }}
      />
    </div>
  );
}

