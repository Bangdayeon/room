import { notFound } from 'next/navigation';

import { CATEGORIES, isCategory } from '@/lib/categories';
import { getPostsByCategory } from '@/lib/posts';

import { PAGE_SIZE, PageNav, pageCount } from '@/components/PageNav';
import { PostList } from '@/components/PostList';

/**
 * /{category}/page/2 — 2쪽부터. 1쪽은 /{category} 가 맡는다.
 *
 * 쪽 번호를 쿼리스트링(?page=2)으로 받으면 라우트 전체가 동적으로 바뀐다.
 * 정적으로 굽기 위해 경로로 받는다.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.flatMap(category => {
    const total = pageCount(getPostsByCategory(category).length);
    // 2쪽부터. 글이 한 쪽에 다 들어가면 아무것도 만들지 않는다.
    return Array.from({ length: Math.max(total - 1, 0) }, (_, index) => ({
      category,
      n: String(index + 2),
    }));
  });
}

export default async function CategoryPagePage({
  params,
}: {
  params: Promise<{ category: string; n: string }>;
}) {
  const { category, n } = await params;
  if (!isCategory(category)) notFound();

  const current = Number(n);
  const posts = getPostsByCategory(category);
  const total = pageCount(posts.length);
  if (!Number.isInteger(current) || current < 2 || current > total) notFound();

  return (
    <main className="mx-auto w-full max-w-[820px] px-6 py-10">
      <h1 className="text-title-lg text-ink-strong mb-1">{category.toUpperCase()}</h1>
      <p className="text-meta text-ink-muted mb-6">
        {posts.length}편 · {current}/{total} 쪽
      </p>

      <PostList posts={posts.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)} />
      <PageNav base={`/${category}`} current={current} total={total} />
    </main>
  );
}
