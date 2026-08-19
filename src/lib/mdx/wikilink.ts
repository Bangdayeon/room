/**
 * Obsidian 위키링크.
 *
 * vault 에서 `[[2026-08-11-next-16]]` 또는 `[[2026-08-11-next-16|이 글]]` 로
 * 적힌 것을 내부 링크로 바꾼다. Obsidian 이 넣어 주는 건 파일명이므로 파일명을
 * 기준으로 찾고, 사람이 손으로 slug 만 적은 경우도 받아 준다.
 *
 * 추출(빌드 스크립트가 related 를 채울 때)과 해석(렌더할 때)이 같은 규칙을
 * 봐야 그래프의 선과 본문의 링크가 어긋나지 않는다. 그래서 한 파일에 둔다.
 */

/** `[[대상]]` · `[[대상|별칭]]`. 대상에 `]`와 `|`는 못 들어간다. */
const WIKILINK = /\[\[([^\]|\n]+?)(?:\|([^\]\n]+?))?\]\]/g;

/** 코드블록 · 인라인 코드 안의 [[...]] 는 링크가 아니다. */
function stripCode(body: string) {
  return body.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

export type Wikilink = {
  /** 대괄호 안에 적힌 그대로. 파일명일 수도, slug 일 수도 있다. */
  target: string;
  /** `|` 뒤의 표시 문구. 없으면 undefined. */
  alias?: string;
};

/** 본문에 등장하는 순서대로. 같은 대상이 여러 번 나오면 여러 번 나온다. */
export function extractWikilinks(body: string): Wikilink[] {
  const found: Wikilink[] = [];

  for (const match of stripCode(body).matchAll(WIKILINK)) {
    const target = match[1].trim();
    if (target === '') continue;
    found.push({ target, alias: match[2]?.trim() || undefined });
  }

  return found;
}

/** 해석에 필요한 최소한. 글 전체를 넘길 이유가 없다. */
export type LinkTarget = { id: string; slug: string; title: string; file: string };

/**
 * 대상 문자열 → 글 id.
 *
 * 파일명(`2026-08-11-slug` · 확장자 유무 무관) 으로 먼저 찾고, 없으면 slug 로,
 * 그래도 없으면 `category/slug` 통째로 적은 경우를 본다. 못 찾으면 null —
 * 부르는 쪽이 경고를 남기고 일반 텍스트로 둔다.
 */
export function resolveWikilink(target: string, posts: LinkTarget[]): LinkTarget | null {
  const needle = target.replace(/\.mdx$/i, '').trim();
  const bare = needle.includes('/') ? (needle.split('/').pop() ?? needle) : needle;

  return (
    posts.find(post => post.file === bare) ??
    posts.find(post => post.slug === bare) ??
    posts.find(post => post.id === needle) ??
    null
  );
}
