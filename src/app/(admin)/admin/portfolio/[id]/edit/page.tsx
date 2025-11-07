// src/app/(admin)/admin/portfolio/[id]/edit/page.tsx

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAndUploadVariants } from "@/lib/images/process";
import Image from "next/image";
import { transparentBlurDataURL } from "@/lib/images/placeholder";
import { redirect } from "next/navigation";
import { logger } from "@/lib/utils/logger";

interface UploadedImage {
  original: string;
  thumbnail?: string;
  medium?: string;
}

interface PortfolioItem {
  id: number;
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

async function updatePortfolio(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) {
    redirect("/admin/portfolio?error=invalid");
  }

  // 기존 이미지 목록
  let existing: string[] = [];
  const existingJson = formData.get("existingImages");
  if (existingJson) {
    try { existing = JSON.parse(String(existingJson)); } catch {}
  }

  // 삭제 선택된 이미지들 (URL 값)
  const removeList = formData.getAll("remove").map((v) => String(v));
  // existing may be string[] or object[]
  const kept = (existing as (string | UploadedImage)[]).filter((item) => {
    if (typeof item === "string") {
      return !removeList.includes(item);
    }
    // object with variants
    const urls = [item.thumbnail, item.medium, item.original].filter(Boolean) as string[];
    return urls.every((u) => !removeList.includes(u));
  });

  // 새 이미지 업로드
  const newFiles = formData.getAll("newImages");
  const uploaded: UploadedImage[] = [];
  try {
    for (const f of newFiles) {
      if (typeof f === "object" && "arrayBuffer" in f) {
        const up = await createAndUploadVariants(f as File);
        uploaded.push(up);
      }
    }
  } catch {
    redirect(`/admin/portfolio/${id}/edit?warn=r2config`);
  }

  const images = [...kept, ...uploaded];

  const payload = {
    title: String(formData.get("title") || "").trim(),
    field: String(formData.get("field") || "").trim(),
    purpose: String(formData.get("purpose") || "").trim(),
    type: String(formData.get("type") || "").trim(),
    format: String(formData.get("format") || "").trim(),
    size: String(formData.get("size") || "").trim(),
    paper: String(formData.get("paper") || "").trim(),
    printing: String(formData.get("printing") || "").trim(),
    finishing: String(formData.get("finishing") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    images,
    updated_at: new Date().toISOString(),
  };

  const portfolioLogger = logger.createLogger('PORTFOLIO_ADMIN');
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("portfolio").update(payload).eq("id", id);
    if (error) {
      portfolioLogger.error("Portfolio update error", error);
      redirect(`/admin/portfolio/${id}/edit?error=supabase`);
    }
    portfolioLogger.debug("Portfolio update success");
    redirect(`/admin/portfolio/${id}/edit?success=1`);
  } catch (error: unknown) {
    if (error instanceof Error && (error.message === "NEXT_REDIRECT" || (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))) {
      throw error;
    }
    portfolioLogger.error("Portfolio update exception", error);
    redirect(`/admin/portfolio/${id}/edit?warn=noconfig`);
  }
}

export default async function EditPortfolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ success?: string; error?: string; warn?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) || {};
  const success = sp.success === "1";
  const error = sp.error === "supabase";
  const warnNoConfig = sp.warn === "noconfig";

  let item: PortfolioItem | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("portfolio")
      .select("id, title, field, purpose, type, format, size, paper, printing, finishing, description, images, created_at")
      .eq("id", id)
      .maybeSingle();
    item = (data || null) as PortfolioItem | null;
  } catch {
    // ignore when not configured
  }

  if (!item) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">항목을 찾을 수 없습니다</h1>
        {warnNoConfig && (
          <div className="rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-3 text-sm text-yellow-800 dark:text-yellow-200">
            Supabase 미설정 상태입니다.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">포트폴리오 수정</h1>
        <p className="text-gray-600 dark:text-gray-300">항목을 수정하고 저장할 수 있습니다.</p>
      </div>

      {success && (
        <div className="rounded-md border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-300">
          저장되었습니다.
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
          저장 중 오류가 발생했습니다.
        </div>
      )}
      {warnNoConfig && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-3 text-sm text-yellow-800 dark:text-yellow-200">
          Supabase 환경 변수(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)가 설정되지 않았습니다.
        </div>
      )}

      <form action={updatePortfolio} className="space-y-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="existingImages" value={JSON.stringify(item.images || [])} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">제목</label>
            <input type="text" name="title" defaultValue={item.title} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">분야</label>
            <select name="field" defaultValue={item.field} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
              { ["브랜딩","편집","패키지","간판","웹","기타"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              )) }
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">목적</label>
            <select name="purpose" defaultValue={item.purpose} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
              { ["홍보","판매","안내","행사","기타"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              )) }
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">종류</label>
            <select name="type" defaultValue={item.type} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
              { ["전단","리플렛","브로슈어","포스터","명함","카탈로그","책자","기타"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              )) }
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">형태</label>
            <select name="format" defaultValue={item.format} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
              { ["단면","양면","2단접지","3단접지","책자","기타"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              )) }
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">장폭고</label>
            <input type="text" name="size" defaultValue={item.size} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">지류</label>
            <input type="text" name="paper" defaultValue={item.paper} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">인쇄</label>
            <input type="text" name="printing" defaultValue={item.printing} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">후가공</label>
            <input type="text" name="finishing" defaultValue={item.finishing} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
          </div>
        </div>

        {/* 기존 이미지 목록 및 삭제 선택 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">기존 이미지</label>
          {Array.isArray(item.images) && item.images.length > 0 ? (
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {item.images.map((img: string | UploadedImage, idx: number) => {
                const url = typeof img === "string" ? img : img.original;
                const thumbnailUrl = typeof img === "string" ? img : (img.thumbnail || img.medium || img.original);
                return (
                  <li key={typeof img === "string" ? img : img.original || idx}
                    className="space-y-2">
                    <Image
                      src={thumbnailUrl}
                      alt="image"
                      width={320}
                      height={160}
                      className="w-full h-28 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                      sizes="(max-width: 768px) 50vw, 320px"
                      placeholder="blur"
                      blurDataURL={transparentBlurDataURL}
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="remove" value={url} />
                      삭제하기
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">등록된 이미지가 없습니다.</p>
          )}
        </div>

        {/* 새 이미지 추가 업로드 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">새 이미지 추가</label>
          <input
            type="file"
            name="newImages"
            accept="image/*"
            multiple
            className="block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-700 dark:file:text-gray-200 dark:hover:file:bg-gray-600"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">설명</label>
          <textarea name="description" rows={6} defaultValue={item.description} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 rounded-lg bg-[#ED6C00] text-white hover:bg-[#d15f00] transition-colors">저장</button>
          <a href="/admin/portfolio" className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">목록으로</a>
        </div>
      </form>
    </div>
  );
}


