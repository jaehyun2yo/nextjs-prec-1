import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { getSessionUser } from '@/lib/auth/session';

const apiLogger = logger.createLogger('ADMIN_BOOKINGS_API');

/**
 * PUT /api/admin/bookings/[id]
 * 예약 수정
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user?.userId) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // TODO: 관리자 권한 확인 추가

    const { id } = await params;
    const body = await request.json();
    const { visitDate, visitTimeSlot, companyName, status, notes } = body;

    const supabase = await createSupabaseServerClient();

    // 예약 수정 시 날짜/시간 변경이 있으면 예약 가능 여부 확인
    if (visitDate && visitTimeSlot) {
      const { data: existingBooking } = await supabase
        .from('visit_bookings')
        .select('visit_date, visit_time_slot')
        .eq('id', id)
        .single();

      // 날짜나 시간이 변경되는 경우에만 확인
      if (
        existingBooking &&
        (existingBooking.visit_date !== visitDate ||
          existingBooking.visit_time_slot !== visitTimeSlot)
      ) {
        const { count } = await supabase
          .from('visit_bookings')
          .select('*', { count: 'exact', head: true })
          .eq('visit_date', visitDate)
          .eq('visit_time_slot', visitTimeSlot)
          .eq('status', 'confirmed')
          .neq('id', id); // 현재 예약 제외

        if ((count || 0) >= 2) {
          return NextResponse.json(
            { error: '해당 시간대는 이미 예약이 가득 찼습니다. (최대 2건)' },
            { status: 400 }
          );
        }
      }
    }

    const updateData: {
      visit_date?: string;
      visit_time_slot?: string;
      company_name?: string;
      status?: string;
      notes?: string | null;
    } = {};
    if (visitDate) updateData.visit_date = visitDate;
    if (visitTimeSlot) updateData.visit_time_slot = visitTimeSlot;
    if (companyName) updateData.company_name = companyName;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabase
      .from('visit_bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      apiLogger.error('Error updating booking', error);
      return NextResponse.json({ error: '예약 수정 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ booking: data });
  } catch (error) {
    apiLogger.error('Unexpected error', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/bookings/[id]
 * 예약 삭제 (실제 삭제 또는 취소)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user?.userId) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // TODO: 관리자 권한 확인 추가

    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    // 실제 삭제 대신 상태를 cancelled로 변경
    const { data, error } = await supabase
      .from('visit_bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      apiLogger.error('Error cancelling booking', error);
      return NextResponse.json({ error: '예약 취소 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ booking: data });
  } catch (error) {
    apiLogger.error('Unexpected error', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
