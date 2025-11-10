'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { FaFileAlt, FaCheckCircle, FaSpinner, FaEye, FaEnvelope, FaCalendarAlt } from "react-icons/fa";
import Link from "next/link";
import { BUTTON_STYLES } from "@/lib/styles";
import { ContactCardToggle } from '@/components/ContactCardToggle';
import type { ProcessStage } from '@/lib/utils/processStages';

type FilterType = 'all' | 'this_week' | 'this_month' | 'last_week' | 'last_month';

interface Company {
  id: number;
  company_name: string;
}

interface Contact {
  id: number;
  company_name: string;
  name: string;
  position?: string | null;
  phone: string;
  email: string;
  status: string;
  process_stage: ProcessStage;
  drawing_type: string | null;
  length: string | null;
  width: string | null;
  height: string | null;
  material?: string | null;
  inquiry_title?: string | null;
  created_at: string;
  revision_request_title?: string | null;
  revision_request_content?: string | null;
  revision_requested_at?: string | null;
  revision_request_file_url?: string | null;
  revision_request_file_name?: string | null;
  revision_request_history?: any;
}

interface CompanyDashboardClientProps {
  initialCompany: Company;
  initialContacts: Contact[];
}

export function CompanyDashboardClient({ initialCompany, initialContacts }: CompanyDashboardClientProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const isRefreshingRef = useRef(false);

  // 날짜 필터링 유틸리티 함수 (한국 시간 기준)
  const getDateRange = useCallback((type: FilterType) => {
    // 현재 한국 시간 가져오기
    const now = new Date();
    const koreaOffset = 9 * 60; // 한국은 UTC+9
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const koreaTime = new Date(utc + (koreaOffset * 60000));
    
    switch (type) {
      case 'this_week': {
        // 이번 주 월요일 00:00:00 (한국 시간)
        const dayOfWeek = koreaTime.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 일요일이면 -6, 아니면 1-dayOfWeek
        const monday = new Date(koreaTime);
        monday.setDate(koreaTime.getDate() + diff);
        monday.setHours(0, 0, 0, 0);
        // UTC로 변환 (Supabase는 UTC로 저장)
        const mondayUTC = new Date(monday.getTime() - (koreaOffset * 60000));
        
        // 이번 주 일요일 23:59:59 (한국 시간)
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        // UTC로 변환
        const sundayUTC = new Date(sunday.getTime() - (koreaOffset * 60000));
        
        return { start: mondayUTC, end: sundayUTC };
      }
      
      case 'this_month': {
        // 이번 달 1일 00:00:00 (한국 시간)
        const firstDay = new Date(koreaTime.getFullYear(), koreaTime.getMonth(), 1, 0, 0, 0, 0);
        const firstDayUTC = new Date(firstDay.getTime() - (koreaOffset * 60000));
        
        // 이번 달 마지막 날 23:59:59 (한국 시간)
        const lastDay = new Date(koreaTime.getFullYear(), koreaTime.getMonth() + 1, 0, 23, 59, 59, 999);
        const lastDayUTC = new Date(lastDay.getTime() - (koreaOffset * 60000));
        
        return { start: firstDayUTC, end: lastDayUTC };
      }
      
      case 'last_week': {
        // 지난 주 월요일 00:00:00 (한국 시간)
        const dayOfWeek = koreaTime.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const thisMonday = new Date(koreaTime);
        thisMonday.setDate(koreaTime.getDate() + diff);
        thisMonday.setHours(0, 0, 0, 0);
        
        const lastMonday = new Date(thisMonday);
        lastMonday.setDate(thisMonday.getDate() - 7);
        const lastMondayUTC = new Date(lastMonday.getTime() - (koreaOffset * 60000));
        
        // 지난 주 일요일 23:59:59 (한국 시간)
        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastMonday.getDate() + 6);
        lastSunday.setHours(23, 59, 59, 999);
        const lastSundayUTC = new Date(lastSunday.getTime() - (koreaOffset * 60000));
        
        return { start: lastMondayUTC, end: lastSundayUTC };
      }
      
      case 'last_month': {
        // 지난 달 1일 00:00:00 (한국 시간)
        const firstDay = new Date(koreaTime.getFullYear(), koreaTime.getMonth() - 1, 1, 0, 0, 0, 0);
        const firstDayUTC = new Date(firstDay.getTime() - (koreaOffset * 60000));
        
        // 지난 달 마지막 날 23:59:59 (한국 시간)
        const lastDay = new Date(koreaTime.getFullYear(), koreaTime.getMonth(), 0, 23, 59, 59, 999);
        const lastDayUTC = new Date(lastDay.getTime() - (koreaOffset * 60000));
        
        return { start: firstDayUTC, end: lastDayUTC };
      }
      
      default:
        return null;
    }
  }, []);

  // 필터링된 contacts
  const filteredContacts = useMemo(() => {
    if (filterType === 'all') {
      return contacts;
    }
    
    const dateRange = getDateRange(filterType);
    if (!dateRange) {
      return contacts;
    }
    
    return contacts.filter(contact => {
      const contactDate = new Date(contact.created_at);
      return contactDate >= dateRange.start && contactDate <= dateRange.end;
    });
  }, [contacts, filterType, getDateRange]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'new':
        return {
          label: '신규',
          iconName: 'spinner' as const,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        };
      case 'read':
        return {
          label: '작업중',
          iconName: 'eye' as const,
          color: 'text-[#ED6C00] dark:text-[#ED6C00]',
          bgColor: 'bg-[#ED6C00]/10 dark:bg-[#ED6C00]/20',
        };
      case 'in_progress':
        return {
          label: '작업중',
          iconName: 'eye' as const,
          color: 'text-[#ED6C00] dark:text-[#ED6C00]',
          bgColor: 'bg-[#ED6C00]/10 dark:bg-[#ED6C00]/20',
        };
      case 'revision_in_progress':
        return {
          label: '수정작업중',
          iconName: 'eye' as const,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        };
      case 'on_hold':
        return {
          label: '보류',
          iconName: 'fileAlt' as const,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-700',
        };
      case 'replied':
        return {
          label: '답변완료',
          iconName: 'checkCircle' as const,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
        };
      case 'completed':
        return {
          label: '납품완료',
          iconName: 'checkCircle' as const,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
        };
      default:
        return {
          label: status,
          iconName: 'fileAlt' as const,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-700',
        };
    }
  };

  // 문의사항 데이터 새로고침 함수
  const refreshContacts = useCallback(async () => {
    if (isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    try {
      const supabase = createSupabaseClient();
      const { data: contactsData, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('company_name', initialCompany.company_name)
        .neq('status', 'deleting')
        .order('created_at', { ascending: false });

      if (!error && contactsData) {
        setContacts(contactsData as Contact[]);
      } else if (error) {
        console.error('Error refreshing contacts:', error);
      }
    } catch (error) {
      console.error('Error refreshing contacts:', error);
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [initialCompany.company_name]);

  // Supabase Realtime 구독 설정
  useEffect(() => {
    const supabase = createSupabaseClient();
    const companyName = initialCompany.company_name;
    
    // contacts 테이블 변경사항 구독
    // 문자열 필터는 따옴표로 감싸야 함
    const channel = supabase
      .channel(`contacts-changes-${companyName}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE 모두 감지
          schema: 'public',
          table: 'contacts',
          filter: `company_name=eq."${companyName}"`,
        },
        (payload) => {
          console.log('Contacts table changed:', payload);
          
          // 데이터 새로고침
          refreshContacts();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to contacts changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error, falling back to polling');
        }
      });

    // 주기적 폴링 (Realtime이 작동하지 않을 경우를 대비)
    // Realtime이 작동하면 이 폴링은 백업 역할만 함
    const pollInterval = setInterval(() => {
      refreshContacts();
    }, 30000); // 30초마다 폴링

    // 정리 함수
    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [initialCompany.company_name, refreshContacts]);

  // 통계 계산 (필터링된 데이터 기준)
  const stats = useMemo(() => ({
    total: filteredContacts.length,
    new: filteredContacts.filter(c => c.status === 'new').length,
    inProgress: filteredContacts.filter(c => 
      c.status === 'read' || 
      c.status === 'in_progress' || 
      c.status === 'revision_in_progress'
    ).length,
    completed: filteredContacts.filter(c => c.status === 'replied' || c.status === 'completed').length,
  }), [filteredContacts]);

  // 필터 옵션
  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'this_week', label: '이번 주' },
    { value: 'this_month', label: '이번 달' },
    { value: 'last_week', label: '지난 주' },
    { value: 'last_month', label: '지난 달' },
  ];

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">진행상황</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {initialCompany.company_name}의 문의 및 주문 진행상황을 확인하실 수 있습니다.
            {isRefreshing && (
              <span className="ml-2 text-xs text-gray-500">업데이트 중...</span>
            )}
          </p>
        </div>
        <Link
          href="/contact"
          className={`${BUTTON_STYLES.primary} flex items-center gap-2`}
        >
          <FaEnvelope className="text-sm" />
          <span>견적 / 문의하기</span>
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-blue-500 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">전체 문의</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
            <div className="bg-blue-500 p-2.5 rounded-full">
              <FaFileAlt className="text-white text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-yellow-500 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">신규 문의</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.new}</p>
            </div>
            <div className="bg-yellow-500 p-2.5 rounded-full">
              <FaSpinner className="text-white text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-orange-500 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">작업중</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.inProgress}</p>
            </div>
            <div className="bg-orange-500 p-2.5 rounded-full">
              <FaEye className="text-white text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-green-500 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">완료</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completed}</p>
            </div>
            <div className="bg-green-500 p-2.5 rounded-full">
              <FaCheckCircle className="text-white text-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* 진행상황 목록 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">문의 진행상황</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterType(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterType === option.value
                    ? 'bg-[#ED6C00] text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        {filterType !== 'all' && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <FaCalendarAlt />
              <span>
                {filterType === 'this_week' && '이번 주 (월요일 ~ 일요일)'}
                {filterType === 'this_month' && '이번 달 (1일 ~ 말일)'}
                {filterType === 'last_week' && '지난 주 (월요일 ~ 일요일)'}
                {filterType === 'last_month' && '지난 달 (1일 ~ 말일)'}
              </span>
              <span className="ml-2 font-medium">
                ({filteredContacts.length}건)
              </span>
            </div>
          </div>
        )}
        
        {filteredContacts.length > 0 ? (
          <div className="space-y-4">
            {filteredContacts.map((contact) => {
              const statusInfo = getStatusInfo(contact.status);
              
              return (
                <ContactCardToggle
                  key={contact.id}
                  contact={contact}
                  statusInfo={statusInfo}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaFileAlt className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {filterType === 'all' 
                ? '진행중인 문의가 없습니다' 
                : '선택한 기간에 해당하는 문의가 없습니다'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

