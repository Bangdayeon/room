import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CATEGORY_COLOR, isCategory } from '@/lib/categories';
import { cn } from '@/lib/cn';
import { getAllPosts, getPost, getPostBody, getRelatedPosts } from '@/lib/posts';

import { MdxContent } from '@/components/MdxContent';
import { PostList } from '@/components/PostList';

/** 색인에 있는 글만 페이지가 된다 — draft 는 프로덕션 산출물에 없으므로 404 다. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map(post => ({ category: post.category, slug: post.slug }));
}

type Params = { params: Promise<{ category: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category, slug } = await params;
  const post = getPost(category, slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { category, slug } = await params;
  if (!isCategory(category)) notFound();

  const post = getPost(category, slug);
  if (!post) notFound();

  const body = getPostBody(post);
  if (body === null) notFound();

  const related = getRelatedPosts(post, 4);

  return (
    <main className="mx-auto w-full max-w-[720px] px-6 py-10">
      <article>
        <header className="border-line mb-8 border-b pb-6">
          <p className="mb-3 flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn('size-2 shrink-0 rounded-full', CATEGORY_COLOR[post.category].dot)}
            />
            <span className="text-meta text-ink-muted">
              {post.category.toUpperCase()} · {post.date}
            </span>
            {post.draft && (
              <span className="text-meta-sm text-warning-ink bg-warning-subtle rounded px-1.5 py-0.5">
                초고
              </span>
            )}
          </p>

          <h1 className="text-title-lg text-ink-strong">{post.title}</h1>
          <p className="text-body text-ink-muted mt-2">{post.summary}</p>

          <ul className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map(tag => (
              <li key={tag}>
                <a
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="text-meta-sm text-ink bg-surface-muted hover:bg-primary-subtle hover:text-primary-ink rounded px-1.5 py-0.5"
                >
                  {tag}
                </a>
              </li>
            ))}
          </ul>
        </header>

        <MdxContent source={body} />
      </article>

      {related.length > 0 && (
        <section aria-label="관련 글" className="border-line mt-16 border-t pt-8">
          {/* 손으로 이어 둔 위키링크가 먼저고, 모자라면 태그 · 카테고리로 채운다. */}
          <h2 className="text-title-sm text-ink-strong mb-2">이어 읽기</h2>
          <PostList posts={related} />
        </section>
      )}
    </main>
  );
}
