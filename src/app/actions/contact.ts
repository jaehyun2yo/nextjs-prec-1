'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import nodemailer from 'nodemailer';
import { uploadBufferToR2 } from '@/lib/r2/upload';

interface ContactFormData {
  company_name: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  referral_source?: string;
  // 도면 및 샘플
  drawing_type?: string;
  has_physical_sample?: boolean;
  has_reference_photos?: boolean;
  drawing_modification?: string;
  box_shape?: string;
  length?: string;
  width?: string;
  height?: string;
  material?: string;
  drawing_notes?: string;
  sample_notes?: string;
  // 일정 조율
  receipt_method?: string;
  visit_date?: string;
  visit_time_slot?: string;
  delivery_type?: string;
  delivery_address?: string;
  delivery_name?: string;
  delivery_phone?: string;
  attachment?: File | null;
}

async function sendEmail(
  data: ContactFormData, 
  attachmentBuffer?: Buffer, 
  attachmentFilename?: string,
  attachmentUrl?: string,
  drawingFileUrl?: string,
  drawingFileName?: string,
  referencePhotosUrls?: string[]
) {
  // Gmail 중복 제거 문제 해결을 위한 이메일 처리 방식:
  // 1. from: SMTP 인증 계정과 동일하게 설정 (Gmail 중복 제거 방지)
  //    - Gmail은 SMTP 인증 계정과 받는 사람이 같으면 from이 달라도 중복 제거할 수 있음
  // 2. to: 관리자 이메일 주소 (ADMIN_EMAIL) - 실제 수신 주소
  // 3. replyTo: 회사 공식 이메일 (service@yjlaser.net) + 문의자 이메일
  //    - 관리자가 답장하면 Cloudflare Email Routing을 통해 처리되거나 문의자에게 직접 답장 가능
  // 
  // 참고: Cloudflare Email Routing은 외부에서 service@yjlaser.net으로 보낼 때만 포워딩되므로,
  // SMTP를 직접 사용할 때는 from을 SMTP 인증 계정과 동일하게 설정해야 Gmail이 정상적으로 수신함
  
  // 이메일 설정 확인
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER; // SMTP 인증 계정 (Gmail 등)
  const smtpPassword = process.env.SMTP_PASSWORD;
  
  // 이메일 주소 설정
  const fromName = process.env.FROM_NAME || '웹사이트 문의'; // 보낸 사람 이름
  const adminEmail = process.env.ADMIN_EMAIL || 'yjlaserbusiness@gmail.com'; // 관리자 수신 주소
  const replyToEmail = process.env.REPLY_TO_EMAIL || 'service@yjlaser.net'; // 답장 주소 (회사 공식 이메일)
  
  // ⚠️ Gmail 중복 제거 문제 해결
  // adminEmail이 service@yjlaser.net인 경우 문제:
  // 1. yjlaserbusiness@gmail.com에서 service@yjlaser.net으로 보냄
  // 2. Cloudflare가 service@yjlaser.net → yjlaserbusiness@gmail.com으로 포워딩
  // 3. 같은 계정에서 보낸 이메일이 다시 돌아옴 → Gmail이 중복 제거하여 수신 안됨
  // 
  // 해결: adminEmail을 직접 수신 주소(yjlaserbusiness@gmail.com)로 설정
  // 이렇게 하면 Cloudflare를 거치지 않고 직접 수신하므로 중복 제거 문제가 발생하지 않음
  let finalAdminEmail = adminEmail;
  if (adminEmail === 'service@yjlaser.net' && smtpUser) {
    console.error('[CONTACT] ❌ ERROR: ADMIN_EMAIL is set to service@yjlaser.net');
    console.error('[CONTACT] This causes Gmail deduplication: same account sends → Cloudflare forwards back → Gmail deduplicates');
    console.error('[CONTACT] 🔧 FIXING: Automatically using SMTP_USER as adminEmail to bypass Cloudflare routing');
    finalAdminEmail = smtpUser; // 자동으로 SMTP 인증 계정 사용
  } else if (adminEmail.includes('service@yjlaser.net')) {
    console.warn('[CONTACT] ⚠️ WARNING: ADMIN_EMAIL contains service@yjlaser.net');
    console.warn('[CONTACT] This may cause Gmail deduplication issues');
    console.warn('[CONTACT] Recommendation: Set ADMIN_EMAIL to yjlaserbusiness@gmail.com in .env.local');
  }
  
  // Gmail 중복 제거 방지: from을 SMTP 인증 계정과 동일하게 설정
  // 이렇게 하면 Gmail이 자가 메일로 인식하지 않음
  const fromEmail = smtpUser; // SMTP 인증 계정 사용

  console.log('[CONTACT] Email configuration check:', {
    smtpHost: smtpHost ? '[OK]' : '[MISSING]',
    smtpPort: smtpPort ? smtpPort : '[MISSING]',
    smtpUser: smtpUser ? '[OK]' : '[MISSING]',
    smtpPassword: smtpPassword ? '[OK]' : '[MISSING]',
    fromEmail,
    adminEmail: finalAdminEmail === adminEmail ? adminEmail : `${adminEmail} → ${finalAdminEmail} (auto-fixed)`,
    replyTo: `${replyToEmail}, ${data.email}`,
  });

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
    console.warn('[CONTACT] Email not configured. Skipping email send.');
    return { success: false, error: 'Email not configured' };
  }

  try {
    // Transporter 생성 (SMTP 인증용 계정 사용)
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: parseInt(smtpPort, 10) === 465, // 465 포트면 true, 그 외는 false
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // SMTP 연결 테스트
    await transporter.verify();
    console.log('[CONTACT] SMTP connection verified successfully');

    // 관리자에게 전송할 이메일 내용
    // from: SMTP 인증 계정 (Gmail 중복 제거 방지)
    // to: 관리자 이메일 주소 (실제 수신 주소)
    // replyTo: 회사 공식 이메일 + 문의자 이메일 (답장 시 선택 가능)
    const mailOptions: any = {
      from: `"${fromName}" <${fromEmail}>`, // SMTP 인증 계정으로 설정 (Gmail 중복 제거 방지)
      to: finalAdminEmail, // 관리자 이메일 주소 (직접 수신 주소 사용하여 Cloudflare 우회)
      replyTo: `${replyToEmail}, ${data.email}`, // 답장 주소: 회사 공식 이메일과 문의자 이메일
      subject: `[문의] ${data.company_name} - ${data.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ED6C00; border-bottom: 2px solid #ED6C00; padding-bottom: 10px;">
            새로운 문의가 접수되었습니다
          </h2>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0; margin-bottom: 15px;">연락처 정보</h3>
            <p><strong>업체명:</strong> ${data.company_name}</p>
            <p><strong>담당자명:</strong> ${data.name}</p>
            <p><strong>담당자 직책:</strong> ${data.position}</p>
            <p><strong>담당자 연락처:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>
            <p><strong>담당자 이메일:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            ${data.referral_source ? `<p><strong>유입경로:</strong> ${data.referral_source}</p>` : ''}
          </div>
          
          ${data.drawing_type ? `
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="color: #374151; margin-top: 0; margin-bottom: 15px;">도면 및 샘플 정보</h3>
            <p><strong>도면 상태:</strong> ${data.drawing_type === 'create' ? '도면 제작이 필요합니다' : '도면을 가지고 있습니다'}</p>
            ${data.drawing_type === 'create' ? `
              <p><strong>실물 샘플:</strong> ${data.has_physical_sample ? '있음' : '없음'}</p>
              <p><strong>제작 자료:</strong> ${data.has_reference_photos ? '있음' : '없음'}</p>
              ${data.sample_notes ? `<p style="margin-top: 10px; padding: 10px; background-color: #ffffff; border-radius: 4px;"><strong>샘플 특이사항:</strong><br>${data.sample_notes.replace(/\n/g, '<br>')}</p>` : ''}
            ` : ''}
            ${data.drawing_type === 'have' ? `
              <p><strong>도면 수정:</strong> ${data.drawing_modification === 'needed' ? '도면의 수정이 필요합니다' : data.drawing_modification === 'not_needed' ? '도면의 수정이 필요없습니다' : '-'}</p>
            ` : ''}
            ${data.box_shape ? `<p><strong>박스 형태:</strong> ${data.box_shape}</p>` : ''}
            ${data.length || data.width || data.height ? `
              <p><strong>크기:</strong> ${data.length || '-'} mm × ${data.width || '-'} mm × ${data.height || '-'} mm</p>
            ` : ''}
            ${data.material ? `<p><strong>재질:</strong> ${data.material}</p>` : ''}
            ${data.drawing_notes ? `<p style="margin-top: 10px; padding: 10px; background-color: #ffffff; border-radius: 4px;"><strong>도면 및 샘플 제작 시 유의사항:</strong><br>${data.drawing_notes.replace(/\n/g, '<br>')}</p>` : ''}
          </div>
          ` : ''}
          
          ${data.receipt_method ? `
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <h3 style="color: #374151; margin-top: 0; margin-bottom: 15px;">일정 조율 정보</h3>
            <p><strong>수령 방법:</strong> ${data.receipt_method === 'visit' ? '방문 수령' : '택배 및 퀵으로 수령'}</p>
            ${data.receipt_method === 'visit' ? `
              <p><strong>방문 날짜:</strong> ${data.visit_date || '-'}</p>
              <p><strong>방문 시간:</strong> ${data.visit_time_slot || '-'}</p>
              <p style="margin-top: 10px; font-size: 12px; color: #6b7280;">회사위치: 서울 중구 퇴계로39길 20, 2층 유진레이져목형 사무실<br>(평일 9:00 ~ 19:00 주말 및 공휴일 휴무)</p>
            ` : ''}
            ${data.receipt_method === 'delivery' ? `
              <p><strong>배송 방법:</strong> ${data.delivery_type === 'parcel' ? '택배' : data.delivery_type === 'quick' ? '퀵' : '-'}</p>
              <p><strong>배송 주소:</strong> ${data.delivery_address || '-'}</p>
              <p><strong>수령인:</strong> ${data.delivery_name || '-'}</p>
              <p><strong>수령인 연락처:</strong> ${data.delivery_phone || '-'}</p>
            ` : ''}
          </div>
          ` : ''}
          
          ${attachmentFilename ? `
          <div style="background-color: #fef3c7; padding: 15px; border: 1px solid #fbbf24; border-radius: 8px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0;"><strong>📎 첨부 파일:</strong> ${attachmentFilename}</p>
            ${attachmentUrl ? `<p style="color: #92400e; margin: 5px 0 0 0;"><a href="${attachmentUrl}" style="color: #ED6C00; text-decoration: underline;">다운로드 링크</a></p>` : ''}
          </div>
          ` : ''}
          ${drawingFileUrl && drawingFileName ? `
          <div style="background-color: #dbeafe; padding: 15px; border: 1px solid #3b82f6; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1e40af; margin: 0;"><strong>📐 도면 파일:</strong> ${drawingFileName}</p>
            <p style="color: #1e40af; margin: 5px 0 0 0;"><a href="${drawingFileUrl}" style="color: #ED6C00; text-decoration: underline;">다운로드 링크</a></p>
          </div>
          ` : ''}
          ${referencePhotosUrls && referencePhotosUrls.length > 0 ? `
          <div style="background-color: #f0fdf4; padding: 15px; border: 1px solid #22c55e; border-radius: 8px; margin: 20px 0;">
            <p style="color: #166534; margin: 0;"><strong>📷 참고 사진 (${referencePhotosUrls.length}개):</strong></p>
            <ul style="color: #166534; margin: 5px 0 0 0; padding-left: 20px;">
              ${referencePhotosUrls.map((url, idx) => `<li><a href="${url}" style="color: #ED6C00; text-decoration: underline;">사진 ${idx + 1} 다운로드</a></li>`).join('')}
            </ul>
          </div>
          ` : ''}
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>이 이메일은 웹사이트 문의 폼에서 자동으로 발송되었습니다.</p>
            <p style="margin-top: 8px;">답장하실 때는 담당자 이메일(<a href="mailto:${data.email}" style="color: #ED6C00;">${data.email}</a>)로 답장해주세요.</p>
          </div>
        </div>
      `,
      text: `
새로운 문의가 접수되었습니다

[연락처 정보]
업체명: ${data.company_name}
담당자명: ${data.name}
담당자 직책: ${data.position}
담당자 연락처: ${data.phone}
담당자 이메일: ${data.email}
${data.referral_source ? `유입경로: ${data.referral_source}` : ''}

${data.drawing_type ? `[도면 및 샘플 정보]
도면 상태: ${data.drawing_type === 'create' ? '도면 제작이 필요합니다' : '도면을 가지고 있습니다'}
${data.drawing_type === 'create' ? `
실물 샘플: ${data.has_physical_sample ? '있음' : '없음'}
제작 자료: ${data.has_reference_photos ? '있음' : '없음'}
${data.sample_notes ? `샘플 특이사항: ${data.sample_notes}` : ''}
` : ''}
${data.drawing_type === 'have' ? `
도면 수정: ${data.drawing_modification === 'needed' ? '도면의 수정이 필요합니다' : data.drawing_modification === 'not_needed' ? '도면의 수정이 필요없습니다' : '-'}
` : ''}
${data.box_shape ? `박스 형태: ${data.box_shape}` : ''}
${data.length || data.width || data.height ? `크기: ${data.length || '-'} mm × ${data.width || '-'} mm × ${data.height || '-'} mm` : ''}
${data.material ? `재질: ${data.material}` : ''}
${data.drawing_notes ? `도면 및 샘플 제작 시 유의사항: ${data.drawing_notes}` : ''}

` : ''}
${data.receipt_method ? `[일정 조율 정보]
수령 방법: ${data.receipt_method === 'visit' ? '방문 수령' : '택배 및 퀵으로 수령'}
${data.receipt_method === 'visit' ? `
방문 날짜: ${data.visit_date || '-'}
방문 시간: ${data.visit_time_slot || '-'}
회사위치: 서울 중구 퇴계로39길 20, 2층 유진레이져목형 사무실 (평일 9:00 ~ 19:00 주말 및 공휴일 휴무)
` : ''}
${data.receipt_method === 'delivery' ? `
배송 방법: ${data.delivery_type === 'parcel' ? '택배' : data.delivery_type === 'quick' ? '퀵' : '-'}
배송 주소: ${data.delivery_address || '-'}
수령인: ${data.delivery_name || '-'}
수령인 연락처: ${data.delivery_phone || '-'}
` : ''}

` : ''}
${attachmentFilename ? `[첨부 파일]
${attachmentFilename}
${attachmentUrl ? `다운로드 링크: ${attachmentUrl}` : ''}

` : ''}
${drawingFileUrl && drawingFileName ? `[도면 파일]
${drawingFileName}
다운로드 링크: ${drawingFileUrl}

` : ''}
${referencePhotosUrls && referencePhotosUrls.length > 0 ? `[참고 사진 (${referencePhotosUrls.length}개)]
${referencePhotosUrls.map((url, idx) => `사진 ${idx + 1}: ${url}`).join('\n')}

` : ''}
---
이 이메일은 웹사이트 문의 폼에서 자동으로 발송되었습니다.
답장하실 때는 담당자 이메일(${data.email})로 답장해주세요.
      `.trim(),
    };

    // 파일 첨부 처리
    if (attachmentBuffer && attachmentFilename) {
      mailOptions.attachments = [
        {
          filename: attachmentFilename,
          content: attachmentBuffer,
        },
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    // 로그 최소화
    // console.log('[CONTACT] ✅ Email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('[CONTACT] Email send error:', error);
    if (error instanceof Error) {
      console.error('[CONTACT] Error details:', {
        message: error.message,
        code: (error as any).code,
        command: (error as any).command,
        response: (error as any).response,
        responseCode: (error as any).responseCode,
      });
    }
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function submitContact(formData: FormData) {
  'use server';

  // 폼 데이터 추출 및 검증
  const contact_type = String(formData.get('contact_type') || 'company').trim();
  const service_mold_request = formData.get('service_mold_request') === '1' || formData.get('service_mold_request') === 'true';
  const service_delivery_brokerage = formData.get('service_delivery_brokerage') === '1' || formData.get('service_delivery_brokerage') === 'true';
  const company_name = String(formData.get('company_name') || '').trim();
  let name = String(formData.get('name') || '').trim();
  let position = String(formData.get('position') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const referral_source = String(formData.get('referral_source') || '').trim();
  
  // 도면 및 샘플 필드
  const drawing_type = String(formData.get('drawing_type') || '').trim();
  const has_physical_sample = formData.get('has_physical_sample') === 'true' || formData.get('has_physical_sample') === '1';
  const has_reference_photos = formData.get('has_reference_photos') === 'true' || formData.get('has_reference_photos') === '1';
  const drawing_modification = String(formData.get('drawing_modification') || '').trim();
  const box_shape = String(formData.get('box_shape') || '').trim();
  const length = String(formData.get('length') || '').trim();
  const width = String(formData.get('width') || '').trim();
  const height = String(formData.get('height') || '').trim();
  const material = String(formData.get('material') || '').trim();
  const drawing_notes = String(formData.get('drawing_notes') || '').trim();
  const sample_notes = String(formData.get('sample_notes') || '').trim();
  
  // 일정 조율 필드
  const receipt_method_raw = formData.get('receipt_method');
  const visit_date_raw = formData.get('visit_date');
  const visit_time_slot_raw = formData.get('visit_time_slot');
  const delivery_type_raw = formData.get('delivery_type');
  const delivery_address_raw = formData.get('delivery_address');
  const delivery_name_raw = formData.get('delivery_name');
  const delivery_phone_raw = formData.get('delivery_phone');
  
  // 빈 문자열이나 null을 null로 변환 (빈 문자열도 null로 처리)
  const receipt_method = (receipt_method_raw && String(receipt_method_raw).trim()) ? String(receipt_method_raw).trim() : null;
  const visit_date = visit_date_raw && String(visit_date_raw).trim() ? String(visit_date_raw).trim() : null;
  const visit_time_slot = visit_time_slot_raw && String(visit_time_slot_raw).trim() ? String(visit_time_slot_raw).trim() : null;
  const delivery_type = delivery_type_raw && String(delivery_type_raw).trim() ? String(delivery_type_raw).trim() : null;
  const delivery_address = delivery_address_raw && String(delivery_address_raw).trim() ? String(delivery_address_raw).trim() : null;
  const delivery_name = delivery_name_raw && String(delivery_name_raw).trim() ? String(delivery_name_raw).trim() : null;
  const delivery_phone = delivery_phone_raw && String(delivery_phone_raw).trim() ? String(delivery_phone_raw).trim() : null;
  
  // 로그 최소화 (필요시에만 주석 해제)
  // console.log('[CONTACT] 일정 조율 필드 추출:', { receipt_method, visit_date, visit_time_slot });
  
  // 파일 업로드 필드
  const attachment = formData.get('attachment') as File | null;
  const drawing_file = formData.get('drawing_file') as File | null;
  const reference_photos = formData.getAll('reference_photos') as File[];

  // 개인일 때는 name을 company_name과 동일하게 처리
  if (contact_type === 'individual') {
    name = company_name;
    if (!position || position === '') {
      position = '개인';
    }
  }

  // 필수 필드 검증
  // 개인일 때는 name과 position이 자동으로 설정되므로 company_name만 확인
  const isIndividual = contact_type === 'individual';
  if (!company_name || (!isIndividual && (!name || !position)) || !phone || !email) {
    redirect('/contact?error=invalid');
  }
  
  // 개인일 때는 name과 position을 다시 확인 (서버에서 설정한 값)
  if (isIndividual && (!name || !position)) {
    redirect('/contact?error=invalid');
  }

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    redirect('/contact?error=invalid_email');
  }

  // 파일 업로드 처리 (R2에 병렬 업로드)
  let attachmentUrl: string | undefined;
  let attachmentFilename: string | undefined;
  let drawingFileUrl: string | undefined;
  let drawingFileName: string | undefined;
  let referencePhotosUrls: string[] = [];
  
  // 기존 attachment 처리 (이메일 첨부용 - 이메일에는 여전히 첨부)
  let attachmentBuffer: Buffer | undefined;
  
  // 파일 크기 검증 (빠른 검증)
  if (attachment && attachment.size > 10 * 1024 * 1024) {
    return { success: false, error: '첨부 파일 크기가 너무 큽니다. (최대 10MB)' };
  }
  if (drawing_file && drawing_file.size > 50 * 1024 * 1024) {
    return { success: false, error: '도면 파일 크기가 너무 큽니다. (최대 50MB)' };
  }
  const oversizedPhoto = reference_photos.find(p => p && p.size > 10 * 1024 * 1024);
  if (oversizedPhoto) {
    return { success: false, error: '참고 사진 크기가 너무 큽니다. (최대 10MB)' };
  }
  
  // 파일 업로드 작업을 병렬로 처리
  const uploadPromises: Promise<void>[] = [];
  
  // Attachment 처리
  if (attachment && attachment.size > 0) {
    uploadPromises.push(
      (async () => {
        try {
          const bytes = await attachment.arrayBuffer();
          attachmentBuffer = Buffer.from(bytes);
          attachmentFilename = attachment.name;
          
          // R2에 업로드
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).slice(2, 10);
          const objectKey = `contacts/attachments/${timestamp}-${randomId}-${attachment.name}`;
          const { url } = await uploadBufferToR2(
            attachmentBuffer,
            attachment.type || 'application/octet-stream',
            objectKey
          );
          attachmentUrl = url;
        } catch (r2Error) {
          console.error('[CONTACT] R2 upload error for attachment:', r2Error);
          // R2 업로드 실패해도 계속 진행
        }
      })()
    );
  }

  // 도면 파일 업로드
  if (drawing_file && drawing_file.size > 0) {
    uploadPromises.push(
      (async () => {
        try {
          const bytes = await drawing_file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          drawingFileName = drawing_file.name;
          
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).slice(2, 10);
          const objectKey = `contacts/drawings/${timestamp}-${randomId}-${drawing_file.name}`;
          const { url } = await uploadBufferToR2(
            buffer,
            drawing_file.type || 'application/octet-stream',
            objectKey
          );
          drawingFileUrl = url;
        } catch (error) {
          console.error('[CONTACT] Drawing file upload error:', error);
          drawingFileName = drawing_file.name;
        }
      })()
    );
  }

  // 참고 사진 업로드 (병렬 처리)
  reference_photos.forEach((photo, index) => {
    if (photo && photo.size > 0) {
      uploadPromises.push(
        (async () => {
          try {
            const bytes = await photo.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).slice(2, 10);
            const objectKey = `contacts/reference-photos/${timestamp}-${randomId}-${index}-${photo.name}`;
            const { url } = await uploadBufferToR2(
              buffer,
              photo.type || 'image/jpeg',
              objectKey
            );
            referencePhotosUrls.push(url);
          } catch (error) {
            console.error('[CONTACT] Reference photo upload error:', error);
            // 하나 실패해도 계속 진행
          }
        })()
      );
    }
  });
  
  // 모든 파일 업로드를 병렬로 실행
  await Promise.all(uploadPromises);

  const contactData: ContactFormData = {
    company_name,
    name,
    position,
    phone,
    email,
    referral_source: referral_source || undefined,
    drawing_type: drawing_type || undefined,
    has_physical_sample: has_physical_sample || undefined,
    has_reference_photos: has_reference_photos || undefined,
    drawing_modification: drawing_modification || undefined,
    box_shape: box_shape || undefined,
    length: length || undefined,
    width: width || undefined,
    height: height || undefined,
    material: material || undefined,
    drawing_notes: drawing_notes || undefined,
    sample_notes: sample_notes || undefined,
    receipt_method: receipt_method || undefined,
    visit_date: visit_date || undefined,
    visit_time_slot: visit_time_slot || undefined,
    delivery_type: delivery_type || undefined,
    delivery_address: delivery_address || undefined,
    delivery_name: delivery_name || undefined,
    delivery_phone: delivery_phone || undefined,
    attachment,
  };

  try {
    // Supabase 연결 (테이블 체크 제거하여 성능 향상)
    const supabase = await createSupabaseServerClient();
    
    // 저장할 데이터 준비 (undefined 값 제거)
    const insertData: any = {
      company_name: contactData.company_name,
      name: contactData.name,
      position: contactData.position,
      phone: contactData.phone,
      email: contactData.email,
      referral_source: referral_source || null,
      // 연락처 정보 추가 필드
      contact_type: contact_type || null,
      service_mold_request: service_mold_request || false,
      service_delivery_brokerage: service_delivery_brokerage || false,
      // 도면 및 샘플
      drawing_type: contactData.drawing_type || null,
      has_physical_sample: contactData.has_physical_sample || false,
      has_reference_photos: contactData.has_reference_photos || false,
      drawing_modification: contactData.drawing_modification || null,
      box_shape: contactData.box_shape || null,
      length: contactData.length || null,
      width: contactData.width || null,
      height: contactData.height || null,
      material: contactData.material || null,
      drawing_notes: contactData.drawing_notes || null,
      sample_notes: contactData.sample_notes || null,
      // 일정 조율
      receipt_method: receipt_method || null,
      visit_date: visit_date || null,
      visit_time_slot: visit_time_slot || null,
      delivery_type: delivery_type || null,
      delivery_address: delivery_address || null,
      delivery_name: delivery_name || null,
      delivery_phone: delivery_phone || null,
      attachment_filename: attachmentFilename || null,
      attachment_url: attachmentUrl || null,
      drawing_file_url: drawingFileUrl || null,
      drawing_file_name: drawingFileName || null,
      reference_photos_urls: referencePhotosUrls.length > 0 ? JSON.stringify(referencePhotosUrls) : null,
      status: 'new',
    };

    // undefined 값 제거 (Supabase에서 undefined는 에러를 발생시킬 수 있음)
    Object.keys(insertData).forEach(key => {
      if (insertData[key] === undefined) {
        delete insertData[key];
      }
    });

    // 로그 최소화 (필요시에만 주석 해제)
    // console.log('[CONTACT] Inserting contact data...');
    
    const { data: insertResult, error: dbError } = await supabase
      .from('contacts')
      .insert(insertData)
      .select();

    // 로그 최소화

    if (dbError) {
      console.error('[CONTACT] ❌ Database insert error:', dbError);
      console.error('[CONTACT] Error details:', {
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        code: dbError.code,
      });
      console.error('[CONTACT] Insert data that failed (full):', JSON.stringify(insertData, null, 2));
      
      // 컬럼이 없다는 에러인 경우
      if (dbError.message && (dbError.message.includes('column') || dbError.code === '42703' || dbError.code === 'PGRST204')) {
        console.error('[CONTACT] ⚠️⚠️⚠️ COLUMN ERROR: 테이블에 컬럼이 없습니다! ⚠️⚠️⚠️');
        console.error('[CONTACT] ⚠️ Supabase SQL Editor에서 check_contacts_table_structure.sql을 실행하여 테이블 구조를 확인하세요.');
        console.error('[CONTACT] ⚠️ 그 다음 supabase_contacts_table_fix.sql 파일의 내용을 실행하세요.');
        console.error('[CONTACT] ⚠️ 에러된 컬럼:', dbError.message);
        console.error(`
-- 필수 컬럼 추가 SQL:
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS contact_type TEXT,
ADD COLUMN IF NOT EXISTS service_mold_request BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS service_delivery_brokerage BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS drawing_type TEXT,
ADD COLUMN IF NOT EXISTS has_physical_sample BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_reference_photos BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS drawing_modification TEXT,
ADD COLUMN IF NOT EXISTS box_shape TEXT,
ADD COLUMN IF NOT EXISTS length TEXT,
ADD COLUMN IF NOT EXISTS width TEXT,
ADD COLUMN IF NOT EXISTS height TEXT,
ADD COLUMN IF NOT EXISTS material TEXT,
ADD COLUMN IF NOT EXISTS drawing_notes TEXT,
ADD COLUMN IF NOT EXISTS sample_notes TEXT,
ADD COLUMN IF NOT EXISTS receipt_method TEXT,
ADD COLUMN IF NOT EXISTS visit_date TEXT,
ADD COLUMN IF NOT EXISTS visit_time_slot TEXT,
ADD COLUMN IF NOT EXISTS delivery_type TEXT,
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_name TEXT,
ADD COLUMN IF NOT EXISTS delivery_phone TEXT,
ADD COLUMN IF NOT EXISTS attachment_filename TEXT,
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS drawing_file_url TEXT,
ADD COLUMN IF NOT EXISTS drawing_file_name TEXT,
ADD COLUMN IF NOT EXISTS reference_photos_urls TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
        `);
      }
      
      // RLS 정책 문제인 경우
      if (dbError.message && (dbError.message.includes('permission') || dbError.message.includes('policy') || dbError.code === '42501')) {
        console.error('[CONTACT] ⚠️⚠️ PERMISSION ERROR: RLS 정책 문제일 수 있습니다!');
        console.error('[CONTACT] ⚠️ Supabase에서 RLS를 비활성화하거나 INSERT 정책을 추가하세요.');
        console.error(`
-- RLS 비활성화 (개발용):
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;

-- 또는 모든 작업을 허용하는 정책 생성:
-- ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations on contacts" ON public.contacts
--   FOR ALL USING (true) WITH CHECK (true);
        `);
      }
      // DB 저장 실패해도 이메일은 시도
    } else {
      // 로그 최소화 - 성공 시에만 간단히 로깅
      console.log('[CONTACT] ✅ Contact saved successfully');
    }

    // 이메일 전송 (비동기로 처리하여 응답 빠르게)
    // DB 저장이 성공하면 바로 성공 응답, 이메일은 백그라운드에서 처리
    const emailPromise = sendEmail(
      contactData, 
      attachmentBuffer, 
      attachmentFilename,
      attachmentUrl,
      drawingFileUrl,
      drawingFileName,
      referencePhotosUrls.length > 0 ? referencePhotosUrls : undefined
    ).catch((error) => {
      console.error('[CONTACT] Email send failed (non-blocking):', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    });

    // DB 저장 성공 여부에 따라 결과 반환
    if (dbError) {
      // DB 저장 실패 시 이메일 전송 결과도 확인
      const emailResult = await emailPromise;
      return { 
        success: false, 
        error: emailResult.success ? '데이터베이스 저장에 실패했습니다. 이메일은 전송되었습니다.' : '데이터베이스 저장에 실패했습니다.' 
      };
    }

    // DB 저장 성공 - 이메일은 백그라운드에서 처리하고 바로 성공 응답
    emailPromise.then((emailResult) => {
      if (!emailResult.success) {
        console.warn('[CONTACT] Email send failed but DB save succeeded:', emailResult.error);
      }
    });

    return { success: true };
  } catch (e: any) {
    console.error('[CONTACT] Exception:', e);
    return { 
      success: false, 
      error: e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.' 
    };
  }
}
