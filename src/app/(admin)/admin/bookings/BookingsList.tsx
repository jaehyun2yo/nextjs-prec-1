'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { FaCalendarAlt, FaClock, FaBuilding, FaUser, FaPhone, FaEnvelope, FaEdit, FaTrash } from 'react-icons/fa';

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

interface BookingsListProps {
  initialBookings: Booking[];
}

export function BookingsList({ initialBookings }: BookingsListProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const supabase = createSupabaseClient();

  // 날짜별로 그룹화
  const groupedBookings = bookings.reduce((acc, booking) => {
    const date = booking.visit_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  const sortedDates = Object.keys(groupedBookings).sort();

  // 날짜 필터링
  const filteredBookings = selectedDate
    ? bookings.filter(b => b.visit_date === selectedDate)
    : bookings;

  const handleDelete = async (id: number) => {
    if (!confirm('정말 이 예약을 취소하시겠습니까?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBookings(bookings.filter(b => b.id !== id));
      } else {
        alert('예약 취소에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('예약 취소 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 필터 */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          날짜 필터
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate('')}
            className="ml-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* 예약 목록 */}
      {sortedDates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-500 dark:text-gray-400">예약이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-orange-500 text-white px-6 py-3">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt />
                  <h2 className="text-lg font-semibold">
                    {new Date(date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long',
                    })}
                  </h2>
                  <span className="ml-auto text-sm">
                    {groupedBookings[date].length}건
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {groupedBookings[date]
                  .sort((a, b) => a.visit_time_slot.localeCompare(b.visit_time_slot))
                  .map((booking) => (
                    <div key={booking.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                              <FaClock />
                              <span className="font-semibold">{booking.visit_time_slot}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <FaBuilding />
                              <span>{booking.company_name}</span>
                            </div>
                          </div>

                          {booking.contacts && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <FaUser />
                                <span>{booking.contacts.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FaPhone />
                                <span>{booking.contacts.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FaEnvelope />
                                <span>{booking.contacts.email}</span>
                              </div>
                              {booking.contacts.inquiry_number && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">문의번호:</span>
                                  <span>{booking.contacts.inquiry_number}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {booking.notes && (
                            <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                              <strong>메모:</strong> {booking.notes}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleDelete(booking.id)}
                            disabled={loading}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                            title="예약 취소"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

