'use client';

import { useState, useCallback } from 'react';
import { PortfolioHorizontalGallery } from "@/components/portfolio/PortfolioHorizontalGallery";
import { PortfolioTagFilter } from "@/components/portfolio/PortfolioTagFilter";
import { PortfolioMinimalNav } from "@/components/portfolio/PortfolioMinimalNav";

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
  images: string[] | Array<{ original: string; thumbnail?: string; medium?: string }>;
  created_at: string;
}

interface PortfolioPageClientProps {
  items: PortfolioItem[];
}

export function PortfolioPageClient({ items }: PortfolioPageClientProps) {
  const [filteredItems, setFilteredItems] = useState<PortfolioItem[]>(items);

  const handleFilterChange = useCallback((filtered: PortfolioItem[]) => {
    setFilteredItems(filtered);
  }, []);

  return (
    <>
      <PortfolioMinimalNav />
      <PortfolioTagFilter items={items} onFilterChange={handleFilterChange} />
      <PortfolioHorizontalGallery items={items} filteredItems={filteredItems} />
    </>
  );
}

