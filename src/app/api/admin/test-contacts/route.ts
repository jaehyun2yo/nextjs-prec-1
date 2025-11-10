import { createSupabaseServerClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // 세션 확인 (관리자만)
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // 문의번호 생성 (YYMMDD-순번 형식)
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    
    // 오늘 날짜의 문의 개수 조회
    const { count } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .like('inquiry_number', `${datePrefix}-%`);
    
    const startSequence = (count || 0) + 1;

    // 50개의 테스트 문의 생성
    const testContacts = Array.from({ length: 50 }, (_, index) => {
      const sequenceNumber = startSequence + index;
      const inquiryNumber = `${datePrefix}-${sequenceNumber}`;
      const timestamp = Date.now() + index; // 각 문의마다 약간씩 다른 시간
      
      return {
        company_name: `테스트 업체 ${index + 1}`,
        name: `테스트 사용자 ${index + 1}`,
        position: '테스트 직책',
        phone: `010-${String(1000 + index).slice(-4)}-${String(5000 + index).slice(-4)}`,
        email: `test${index + 1}@example.com`,
        contact_type: 'inquiry',
        status: 'new',
        inquiry_title: `테스트 문의사항 ${index + 1}`,
        inquiry_number: inquiryNumber,
        created_at: new Date(timestamp).toISOString(),
        updated_at: new Date(timestamp).toISOString(),
      };
    });

    // 일괄 삽입
    const { data, error } = await supabase
      .from('contacts')
      .insert(testContacts)
      .select();

    if (error) {
      console.error('Error creating test contacts:', error);
      return NextResponse.json(
        { success: false, error: '테스트 문의사항 생성에 실패했습니다: ' + error.message },
        { status: 500 }
      );
    }

    // 페이지 캐시 무효화
    revalidatePath('/admin/contacts');

    return NextResponse.json({ 
      success: true, 
      count: data?.length || 0,
      message: `${data?.length || 0}개의 테스트 문의사항이 생성되었습니다.`
    });
  } catch (error) {
    console.error('Error in POST /api/admin/test-contacts:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

