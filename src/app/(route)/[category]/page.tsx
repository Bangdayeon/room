import { notFound } from 'next/navigation';

import { CATEGORIES, isCategory } from '@/lib/categories';

// 카테고리 6개만 빌드타임에 생성하고 그 외 경로는 404 로 보낸다.
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map(category => ({ category }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!isCategory(category)) notFound();

  // TODO: 목록 렌더 (페이지당 20 · 페이지네이션). src/data/index.json 연결 후.
  return <main>{category}</main>;
}
