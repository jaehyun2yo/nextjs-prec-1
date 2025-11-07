import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { logger } from "@/lib/utils/logger";

interface PortfolioItem {
  id: number;
  title: string;
  field: string;
  purpose: string;
  type: string;
  format: string;
  size: string;
  paper: string;
  printing: string;
  finishing: string;
  description: string;
  images: string[];
  created_at: string;
}

export default async function PortfolioPage() {
  // Supabase에서 포트폴리오 데이터 가져오기
  const portfolioLogger = logger.createLogger('PORTFOLIO');
  let items: PortfolioItem[] = [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("portfolio")
      .select("id, title, field, purpose, type, format, size, paper, printing, finishing, description, images, created_at")
      .order("created_at", { ascending: false });
    
    if (error) {
      portfolioLogger.error("Portfolio page select error", error);
    } else {
      items = (data || []) as PortfolioItem[];
    }
  } catch (error) {
    portfolioLogger.error("Portfolio page select exception", error);
  }

  return (
    <div className="w-full py-8 px-4 md:px-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-gray-100">포트폴리오</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            등록된 포트폴리오가 없습니다.
          </p>
        </div>
      ) : (
        <PortfolioGrid items={items} />
      )}
    </div>
  );
}



