import { notFound } from 'next/navigation';

import { isCategory } from '@/lib/categories';

// TODO: generateStaticParams — src/data/index.json 의 글 목록으로 전량 정적 생성.
// TODO: generateMetadata — OG · structured data.

export default async function PostPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  if (!isCategory(category)) notFound();

  // TODO: MDX 본문 + <PostFooter> (Phase 4 좋아요·댓글 자리) + 관련글 4개.
  return <main>{`${category}/${slug}`}</main>;
}
