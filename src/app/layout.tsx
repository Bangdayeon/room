import type { Metadata } from 'next';

import { SITE_DESCRIPTION, SITE_NAME } from '@/config/site';

import { PREFS_BOOT_SCRIPT } from '@/lib/prefs';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // 아래 인라인 스크립트가 하이드레이션 전에 class · lang 을 건드린다.
    // suppressHydrationWarning 이 없으면 React 가 이걸 불일치로 보고 되돌린다.
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 첫 페인트 전에 동기 실행 — 저장된 테마 · 언어를 되살린다.
            여기 말고는 깜빡임 없이 복원할 자리가 없다 (Next 공식 가이드
            preventing-flash-before-hydration 과 같은 방식). */}
        <script dangerouslySetInnerHTML={{ __html: PREFS_BOOT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
