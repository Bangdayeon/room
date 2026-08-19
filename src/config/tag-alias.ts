/**
 * 태그 정규화 표 (브리프 8장).
 * 태그는 소문자 영문 또는 한글 + 하이픈. 글당 2~5개. 카테고리명과 중복 금지.
 *
 * key(별칭) → value(정본). 빌드 시 모든 태그를 이 표로 치환한다.
 * 예: { 'js': 'javascript', '넷플릭스': 'netflix' }
 */
export const tagAlias: Record<string, string> = {};

/** 별칭이면 정본으로, 아니면 그대로. 글을 읽는 모든 경로가 이 함수를 지난다. */
export function normalizeTag(tag: string): string {
  return tagAlias[tag] ?? tag;
}
