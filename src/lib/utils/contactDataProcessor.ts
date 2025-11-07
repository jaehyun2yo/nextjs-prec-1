// Contact Form 데이터 처리 유틸리티

import type { ContactFormData } from '@/app/actions/contact';

export interface ProcessedContactData {
  inquiry_title: string;
  company_name: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  referral_source?: string | null;
  contact_type?: string | null;
  service_mold_request?: boolean;
  service_delivery_brokerage?: boolean;
  drawing_type?: string | null;
  has_physical_sample?: boolean;
  has_reference_photos?: boolean;
  drawing_modification?: string | null;
  box_shape?: string | null;
  length?: string | null;
  width?: string | null;
  height?: string | null;
  material?: string | null;
  drawing_notes?: string | null;
  sample_notes?: string | null;
  receipt_method?: string | null;
  visit_location?: string | null;
  visit_date?: string | null;
  visit_time_slot?: string | null;
  delivery_type?: string | null;
  delivery_address?: string | null;
  delivery_name?: string | null;
  delivery_phone?: string | null;
  attachment_filename?: string | null;
  attachment_url?: string | null;
  drawing_file_url?: string | null;
  drawing_file_name?: string | null;
  reference_photos_urls?: string | null;
  inquiry_number?: string | null;
  status?: string;
}

/**
 * FormData에서 문자열 필드 추출 (빈 문자열을 null로 변환)
 */
export function extractStringField(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (!value) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

/**
 * FormData에서 불린 필드 추출
 */
export function extractBooleanField(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === '1' || value === 'true';
}

/**
 * Contact Form 데이터를 데이터베이스 저장용 형식으로 변환
 */
export function prepareContactInsertData(
  contactData: ContactFormData,
  metadata: {
    contact_type: string;
    service_mold_request: boolean;
    service_delivery_brokerage: boolean;
    receipt_method?: string | null;
    visit_location?: string | null;
    visit_date?: string | null;
    visit_time_slot?: string | null;
    delivery_type?: string | null;
    delivery_address?: string | null;
    delivery_name?: string | null;
    delivery_phone?: string | null;
    attachmentFilename?: string | null;
    attachmentUrl?: string | null;
    drawingFileUrl?: string | null;
    drawingFileName?: string | null;
    referencePhotosUrls?: string[];
    inquiryNumber?: string | null;
  }
): ProcessedContactData {
  const insertData: ProcessedContactData = {
    inquiry_title: contactData.inquiry_title,
    company_name: contactData.company_name,
    name: contactData.name,
    position: contactData.position,
    phone: contactData.phone,
    email: contactData.email,
    referral_source: contactData.referral_source || null,
    contact_type: metadata.contact_type || null,
    service_mold_request: metadata.service_mold_request || false,
    service_delivery_brokerage: metadata.service_delivery_brokerage || false,
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
    receipt_method: metadata.receipt_method || null,
    visit_location: metadata.visit_location || null,
    visit_date: metadata.visit_date || null,
    visit_time_slot: metadata.visit_time_slot || null,
    delivery_type: metadata.delivery_type || null,
    delivery_address: metadata.delivery_address || null,
    delivery_name: metadata.delivery_name || null,
    delivery_phone: metadata.delivery_phone || null,
    attachment_filename: metadata.attachmentFilename || null,
    attachment_url: metadata.attachmentUrl || null,
    drawing_file_url: metadata.drawingFileUrl || null,
    drawing_file_name: metadata.drawingFileName || null,
    reference_photos_urls: metadata.referencePhotosUrls && metadata.referencePhotosUrls.length > 0 
      ? JSON.stringify(metadata.referencePhotosUrls) 
      : null,
    inquiry_number: metadata.inquiryNumber || null,
    status: 'new',
  };

  // undefined 값 제거
  Object.keys(insertData).forEach(key => {
    if (insertData[key as keyof ProcessedContactData] === undefined) {
      delete insertData[key as keyof ProcessedContactData];
    }
  });

  return insertData;
}

