// src/app/(admin)/admin/posts/page.tsx (수정 후)

import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Post } from '@/types/database.types';
import { DeleteButton } from './delete-button';

export default async function AdminPostsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: posts, error } = await supabase.from("posts").select<"*", Post>("*");

  if (error) {
    console.error("Error fetching posts:", error);
  }

  const postList = posts || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">게시물 관리</h1>
        <Link
          href="/admin/posts/new"
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-md hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          새 게시물 작성
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700">
        {postList.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">등록된 게시물이 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {postList.map((post: Post) => (
              <li
                key={post.id}
                className="flex justify-between items-center border-b-2 border-gray-200 dark:border-gray-700 pb-4 last:border-b-0"
              >
                <span className="text-lg text-gray-900 dark:text-gray-100 font-medium">{post.title}</span>
                <div className="flex items-center space-x-3">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-500 transition-colors duration-300 font-medium"
                  >
                    수정
                  </Link>
                  <DeleteButton postId={post.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
