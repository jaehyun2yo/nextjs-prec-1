import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FaFileAlt, FaUsers, FaEye, FaChartLine } from "react-icons/fa";
import Link from "next/link";

export default async function AdminDashboardPage() {
  let postCount = 0;
  let posts: any[] = [];
  
  try {
    const supabase = await createSupabaseServerClient();
    
    // 통계 데이터 가져오기
    const { data, error } = await supabase
      .from("posts")
      .select("*");
    
    posts = data || [];
    postCount = posts.length;
  } catch (error) {
    console.error("Supabase connection error:", error);
    // Supabase 설정이 없는 경우에도 페이지는 표시되도록 함
  }

  // 통계 카드 데이터
  const stats = [
    {
      title: "전체 게시물",
      value: postCount,
      icon: FaFileAlt,
      color: "bg-blue-500",
      href: "/admin/posts",
    },
    {
      title: "사용자",
      value: "N/A",
      icon: FaUsers,
      color: "bg-green-500",
      href: "#",
    },
    {
      title: "조회수",
      value: "0",
      icon: FaEye,
      color: "bg-yellow-500",
      href: "#",
    },
    {
      title: "성장률",
      value: "+12%",
      icon: FaChartLine,
      color: "bg-purple-500",
      href: "#",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
        <p className="text-gray-600">
          웹사이트의 전반적인 현황을 한눈에 파악하세요
        </p>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-4 rounded-full`}>
                  <Icon className="text-white text-2xl" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 최근 활동 영역 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">최근 게시물</h2>
        {posts && posts.length > 0 ? (
          <ul className="space-y-3">
            {posts.slice(0, 5).map((post) => (
              <li
                key={post.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <h3 className="font-semibold">{post.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(post.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  편집 →
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">게시물이 없습니다</p>
        )}
        
        <Link
          href="/admin/posts"
          className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
        >
          모든 게시물 보기 →
        </Link>
      </div>
    </div>
  );
}
