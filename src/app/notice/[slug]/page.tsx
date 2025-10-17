import Link from "next/link";

// 2. Supabase 클라이언트와 notFound 함수를 가져옵니다.
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type PostDetailPageProps = {
  params: {
    id: string;
  };
};

// 3. 페이지 컴포넌트를 async 함수로 바꿉니다.
export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const supabase = await createSupabaseServerClient();

  const postId = parseInt(params.id, 10);

  // 4. URL의 id와 일치하는 게시물 하나만 Supabase에서 가져옵니다.
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (error || !post) {
    // 5. 데이터를 가져오다 에러가 나거나 게시물이 없으면 '찾을 수 없음' 페이지를 보여줍니다.
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      {/* prose 클래스는 글을 읽기 좋게 스타일링해줍니다. */}
      <div className="prose lg:prose-xl">
        <p>{post.content}</p>
      </div>
      <Link
        href="/notice"
        className="text-blue-500 hover:underline mt-8 inline-block"
      >
        &larr; 목록으로 돌아가기
      </Link>
    </div>
  );
}
