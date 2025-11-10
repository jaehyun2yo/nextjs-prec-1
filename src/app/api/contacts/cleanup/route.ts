import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST: 10일 이상 된 삭제된 문의사항 영구 삭제
// 이 API는 cron job이나 스케줄러에서 주기적으로 호출되어야 합니다
export async function POST(request: NextRequest) {
  try {
    // API 키 확인 (보안을 위해)
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.CLEANUP_API_KEY;
    
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // 10일 전 날짜 계산
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const tenDaysAgoISO = tenDaysAgo.toISOString();

    // 10일 이상 된 삭제된 문의사항 조회
    const { data: contactsToDelete, error: fetchError } = await supabase
      .from('contacts')
      .select('id')
      .not('deleted_at', 'is', null)
      .lte('deleted_at', tenDaysAgoISO);

    if (fetchError) {
      console.error('[CLEANUP] Error fetching contacts to delete:', fetchError);
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    if (!contactsToDelete || contactsToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        deletedCount: 0,
        message: '삭제할 문의사항이 없습니다.',
      });
    }

    // 영구 삭제
    const idsToDelete = contactsToDelete.map(c => c.id);
    const { error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error('[CLEANUP] Error deleting contacts:', deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    console.log(`[CLEANUP] Permanently deleted ${idsToDelete.length} contacts`);

    return NextResponse.json({
      success: true,
      deletedCount: idsToDelete.length,
      message: `${idsToDelete.length}개의 문의사항이 영구 삭제되었습니다.`,
    });
  } catch (error) {
    console.error('[CLEANUP] Exception:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

