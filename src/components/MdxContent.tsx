import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/cn';
import { remarkCallout } from '@/lib/mdx/remark-callout';
import { remarkWikilink } from '@/lib/mdx/remark-wikilink';
import type { LinkTarget } from '@/lib/mdx/wikilink';
import { getAllPosts } from '@/lib/posts';

import { Callout } from '@/components/Callout';

/**
 * MDX 본문 렌더.
 *
 * 번들러(@next/mdx)가 아니라 여기서 컴파일한다. Turbopack 은 remark 플러그인을
 * 문자열로만 받고 JS 함수를 못 넘기는데(Next 문서 mdx.md), 위키링크 · 콜아웃은
 * 이 저장소 안에 있는 자작 플러그인이라 문자열로 지목할 수가 없다.
 *
 * 태그별 클래스는 전부 기존 타이포 · 색 토큰이다. 본문에서 처음 보는 크기나
 * 색이 나오면 그건 토큰이 부족하다는 신호지 여기서 값을 적을 이유가 아니다.
 */

const COMPONENTS = {
  callout: Callout,

  h2: (props: React.ComponentProps<'h2'>) => (
    <h2 {...props} className="text-title-md text-ink-strong mt-10 mb-3" />
  ),
  h3: (props: React.ComponentProps<'h3'>) => (
    <h3 {...props} className="text-title-sm text-ink-strong mt-8 mb-2" />
  ),
  h4: (props: React.ComponentProps<'h4'>) => (
    <h4 {...props} className="text-label text-ink-strong mt-6 mb-2" />
  ),

  p: (props: React.ComponentProps<'p'>) => <p {...props} className="text-body-lg my-5" />,

  a: (props: React.ComponentProps<'a'>) => (
    <a {...props} className="text-ink decoration-primary underline underline-offset-4" />
  ),

  ul: (props: React.ComponentProps<'ul'>) => (
    <ul {...props} className="text-body-lg my-5 list-disc space-y-1 pl-5" />
  ),
  ol: (props: React.ComponentProps<'ol'>) => (
    <ol {...props} className="text-body-lg my-5 list-decimal space-y-1 pl-5" />
  ),

  blockquote: (props: React.ComponentProps<'blockquote'>) => (
    <blockquote {...props} className="border-line-strong text-ink-muted my-6 border-l-2 pl-4" />
  ),

  hr: () => <hr className="border-line my-10" />,

  code: (props: React.ComponentProps<'code'>) => (
    <code
      {...props}
      className="text-code bg-surface-muted rounded px-1 py-0.5 font-mono break-words"
    />
  ),
  pre: (props: React.ComponentProps<'pre'>) => (
    <pre
      {...props}
      className="text-code bg-surface-subtle border-line my-6 overflow-x-auto rounded-lg border p-4 [&>code]:bg-transparent [&>code]:p-0"
    />
  ),

  table: (props: React.ComponentProps<'table'>) => (
    <div className="my-6 overflow-x-auto">
      <table {...props} className="text-body-sm w-full border-collapse" />
    </div>
  ),
  th: (props: React.ComponentProps<'th'>) => (
    <th {...props} className="border-line text-ink-strong border-b px-3 py-2 text-left" />
  ),
  td: (props: React.ComponentProps<'td'>) => (
    <td {...props} className="border-line-subtle border-b px-3 py-2" />
  ),

  // TODO: R2 이미지는 <Img> 로 바꾼다 (config/images.json 의 width/height/blur).
  //       절대 규칙 8 — next/image 에 물리지 않는다.
  img: (props: React.ComponentProps<'img'>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ''} className="border-line my-6 rounded-lg border" />
  ),
};

export async function MdxContent({ source, className }: { source: string; className?: string }) {
  // 위키링크를 풀려면 전체 글 목록이 필요하다. 파일명은 규약대로 조립한다.
  const targets: LinkTarget[] = getAllPosts().map(post => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    file: `${post.date}-${post.slug}`,
  }));

  const { content } = await compileMDX({
    source,
    components: COMPONENTS,
    options: {
      mdxOptions: {
        // unified 는 [플러그인, 옵션] 을 받아 자기가 호출한다. 미리 호출해서
        // 넘기면 트랜스포머가 플러그인 자리에 앉아 tree 대신 옵션을 받는다.
        remarkPlugins: [
          remarkGfm,
          [
            remarkCallout,
            {
              onUnknown: (type: string) =>
                console.warn(`[mdx] 모르는 콜아웃 종류 [!${type}] — note 로 그린다`),
            },
          ],
          [
            remarkWikilink,
            {
              posts: targets,
              onMissing: (target: string) =>
                console.warn(`[mdx] 위키링크가 가리키는 글이 없다: [[${target}]]`),
            },
          ],
        ],
      },
    },
  });

  return <div className={cn('text-ink', className)}>{content}</div>;
}
