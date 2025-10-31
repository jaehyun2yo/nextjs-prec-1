import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PortfolioCard } from "@/components/PortfolioCard";

export default async function PortfolioPage() {
  // Supabase에서 포트폴리오 데이터 가져오기
  let items: any[] = [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("portfolio")
      .select("id, title, field, purpose, type, format, size, paper, printing, finishing, description, images, created_at")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("[PORTFOLIO PAGE SELECT ERROR]", error);
    } else {
      items = data || [];
    }
  } catch (e) {
    console.error("[PORTFOLIO PAGE SELECT EXCEPTION]", e);
  }

  return (
    <div className="w-full py-8 px-4 md:px-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">포트폴리오</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            등록된 포트폴리오가 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}



