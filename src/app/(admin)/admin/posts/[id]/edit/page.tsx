// src/app/(admin)/admin/posts/[id]/edit/page.tsx (최종)

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

type EditPostPageProps = {
  params: {
    id: string;
  };
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = params;
  const supabase = await createSupabaseServerClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) {
    notFound();
  }

  // 1. 수정 작업을 처리할 서버 액션입니다.
  async function updatePostAction(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    const supabase = await createSupabaseServerClient();

    // 2. 'posts' 테이블에서 'id'가 일치하는 데이터를 'update'합니다.
    const { error } = await supabase
      .from("posts")
      .update({ title, content })
      .eq("id", id);

    if (error) {
      console.error("Error updating post:", error);
      return;
    }

    // 3. 목록 페이지와 수정 페이지의 캐시를 모두 갱신합니다.
    revalidatePath("/admin/posts");
    revalidatePath(`/admin/posts/${id}/edit`);

    // 4. 작업 완료 후, 게시물 목록 페이지로 돌아갑니다.
    redirect("/admin/posts");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">게시물 수정</h1>
        <p className="text-gray-600 dark:text-gray-400">
          게시물 정보를 수정할 수 있습니다
        </p>
      </div>
      
      {/* 5. form의 action에 우리가 만든 서버 액션을 연결합니다. */}
      <form
        action={updatePostAction}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 space-y-6"
      >
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            defaultValue={post.title}
            className="mt-1 block w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
            placeholder="게시물 제목을 입력하세요"
          />
        </div>
        
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            id="content"
            rows={12}
            required
            defaultValue={post.content || ""}
            className="mt-1 block w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 resize-y"
            placeholder="게시물 내용을 입력하세요"
          ></textarea>
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
          >
            수정하기
          </button>
          <Link
            href="/admin/posts"
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 font-medium inline-block text-center"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
