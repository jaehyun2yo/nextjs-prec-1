'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * 업체 상태 변경 서버 액션
 */
export async function updateCompanyStatus(companyId: number, status: 'active' | 'inactive' | 'pending') {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { error } = await supabase
      .from('companies')
      .update({ status })
      .eq('id', companyId);

    if (error) {
      console.error('Error updating company status:', error);
      return { success: false, error: error.message };
    }

    // 페이지 캐시 무효화
    revalidatePath('/admin/companies');
    revalidatePath(`/admin/companies/${companyId}`);

    return { success: true };
  } catch (error) {
    console.error('Update company status error:', error);
    return { success: false, error: '서버 오류가 발생했습니다.' };
  }
}





