import { createSupabaseServerClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { toApiErrorResponse, convertSupabaseError, AuthenticationError, ValidationError } from '@/lib/utils/errors';

const statusApiLogger = logger.createLogger('STATUS_API');

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 세션 검증
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      const errorResponse = toApiErrorResponse(new AuthenticationError());
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['new', 'read', 'in_progress', 'revision_in_progress', 'completed', 'on_hold', 'replied', 'deleting'].includes(status)) {
      const errorResponse = toApiErrorResponse(new ValidationError('유효하지 않은 상태 값입니다.'));
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', id);

    if (error) {
      statusApiLogger.error('Error updating contact status', error, { contactId: id, status });
      const dbError = convertSupabaseError(error);
      const errorResponse = toApiErrorResponse(dbError);
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    statusApiLogger.error('Exception in PATCH contact status', error);
    const errorResponse = toApiErrorResponse(error);
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
}

