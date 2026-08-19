import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CATEGORIES, isCategory } from '@/lib/categories';
import { getPostsByCategory } from '@/lib/posts';

import { PAGE_SIZE, PageNav, pageCount } from '@/components/PageNav';
import { PostList } from '@/components/PostList';

// 카테고리 6개만 빌드타임에 생성하고 그 외 경로는 404 로 보낸다.
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map(category => ({ category }));
}

type Params = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  return { title: category.toUpperCase() };
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params;
  if (!isCategory(category)) notFound();

  const posts = getPostsByCategory(category);

  return (
    <main className="mx-auto w-full max-w-[820px] px-6 py-10">
      <h1 className="text-title-lg text-ink-strong mb-1">{category.toUpperCase()}</h1>
      <p className="text-meta text-ink-muted mb-6">{posts.length}편</p>

      <PostList posts={posts.slice(0, PAGE_SIZE)} />
      <PageNav base={`/${category}`} current={1} total={pageCount(posts.length)} />
    </main>
  );
}
