// src/app/blog/[id]/page.tsx

import Link from "next/link";

interface Post {
  id: number;
  title: string;
  body: string;
}

// 특정 ID의 게시물 하나만 가져오는 함수
async function getPost(id: string) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  if (!res.ok) {
    // 적절한 에러 처리 또는 notFound() 함수를 호출할 수 있습니다.
    throw new Error("Failed to fetch post");
  }
  return res.json();
}

type BlogPostPageProps = {
  params: {
    id: string;
  };
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post: Post = await getPost(params.id);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold mb-4 text-gray-800">
        {post.title}
      </h1>
      <p className="text-gray-600 text-lg leading-relaxed mt-6">{post.body}</p>
      <Link
        href="/blog"
        className="text-blue-600 hover:underline mt-12 inline-block"
      >
        &larr; 블로그 목록으로 돌아가기
      </Link>
    </div>
  );
}
