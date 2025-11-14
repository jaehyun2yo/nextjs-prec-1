// src/app/(admin)/admin/portfolio/page.tsx

import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { transparentBlurDataURL } from '@/lib/images/placeholder';
import { logger } from '@/lib/utils/logger';
import { PortfolioForm } from '@/components/portfolio/PortfolioForm';
import { PortfolioDeleteButton } from '@/components/portfolio/PortfolioDeleteButton';

interface UploadedImage {
  original: string;
  thumbnail?: string;
  medium?: string;
}

interface PortfolioItem {
  id: string; // UUID
  title: string;
  field: string;
  purpose: string;
  type: string;
  format: string;
  size: string;
  paper: string;
  printing: string;
  finishing: string;
  description: string;
  images: string[] | UploadedImage[];
  created_at: string;
}

async function savePortfolio(formData: FormData): Promise<{ success: boolean; error?: string }> {
  'use server';
  const portfolioLogger = logger.createLogger('PORTFOLIO_ADMIN');
  // 간단 검증
  const required = [
    'title',
    'field',
    'purpose',
    'type',
    'format',
    'size',
    'paper',
    'printing',
    'finishing',
    'description',
  ];
  for (const key of required) {
    const v = formData.get(key);
    if (!v || String(v).trim() === '') {
      return { success: false, error: 'invalid' };
    }
  }

  // 이미지 업로드 (이미 API Route에서 업로드된 URL 사용)
  const uploadedImagesJson = formData.getAll('uploadedImages');
  const uploaded: UploadedImage[] = [];
  try {
    for (const imgJson of uploadedImagesJson) {
      if (typeof imgJson === 'string') {
        const img = JSON.parse(imgJson) as UploadedImage;
        uploaded.push(img);
      }
    }
  } catch (error) {
    portfolioLogger.error('Failed to parse uploaded images', error);
    return { success: false, error: 'invalid' };
  }

  const payload = {
    title: String(formData.get('title') || '').trim(),
    field: String(formData.get('field') || '').trim(),
    purpose: String(formData.get('purpose') || '').trim(),
    type: String(formData.get('type') || '').trim(),
    format: String(formData.get('format') || '').trim(),
    size: String(formData.get('size') || '').trim(),
    paper: String(formData.get('paper') || '').trim(),
    printing: String(formData.get('printing') || '').trim(),
    finishing: String(formData.get('finishing') || '').trim(),
    description: String(formData.get('description') || '').trim(),
    images: uploaded,
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = await createSupabaseServerClient();
    const { error, data } = await supabase
      .from('portfolio')
      .insert(payload as Record<string, unknown>);
    if (error) {
      console.error('[PORTFOLIO INSERT ERROR]', error);
      console.error('[PORTFOLIO INSERT ERROR DETAILS]', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return { success: false, error: 'supabase' };
    }
    console.log('[PORTFOLIO INSERT SUCCESS]', data);
    return { success: true };
  } catch (error: unknown) {
    portfolioLogger.error('Portfolio insert exception', error);
    return { success: false, error: 'noconfig' };
  }
}

async function deletePortfolio(formData: FormData): Promise<{ success: boolean; error?: string }> {
  'use server';
  const portfolioLogger = logger.createLogger('PORTFOLIO_ADMIN');
  const id = formData.get('id');
  if (!id) {
    return { success: false, error: 'invalid' };
  }

  // ID는 UUID 문자열
  const portfolioId = String(id).trim();
  if (!portfolioId) {
    portfolioLogger.error('Invalid portfolio ID', { id });
    return { success: false, error: 'invalid' };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('portfolio').delete().eq('id', portfolioId);
    if (error) {
      portfolioLogger.error('Portfolio delete error', error);
      return { success: false, error: 'supabase' };
    }
    portfolioLogger.debug('Portfolio delete success', { id: portfolioId });
    return { success: true };
  } catch (error: unknown) {
    portfolioLogger.error('Portfolio delete exception', error);
    return { success: false, error: 'noconfig' };
  }
}

export default async function AdminPortfolioPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; warn?: string }>;
}) {
  const params = (await searchParams) || {};
  const success = params.success === '1';
  const error = params.error === 'invalid';
  const warnNoConfig = params.warn === 'noconfig';

  // 목록 조회 (Supabase가 설정되어 있을 때만)
  const portfolioLogger = logger.createLogger('PORTFOLIO_ADMIN');
  let items: PortfolioItem[] = [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('portfolio')
      .select(
        'id, title, field, purpose, type, format, size, paper, printing, finishing, images, created_at'
      )
      .order('created_at', { ascending: false });
    if (error) {
      portfolioLogger.error('Portfolio select error', error);
    } else {
      items = (data || []) as PortfolioItem[];
    }
  } catch (error) {
    portfolioLogger.error('Portfolio select exception', error);
    // 미구성 시 목록은 비움
  }

  // 선택 옵션 (문자열로 저장)
  const FIELD_OPTIONS = ['브랜딩', '편집', '패키지', '간판', '웹', '기타'];
  const PURPOSE_OPTIONS = ['홍보', '판매', '안내', '행사', '기타'];
  const TYPE_OPTIONS = ['전단', '리플렛', '브로슈어', '포스터', '명함', '카탈로그', '책자', '기타'];
  const FORMAT_OPTIONS = ['단면', '양면', '2단접지', '3단접지', '책자', '기타'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">포트폴리오 관리</h1>
        <p className="text-gray-600 dark:text-gray-300">
          포트폴리오 항목을 추가/수정/삭제할 수 있는 관리자 페이지입니다.
        </p>
      </div>

      {success && (
        <div className="rounded-md border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-300">
          저장되었습니다.
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
          필수 항목을 확인해주세요.
        </div>
      )}
      {warnNoConfig && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-3 text-sm text-yellow-800 dark:text-yellow-200">
          Supabase 환경 변수(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)가 설정되지
          않아 저장하지 못했습니다. 설정 후 다시 시도해주세요.
        </div>
      )}
      {params.warn === 'r2config' && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-3 text-sm text-yellow-800 dark:text-yellow-200">
          R2 설정이 누락되었습니다. .env.local에 R2_ENDPOINT, R2_ACCESS_KEY_ID,
          R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL를 설정하고 서버를 재시작하세요.
        </div>
      )}

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <PortfolioForm
          savePortfolio={savePortfolio}
          fieldOptions={FIELD_OPTIONS}
          purposeOptions={PURPOSE_OPTIONS}
          typeOptions={TYPE_OPTIONS}
          formatOptions={FORMAT_OPTIONS}
        />
      </div>

      {/* 목록 */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-4">등록된 포트폴리오</h2>
        {items.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">표시할 항목이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((it) => (
              <li key={it.id} className="py-3 flex items-start gap-4">
                {Array.isArray(it.images) && it.images[0] && (
                  <Image
                    src={
                      typeof it.images[0] === 'string'
                        ? it.images[0]
                        : it.images[0].thumbnail || it.images[0].medium || it.images[0].original
                    }
                    alt={it.title}
                    width={96}
                    height={72}
                    className="w-24 h-18 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                    loading="lazy"
                    sizes="96px"
                    placeholder="blur"
                    blurDataURL={transparentBlurDataURL}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{it.title}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(it.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {it.field} · {it.purpose} · {it.type} · {it.format} · {it.size}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    지류: {it.paper} · 인쇄: {it.printing} · 후가공: {it.finishing}
                  </p>
                  {Array.isArray(it.images) && it.images.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">이미지 {it.images.length}개</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/portfolio/${it.id}/edit`}
                    className="px-3 py-1.5 rounded-md text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    수정
                  </Link>
                  <PortfolioDeleteButton
                    portfolioId={it.id}
                    portfolioTitle={it.title}
                    deletePortfolio={deletePortfolio}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
