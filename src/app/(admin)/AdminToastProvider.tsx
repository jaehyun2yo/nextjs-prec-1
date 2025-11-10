'use client';

import { useEffect, useRef } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

export function AdminToastProvider() {
  const { info } = useToast();
  const router = useRouter();
  const processedContactIdsRef = useRef<Set<number>>(new Set());
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const supabase = createSupabaseClient();

    // 초기 로드 시 최신 문의사항 ID들 저장
    const initializeProcessedIds = async () => {
      const { data } = await supabase
        .from('contacts')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(100);

      if (data) {
        processedContactIdsRef.current = new Set(data.map(contact => contact.id));
      }
    };

    initializeProcessedIds();

    // Realtime 구독: 신규 문의사항 감지
    const channel = supabase
      .channel('admin-new-contacts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contacts',
        },
        (payload) => {
          const newContact = payload.new as any;
          
          // 이미 알림을 보낸 문의사항인지 확인
          if (processedContactIdsRef.current.has(newContact.id)) {
            return;
          }

          // 처리된 ID에 추가
          processedContactIdsRef.current.add(newContact.id);

          // 신규 문의사항 알림 표시
          info(
            '신규 문의사항이 등록되었습니다',
            `${newContact.company_name || newContact.name || '문의 #' + newContact.id}`,
            {
              color: 'primary',
              timeout: 8000,
              hideCloseButton: false,
              shouldShowTimeoutProgress: true,
              onClick: () => {
                router.push(`/admin/contacts/${newContact.id}`);
              },
              action: {
                label: '확인하기',
                onClick: () => {
                  router.push(`/admin/contacts/${newContact.id}`);
                },
              },
            }
          );
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Admin Toast] ✅ Subscribed to new contacts');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Admin Toast] ❌ Channel error');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [info, router]);

  return null;
}

