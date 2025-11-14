import { getSessionUser } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { redirect } from 'next/navigation';
import { BookingsList } from './BookingsList';

const adminLogger = logger.createLogger('ADMIN_BOOKINGS');

export default async function AdminBookingsPage() {
  const user = await getSessionUser();
  if (!user?.userId) {
    redirect('/login');
  }

  // TODO: 관리자 권한 확인 추가

  const supabase = await createSupabaseServerClient();

  interface Contact {
    id: number;
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
    contact_id: number | null;
    status: string;
    notes: string | null;
    created_at: string;
    contacts: Contact | null;
  }

  let bookings: Booking[] = [];

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
    } else {
      bookings = data || [];
    }
  } catch (error) {
    adminLogger.error('Unexpected error', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">예약 관리</h1>
        <p className="text-gray-600 dark:text-gray-400">방문 예약을 관리하고 확인할 수 있습니다.</p>
      </div>

      <BookingsList initialBookings={bookings} />
    </div>
  );
}
