import type { Metadata } from 'next';

import { getArchive } from '@/lib/posts';

import { PostList } from '@/components/PostList';

export const metadata: Metadata = { title: '아카이브' };

export default function ArchivePage() {
  const years = getArchive();
  const total = years.reduce((sum, year) => sum + year.posts.length, 0);

  return (
    <main className="mx-auto w-full max-w-[820px] px-6 py-10">
      <h1 className="text-title-lg text-ink-strong mb-1">아카이브</h1>
      <p className="text-meta text-ink-muted mb-8">전체 {total}편</p>

      {years.length === 0 && (
        <p className="text-body text-ink-muted py-16 text-center">아직 글이 없다.</p>
      )}

      {years.map(({ year, posts }) => (
        <section key={year} className="mb-10">
          <h2 className="text-title-sm text-ink-strong border-line mb-2 border-b pb-2">
            {year}
            <span className="text-meta text-ink-muted ml-2">{posts.length}편</span>
          </h2>
          <PostList posts={posts} />
        </section>
      ))}
    </main>
  );
}
