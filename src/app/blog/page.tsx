// src/app/blog/page.tsx

import Link from "next/link";

// 게시물 데이터의 타입을 정의합니다.
interface Post {
  id: number;
  title: string;
  body: string;
}

// 1. 페이지 컴포넌트를 async 함수로 만듭니다.
async function getPosts() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");

  // 에러 처리 (실제 프로젝트에서는 중요!)
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  return res.json();
}

export default async function BlogPage() {
  // 2. 서버에서 직접 데이터를 가져옵니다.
  const posts: Post[] = await getPosts();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">블로그</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="border p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2 line-clamp-2 h-14">
              {post.title}
            </h2>
            <p className="text-gray-600 mb-4 line-clamp-3 h-20">{post.body}</p>
            {/* 3. 상세 페이지로 가는 링크를 연결합니다. id가 숫자이므로 문자로 바꿔줍니다. */}
            <Link
              href={`/blog/${post.id}`}
              className="text-blue-500 font-semibold hover:underline"
            >
              더 읽기 &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
