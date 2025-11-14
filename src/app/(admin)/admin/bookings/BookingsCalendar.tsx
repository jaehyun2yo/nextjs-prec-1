'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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
  const [dayOffset, setDayOffset] = useState(0); // 오늘 기준으로 며칠 뒤인지

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

  // 기준 날짜로부터 3일 생성
  const calendarDays = useMemo(() => {
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    baseDate.setDate(baseDate.getDate() + dayOffset);

    const days: Array<{
      date: Date;
      dateString: string;
      bookings: Booking[];
    }> = [];

    for (let i = 0; i < 3; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      days.push({
        date: new Date(date),
        dateString,
        bookings: bookingsByDate[dateString] || [],
      });
    }

    return days;
  }, [dayOffset, bookingsByDate]);

  // 이전 3일
  const goToPrevious3Days = () => {
    setDayOffset(dayOffset - 3);
  };

  // 다음 3일
  const goToNext3Days = () => {
    setDayOffset(dayOffset + 3);
  };

  // 오늘로 이동
  const goToToday = () => {
    setDayOffset(0);
  };

  // 태그 클릭 핸들러
  const handleBookingClick = (booking: Booking) => {
    if (booking.contact_id) {
      router.push(`/admin/contacts/${booking.contact_id}`);
    }
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* 네비게이션 버튼 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={goToPrevious3Days}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
        >
          <FaChevronLeft />
          <span>이전 3일</span>
        </button>
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300 text-sm"
        >
          오늘
        </button>
        <button
          onClick={goToNext3Days}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
        >
          <span>다음 3일</span>
          <FaChevronRight />
        </button>
      </div>

      {/* 캘린더 그리드 */}
      <div className="p-6">
        {/* 날짜 셀 - 3일 모두 표시 */}
        <div className="grid grid-cols-3 gap-6">
          {calendarDays.map((day, index) => {
            const isToday = day.date.toDateString() === new Date().toDateString();
            const hasBookings = day.bookings.length > 0;

            return (
              <div
                key={index}
                className={`min-h-[600px] border rounded-lg p-6 ${
                  hasBookings
                    ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                } ${isToday ? 'ring-2 ring-gray-400 dark:ring-gray-600' : ''}`}
              >
                {/* 날짜 정보 */}
                <div
                  className={`text-xl font-bold mb-5 pb-4 border-b ${
                    hasBookings
                      ? 'text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                      : 'text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div
                    className={`text-base mb-2 ${
                      hasBookings
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {weekDays[day.date.getDay()]}
                  </div>
                  {day.date.getMonth() + 1}월 {day.date.getDate()}일
                  {isToday && (
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">(오늘)</span>
                  )}
                </div>

                {/* 예약 태그들 - 모두 표시 */}
                <div className="space-y-3">
                  {day.bookings.length === 0 ? (
                    <div className="text-base text-gray-400 dark:text-gray-600 text-center py-12">
                      예약 없음
                    </div>
                  ) : (
                    day.bookings.map((booking) => (
                      <button
                        key={booking.id}
                        onClick={() => handleBookingClick(booking)}
                        className="w-full text-left px-4 py-3 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 rounded-lg transition-colors cursor-pointer border border-orange-200 dark:border-orange-800"
                        title={`${booking.company_name} - ${booking.visit_time_slot}`}
                      >
                        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 mb-2">
                          <FaClock className="text-base flex-shrink-0" />
                          <span className="font-bold text-base">{booking.company_name}</span>
                        </div>
                        <div className="text-base text-orange-600 dark:text-orange-400 font-medium">
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
