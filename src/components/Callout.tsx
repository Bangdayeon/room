import { cn } from '@/lib/cn';
import { CALLOUT_TYPES, type CalloutType } from '@/lib/mdx/remark-callout';

/**
 * Obsidian 콜아웃.
 *
 *   > [!tip] 제목
 *   > 본문
 *
 * remark-callout 이 blockquote 를 <callout> 으로 바꾸고, MDX 컴포넌트 맵이
 * 이 컴포넌트로 잇는다. 그래서 props 는 전부 문자열로 들어온다.
 *
 * 색은 이미 있는 시맨틱 토큰을 그대로 쓴다 — 콜아웃 전용 색을 새로 만들면
 * 팔레트가 두 벌이 된다.
 */

const STYLES: Record<CalloutType, { box: string; mark: string; icon: string }> = {
  note: {
    box: 'bg-primary-subtle border-primary',
    mark: 'text-primary-ink',
    // 느낌표 (알림)
    icon: 'M12 8v5m0 3.2v.1',
  },
  tip: {
    box: 'bg-success-subtle border-success',
    mark: 'text-success-ink',
    // 체크
    icon: 'm8 12.5 2.8 2.8L16.5 9.6',
  },
  warning: {
    box: 'bg-warning-subtle border-warning',
    mark: 'text-warning-ink',
    icon: 'M12 8v5m0 3.2v.1',
  },
  danger: {
    box: 'bg-error-subtle border-error',
    mark: 'text-error-ink',
    // 엑스
    icon: 'm8.8 8.8 6.4 6.4M15.2 8.8l-6.4 6.4',
  },
  quote: {
    box: 'bg-surface-subtle border-line-strong',
    mark: 'text-ink-muted',
    // 따옴표
    icon: 'M9.5 9.5h-2v2h2v3M16.5 9.5h-2v2h2v3',
  },
};

const LABELS: Record<CalloutType, string> = {
  note: '참고',
  tip: '팁',
  warning: '주의',
  danger: '경고',
  quote: '인용',
};

function isCalloutType(value: string): value is CalloutType {
  return (CALLOUT_TYPES as readonly string[]).includes(value);
}

export function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: string;
  title?: string;
  children?: React.ReactNode;
}) {
  const kind = isCalloutType(type) ? type : 'note';
  const style = STYLES[kind];

  return (
    <aside className={cn('my-6 rounded-lg border-l-4 px-4 py-3', style.box)}>
      <p className={cn('text-label mb-1 flex items-center gap-1.5', style.mark)}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 shrink-0">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path
            d={style.icon}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {title || LABELS[kind]}
      </p>

      <div className="text-body-sm text-ink [&>p]:my-1">{children}</div>
    </aside>
  );
}
