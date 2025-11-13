import { createSupabaseServerClient } from '@/lib/supabase/server';
import { verifySession, getSessionUser } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

// 납품업체 목록 조회
export async function GET() {
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

    const supabase = await createSupabaseServerClient();

    // 업체의 납품업체 목록 조회
    const { data: deliveryCompanies, error } = await supabase
      .from('delivery_companies')
      .select('*')
      .eq('company_id', user.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching delivery companies:', error);
      return NextResponse.json(
        { error: '납품업체 목록을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ deliveryCompanies: deliveryCompanies || [] });
  } catch (error) {
    console.error('Error in GET /api/company/delivery-companies:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 납품업체 추가
export async function POST(request: NextRequest) {
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

    // 납품업체 추가
    const { data: newDeliveryCompany, error } = await supabase
      .from('delivery_companies')
      .insert({
        company_id: user.userId,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating delivery company:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      
      // 테이블이 없는 경우
      if (error.message && (error.message.includes('relation') || error.message.includes('does not exist') || error.code === '42P01')) {
        return NextResponse.json(
          { 
            error: '납품업체 테이블이 존재하지 않습니다. Supabase SQL Editor에서 create_delivery_companies_table.sql을 실행해주세요.',
            details: error.message 
          },
          { status: 500 }
        );
      }
      
      // RLS 정책 문제
      if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
        return NextResponse.json(
          { 
            error: 'RLS 정책 문제입니다. Supabase에서 RLS 정책을 확인해주세요.',
            details: error.message 
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: '납품업체 추가에 실패했습니다.',
          details: error.message || '알 수 없는 오류'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      deliveryCompany: newDeliveryCompany 
    });
  } catch (error) {
    console.error('Error in POST /api/company/delivery-companies:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

