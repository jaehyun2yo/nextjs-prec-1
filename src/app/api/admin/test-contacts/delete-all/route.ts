import { createSupabaseServerClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function DELETE(request: NextRequest) {
  try {
    // 세션 확인
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // 테스트 문의 조회 (company_name이 '테스트 업체'로 시작하는 것들 - "신규 문의 50개 생성"으로 만든 것들)
    const { data: testContacts, error: fetchError } = await supabase
      .from('contacts')
      .select('id')
      .ilike('company_name', '테스트 업체%');

    if (fetchError) {
      console.error('Error fetching test contacts:', fetchError);
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    if (!testContacts || testContacts.length === 0) {
      return NextResponse.json({
        success: true,
        deletedCount: 0,
        message: '삭제할 테스트 문의가 없습니다.',
      });
    }

    const idsToDelete = testContacts.map(contact => contact.id);

    // 영구 삭제
    const { error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error('Error deleting test contacts:', deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    // 페이지 캐시 무효화
    revalidatePath('/admin/contacts');

    return NextResponse.json({
      success: true,
      deletedCount: idsToDelete.length,
      message: `${idsToDelete.length}개의 테스트 문의가 삭제되었습니다.`,
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/test-contacts/delete-all:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

