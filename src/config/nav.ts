import { CATEGORIES } from '@/lib/categories';

/**
 * 좌측 네비 트리.
 *
 * 지금 실제로 존재하는 페이지만, 한 단으로 펼쳐서 넣는다. 깊이 제한은 없다 —
 * 어느 노드에든 children 을 달면 <Sidebar> 가 들여쓰기 · 펼침 토글 · 활성 전파를
 * 그대로 처리하므로, 나중에 DEV 아래 소메뉴를 붙일 때 이 배열만 고치면 된다.
 */
export type NavNode = {
  /** 표시 이름. 카테고리는 대문자 영문 (브리프 7장). */
  label: string;
  href: string;
  /** 연한 글씨로 한 단 낮춰 보이게 한다 — 카테고리가 아닌 보조 메뉴. */
  muted?: boolean;
  /** 활성 자손이 없어도 처음부터 펼쳐 둘지. */
  defaultOpen?: boolean;
  children?: NavNode[];
};

export const NAV: NavNode[] = [
  { label: '홈', href: '/' },

  ...CATEGORIES.map(category => ({
    label: category.toUpperCase(),
    href: `/${category}`,
  })),

  { label: '태그', href: '/tags', muted: true },
  { label: '아카이브', href: '/archive', muted: true },
  { label: '소개', href: '/about', muted: true },
];
