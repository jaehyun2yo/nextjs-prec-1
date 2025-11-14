import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { BookingsCalendar } from './BookingsCalendar';

const adminLogger = logger.createLogger('ADMIN_BOOKINGS');

export default async function AdminBookingsPage() {
  // 인증은 layout에서 처리됨
  const supabase = await createSupabaseServerClient();

  interface Contact {
    id: number; // BIGSERIAL
    company_name: string;
    name: string;
    phone: string;
    email: string;
    inquiry_number: string | null;
  }

  interface Booking {
    id: number;
    visit_date: string;
    visit_time_slot: string;
    company_name: string;
    contact_id: number | null; // BIGINT (BIGSERIAL)
    status: string;
    notes: string | null;
    created_at: string;
    contacts: Contact | null;
  }

  let bookings: Booking[] = [];
  let hasError = false;
  let errorMessage = '';

  try {
    const { data, error } = await supabase
      .from('visit_bookings')
      .select(
        `
        *,
        contacts (
          id,
          company_name,
          name,
          phone,
          email,
          inquiry_number
        )
      `
      )
      .eq('status', 'confirmed')
      .order('visit_date', { ascending: true })
      .order('visit_time_slot', { ascending: true });

    if (error) {
      adminLogger.error('Error fetching bookings', error);
      hasError = true;
      errorMessage = error.message || '예약 데이터를 불러오는 중 오류가 발생했습니다.';
      // 테이블이 없을 수도 있으므로 빈 배열로 처리
      bookings = [];
    } else {
      bookings = data || [];
    }
  } catch (error) {
    adminLogger.error('Unexpected error in bookings page', error);
    hasError = true;
    errorMessage = error instanceof Error ? error.message : '예기치 않은 오류가 발생했습니다.';
    bookings = [];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">예약 관리</h1>
        <p className="text-gray-600 dark:text-gray-400">
          방문 예약을 캘린더 형태로 확인할 수 있습니다.
        </p>
      </div>

      {hasError && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            ⚠️ {errorMessage}
            {(errorMessage.includes('relation') || errorMessage.includes('does not exist')) && (
              <span className="block mt-2">
                visit_bookings 테이블이 존재하지 않을 수 있습니다. 데이터베이스 설정을 확인해주세요.
              </span>
            )}
          </p>
        </div>
      )}

      <BookingsCalendar initialBookings={bookings} />
    </div>
  );
}
