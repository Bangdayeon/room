import type { Metadata } from 'next';

import '@/styles/globals.css';

export const metadata: Metadata = {
  // 사이트 명칭 미확정 (브리프 10장)
  title: '방다',
  description: '개발 · 기획 · 리뷰 · 인스타툰 · 여행 기록 아카이브',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
