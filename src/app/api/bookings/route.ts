import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { getSessionUser } from '@/lib/auth/session';

const apiLogger = logger.createLogger('BOOKINGS_API');

/**
 * GET /api/bookings
 * 예약 목록 조회
 * Query params: 
 *   - date: 특정 날짜의 예약만 조회 (YYYY-MM-DD)
 *   - companyName: 특정 업체의 예약만 조회
 *   - startDate, endDate: 날짜 범위 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const companyName = searchParams.get('companyName');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from('visit_bookings')
      .select('*')
      .order('visit_date', { ascending: true })
      .order('visit_time_slot', { ascending: true });

    // 필터 적용
    if (date) {
      query = query.eq('visit_date', date);
    }
    if (companyName) {
      query = query.eq('company_name', companyName);
    }
    if (startDate) {
      query = query.gte('visit_date', startDate);
    }
    if (endDate) {
      query = query.lte('visit_date', endDate);
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

/**
 * POST /api/bookings
 * 새 예약 생성
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { visitDate, visitTimeSlot, companyName, contactId, notes } = body;

    if (!visitDate || !visitTimeSlot || !companyName) {
      return NextResponse.json(
        { error: 'visitDate, visitTimeSlot, companyName은 필수입니다.' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // 예약 가능 여부 확인 (타임당 최대 2건)
    const { count, error: countError } = await supabase
      .from('visit_bookings')
      .select('*', { count: 'exact', head: true })
      .eq('visit_date', visitDate)
      .eq('visit_time_slot', visitTimeSlot)
      .eq('status', 'confirmed');

    if (countError) {
      apiLogger.error('Error checking booking availability', countError);
      return NextResponse.json(
        { error: '예약 가능 여부 확인 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    if ((count || 0) >= 2) {
      return NextResponse.json(
        { error: '해당 시간대는 이미 예약이 가득 찼습니다. (최대 2건)' },
        { status: 400 }
      );
    }

    // 예약 생성
    const { data, error } = await supabase
      .from('visit_bookings')
      .insert({
        visit_date: visitDate,
        visit_time_slot: visitTimeSlot,
        company_name: companyName,
        contact_id: contactId || null,
        status: 'confirmed',
        notes: notes || null,
        created_by: 'company',
      })
      .select()
      .single();

    if (error) {
      apiLogger.error('Error creating booking', error);
      return NextResponse.json(
        { error: '예약 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ booking: data }, { status: 201 });
  } catch (error) {
    apiLogger.error('Unexpected error', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

