/**
 * 검색어 한 개를 헤더 입력창과 /search 화면이 나눠 쓴다.
 *
 * 둘은 컴포넌트 트리에서 멀리 떨어져 있다 (헤더는 셸, 결과는 페이지). props
 * 로 잇자면 layout 까지 상태가 올라가야 하고, URL(useSearchParams)로 잇자면
 * 타이핑마다 라우터가 돌고 모든 페이지가 Suspense 경계를 요구한다. 그래서
 * prefs.ts · recent-searches.ts 와 같은 모듈 스토어로 둔다.
 *
 * URL 은 이 값의 거울이다 — 공유 · 뒤로가기용으로 200ms 디바운스해서
 * replace 로만 쓰고, 읽는 건 첫 진입 때 한 번뿐이다.
 */

const listeners = new Set<() => void>();

/** null = 아직 아무도 안 건드림. 첫 읽기에서 URL 을 한 번 본다. */
let query: string | null = null;

export function subscribeQuery(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getQuery(): string {
  query ??= new URLSearchParams(window.location.search).get('q') ?? '';
  return query;
}

/** 서버에는 URL 을 읽을 window 가 없다. 프리렌더는 늘 빈 화면(그래프)이다. */
export function getServerQuery(): string {
  return '';
}

export function setQuery(next: string) {
  if (query === next) return;
  query = next;
  for (const listener of listeners) listener();
}
