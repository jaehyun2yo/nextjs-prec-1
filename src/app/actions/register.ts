'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hashPassword } from '@/lib/auth/security';
import { uploadFileToR2 } from '@/lib/r2/upload';
import { redirect } from 'next/navigation';

export async function registerCompany(formData: FormData) {
  'use server';

  try {
    // 로그인 정보
    const username = String(formData.get('username') || '').trim();
    const password = String(formData.get('password') || '').trim();
    const passwordConfirm = String(formData.get('password_confirm') || '').trim();

    // 업체 정보
    const companyName = String(formData.get('company_name') || '').trim();
    const businessRegistrationNumber = String(formData.get('business_registration_number') || '').trim();
    const representativeName = String(formData.get('representative_name') || '').trim();
    const businessType = String(formData.get('business_type') || '').trim();
    const businessCategory = String(formData.get('business_category') || '').trim();
    const businessAddress = String(formData.get('business_address') || '').trim();
    const businessRegistrationFile = formData.get('business_registration_file') as File | null;

    // 실무담당자 정보
    const managerName = String(formData.get('manager_name') || '').trim();
    const managerPosition = String(formData.get('manager_position') || '').trim();
    const managerPhone = String(formData.get('manager_phone') || '').trim();
    const managerEmail = String(formData.get('manager_email') || '').trim();

    // 회계담당자 정보
    const accountantName = String(formData.get('accountant_name') || '').trim();
    const accountantPhone = String(formData.get('accountant_phone') || '').trim();
    const accountantEmail = String(formData.get('accountant_email') || '').trim();
    const accountantFax = String(formData.get('accountant_fax') || '').trim();

    // 견적서 제공받을 방법 (단일 선택)
    const quoteMethod = String(formData.get('quote_method') || '').trim();
    const quoteMethodEmail = quoteMethod === 'email';
    const quoteMethodFax = quoteMethod === 'fax';
    const quoteMethodSms = quoteMethod === 'sms';

    // 필수 필드 검증
    if (!username || !password || !passwordConfirm) {
      redirect('/register?error=missing_fields');
    }

    if (password !== passwordConfirm) {
      redirect('/register?error=password_mismatch');
    }

    if (password.length < 8) {
      redirect('/register?error=password_too_short');
    }

    if (!companyName || !businessRegistrationNumber || !representativeName || !businessAddress) {
      redirect('/register?error=missing_company_info');
    }

    if (!managerName || !managerPosition || !managerPhone || !managerEmail) {
      redirect('/register?error=missing_manager_info');
    }

    // 아이디 중복 확인
    const supabase = await createSupabaseServerClient();
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('username', username)
      .single();

    if (existingCompany) {
      redirect('/register?error=username_exists');
    }

    // 사업자등록번호 중복 확인
    const { data: existingBusinessNumber } = await supabase
      .from('companies')
      .select('id')
      .eq('business_registration_number', businessRegistrationNumber)
      .single();

    if (existingBusinessNumber) {
      redirect('/register?error=business_number_exists');
    }

    // 비밀번호 해싱
    const passwordHash = await hashPassword(password);

    // 사업자등록증 파일 업로드
    let businessRegistrationFileUrl: string | null = null;
    let businessRegistrationFileName: string | null = null;

    if (businessRegistrationFile && businessRegistrationFile.size > 0) {
      try {
        const { url } = await uploadFileToR2(businessRegistrationFile, 'companies');
        businessRegistrationFileUrl = url;
        businessRegistrationFileName = businessRegistrationFile.name;
      } catch (error) {
        console.error('File upload error:', error);
        redirect('/register?error=file_upload_failed');
      }
    }

    // 데이터베이스에 저장
    const insertData = {
      username,
      password_hash: passwordHash,
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
      status: 'pending', // 승인 대기 상태
    };

    console.log('[REGISTER] Inserting data:', JSON.stringify(insertData, null, 2));

    const { data, error: insertError } = await supabase
      .from('companies')
      .insert(insertData)
      .select();

    if (insertError) {
      console.error('[REGISTER] Database insert error:', insertError);
      console.error('[REGISTER] Error code:', insertError.code);
      console.error('[REGISTER] Error message:', insertError.message);
      console.error('[REGISTER] Error details:', insertError.details);
      console.error('[REGISTER] Error hint:', insertError.hint);
      
      // 컬럼이 없다는 에러인 경우
      if (insertError.message && (insertError.message.includes('column') || insertError.code === '42703' || insertError.code === 'PGRST204')) {
        console.error('[REGISTER] ⚠️⚠️⚠️ COLUMN ERROR: 테이블에 컬럼이 없습니다! ⚠️⚠️⚠️');
        console.error('[REGISTER] ⚠️ Supabase SQL Editor에서 supabase_companies_table.sql을 실행하세요.');
      }
      
      // RLS 정책 문제인 경우
      if (insertError.code === '42501' || insertError.message?.includes('permission') || insertError.message?.includes('policy')) {
        console.error('[REGISTER] ⚠️⚠️⚠️ RLS POLICY ERROR: RLS 정책 문제입니다! ⚠️⚠️⚠️');
        console.error('[REGISTER] ⚠️ Supabase SQL Editor에서 RLS 정책을 확인하세요.');
      }
      
      redirect('/register?error=database_error');
    }

    console.log('[REGISTER] Successfully inserted:', data);

    // 성공 시 로그인 페이지로 리디렉션
    redirect('/login?success=registered');
  } catch (error) {
    // Next.js의 redirect()는 NEXT_REDIRECT 에러를 throw하므로 다시 throw
    if (error instanceof Error && (error.message === "NEXT_REDIRECT" || (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))) {
      throw error;
    }
    
    console.error('[REGISTER] Registration error:', error);
    if (error instanceof Error) {
      console.error('[REGISTER] Error message:', error.message);
      console.error('[REGISTER] Error stack:', error.stack);
    }
    redirect('/register?error=server_error');
  }
}

export async function createTestAccount() {
  'use server';

  try {
    const supabase = await createSupabaseServerClient();
    
    // 테스트 계정 정보
    const testUsername = `test_${Date.now()}`;
    const testPassword = 'test1234';
    const passwordHash = await hashPassword(testPassword);

    // 아이디 중복 확인
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('username', testUsername)
      .single();

    if (existingCompany) {
      return { success: false };
    }

    // 테스트 계정 생성
    const testInsertData = {
      username: testUsername,
      password_hash: passwordHash,
      company_name: '테스트 업체',
      business_registration_number: `123-45-${Math.floor(Math.random() * 100000)}`,
      representative_name: '테스트 대표',
      business_type: '제조업',
      business_category: '포장재 제조',
      business_address: '서울시 강남구 테스트로 123',
      manager_name: '테스트 담당자',
      manager_position: '과장',
      manager_phone: '010-1234-5678',
      manager_email: `test${Date.now()}@example.com`,
      accountant_name: '테스트 회계',
      accountant_phone: '010-9876-5432',
      accountant_email: `accountant${Date.now()}@example.com`,
      accountant_fax: '02-1234-5678',
        quote_method_email: true,
        quote_method_fax: false,
        quote_method_sms: false,
      status: 'active', // 테스트 계정은 바로 활성화
    };

    console.log('[TEST_ACCOUNT] Inserting test account:', JSON.stringify(testInsertData, null, 2));

    const { data, error: insertError } = await supabase
      .from('companies')
      .insert(testInsertData)
      .select();

    if (insertError) {
      console.error('[TEST_ACCOUNT] Database insert error:', insertError);
      console.error('[TEST_ACCOUNT] Error code:', insertError.code);
      console.error('[TEST_ACCOUNT] Error message:', insertError.message);
      console.error('[TEST_ACCOUNT] Error details:', insertError.details);
      console.error('[TEST_ACCOUNT] Error hint:', insertError.hint);
      
      // 컬럼이 없다는 에러인 경우
      if (insertError.message && (insertError.message.includes('column') || insertError.code === '42703' || insertError.code === 'PGRST204')) {
        console.error('[TEST_ACCOUNT] ⚠️⚠️⚠️ COLUMN ERROR: 테이블에 컬럼이 없습니다! ⚠️⚠️⚠️');
        console.error('[TEST_ACCOUNT] ⚠️ Supabase SQL Editor에서 supabase_companies_table.sql을 실행하세요.');
      }
      
      // RLS 정책 문제인 경우
      if (insertError.code === '42501' || insertError.message?.includes('permission') || insertError.message?.includes('policy')) {
        console.error('[TEST_ACCOUNT] ⚠️⚠️⚠️ RLS POLICY ERROR: RLS 정책 문제입니다! ⚠️⚠️⚠️');
        console.error('[TEST_ACCOUNT] ⚠️ Supabase SQL Editor에서 RLS 정책을 확인하세요.');
      }
      
      return { success: false };
    }

    console.log('[TEST_ACCOUNT] Successfully created test account:', data);

    // 성공 시 테스트 계정 정보 반환 (모달 표시 후 리디렉션)
    return {
      success: true,
      username: testUsername,
      password: testPassword,
    };
  } catch (error) {
    // Next.js의 redirect()는 NEXT_REDIRECT 에러를 throw하므로 다시 throw
    if (error instanceof Error && (error.message === "NEXT_REDIRECT" || (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))) {
      throw error;
    }
    
    // 에러는 이미 위에서 처리됨
    return { success: false };
  }
}

