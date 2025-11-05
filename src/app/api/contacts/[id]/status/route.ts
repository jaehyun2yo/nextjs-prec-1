import { createSupabaseServerClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 세션 검증
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['new', 'read', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating contact status:', error);
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH /api/contacts/[id]/status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

