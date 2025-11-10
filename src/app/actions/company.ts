'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { verifySession, getSessionUser } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/security';
import { uploadFileToR2 } from '@/lib/utils/fileUpload';
import { revalidatePath } from 'next/cache';

export async function updateCompanyProfile(formData: FormData) {
  try {
    // 세션 확인
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return { success: false, error: '인증이 필요합니다.' };
    }

    const user = await getSessionUser();
    if (!user?.userId || user?.userType !== 'company') {
      return { success: false, error: '권한이 없습니다.' };
    }

    const supabase = await createSupabaseServerClient();

    // 업체 정보 가져오기
    const { data: currentCompany, error: fetchError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', user.userId)
      .single();

    if (fetchError || !currentCompany) {
      return { success: false, error: '업체 정보를 찾을 수 없습니다.' };
    }

    // 폼 데이터 추출
    const companyName = String(formData.get('company_name') || '').trim();
    const businessRegistrationNumber = String(formData.get('business_registration_number') || '').trim();
    const representativeName = String(formData.get('representative_name') || '').trim();
    const businessType = String(formData.get('business_type') || '').trim();
    const businessCategory = String(formData.get('business_category') || '').trim();
    const businessAddress = String(formData.get('business_address') || '').trim();
    const businessRegistrationFile = formData.get('business_registration_file') as File | null;

    const managerName = String(formData.get('manager_name') || '').trim();
    const managerPosition = String(formData.get('manager_position') || '').trim();
    const managerPhone = String(formData.get('manager_phone') || '').trim();
    const managerEmail = String(formData.get('manager_email') || '').trim();

    const accountantName = String(formData.get('accountant_name') || '').trim();
    const accountantPhone = String(formData.get('accountant_phone') || '').trim();
    const accountantEmail = String(formData.get('accountant_email') || '').trim();
    const accountantFax = String(formData.get('accountant_fax') || '').trim();

    const quoteMethod = String(formData.get('quote_method') || '').trim();
    const quoteMethodEmail = quoteMethod === 'email';
    const quoteMethodFax = quoteMethod === 'fax';
    const quoteMethodSms = quoteMethod === 'sms';

    const newPassword = String(formData.get('new_password') || '').trim();
    const newPasswordConfirm = String(formData.get('new_password_confirm') || '').trim();

    // 필수 필드 검증
    if (!companyName || !businessRegistrationNumber || !representativeName || !businessAddress) {
      return { success: false, error: '필수 항목을 모두 입력해주세요.' };
    }

    if (!managerName || !managerPosition || !managerPhone || !managerEmail) {
      return { success: false, error: '실무담당자 정보를 모두 입력해주세요.' };
    }

    // 비밀번호 변경 검증
    if (newPassword || newPasswordConfirm) {
      if (newPassword !== newPasswordConfirm) {
        return { success: false, error: '비밀번호와 비밀번호 확인이 일치하지 않습니다.' };
      }
      if (newPassword.length < 8) {
        return { success: false, error: '비밀번호는 최소 8자 이상이어야 합니다.' };
      }
    }

    // 사업자등록번호 중복 확인 (본인 제외)
    if (businessRegistrationNumber !== currentCompany.business_registration_number) {
      const { data: existingBusinessNumber } = await supabase
        .from('companies')
        .select('id')
        .eq('business_registration_number', businessRegistrationNumber)
        .neq('id', user.userId)
        .single();

      if (existingBusinessNumber) {
        return { success: false, error: '이미 등록된 사업자등록번호입니다.' };
      }
    }

    // 사업자등록증 파일 업로드
    let businessRegistrationFileUrl = currentCompany.business_registration_file_url;
    let businessRegistrationFileName = currentCompany.business_registration_file_name;

    if (businessRegistrationFile && businessRegistrationFile.size > 0) {
      try {
        const result = await uploadFileToR2(businessRegistrationFile, 'companies');
        businessRegistrationFileUrl = result.url || null;
        businessRegistrationFileName = result.filename || businessRegistrationFile.name;
      } catch (error) {
        console.error('File upload error:', error);
        return { success: false, error: '파일 업로드에 실패했습니다.' };
      }
    }

    // 업데이트 데이터 준비
    const updateData: any = {
      company_name: companyName,
      business_registration_number: businessRegistrationNumber,
      representative_name: representativeName,
      business_type: businessType || null,
      business_category: businessCategory || null,
      business_address: businessAddress,
      business_registration_file_url: businessRegistrationFileUrl,
      business_registration_file_name: businessRegistrationFileName,
      manager_name: managerName,
      manager_position: managerPosition,
      manager_phone: managerPhone,
      manager_email: managerEmail,
      accountant_name: accountantName || null,
      accountant_phone: accountantPhone || null,
      accountant_email: accountantEmail || null,
      accountant_fax: accountantFax || null,
      quote_method_email: quoteMethodEmail,
      quote_method_fax: quoteMethodFax,
      quote_method_sms: quoteMethodSms,
      updated_at: new Date().toISOString(),
    };

    // 비밀번호 변경
    if (newPassword) {
      const passwordHash = await hashPassword(newPassword);
      updateData.password_hash = passwordHash;
    }

    // 데이터베이스 업데이트
    const { error: updateError } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', user.userId);

    if (updateError) {
      console.error('Error updating company profile:', updateError);
      return { success: false, error: '정보 수정에 실패했습니다.' };
    }

    // 페이지 캐시 무효화
    revalidatePath('/company/profile');
    revalidatePath('/company/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error in updateCompanyProfile:', error);
    return { success: false, error: '서버 오류가 발생했습니다.' };
  }
}

