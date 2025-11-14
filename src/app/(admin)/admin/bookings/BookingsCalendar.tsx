'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronLeft, FaChevronRight, FaClock } from 'react-icons/fa';

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
  const [currentDate, setCurrentDate] = useState(new Date());

  // 현재 월의 첫 날과 마지막 날 계산
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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

  // 캘린더 그리드 생성
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // 주의 시작일 (일요일)

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      dateString: string;
      bookings: Booking[];
    }> = [];

    const current = new Date(startDate);
    // 6주 * 7일 = 42일
    for (let i = 0; i < 42; i++) {
      const dateString = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        dateString,
        bookings: bookingsByDate[dateString] || [],
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [year, month, bookingsByDate]);

  // 월 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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
      {/* 헤더 */}
      <div className="bg-orange-500 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-orange-600 rounded transition-colors"
              aria-label="이전 달"
            >
              <FaChevronLeft />
            </button>
            <h2 className="text-xl font-bold">
              {year}년 {month + 1}월
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-orange-600 rounded transition-colors"
              aria-label="다음 달"
            >
              <FaChevronRight />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors text-sm"
          >
            오늘
          </button>
        </div>
      </div>

      {/* 캘린더 그리드 */}
      <div className="p-4">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const isToday = day.date.toDateString() === new Date().toDateString();
            const hasBookings = day.bookings.length > 0;

            return (
              <div
                key={index}
                className={`min-h-[120px] border border-gray-200 dark:border-gray-700 rounded p-2 ${
                  day.isCurrentMonth
                    ? 'bg-white dark:bg-gray-800'
                    : 'bg-gray-50 dark:bg-gray-900/50 opacity-60'
                } ${isToday ? 'ring-2 ring-orange-500' : ''}`}
              >
                {/* 날짜 번호 */}
                <div
                  className={`text-sm font-medium mb-1 ${
                    day.isCurrentMonth
                      ? isToday
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}
                >
                  {day.date.getDate()}
                </div>

                {/* 예약 태그들 */}
                <div className="space-y-1">
                  {day.bookings.slice(0, 3).map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() => handleBookingClick(booking)}
                      className="w-full text-left px-2 py-1 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 rounded text-xs transition-colors cursor-pointer group"
                      title={`${booking.company_name} - ${booking.visit_time_slot}`}
                    >
                      <div className="flex items-center gap-1 text-orange-700 dark:text-orange-300">
                        <FaClock className="text-[10px] flex-shrink-0" />
                        <span className="truncate font-medium">{booking.company_name}</span>
                      </div>
                      <div className="text-[10px] text-orange-600 dark:text-orange-400 mt-0.5 truncate">
                        {booking.visit_time_slot}
                      </div>
                    </button>
                  ))}
                  {day.bookings.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                      +{day.bookings.length - 3}건
                    </div>
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
