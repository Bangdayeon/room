import type { Metadata } from 'next';
import Link from 'next/link';

import { cn } from '@/lib/cn';
import { getTagCounts } from '@/lib/posts';

export const metadata: Metadata = { title: '태그' };

/** 글이 많은 태그일수록 크게. 세 단계면 충분하다. */
function sizeOf(count: number, max: number) {
  if (count >= max * 0.66) return 'text-title-sm';
  if (count >= max * 0.33) return 'text-body';
  return 'text-body-sm';
}

export default function TagsPage() {
  const tags = getTagCounts();
  const max = tags[0]?.count ?? 1;

  return (
    <main className="mx-auto w-full max-w-[820px] px-6 py-10">
      <h1 className="text-title-lg text-ink-strong mb-1">태그</h1>
      <p className="text-meta text-ink-muted mb-8">{tags.length}종</p>

      {tags.length === 0 ? (
        <p className="text-body text-ink-muted py-16 text-center">아직 태그가 없다.</p>
      ) : (
        <ul className="flex flex-wrap items-baseline gap-x-4 gap-y-3">
          {tags.map(({ tag, count }) => (
            <li key={tag}>
              <Link
                href={`/tags/${encodeURIComponent(tag)}`}
                className={cn(
                  'text-ink hover:text-primary-ink focus-visible:outline-primary rounded focus-visible:outline-2',
                  sizeOf(count, max)
                )}
              >
                {tag}
                <span className="text-meta text-ink-muted ml-1">{count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
