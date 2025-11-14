import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

const apiLogger = logger.createLogger('BOOKINGS_API');

/**
 * GET /api/bookings/available
 * 특정 날짜와 시간 슬롯의 예약 가능 여부 조회
 * Query params: date (YYYY-MM-DD), timeSlot (예: "9:00~10:00")
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const timeSlot = searchParams.get('timeSlot');

    if (!date || !timeSlot) {
      return NextResponse.json(
        { error: 'date와 timeSlot 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // 날짜 형식 정규화 (YYYY-MM-DD)
    const normalizedDate = date.trim();

    // 해당 날짜와 시간 슬롯의 예약 개수 조회
    const { count, error } = await supabase
      .from('visit_bookings')
      .select('*', { count: 'exact', head: true })
      .eq('visit_date', normalizedDate)
      .eq('visit_time_slot', timeSlot.trim())
      .eq('status', 'confirmed');

    if (error) {
      apiLogger.error('Error fetching booking count', error);
      return NextResponse.json(
        { error: '예약 정보 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    const bookingCount = count || 0;
    const isAvailable = bookingCount < 2;
    const availableSlots = Math.max(0, 2 - bookingCount);

    return NextResponse.json({
      date,
      timeSlot,
      bookingCount,
      availableSlots,
      isAvailable,
      maxBookings: 2,
    });
  } catch (error) {
    apiLogger.error('Unexpected error', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

