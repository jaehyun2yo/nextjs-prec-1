// src/app/(admin)/admin/posts/_actions/index.ts

"use server"; // 이 파일의 모든 함수는 서버에서만 실행됩니다!

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// 새 게시물을 생성하는 서버 액션
export async function createPost(title: string, contentJson: string) {
  const supabase =  await createSupabaseServerClient();

  // 클라이언트에서 받은 JSON 문자열을 실제 JSON 객체로 변환합니다.
  const content = JSON.parse(contentJson);

  const { data, error } = await supabase
    .from("posts")
    .insert([{ title, content }]) // content 컬럼에 JSON 객체를 직접 저장
    .select();

  if (error) {
    console.error("Error creating post:", error);
    // 실제 서비스에서는 에러 처리를 더 정교하게 할 수 있습니다.
    return { success: false, error };
  }

  // 데이터가 변경되었으니, 목록 페이지의 캐시를 갱신합니다.
  revalidatePath("/admin/posts");
  // 성공적으로 글을 만들었으면, 목록 페이지로 이동시킵니다.
  redirect("/admin/posts");
}
