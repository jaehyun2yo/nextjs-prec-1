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
    <div className="w-full py-8 px-4 md:px-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-gray-100">블로그</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:border-orange-500 dark:hover:border-orange-500"
          >
            <h2 className="text-sm font-semibold mb-3 line-clamp-2 h-14 text-gray-900 dark:text-gray-100">
              {post.title}
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 h-20">{post.body}</p>
            <Link
              href={`/blog/${post.id}`}
              className="text-sm text-orange-600 dark:text-orange-400 font-semibold hover:text-orange-700 dark:hover:text-orange-500 transition-colors duration-300 inline-flex items-center gap-2"
            >
              더 읽기 &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
