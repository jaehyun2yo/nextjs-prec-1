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
                <DeleteButton postId={post.id} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
