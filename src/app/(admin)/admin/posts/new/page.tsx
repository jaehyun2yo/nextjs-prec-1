// src/app/(admin)/admin/posts/new/page.tsx (수정 후)

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default function NewPostPage() {
  // 1. 폼이 제출되면 실행될 서버 액션 함수입니다.
  async function createPostAction(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    // 2. Supabase 클라이언트를 생성합니다.
    const supabase = createSupabaseServerClient();

    // 3. 'posts' 테이블에 새 데이터를 삽입(insert)합니다.
    const { error } = await (await supabase)
      .from("posts")
      .insert([{ title: title, content: content }]);

    if (error) {
      console.error("Error creating post:", error);
      // 실제 서비스에서는 에러 페이지로 리디렉션하는 등의 처리를 할 수 있습니다.
      return;
    }

    // 4. 게시물 목록 페이지의 캐시를 갱신해서 새 글이 바로 보이도록 합니다.
    revalidatePath("/admin/posts");

    // 5. 작업 완료 후, 게시물 목록 페이지로 돌아갑니다.
    redirect("/admin/posts");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">새 게시물 작성</h1>
      {/* 6. form의 action에 우리가 만든 서버 액션을 연결합니다. */}
      <form
        action={createPostAction}
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          작성하기
        </button>
      </form>
    </div>
  );
}
