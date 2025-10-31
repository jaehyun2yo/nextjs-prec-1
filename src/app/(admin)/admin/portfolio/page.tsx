// src/app/(admin)/admin/portfolio/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uploadFileToR2 } from "@/lib/r2/upload";
import { createAndUploadVariants } from "@/lib/images/process";
import Image from "next/image";
import { transparentBlurDataURL } from "@/lib/images/placeholder";

async function savePortfolio(formData: FormData) {
  "use server";
  // 간단 검증
  const required = [
    "title",
    "field",
    "purpose",
    "type",
    "format",
    "size",
    "paper",
    "printing",
    "finishing",
    "description",
  ];
  for (const key of required) {
    const v = formData.get(key);
    if (!v || String(v).trim() === "") {
      redirect("/admin/portfolio?error=invalid");
    }
  }

  // 이미지 업로드 (여러장)
  const images = formData.getAll("images");
  let uploaded: any[] = [];
  try {
    for (const f of images) {
      if (typeof f === "object" && "arrayBuffer" in f) {
        const res = await createAndUploadVariants(f as File);
        uploaded.push(res);
      }
    }
  } catch (e) {
    // R2 설정/업로드 실패 시 경고로 안내
    redirect("/admin/portfolio?warn=r2config");
  }

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
    images: uploaded,
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = await createSupabaseServerClient();
    const { error, data } = await supabase.from("portfolio").insert(payload as any);
    if (error) {
      console.error("[PORTFOLIO INSERT ERROR]", error);
      console.error("[PORTFOLIO INSERT ERROR DETAILS]", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      redirect("/admin/portfolio?error=supabase");
    }
    console.log("[PORTFOLIO INSERT SUCCESS]", data);
    // Next.js redirect는 예외를 throw하므로 catch에서 잡히면 안됨
    redirect("/admin/portfolio?success=1");
  } catch (e: any) {
    // Next.js redirect는 NEXT_REDIRECT 에러를 throw하므로 이를 무시해야 함
    if (e?.digest?.startsWith("NEXT_REDIRECT")) {
      throw e; // redirect 예외는 다시 throw
    }
    // 실제 에러만 catch
    console.error("[PORTFOLIO INSERT EXCEPTION]", e);
    if (e instanceof Error) {
      console.error("[PORTFOLIO INSERT EXCEPTION MESSAGE]", e.message);
      console.error("[PORTFOLIO INSERT EXCEPTION STACK]", e.stack);
    }
    redirect("/admin/portfolio?warn=noconfig");
  }
}

async function deletePortfolio(formData: FormData) {
  "use server";
  const id = formData.get("id");
  if (!id) {
    redirect("/admin/portfolio?error=invalid");
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("portfolio").delete().eq("id", id as string);
    if (error) {
      console.error("[PORTFOLIO DELETE ERROR]", error);
      redirect("/admin/portfolio?error=supabase");
    }
    redirect("/admin/portfolio?success=1");
  } catch (e: any) {
    // Next.js redirect는 NEXT_REDIRECT 에러를 throw하므로 이를 무시해야 함
    if (e?.digest?.startsWith("NEXT_REDIRECT")) {
      throw e; // redirect 예외는 다시 throw
    }
    console.error("[PORTFOLIO DELETE EXCEPTION]", e);
    redirect("/admin/portfolio?warn=noconfig");
  }
}

export default async function AdminPortfolioPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; warn?: string }>;
}) {
  const params = (await searchParams) || {};
  const success = params.success === "1";
  const error = params.error === "invalid";
  const warnNoConfig = params.warn === "noconfig";

  // 목록 조회 (Supabase가 설정되어 있을 때만)
  let items: any[] = [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("portfolio")
      .select("id, title, field, purpose, type, format, size, paper, printing, finishing, images, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[PORTFOLIO SELECT ERROR]", error);
    } else {
      items = data || [];
    }
  } catch (e) {
    // 미구성 시 목록은 비움
    console.error("[PORTFOLIO SELECT EXCEPTION]", e);
  }

  // 선택 옵션 (문자열로 저장)
  const FIELD_OPTIONS = ["브랜딩", "편집", "패키지", "간판", "웹", "기타"];
  const PURPOSE_OPTIONS = ["홍보", "판매", "안내", "행사", "기타"];
  const TYPE_OPTIONS = ["전단", "리플렛", "브로슈어", "포스터", "명함", "카탈로그", "책자", "기타"];
  const FORMAT_OPTIONS = ["단면", "양면", "2단접지", "3단접지", "책자", "기타"];

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
          Supabase 환경 변수(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)가 설정되지 않아 저장하지 못했습니다. 설정 후 다시 시도해주세요.
        </div>
      )}
      {params.warn === "r2config" && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-3 text-sm text-yellow-800 dark:text-yellow-200">
          R2 설정이 누락되었습니다. .env.local에 R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL를 설정하고 서버를 재시작하세요.
        </div>
      )}

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <form action={savePortfolio} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">제목</label>
              <input
                type="text"
                name="title"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="프로젝트 제목"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">분야</label>
              <select
                name="field"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                defaultValue=""
                required
              >
                <option value="" disabled>분야 선택</option>
                {FIELD_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">목적</label>
              <select
                name="purpose"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                defaultValue=""
                required
              >
                <option value="" disabled>목적 선택</option>
                {PURPOSE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">종류</label>
              <select
                name="type"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                defaultValue=""
                required
              >
                <option value="" disabled>종류 선택</option>
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">형태</label>
              <select
                name="format"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                defaultValue=""
                required
              >
                <option value="" disabled>형태 선택</option>
                {FORMAT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">장폭고 (규격/사이즈)</label>
              <input
                type="text"
                name="size"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="예: 210x297mm (A4)"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">지류 (종이)</label>
              <input
                type="text"
                name="paper"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="예: 스노우지 200g, 랑데뷰 240g"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">인쇄</label>
              <input
                type="text"
                name="printing"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="예: 컬러 4도 / 별색 / 양면"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">후가공</label>
              <input
                type="text"
                name="finishing"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="예: 코팅, 박, 형압, 오시, 접지"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">이미지 (여러 장)</label>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              className="block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-700 dark:file:text-gray-200 dark:hover:file:bg-gray-600"
            />
            <p className="text-xs text-gray-500">여러 이미지를 선택할 수 있습니다. (저장은 추후 구현)</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">설명</label>
            <textarea
              name="description"
              rows={6}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="프로젝트에 대한 상세 설명"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#ED6C00] text-white hover:bg-[#d15f00] transition-colors"
            >
              저장
            </button>
            <Link
              href="/admin"
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              대시보드로 돌아가기
            </Link>
          </div>
        </form>
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
                    src={typeof it.images[0] === "string" ? it.images[0] : (it.images[0].thumb || it.images[0].medium || it.images[0].original)}
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
                    <span className="text-xs text-gray-500">{new Date(it.created_at).toLocaleString()}</span>
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
                  <form action={deletePortfolio}>
                    <input type="hidden" name="id" value={it.id} />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-md text-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/40"
                    >
                      삭제
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


