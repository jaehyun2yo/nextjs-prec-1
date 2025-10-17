// src/app/(admin)/admin/posts/page.tsx (수정 후)

import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Post } from '@/types/database.types';

export default async function AdminPostsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: posts, error } =  await supabase.from("posts").select<"*", Post>("*");

  if (error) {
    console.error("Error fetching posts:", error);
  }

  const postList = posts || [];

  // 1. 게시물 삭제를 위한 서버 액션 함수입니다.
  async function deletePostAction(formData: FormData) {
    "use server";

    const postId = formData.get("postId") as string;

    // 2. Supabase 클라이언트를 생성합니다.
    const supabase = await createSupabaseServerClient();

    // 3. 'posts' 테이블에서 'id'가 일치하는 데이터를 삭제(delete)합니다.
    const { error } = await  supabase.from("posts").delete().eq("id", postId);

    if (error) {
      console.error("Error deleting post:", error);
      return;
    }

    // 4. 데이터가 변경되었으니, 현재 경로의 캐시를 갱신합니다.
    revalidatePath("/admin/posts");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">게시물 관리</h1>
        <Link
          href="/admin/posts/new"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          새 게시물 작성
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <ul className="space-y-4">
          {postList.map((post: Post) => (
            <li
              key={post.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <span className="text-lg">{post.title}</span>
              <div className="flex items-center space-x-2">
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="text-blue-500 hover:underline"
                >
                  수정
                </Link>
                {/* 5. 삭제 버튼을 form으로 감싸고, 위에서 만든 서버 액션을 연결합니다. */}
                <form action={deletePostAction}>
                  <input type="hidden" name="postId" value={post.id} />
                  <button
                    type="submit"
                    className="text-red-500 hover:underline"
                  >
                    삭제
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
