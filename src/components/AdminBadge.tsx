'use client';

import { useEffect, useState, useCallback } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';

interface AdminBadgeProps {
  userType?: 'admin' | 'company' | null;
}

export function AdminBadge({ userType }: AdminBadgeProps) {
  const [newContactCount, setNewContactCount] = useState<number>(0);

  // 초기 신규 문의사항 개수 가져오기
  const fetchNewContactCount = useCallback(async () => {
    const supabase = createSupabaseClient();
    const { count, error } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');

    if (!error && count !== null) {
      setNewContactCount(count);
    }
  }, []);

  useEffect(() => {
    // 관리자가 아닌 경우 뱃지 표시 안 함
    if (userType !== 'admin') {
      return;
    }

    const supabase = createSupabaseClient();

    // 초기 개수 가져오기
    fetchNewContactCount();

    // Realtime 구독: 신규 문의사항 감지
    const channel = supabase
      .channel('admin-new-contact-badge')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
        },
        () => {
          // contacts 테이블에 변경이 있으면 개수 다시 가져오기
          fetchNewContactCount();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Admin Badge] ✅ Subscribed to contacts changes');
        }
      });

    // 주기적으로 개수 갱신 (Realtime이 작동하지 않을 경우 대비)
    const interval = setInterval(() => {
      fetchNewContactCount();
    }, 10000); // 10초마다 갱신

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [userType, fetchNewContactCount]);

  // 관리자가 아니거나 신규 문의사항이 없으면 뱃지 표시 안 함
  if (userType !== 'admin' || newContactCount === 0) {
    return null;
  }

  return (
    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
      {newContactCount > 99 ? '99+' : newContactCount}
    </span>
  );
}

