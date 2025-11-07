import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UpdateStatusButton } from "./update-status-button";
import { DeleteButton } from "./delete-button";
import { ConfirmButton } from "./confirm-button";
import { UpdateProcessStageButton } from "./update-process-stage-button";
import { ProcessStageIndicator } from "@/components/ProcessStageIndicator";
import type { ProcessStage } from "@/lib/utils/processStages";

interface Contact {
  id: number;
  company_name: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  contact_type?: string | null;
  service_mold_request?: boolean | null;
  service_delivery_brokerage?: boolean | null;
  drawing_type: string | null;
  has_physical_sample: boolean | null;
  has_reference_photos: boolean | null;
  drawing_modification: string | null;
  box_shape: string | null;
  length: string | null;
  width: string | null;
  height: string | null;
  material: string | null;
  drawing_notes: string | null;
  sample_notes: string | null;
  receipt_method: string | null;
  visit_date: string | null;
  visit_time_slot: string | null;
  delivery_type: string | null;
  delivery_address: string | null;
  delivery_name: string | null;
  delivery_phone: string | null;
  attachment_filename: string | null;
  attachment_url: string | null;
  drawing_file_url: string | null;
  drawing_file_name: string | null;
  reference_photos_urls: string | null;
  status: string;
  process_stage: ProcessStage;
  created_at: string;
  updated_at: string;
}

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !contact) {
    notFound();
  }

  const contactData = contact as Contact;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/admin/contacts"
            className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 mb-2 inline-block"
          >
            ← 목록으로
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">문의 상세보기</h1>
        </div>
        <div className="flex gap-3 items-center">
          <UpdateStatusButton contactId={contactData.id} currentStatus={contactData.status} />
          <DeleteButton 
            contactId={contactData.id} 
            contactName={contactData.company_name || contactData.name || `문의 #${contactData.id}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 내용 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 연락처 정보 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              연락처 정보
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">문의 유형</label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {contactData.contact_type === 'individual' ? '개인' : '업체'}
                </p>
              </div>
              {contactData.contact_type === 'individual' && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">서비스 유형</label>
                  <div className="mt-1 space-y-1">
                    {contactData.service_mold_request && (
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded mr-2">
                        목형 제작 의뢰
                      </span>
                    )}
                    {contactData.service_delivery_brokerage && (
                      <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                        납품까지 중개
                      </span>
                    )}
                    {!contactData.service_mold_request && !contactData.service_delivery_brokerage && (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {contactData.contact_type === 'individual' ? '이름' : '업체명'}
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">{contactData.company_name}</p>
                </div>
                {contactData.contact_type === 'company' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">담당자명</label>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">{contactData.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">직책</label>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">{contactData.position}</p>
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">연락처</label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">
                    <a href={`tel:${contactData.phone}`} className="text-orange-600 hover:underline">
                      {contactData.phone}
                    </a>
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">이메일</label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">
                    <a href={`mailto:${contactData.email}`} className="text-orange-600 hover:underline">
                      {contactData.email}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 도면 및 샘플 정보 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              도면 및 샘플 정보
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">도면 상태</label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {contactData.drawing_type === 'create' 
                    ? '도면 제작이 필요합니다' 
                    : contactData.drawing_type === 'have' 
                    ? '도면을 가지고 있습니다' 
                    : '-'}
                </p>
              </div>

              {contactData.drawing_type === 'create' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">실물 샘플</label>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">
                      {contactData.has_physical_sample ? '있음' : '없음'}
                    </p>
                  </div>
                  {contactData.has_physical_sample && contactData.sample_notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">샘플 특이사항</label>
                      <p className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        {contactData.sample_notes}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">제작 자료</label>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">
                      {contactData.has_reference_photos ? '있음' : '없음'}
                    </p>
                  </div>
                </>
              )}

              {contactData.drawing_type === 'have' && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">도면 수정</label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">
                    {contactData.drawing_modification === 'needed'
                      ? '도면의 수정이 필요합니다'
                      : contactData.drawing_modification === 'not_needed'
                      ? '도면의 수정이 필요없습니다'
                      : '-'}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">박스 형태</label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">{contactData.box_shape || '-'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">크기 (장×폭×고)</label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {contactData.length || '-'} mm × {contactData.width || '-'} mm × {contactData.height || '-'} mm
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">재질</label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">{contactData.material || '-'}</p>
              </div>

              {contactData.drawing_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">도면 및 샘플 제작 시 유의사항</label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {contactData.drawing_notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 일정 조율 정보 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              일정 조율 정보
            </h2>
            <div className="space-y-4">
              {contactData.receipt_method ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">수령 방법</label>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">
                      {contactData.receipt_method === 'visit' 
                        ? '방문 수령' 
                        : contactData.receipt_method === 'delivery' 
                        ? '택배 및 퀵으로 수령' 
                        : contactData.receipt_method || '-'}
                    </p>
                  </div>

                  {contactData.receipt_method === 'visit' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">방문 날짜</label>
                        <p className="mt-1 text-gray-900 dark:text-gray-100">{contactData.visit_date || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">방문 시간</label>
                        <p className="mt-1 text-gray-900 dark:text-gray-100">{contactData.visit_time_slot || '-'}</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>회사위치:</strong> 서울 중구 퇴계로39길 20, 2층 유진레이져목형 사무실
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          (평일 9:00 ~ 19:00 주말 및 공휴일 휴무)
                        </p>
                      </div>
                    </>
                  )}

                  {contactData.receipt_method === 'delivery' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">배송 방법</label>
                        <p className="mt-1 text-gray-900 dark:text-gray-100">
                          {contactData.delivery_type === 'parcel' ? '택배' : contactData.delivery_type === 'quick' ? '퀵' : '-'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">배송 주소</label>
                        <p className="mt-1 text-gray-900 dark:text-gray-100">{contactData.delivery_address || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">수령인</label>
                        <p className="mt-1 text-gray-900 dark:text-gray-100">{contactData.delivery_name || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">수령인 연락처</label>
                        <p className="mt-1 text-gray-900 dark:text-gray-100">
                          {contactData.delivery_phone ? (
                            <a href={`tel:${contactData.delivery_phone}`} className="text-orange-600 hover:underline">
                              {contactData.delivery_phone}
                            </a>
                          ) : '-'}
                        </p>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">입력된 정보가 없습니다.</p>
              )}
            </div>
          </div>

          {/* 첨부 파일 */}
          {(contactData.attachment_url || contactData.attachment_filename || 
            contactData.drawing_file_url || contactData.drawing_file_name || 
            contactData.reference_photos_urls) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                첨부 파일
              </h2>
              <div className="space-y-4">
                {(contactData.attachment_filename || contactData.attachment_url) && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">첨부 파일</label>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 dark:text-gray-100 text-sm flex-1 truncate mr-2">
                        {contactData.attachment_filename || '파일명 없음'}
                      </p>
                      {contactData.attachment_url && (
                        <a
                          href={contactData.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={contactData.attachment_filename || undefined}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap"
                        >
                          📥 다운로드
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                {(contactData.drawing_file_name || contactData.drawing_file_url) && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">도면 파일</label>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 dark:text-gray-100 text-sm flex-1 truncate mr-2">
                        {contactData.drawing_file_name || '파일명 없음'}
                      </p>
                      {contactData.drawing_file_url && (
                        <a
                          href={contactData.drawing_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={contactData.drawing_file_name || undefined}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap"
                        >
                          📥 다운로드
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                {contactData.reference_photos_urls && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-3">참고 사진</label>
                    <div className="space-y-2">
                      {(() => {
                        try {
                          const urls = JSON.parse(contactData.reference_photos_urls) as string[];
                          if (urls.length === 0) return null;
                          return urls.map((url, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
                              <span className="text-gray-900 dark:text-gray-100 text-sm">사진 {idx + 1}</span>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={`reference-photo-${idx + 1}.jpg`}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors duration-200"
                              >
                                📥 다운로드
                              </a>
                            </div>
                          ));
                        } catch {
                          return <p className="text-gray-500 dark:text-gray-400 text-sm">파일 정보를 불러올 수 없습니다.</p>;
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 사이드바 정보 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">상태 정보</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">상태</label>
                <p className="mt-1">
                  <span
                    className={`px-3 py-1 text-sm rounded ${
                      contactData.status === 'new'
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : contactData.status === 'read'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : contactData.status === 'in_progress'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        : contactData.status === 'revision_in_progress'
                        ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                        : contactData.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : contactData.status === 'on_hold'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {contactData.status === 'new' ? '신규' 
                      : contactData.status === 'read' ? '읽음'
                      : contactData.status === 'in_progress' ? '작업중'
                      : contactData.status === 'revision_in_progress' ? '수정작업중'
                      : contactData.status === 'completed' ? '납품완료'
                      : contactData.status === 'on_hold' ? '보류'
                      : contactData.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">등록일</label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {new Date(contactData.created_at).toLocaleString('ko-KR')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">수정일</label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {new Date(contactData.updated_at).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
          </div>

          {/* 확인완료 버튼 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">확인 상태</h3>
            <ConfirmButton contactId={contactData.id} currentStatus={contactData.status} />
          </div>

          {/* 공정 단계 관리 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">공정 단계 관리</h3>
            <UpdateProcessStageButton 
              contactId={contactData.id} 
              currentStage={contactData.process_stage} 
              status={contactData.status}
            />
            <div className="mt-4">
              <ProcessStageIndicator 
                currentStage={contactData.process_stage} 
                status={contactData.status} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

