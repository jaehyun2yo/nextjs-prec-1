import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";

// GET: 문의 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 세션 확인
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    // 문의 조회 (삭제중이 아닌 것만)
    const { data: contact, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .neq('status', 'deleting')
      .single();

    if (error) {
      console.error('[GET CONTACT] Error:', error);
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    if (!contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error('[GET CONTACT] Exception:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: 문의 삭제
// - permanent=true: 영구 삭제 (실제 DB에서 삭제)
// - permanent 없음: status를 'deleting'으로 변경 (삭제중 상태)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 세션 확인
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    // 요청 본문 확인 (영구 삭제인지 확인)
    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const isPermanent = body.permanent === true;

    if (isPermanent) {
      // 영구 삭제: 실제 DB에서 삭제
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[PERMANENT DELETE CONTACT] Error:', error);
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: 500 }
        );
      }
    } else {
      // 삭제중 상태로 변경: status를 'deleting'으로, deleted_at 설정
      const { error } = await supabase
        .from('contacts')
        .update({ 
          status: 'deleting',
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .neq('status', 'deleting'); // 이미 삭제중인 것은 제외

      if (error) {
        console.error('[DELETE CONTACT] Error:', error);
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE CONTACT] Exception:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

