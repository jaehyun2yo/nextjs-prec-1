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
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">공지사항</h1>
      <ul className="space-y-4">
        {postList.map((post: Post) => (
          <li key={post.id} className="border p-4 rounded-md hover:bg-gray-50">
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
