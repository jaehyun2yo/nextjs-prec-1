// src/app/(admin)/admin/posts/[id]/edit/page.tsx (최종)

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
    <div>
      <h1 className="text-3xl font-bold mb-6">게시물 수정</h1>
      {/* 5. form의 action에 우리가 만든 서버 액션을 연결합니다. */}
      <form
        action={updatePostAction}
        className="bg-white p-8 rounded-lg shadow-md space-y-6"
      >
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            제목
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            defaultValue={post.title}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            내용
          </label>
          <textarea
            name="content"
            id="content"
            rows={10}
            required
            defaultValue={post.content || ""}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          수정하기
        </button>
      </form>
    </div>
  );
}
