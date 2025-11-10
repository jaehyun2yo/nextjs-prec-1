import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

// POST: 문의 복원 (삭제중 상태에서 복원)
export async function POST(
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

    // 현재 문의 정보 가져오기 (이전 상태 확인)
    const { data: currentContact, error: fetchError } = await supabase
      .from('contacts')
      .select('status, deleted_at')
      .eq('id', id)
      .single();

    if (fetchError || !currentContact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    if (currentContact.status !== 'deleting') {
      return NextResponse.json(
        { error: "Contact is not in deleting status" },
        { status: 400 }
      );
    }

    // 복원: status를 'read'로 변경하고 deleted_at을 null로 설정
    // 삭제 전 상태를 알 수 없으므로 기본적으로 'read'로 복원
    const { error } = await supabase
      .from('contacts')
      .update({ 
        status: 'read',
        deleted_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('status', 'deleting'); // 삭제중 상태인 것만 복원 가능

    if (error) {
      console.error('[RESTORE CONTACT] Error:', error);
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    // 페이지 캐시 무효화
    revalidatePath('/admin/contacts');
    revalidatePath(`/admin/contacts/${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[RESTORE CONTACT] Exception:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

