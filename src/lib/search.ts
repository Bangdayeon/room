import type { Post } from '@/types/post';

/**
 * 제목 · 태그 · 요약 부분일치.
 *
 * 픽스처 십수 개가 대상이라 이걸로 충분하다. 한국어 검색 라이브러리를
 * 정하면(README 미결정) 이 함수 안쪽만 갈아끼운다 — 초성 검색이나 형태소
 * 분석이 붙어도 호출부는 그대로다.
 */

/** 공백과 대소문자를 지운다. '디자인 시스템' 으로도 '디자인시스템' 을 찾게. */
function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, '');
}

export function searchPosts(posts: Post[], query: string): Post[] {
  const needle = normalize(query);
  if (needle === '') return [];

  return posts.filter(post =>
    normalize([post.title, post.summary, ...post.tags].join(' ')).includes(needle)
  );
}
