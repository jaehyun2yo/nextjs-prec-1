import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { getSessionUser } from '@/lib/auth/session';

const apiLogger = logger.createLogger('ADMIN_BOOKINGS_API');

/**
 * GET /api/admin/bookings
 * 관리자용 예약 목록 조회 (모든 예약)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // TODO: 관리자 권한 확인 추가

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from('visit_bookings')
      .select(`
        *,
        contacts (
          id,
          company_name,
          name,
          phone,
          email,
          inquiry_number
        )
      `)
      .order('visit_date', { ascending: true })
      .order('visit_time_slot', { ascending: true });

    // 필터 적용
    if (date) {
      query = query.eq('visit_date', date);
    }
    if (startDate) {
      query = query.gte('visit_date', startDate);
    }
    if (endDate) {
      query = query.lte('visit_date', endDate);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      apiLogger.error('Error fetching bookings', error);
      return NextResponse.json(
        { error: '예약 목록 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookings: data || [] });
  } catch (error) {
    apiLogger.error('Unexpected error', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

