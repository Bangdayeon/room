/**
 * 카테고리 목록 (브리프 4장). 콘텐츠에서는 content/ 하위 폴더가 카테고리를 결정하고,
 * 라우트에서는 이 배열이 /{category} 의 정적 파라미터가 된다.
 */
export const CATEGORIES = ['dev', 'design', 'review', 'toon', 'travel', 'log'] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
