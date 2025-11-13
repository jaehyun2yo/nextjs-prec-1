import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { logger } from "@/lib/utils/logger";
import { toApiErrorResponse, convertSupabaseError, AuthenticationError, DatabaseError } from "@/lib/utils/errors";

const contactApiLogger = logger.createLogger('CONTACT_API');

/**
 * GET /api/contacts/[id]
 * 
 * 문의 상세 정보를 조회합니다.
 * 
 * @param request - Next.js 요청 객체
 * @param params - 라우트 파라미터 (id: 문의 ID)
 * @returns 문의 상세 정보 또는 에러 응답
 * 
 * @requires 인증 - 세션 쿠키 필요
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/contacts/123');
 * const contact = await response.json();
 * ```
 */
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
      contactApiLogger.error('Error fetching contact', error, { contactId: id });
      const dbError = convertSupabaseError(error);
      const errorResponse = toApiErrorResponse(dbError);
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
    }

    if (!contact) {
      const errorResponse = toApiErrorResponse(new DatabaseError('문의를 찾을 수 없습니다.', { contactId: id }));
      return NextResponse.json(errorResponse.body, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    contactApiLogger.error('Exception in GET contact', error);
    const errorResponse = toApiErrorResponse(error);
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
}

/**
 * DELETE /api/contacts/[id]
 * 
 * 문의를 삭제합니다.
 * 
 * @param request - Next.js 요청 객체 (body에 permanent 옵션 포함 가능)
 * @param params - 라우트 파라미터 (id: 문의 ID)
 * @returns 성공 여부 또는 에러 응답
 * 
 * @requires 인증 - 세션 쿠키 필요
 * 
 * @remarks
 * - permanent=true: 영구 삭제 (실제 DB에서 삭제)
 * - permanent 없음: status를 'deleting'으로 변경 (삭제중 상태, 10일 후 영구 삭제)
 * 
 * @example
 * ```typescript
 * // 소프트 삭제
 * await fetch('/api/contacts/123', { method: 'DELETE' });
 * 
 * // 영구 삭제
 * await fetch('/api/contacts/123', { 
 *   method: 'DELETE',
 *   body: JSON.stringify({ permanent: true })
 * });
 * ```
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 세션 확인
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      const errorResponse = toApiErrorResponse(new AuthenticationError());
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
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
        contactApiLogger.error('Error permanently deleting contact', error, { contactId: id });
        const dbError = convertSupabaseError(error);
        const errorResponse = toApiErrorResponse(dbError);
        return NextResponse.json(errorResponse.body, { status: errorResponse.status });
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
        contactApiLogger.error('Error deleting contact', error, { contactId: id });
        const dbError = convertSupabaseError(error);
        const errorResponse = toApiErrorResponse(dbError);
        return NextResponse.json(errorResponse.body, { status: errorResponse.status });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    contactApiLogger.error('Exception in DELETE contact', error);
    const errorResponse = toApiErrorResponse(error);
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
}

