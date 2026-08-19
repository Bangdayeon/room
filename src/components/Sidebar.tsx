'use client';

import { useId, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAV, type NavNode } from '@/config/nav';

import { cn } from '@/lib/cn';

/* 활성 도트 색. vivid 토큰만 쓴다 — 주황으로 바꾸려면 bg-cat-log 로 교체.
   (브리프 7장은 좌측 네비 활성 표시를 형태로만 하라고 하지만, 여기서는
   요청대로 색 + 형태를 함께 쓴다. 도트 옆에 항상 메뉴 이름이 있으므로
   색이 정보를 혼자 짊어지지는 않는다.) */
const ACTIVE_DOT = 'bg-primary';

/** '/' 는 정확히 일치할 때만 활성. 나머지는 하위 경로까지 포함한다. */
function isMatch(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * 현재 경로에 해당하는 노드의 href. 가장 깊은(= 가장 긴) 것 하나만 이긴다.
 * 활성 항목이 없으면 빈 문자열 (예: /search — 메뉴에 없는 화면).
 */
function findActiveHref(nodes: NavNode[], pathname: string) {
  let active = '';
  const stack: NavNode[] = [...nodes];

  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) break;
    if (node.href.length > active.length && isMatch(pathname, node.href)) {
      active = node.href;
    }
    if (node.children) stack.push(...node.children);
  }

  return active;
}

/** 자손 중에 활성 항목이 있는가 — 있으면 부모를 자동으로 펼친다. */
function hasActiveDescendant(node: NavNode, activeHref: string): boolean {
  return (node.children ?? []).some(
    child => child.href === activeHref || hasActiveDescendant(child, activeHref)
  );
}

function NavBranch({
  node,
  depth,
  activeHref,
}: {
  node: NavNode;
  depth: number;
  activeHref: string;
}) {
  const children = node.children ?? [];
  const listId = useId();

  // null = 아직 사용자가 건드리지 않음 → 경로와 defaultOpen 을 따른다.
  const [toggled, setToggled] = useState<boolean | null>(null);
  const open = toggled ?? (hasActiveDescendant(node, activeHref) || node.defaultOpen === true);

  const isActive = node.href === activeHref;

  return (
    <li>
      {/* pr-9 는 오른쪽 끝 도트 자리. 깊이만큼 왼쪽을 들여쓴다. */}
      <div
        className="hover:bg-surface-subtle relative flex items-center pr-9"
        style={{ paddingInlineStart: `calc(1rem + ${depth} * 1rem)` }}
      >
        <Link
          href={node.href}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            'text-nav min-w-0 flex-1 truncate py-2',
            'focus-visible:outline-primary focus-visible:outline-2 focus-visible:-outline-offset-2',
            isActive
              ? 'text-ink-strong font-semibold'
              : node.muted
                ? 'text-ink-muted hover:text-ink'
                : 'text-ink'
          )}
        >
          {node.label}
        </Link>

        {children.length > 0 && (
          // 펼침 토글은 텍스트 오른쪽. 아이콘 라이브러리를 쓰지 않는다 (README 규약).
          <button
            type="button"
            onClick={() => setToggled(!open)}
            aria-expanded={open}
            aria-controls={listId}
            aria-label={`${node.label} 하위 메뉴 ${open ? '접기' : '펼치기'}`}
            className="text-ink-muted hover:text-ink focus-visible:outline-primary grid size-5 shrink-0 place-items-center focus-visible:outline-2"
          >
            <svg
              viewBox="0 0 12 12"
              aria-hidden="true"
              className={cn('size-3 transition-transform duration-200', open && 'rotate-90')}
            >
              <path
                d="M4.5 2.5 8 6l-3.5 3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {isActive && (
          // 바깥 span 이 위치(수직 중앙)를, 안쪽 span 이 애니메이션을 맡는다.
          // 한 요소에 몰면 키프레임의 transform 이 -translate-y-1/2 를 덮어쓴다.
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
          >
            <span className={cn('animate-pudding-rise block size-3 origin-bottom', ACTIVE_DOT)} />
          </span>
        )}
      </div>

      {children.length > 0 && (
        <ul id={listId} hidden={!open}>
          {children.map(child => (
            <NavBranch key={child.href} node={child} depth={depth + 1} activeHref={activeHref} />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * 좌측 네비게이션.
 *
 * 브랜드와 설정은 헤더로 갔고 여기는 메뉴만 남았다. 접힘 상태는 헤더의
 * 토글이 들고 있어서 prop 으로 받는다 (AppShell 참고).
 */
export function Sidebar({ id, open }: { id: string; open: boolean }) {
  const pathname = usePathname();
  const activeHref = findActiveHref(NAV, pathname);

  return (
    <aside
      className={cn(
        // top-14 · 100dvh-3.5rem 은 헤더 높이(h-14)와 짝이다. 한쪽만 고치면 어긋난다.
        'border-line bg-surface w-full shrink-0 transition-[width] duration-200',
        'md:sticky md:top-14 md:h-[calc(100dvh-3.5rem)]',
        open ? 'border-b md:w-56 md:border-r md:border-b-0' : 'md:w-0 md:overflow-hidden'
      )}
    >
      <nav id={id} hidden={!open} aria-label="사이트 메뉴" className="py-4">
        <ul>
          {NAV.map(node => (
            <NavBranch key={node.href} node={node} depth={0} activeHref={activeHref} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
