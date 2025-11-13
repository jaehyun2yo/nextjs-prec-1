import { createSupabaseServerClient } from '@/lib/supabase/server';
import { verifySession, getSessionUser } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

// 납품업체 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 세션 확인
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = await getSessionUser();
    if (!user?.userId || user?.userType !== 'company') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const deliveryCompanyId = parseInt(id, 10);

    if (isNaN(deliveryCompanyId)) {
      return NextResponse.json(
        { error: '유효하지 않은 납품업체 ID입니다.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, phone, address } = body;

    // 필수 필드 검증
    if (!name || !phone || !address) {
      return NextResponse.json(
        { error: '납품업체명, 연락처, 주소를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // 납품업체 소유권 확인
    const { data: existingCompany, error: checkError } = await supabase
      .from('delivery_companies')
      .select('company_id')
      .eq('id', deliveryCompanyId)
      .single();

    if (checkError || !existingCompany) {
      return NextResponse.json(
        { error: '납품업체를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (existingCompany.company_id !== user.userId) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 납품업체 수정
    const { data: updatedCompany, error } = await supabase
      .from('delivery_companies')
      .update({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', deliveryCompanyId)
      .eq('company_id', user.userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating delivery company:', error);
      return NextResponse.json(
        { error: '납품업체 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      deliveryCompany: updatedCompany 
    });
  } catch (error) {
    console.error('Error in PATCH /api/company/delivery-companies/[id]:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 납품업체 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 세션 확인
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = await getSessionUser();
    if (!user?.userId || user?.userType !== 'company') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const deliveryCompanyId = parseInt(id, 10);

    if (isNaN(deliveryCompanyId)) {
      return NextResponse.json(
        { error: '유효하지 않은 납품업체 ID입니다.' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // 납품업체 소유권 확인
    const { data: existingCompany, error: checkError } = await supabase
      .from('delivery_companies')
      .select('company_id')
      .eq('id', deliveryCompanyId)
      .single();

    if (checkError || !existingCompany) {
      return NextResponse.json(
        { error: '납품업체를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (existingCompany.company_id !== user.userId) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 납품업체 삭제
    const { error } = await supabase
      .from('delivery_companies')
      .delete()
      .eq('id', deliveryCompanyId)
      .eq('company_id', user.userId);

    if (error) {
      console.error('Error deleting delivery company:', error);
      return NextResponse.json(
        { error: '납품업체 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/company/delivery-companies/[id]:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

