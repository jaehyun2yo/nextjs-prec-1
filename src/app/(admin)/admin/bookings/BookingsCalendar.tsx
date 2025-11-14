'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FaClock } from 'react-icons/fa';

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

interface BookingsCalendarProps {
  initialBookings: Booking[];
}

export function BookingsCalendar({ initialBookings }: BookingsCalendarProps) {
  const router = useRouter();

  // 날짜별로 예약 그룹화
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    initialBookings.forEach((booking) => {
      const date = booking.visit_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(booking);
    });
    return grouped;
  }, [initialBookings]);

  // 오늘 기준으로 7일 생성 (오늘 포함)
  const calendarDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: Array<{
      date: Date;
      dateString: string;
      bookings: Booking[];
    }> = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      days.push({
        date: new Date(date),
        dateString,
        bookings: bookingsByDate[dateString] || [],
      });
    }

    return days;
  }, [bookingsByDate]);

  // 오늘 기준 날짜 범위 표시
  const weekRange = useMemo(() => {
    if (calendarDays.length === 0) return '';
    const start = calendarDays[0].date;
    const end = calendarDays[6].date;
    const startStr = `${start.getMonth() + 1}/${start.getDate()}`;
    const endStr = `${end.getMonth() + 1}/${end.getDate()}`;
    return `${start.getFullYear()}년 ${startStr} ~ ${endStr}`;
  }, [calendarDays]);

  // 태그 클릭 핸들러
  const handleBookingClick = (booking: Booking) => {
    if (booking.contact_id) {
      router.push(`/admin/contacts/${booking.contact_id}`);
    }
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* 헤더 */}
      <div className="bg-orange-500 text-white px-6 py-4">
        <h2 className="text-xl font-bold">{weekRange}</h2>
      </div>

      {/* 캘린더 그리드 */}
      <div className="p-6">
        {/* 날짜 셀 - 7일 모두 표시 */}
        <div className="grid grid-cols-7 gap-4">
          {calendarDays.map((day, index) => {
            const isToday = day.date.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`min-h-[500px] border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 ${
                  isToday ? 'ring-2 ring-orange-500' : ''
                }`}
              >
                {/* 날짜 정보 */}
                <div
                  className={`text-lg font-bold mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 ${
                    isToday
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {weekDays[day.date.getDay()]}
                  </div>
                  {day.date.getMonth() + 1}월 {day.date.getDate()}일
                </div>

                {/* 예약 태그들 - 모두 표시 */}
                <div className="space-y-2">
                  {day.bookings.length === 0 ? (
                    <div className="text-sm text-gray-400 dark:text-gray-600 text-center py-8">
                      예약 없음
                    </div>
                  ) : (
                    day.bookings.map((booking) => (
                      <button
                        key={booking.id}
                        onClick={() => handleBookingClick(booking)}
                        className="w-full text-left px-3 py-2.5 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 rounded-lg transition-colors cursor-pointer border border-orange-200 dark:border-orange-800"
                        title={`${booking.company_name} - ${booking.visit_time_slot}`}
                      >
                        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 mb-1">
                          <FaClock className="text-sm flex-shrink-0" />
                          <span className="font-semibold">{booking.company_name}</span>
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">
                          {booking.visit_time_slot}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
