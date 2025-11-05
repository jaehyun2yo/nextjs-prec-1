import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Post } from "@/types/database.types";

export default async function NoticeListPage() {
  const supabase = await createSupabaseServerClient();

  const { data: posts, error } = await supabase.from("posts").select("*");

  if (error) {
    console.error("Error fetching posts:", error);
  }

  const postList = posts || [];

  return (
    <div className="w-full py-8 px-4 md:px-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-gray-100">공지사항</h1>
      {postList.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">등록된 공지사항이 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {postList.map((post: Post) => (
            <li
              key={post.id}
              className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-6 rounded-xl hover:border-orange-500 dark:hover:border-orange-500 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Link href={`/notice/${post.id}`}>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-orange-600 dark:hover:text-orange-500 transition-colors duration-300">
                  {post.title}
                </h2>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
