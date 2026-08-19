'use client';

import { useSyncExternalStore } from 'react';

import { cn } from '@/lib/cn';
import {
  type Lang,
  SERVER_LANG,
  SERVER_THEME,
  type Theme,
  applyLang,
  applyTheme,
  readLang,
  readTheme,
  subscribePrefs,
} from '@/lib/prefs';

import { Dropdown } from '@/components/Dropdown';

/**
 * 헤더 우측 설정 — 언어 · 테마.
 *
 * 데스크톱은 드롭다운 두 개, 모바일은 톱니 하나에 둘 다 넣는다 (375px 에
 * 로고 · 검색 · 드롭다운 둘을 같이 세우면 제목부터 뭉갠다).
 *
 * 현재 값 표시는 JS 상태가 아니라 <html> 을 보는 CSS variant 가 한다
 * (theme-dark:inline 처럼). head 인라인 스크립트가 첫 페인트 전에 class 와
 * lang 을 복원하므로 새로고침 직후에도 틀린 값이 잠깐 비치지 않는다.
 * JS 로 읽은 값은 aria-pressed 에만 쓴다.
 */

type Option<T extends string> = {
  value: T;
  label: string;
  /** 패널에서 현재 값을 칠하는 클래스. */
  active: string;
  /** 트리거에서 이 라벨만 보이게 하는 클래스. */
  show: string;
};

const THEME_OPTIONS: readonly Option<Theme>[] = [
  {
    value: 'system',
    label: '시스템',
    active: 'theme-system:bg-primary-subtle theme-system:text-primary-ink',
    show: 'hidden theme-system:inline',
  },
  {
    value: 'light',
    label: '라이트',
    active: 'theme-light:bg-primary-subtle theme-light:text-primary-ink',
    show: 'hidden theme-light:inline',
  },
  {
    value: 'dark',
    label: '다크',
    active: 'theme-dark:bg-primary-subtle theme-dark:text-primary-ink',
    show: 'hidden theme-dark:inline',
  },
];

const LANG_OPTIONS: readonly Option<Lang>[] = [
  {
    value: 'ko',
    label: '한국어',
    active: 'lang-ko:bg-primary-subtle lang-ko:text-primary-ink',
    show: 'hidden lang-ko:inline',
  },
  {
    value: 'en',
    label: 'English',
    active: 'lang-en:bg-primary-subtle lang-en:text-primary-ink',
    show: 'hidden lang-en:inline',
  },
];

function Caret() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className="size-3 shrink-0">
      <path
        d="M3 4.75 6 8l3-3.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 트리거 라벨 — 현재 값 하나만 CSS 로 드러난다. */
function CurrentLabel<T extends string>({ options }: { options: readonly Option<T>[] }) {
  return (
    <span>
      {options.map(option => (
        <span key={option.value} className={option.show}>
          {option.label}
        </span>
      ))}
    </span>
  );
}

function OptionList<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'text-meta text-ink hover:bg-surface-subtle block w-full rounded-md px-2 py-1.5 text-left',
            'focus-visible:outline-primary focus-visible:outline-2 focus-visible:-outline-offset-2',
            option.active
          )}
        >
          {option.label}
        </button>
      ))}
    </>
  );
}

function useTheme() {
  return useSyncExternalStore(subscribePrefs, readTheme, () => SERVER_THEME);
}

function useLang() {
  return useSyncExternalStore(subscribePrefs, readLang, () => SERVER_LANG);
}

export function LangMenu() {
  const lang = useLang();

  return (
    <Dropdown
      label="언어 선택"
      trigger={
        <>
          <CurrentLabel options={LANG_OPTIONS} />
          <Caret />
        </>
      }
    >
      <OptionList options={LANG_OPTIONS} value={lang} onChange={applyLang} />
    </Dropdown>
  );
}

export function ThemeMenu() {
  const theme = useTheme();

  return (
    <Dropdown
      label="테마 선택"
      trigger={
        <>
          <CurrentLabel options={THEME_OPTIONS} />
          <Caret />
        </>
      }
    >
      <OptionList options={THEME_OPTIONS} value={theme} onChange={applyTheme} />
    </Dropdown>
  );
}

/** 모바일 — 언어 · 테마를 한 패널에 담는다. */
export function SettingsMenu() {
  const lang = useLang();
  const theme = useTheme();

  return (
    <Dropdown
      label="설정"
      trigger={
        <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5">
          <circle cx="10" cy="10" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M10 2.2v2M10 15.8v2M17.8 10h-2M4.2 10h-2M15.5 4.5l-1.4 1.4M5.9 14.1l-1.4 1.4M15.5 15.5l-1.4-1.4M5.9 5.9 4.5 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      }
    >
      <p className="text-meta-sm text-ink-muted px-2 pt-1 pb-0.5">언어</p>
      <OptionList options={LANG_OPTIONS} value={lang} onChange={applyLang} />

      <p className="text-meta-sm text-ink-muted mt-1 px-2 pt-1 pb-0.5">테마</p>
      <OptionList options={THEME_OPTIONS} value={theme} onChange={applyTheme} />
    </Dropdown>
  );
}
