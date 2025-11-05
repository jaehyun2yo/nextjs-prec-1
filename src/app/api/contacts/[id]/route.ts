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

    // 문의 조회
    const { data: contact, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
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

    // 문의 삭제
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[DELETE CONTACT] Error:', error);
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
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

