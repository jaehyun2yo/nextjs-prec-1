'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';
import type { ProcessStage } from '@/lib/utils/processStages';

const contactsLogger = logger.createLogger('CONTACTS_ACTIONS');

/**
 * 공정 단계 업데이트
 */
export async function updateProcessStage(contactId: number, processStage: ProcessStage) {
  'use server';

  try {
    const supabase = await createSupabaseServerClient();
    
    // 현재 문의 정보 가져오기
    const { data: currentContact, error: fetchError } = await supabase
      .from('contacts')
      .select('status, process_stage')
      .eq('id', contactId)
      .single();

    if (fetchError) {
      contactsLogger.error('Failed to fetch current contact', fetchError);
      return { success: false, error: fetchError.message };
    }

    // 상태 자동 업데이트 로직
    let newStatus = currentContact.status;
    
    // 납품(delivery) 단계가 완료되면 상태를 'completed'(납품완료)로 변경
    if (processStage === 'delivery') {
      newStatus = 'completed';
    }
    // 작업현황을 업데이트하면 상태를 'in_progress'(작업중)로 변경
    else if (processStage !== null) {
      // 납품 단계가 아니고, 공정 단계가 설정되거나 변경되는 경우
      // 읽음, 보류, 수정작업중 상태에서 공정 단계를 업데이트하면 작업중으로 변경
      if (currentContact.status === 'read' || 
          currentContact.status === 'on_hold' || 
          currentContact.status === 'revision_in_progress') {
        newStatus = 'in_progress';
      }
      // 이미 작업중이거나 다른 상태면 작업중으로 유지/변경 (납품완료 제외)
      else if (currentContact.status !== 'completed') {
        newStatus = 'in_progress';
      }
    }

    const updateData: { process_stage: ProcessStage; updated_at: string; status: string } = {
      process_stage: processStage,
      updated_at: new Date().toISOString(),
      status: newStatus, // 항상 상태를 업데이트
    };
    
    const { error } = await supabase
      .from('contacts')
      .update(updateData)
      .eq('id', contactId);

    if (error) {
      contactsLogger.error('Failed to update process stage', error);
      return { success: false, error: error.message };
    }

    // 페이지 캐시 무효화
    revalidatePath('/admin/contacts');
    revalidatePath(`/admin/contacts/${contactId}`);
    revalidatePath('/company/dashboard');

    contactsLogger.debug('Process stage updated successfully', { contactId, processStage, newStatus });
    return { success: true };
  } catch (error) {
    contactsLogger.error('Exception updating process stage', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
    };
  }
}

