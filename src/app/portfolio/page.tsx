import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PortfolioPageClient } from "./PortfolioPageClient";
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

  return <PortfolioPageClient items={items} />;
}



