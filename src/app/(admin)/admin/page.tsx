import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FaFileAlt, FaUsers, FaEye, FaChartLine, FaEnvelope, FaEdit, FaCalendarAlt } from "react-icons/fa";
import Link from "next/link";

export default async function AdminDashboardPage() {
  let postCount = 0;
  let posts: any[] = [];
  let contactCount = 0;
  let newContactCount = 0;
  
  try {
    const supabase = await createSupabaseServerClient();
    
    // 게시물 통계
    const { data: postsData } = await supabase
      .from("posts")
      .select("*");
    
    posts = postsData || [];
    postCount = posts.length;

    // 문의하기 통계
    const { count: totalContacts } = await supabase
      .from("contacts")
      .select("*", { count: 'exact', head: true });
    
    const { count: newContacts } = await supabase
      .from("contacts")
      .select("*", { count: 'exact', head: true })
      .eq('status', 'new');
    
    contactCount = totalContacts || 0;
    newContactCount = newContacts || 0;
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
      borderColor: "border-blue-500",
      href: "/admin/posts",
    },
    {
      title: "전체 문의",
      value: contactCount,
      icon: FaEnvelope,
      color: "bg-orange-500",
      borderColor: "border-orange-500",
      href: "/admin/contacts",
      badge: newContactCount > 0 ? `${newContactCount}건 신규` : undefined,
    },
    {
      title: "조회수",
      value: "0",
      icon: FaEye,
      color: "bg-yellow-500",
      borderColor: "border-yellow-500",
      href: "#",
    },
    {
      title: "성장률",
      value: "+12%",
      icon: FaChartLine,
      color: "bg-purple-500",
      borderColor: "border-purple-500",
      href: "#",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">관리자 대시보드</h1>
        <p className="text-gray-600 dark:text-gray-400">
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
              className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-l-4 ${stat.borderColor} relative border border-gray-200 dark:border-gray-700`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                  {stat.badge && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">
                      {stat.badge}
                    </p>
                  )}
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">최근 게시물</h2>
          <Link
            href="/admin/posts"
            className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-500 font-medium transition-colors duration-300"
          >
            전체 보기 →
          </Link>
        </div>
        
        {posts && posts.length > 0 ? (
          <ul className="space-y-3">
            {posts.slice(0, 5).map((post) => (
              <li
                key={post.id}
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FaCalendarAlt className="text-xs" />
                    <span>
                      {new Date(post.created_at).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="ml-4 flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-500 font-medium transition-colors duration-300 whitespace-nowrap"
                >
                  <FaEdit className="text-sm" />
                  <span>편집</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <FaFileAlt className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">등록된 게시물이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
