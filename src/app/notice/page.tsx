import Link from "next/link";

// 2. 관리자 페이지처럼 Supabase 서버 클라이언트를 가져옵니다.
import { createSupabaseServerClient } from "@/lib/supabase/server";

// 3. 함수를 'async'로 바꿔주세요.
export default async function NoticeListPage() {
  // 4. Supabase 클라이언트를 생성합니다.
  const supabase = await createSupabaseServerClient();

  // 5. 'posts' 테이블에서 모든 데이터를 가져옵니다.
  const { data: posts, error } = await supabase.from("posts").select("*");

  if (error) {
    console.error("Error fetching posts:", error);
  }

  // 6. 데이터가 없을 경우를 대비해 기본값을 빈 배열로 설정합니다.
  const postList = posts || [];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">공지사항</h1>
      <ul className="space-y-4">
        {/* 7. 더미 데이터 'posts' 대신, Supabase에서 가져온 'postList'를 사용합니다. */}
        {postList.map((post: any) => (
          <li key={post.id} className="border p-4 rounded-md hover:bg-gray-50">
            {/* 8. 상세 페이지 경로도 수정해야 합니다. */}
            <Link href={`/notice/${post.id}`}>
              <h2 className="text-xl font-semibold text-blue-600">
                {post.title}
              </h2>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
