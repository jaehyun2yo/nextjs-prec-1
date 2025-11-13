import { createSupabaseServerClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { uploadFileToR2 } from '@/lib/utils/fileUpload';
import type { RevisionRequestHistory } from '@/types/database.types';

export async function POST(
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
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const file = formData.get('file') as File | null;

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 파일 업로드 처리
    let fileUrl: string | null = null;
    let fileName: string | null = null;

    if (file && file.size > 0) {
      try {
        // 파일 크기 제한 (10MB)
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: '파일 크기는 10MB 이하여야 합니다.' },
            { status: 400 }
          );
        }

        const result = await uploadFileToR2(file, 'revision-requests');
        if (result.url) {
          fileUrl = result.url;
          fileName = result.filename || file.name;
        }
      } catch (error) {
        console.error('Error uploading revision request file:', error);
        // 파일 업로드 실패해도 수정요청은 저장
      }
    }

    const supabase = await createSupabaseServerClient();

    // 기존 수정요청 정보 가져오기 (히스토리에 추가하기 위해)
    const { data: currentContact } = await supabase
      .from('contacts')
      .select('revision_request_title, revision_request_content, revision_requested_at, revision_request_file_url, revision_request_file_name, revision_request_history')
      .eq('id', id)
      .single();

    // 기존 수정요청이 있으면 히스토리에 추가
    let history: RevisionRequestHistory = [];
    if (currentContact?.revision_request_history) {
      try {
        history = Array.isArray(currentContact.revision_request_history) 
          ? currentContact.revision_request_history 
          : JSON.parse(currentContact.revision_request_history as string);
      } catch {
        history = [];
      }
    }

    // 기존 수정요청이 있으면 히스토리에 추가
    if (currentContact?.revision_request_title && currentContact?.revision_requested_at) {
      history.push({
        title: currentContact.revision_request_title,
        content: currentContact.revision_request_content || '',
        requested_at: currentContact.revision_requested_at,
        file_url: currentContact.revision_request_file_url || null,
        file_name: currentContact.revision_request_file_name || null,
      });
    }

    // 수정요청 내용 저장 및 상태 변경
    const updateData: {
      revision_request_title: string;
      revision_request_content: string;
      revision_requested_at: string;
      status: string;
      updated_at: string;
      revision_request_file_url?: string | null;
      revision_request_file_name?: string | null;
      revision_request_history?: RevisionRequestHistory;
    } = {
      revision_request_title: title.trim(),
      revision_request_content: content.trim(),
      revision_requested_at: new Date().toISOString(),
      status: 'revision_in_progress',
      updated_at: new Date().toISOString(),
      revision_request_history: history,
    };

    if (fileUrl) {
      updateData.revision_request_file_url = fileUrl;
      updateData.revision_request_file_name = fileName;
    }

    const { error: updateError } = await supabase
      .from('contacts')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating revision request:', updateError);
      
      // 필드가 없는 경우를 대비해 status만 업데이트 시도
      const { error: statusError } = await supabase
        .from('contacts')
        .update({
          status: 'revision_in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (statusError) {
        return NextResponse.json(
          { error: '수정요청 제출에 실패했습니다. 필드가 없을 수 있습니다. SQL 스크립트를 실행해주세요.' },
          { status: 500 }
        );
      }
    }

    // 페이지 캐시 무효화
    revalidatePath('/company/dashboard');
    revalidatePath(`/admin/contacts/${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/contacts/[id]/revision-request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

