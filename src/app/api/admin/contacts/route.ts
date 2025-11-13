import { createSupabaseServerClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { toApiErrorResponse, convertSupabaseError, AuthenticationError } from '@/lib/utils/errors';

const adminContactsLogger = logger.createLogger('ADMIN_CONTACTS');

export async function GET(request: NextRequest) {
  try {
    // 세션 확인
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      const errorResponse = toApiErrorResponse(new AuthenticationError());
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
    }

    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const itemsPerPage = 20;
    const searchQuery = searchParams.get('search') || '';

    const supabase = await createSupabaseServerClient();

    // 쿼리 구성
    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' });
    
    if (statusFilter === 'all') {
      query = query.neq('status', 'deleting');
    } else if (statusFilter === 'deleting') {
      query = query.eq('status', 'deleting');
    } else {
      query = query.eq('status', statusFilter);
    }
    
    if (searchQuery) {
      query = query.ilike('inquiry_number', `%${searchQuery}%`);
    }
    
    // 페이지네이션 적용
    const offset = (page - 1) * itemsPerPage;
    const { data: contacts, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + itemsPerPage - 1);

    if (error) {
      adminContactsLogger.error('Error fetching contacts', error, { statusFilter, page, searchQuery });
      const dbError = convertSupabaseError(error);
      const errorResponse = toApiErrorResponse(dbError);
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
    }

    return NextResponse.json({
      contacts: contacts || [],
      totalCount: count || 0,
      hasMore: (count || 0) > offset + itemsPerPage,
    });
  } catch (error) {
    adminContactsLogger.error('Exception in GET admin contacts', error);
    const errorResponse = toApiErrorResponse(error);
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
}

