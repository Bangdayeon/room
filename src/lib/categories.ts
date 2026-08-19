/**
 * 카테고리 목록 (브리프 4장). 콘텐츠에서는 content/ 하위 폴더가 카테고리를 결정하고,
 * 라우트에서는 이 배열이 /{category} 의 정적 파라미터가 된다.
 */
export const CATEGORIES = ['dev', 'design', 'review', 'toon', 'travel', 'log'] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

/**
 * 카테고리별 색 클래스.
 *
 * Tailwind 는 소스에 문자열로 존재하는 클래스만 생성한다. `bg-cat-${category}`
 * 처럼 조립하면 유틸리티가 만들어지지 않으므로 전체 클래스명을 여기 적어둔다.
 *
 *   dot     목록의 카테고리 도트 · 상세 상단 띠 (면. 글자색 아님)
 *   ink     같은 계열 글자색 (AA 통과)
 *   subtle  칩 · 배너 배경
 *   fill    SVG 면 (/search 의 글 그래프 노드)
 *
 * 색은 의미를 혼자 짊어지지 않는다 — 도트 옆에는 항상 카테고리 이름이 텍스트로
 * 함께 있어야 한다. 좌측 네비 활성 표시는 색이 아니라 형태로 한다 (브리프 7장).
 */
export const CATEGORY_COLOR: Record<
  Category,
  { dot: string; ink: string; subtle: string; fill: string }
> = {
  dev: {
    dot: 'bg-cat-dev',
    ink: 'text-cat-dev-ink',
    subtle: 'bg-cat-dev-subtle',
    fill: 'fill-cat-dev',
  },
  design: {
    dot: 'bg-cat-design',
    ink: 'text-cat-design-ink',
    subtle: 'bg-cat-design-subtle',
    fill: 'fill-cat-design',
  },
  review: {
    dot: 'bg-cat-review',
    ink: 'text-cat-review-ink',
    subtle: 'bg-cat-review-subtle',
    fill: 'fill-cat-review',
  },
  toon: {
    dot: 'bg-cat-toon',
    ink: 'text-cat-toon-ink',
    subtle: 'bg-cat-toon-subtle',
    fill: 'fill-cat-toon',
  },
  travel: {
    dot: 'bg-cat-travel',
    ink: 'text-cat-travel-ink',
    subtle: 'bg-cat-travel-subtle',
    fill: 'fill-cat-travel',
  },
  log: {
    dot: 'bg-cat-log',
    ink: 'text-cat-log-ink',
    subtle: 'bg-cat-log-subtle',
    fill: 'fill-cat-log',
  },
};
