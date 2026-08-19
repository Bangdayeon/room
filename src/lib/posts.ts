import type { Graph, GraphLink, GraphNode, Post } from '@/types/post';

import type { Category } from '@/lib/categories';
import { CATEGORIES } from '@/lib/categories';
import { loadBody, loadPosts } from '@/lib/content/source';

/**
 * 글 데이터를 읽는 유일한 창구.
 *
 * 출처(dev 는 src/content 직독, 프로덕션은 src/data/index.json)는 source.ts 가
 * 가린다. 화면은 여기 함수들만 알면 된다.
 *
 * dev 에서는 draft 도 섞여 나온다 — 쓰는 중인 글을 로컬에서 보라고 그렇게 뒀다.
 * 프로덕션 산출물에는 draft 가 애초에 없다.
 */

/** 전체 글, 최신순. */
export function getAllPosts(): Post[] {
  return loadPosts();
}

export function getPost(category: string, slug: string): Post | null {
  return getAllPosts().find(post => post.category === category && post.slug === slug) ?? null;
}

/** 글 본문(MDX 원문). 파일이 사라졌으면 null. */
export function getPostBody(post: Post): string | null {
  return loadBody(post);
}

export function getPostsByCategory(category: Category): Post[] {
  return getAllPosts().filter(post => post.category === category);
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter(post => post.tags.includes(tag));
}

/** 연도별 묶음, 최신 연도부터. */
export function getArchive(): { year: string; posts: Post[] }[] {
  const byYear = new Map<string, Post[]>();

  for (const post of getAllPosts()) {
    const year = post.date.slice(0, 4);
    byYear.set(year, [...(byYear.get(year) ?? []), post]);
  }

  return [...byYear]
    .map(([year, posts]) => ({ year, posts }))
    .sort((a, b) => b.year.localeCompare(a.year));
}

/** 태그 → 글 수. 많은 순, 같으면 이름순. */
export function getTagCounts(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }

  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/**
 * 글 아래에 붙일 관련글.
 *
 * 순서가 곧 우선순위다 — 내가 직접 이어 둔 글(위키링크)이 먼저고, 그다음은
 * 태그가 많이 겹치는 글, 그래도 모자라면 같은 카테고리의 최신 글로 채운다.
 * 자동 추천이 손으로 적은 링크를 밀어내지 않게 하려는 순서다.
 */
export function getRelatedPosts(post: Post, limit = 4): Post[] {
  const all = getAllPosts().filter(candidate => candidate.id !== post.id);
  const picked: Post[] = [];

  const take = (candidates: Post[]) => {
    for (const candidate of candidates) {
      if (picked.length >= limit) return;
      if (picked.some(already => already.id === candidate.id)) continue;
      picked.push(candidate);
    }
  };

  const byId = new Map(all.map(candidate => [candidate.id, candidate]));
  take(post.related.flatMap(id => byId.get(id) ?? []));

  const shared = all
    .map(candidate => ({
      candidate,
      overlap: candidate.tags.filter(tag => post.tags.includes(tag)).length,
    }))
    .filter(entry => entry.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || b.candidate.date.localeCompare(a.candidate.date))
    .map(entry => entry.candidate);

  take(shared);
  take(all.filter(candidate => candidate.category === post.category));

  return picked;
}

/**
 * 글 그래프.
 *
 * 카테고리 6개가 허브로 서고 그 아래 글이 매달린다 (실선). 글끼리는 본문의
 * 위키링크로 이어진다 (점선). 선이 두 종류지만 굵기 · 점선으로 구분되고,
 * 카테고리 선은 "소속", 위키링크 선은 "이어 읽기"라 뜻이 겹치지 않는다.
 *
 * 카테고리당 perCategory 개까지만 올린다 — 전부 올리면 글이 늘수록 그림이
 * 아니라 실타래가 된다. 밀려난 글은 검색과 카테고리 페이지에 있다.
 */
export function getGraph(perCategory: number): Graph {
  const all = getAllPosts();

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const relatedDegree = new Map<string, number>();

  const chosen = new Map<Category, Post[]>();
  for (const category of CATEGORIES) {
    const posts = rankForGraph(all.filter(post => post.category === category)).slice(
      0,
      perCategory
    );
    if (posts.length > 0) chosen.set(category, posts);
  }

  const included = new Set([...chosen.values()].flat().map(post => post.id));

  // 글끼리의 선을 먼저 센다 — 노드 반지름이 이 수를 쓴다.
  const seen = new Set<string>();
  for (const post of [...chosen.values()].flat()) {
    for (const target of post.related) {
      // 상한 밖으로 밀린 글로 향하는 선은 그리지 않는다. 깨진 참조는 이미
      // 빌드가 걸러 내므로 여기서는 조용히 넘어간다.
      if (!included.has(target)) continue;

      const key = [post.id, target].sort().join(' ');
      if (seen.has(key)) continue;
      seen.add(key);

      links.push({ source: post.id, target, kind: 'related' });
      relatedDegree.set(post.id, (relatedDegree.get(post.id) ?? 0) + 1);
      relatedDegree.set(target, (relatedDegree.get(target) ?? 0) + 1);
    }
  }

  for (const [category, posts] of chosen) {
    const hubId = `category:${category}`;

    nodes.push({
      id: hubId,
      label: category.toUpperCase(),
      category,
      kind: 'category',
      href: `/${category}`,
      degree: posts.length,
    });

    for (const post of posts) {
      nodes.push({
        id: post.id,
        label: post.title,
        category,
        kind: 'post',
        href: `/${post.id}`,
        degree: relatedDegree.get(post.id) ?? 0,
      });

      links.push({ source: hubId, target: post.id, kind: 'category' });
    }
  }

  return { nodes, links };
}

/**
 * 그래프에 올릴 글을 고르는 순서. 지금은 최신순이다.
 *
 * TODO(조회수): "많이 읽힌 글"로 바꾸려면 이 함수 하나만 갈아끼우면 된다.
 * 다만 지금은 재료가 없다. 선행 작업 세 가지 —
 *
 *   1. 분석 도구 설치 (Plausible · Umami · Vercel Analytics 중 택 1).
 *      README 미결정 항목이라 도구부터 정해야 한다.
 *   2. 집계 API 로 경로별 조회수를 받아오는 스크립트.
 *      scripts/build-index.ts 에서 빌드 때 한 번 호출한다.
 *   3. Post 스키마에 views?: number 추가 → src/data/index.json 에 굽는다.
 *      frontmatter 에는 넣지 않는다. 사람이 적는 값이 아니다.
 *
 * 그 뒤 이 함수는 (b.views ?? 0) - (a.views ?? 0) 로 시작하고, 조회수가 같거나
 * 아직 집계되지 않은 글은 지금처럼 최신순으로 밀어내면 된다.
 */
function rankForGraph(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}
