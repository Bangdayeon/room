/**
 * 사용자 설정 — 테마 · 언어.
 *
 * 값은 localStorage 에 저장하고, 실제 상태는 <html> 이 들고 있다
 * (테마 = class="dark" / "light", 언어 = lang 속성). 첫 페인트 전에
 * PREFS_BOOT_SCRIPT 가 둘을 복원하므로 새로고침 때 깜빡임이 없다.
 *
 * 선택 UI 의 활성 칸도 JS 상태가 아니라 <html> 을 보는 CSS 로 칠한다
 * (globals.css 의 theme-* · lang-* variant). 그래서 하이드레이션 전에도
 * 항상 맞는 칸이 켜져 있다.
 */

export const THEME_KEY = 'theme';
export const LANG_KEY = 'lang';

export type Theme = 'system' | 'light' | 'dark';
export type Lang = 'ko' | 'en';

/** <head> 안에서 동기 실행 — localStorage 값을 <html> 에 되돌린다. */
export const PREFS_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||t==="light")d.classList.add(t);var l=localStorage.getItem("${LANG_KEY}");if(l==="ko"||l==="en")d.lang=l}catch(e){}})()`;

/* ---------- 외부 스토어 ----------
   진짜 상태는 <html> 이 들고 있다. 선택 UI 는 useSyncExternalStore 로 그걸
   구독한다 — useState + useEffect 로 흉내내면 하이드레이션 직후 한 번 더
   렌더가 돌고(react-hooks/set-state-in-effect), 서버 값이 잠깐 비친다. */

const listeners = new Set<() => void>();

export function subscribePrefs(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

/** localStorage 는 사파리 프라이빗 모드 등에서 던진다 — 설정은 실패해도 앱은 산다. */
function store(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // 저장만 포기한다. 이번 세션 동안은 <html> 에 반영된 값이 유지된다.
  }
}

export function readTheme(): Theme {
  const root = document.documentElement;
  if (root.classList.contains('dark')) return 'dark';
  if (root.classList.contains('light')) return 'light';
  return 'system';
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
  // system 은 값을 지운다 — 저장된 게 없으면 OS 설정을 따른다.
  store(THEME_KEY, theme === 'system' ? null : theme);
  emit();
}

export function readLang(): Lang {
  return document.documentElement.lang === 'en' ? 'en' : 'ko';
}

export function applyLang(lang: Lang) {
  // TODO: 아직 번역 · 로케일 라우팅이 없다. 지금은 선택을 기억하고 <html lang>
  // 만 바꾼다. i18n 을 붙이면 이 함수가 라우터를 태우는 자리가 된다.
  document.documentElement.lang = lang;
  store(LANG_KEY, lang);
  emit();
}

/* 서버에는 DOM 이 없다. <html lang="ko"> 에 클래스가 없는 상태 = 아래 기본값. */
export const SERVER_THEME: Theme = 'system';
export const SERVER_LANG: Lang = 'ko';
