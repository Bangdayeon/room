/**
 * 최근 검색어.
 *
 * lib/prefs.ts 와 같은 모양이다 — 진짜 값은 localStorage 에 있고, 화면은
 * useSyncExternalStore 로 그걸 구독한다. 타이핑 중간값이 쌓이면 쓰레기가
 * 되므로 저장은 Enter · 결과 클릭 시점에만 부른다.
 */

const KEY = 'recent-searches';
const LIMIT = 8;

const listeners = new Set<() => void>();

/** 스냅샷은 참조가 안정적이어야 한다 — 매번 새 배열을 만들면 무한 렌더가 난다. */
let cache: string[] | null = null;

const EMPTY: string[] = [];

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;

    return parsed.filter((item): item is string => typeof item === 'string').slice(0, LIMIT);
  } catch {
    // 값이 깨졌거나 localStorage 가 막힌 환경. 최근 검색만 포기한다.
    return EMPTY;
  }
}

function write(next: string[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // 저장만 포기한다. 이번 세션 동안은 cache 로 유지된다.
  }
  for (const listener of listeners) listener();
}

export function subscribeRecentSearches(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getRecentSearches(): string[] {
  cache ??= read();
  return cache;
}

/** 서버에는 localStorage 가 없다. 하이드레이션 전에는 빈 목록이 정답이다. */
export function getServerRecentSearches(): string[] {
  return EMPTY;
}

export function addRecentSearch(query: string) {
  const value = query.trim();
  if (value === '') return;

  // 같은 검색어를 다시 하면 위로 올린다.
  const rest = getRecentSearches().filter(item => item !== value);
  write([value, ...rest].slice(0, LIMIT));
}

export function removeRecentSearch(query: string) {
  write(getRecentSearches().filter(item => item !== query));
}

export function clearRecentSearches() {
  write(EMPTY);
}
