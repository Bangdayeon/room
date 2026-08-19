import type { Link, Parent, Root, Text } from 'mdast';
import { visit } from 'unist-util-visit';

import { type LinkTarget, resolveWikilink } from '@/lib/mdx/wikilink';

/**
 * `[[파일명]]` · `[[파일명|별칭]]` 을 내부 링크로 바꾼다.
 *
 * 코드블록 · 인라인 코드는 text 노드가 아니라 code · inlineCode 노드라
 * 애초에 visit 대상이 아니다 — 별도로 걸러낼 필요가 없다.
 *
 * 못 찾은 대상은 링크로 만들지 않고 원문 그대로 둔다. 글을 쓰다 만 상태에서
 * 화면이 깨지는 것보다 낫고, 어디가 깨졌는지는 빌드 로그가 알려 준다.
 */

const WIKILINK = /\[\[([^\]|\n]+?)(?:\|([^\]\n]+?))?\]\]/g;

export type WikilinkOptions = {
  posts: LinkTarget[];
  /** 못 찾은 대상을 받는다. 빌드 로그를 남기는 쪽이 정한다. */
  onMissing?: (target: string) => void;
};

export function remarkWikilink({ posts, onMissing }: WikilinkOptions) {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === undefined) return;
      if (!node.value.includes('[[')) return;

      const replacement: (Text | Link)[] = [];
      let cursor = 0;

      for (const match of node.value.matchAll(WIKILINK)) {
        const [raw, rawTarget, rawAlias] = match;
        const start = match.index;
        const target = rawTarget.trim();
        const found = resolveWikilink(target, posts);

        if (!found) {
          onMissing?.(target);
          continue; // 원문을 그대로 둔다 — 아래 slice 가 통째로 집어 간다.
        }

        if (start > cursor) {
          replacement.push({ type: 'text', value: node.value.slice(cursor, start) });
        }

        replacement.push({
          type: 'link',
          url: `/${found.id}`,
          children: [{ type: 'text', value: rawAlias?.trim() || found.title }],
        });

        cursor = start + raw.length;
      }

      if (replacement.length === 0) return;

      if (cursor < node.value.length) {
        replacement.push({ type: 'text', value: node.value.slice(cursor) });
      }

      (parent as Parent).children.splice(index, 1, ...replacement);
      // 새로 넣은 노드들은 다시 훑지 않는다 (링크 안에서 또 링크를 찾을 이유가 없다).
      return index + replacement.length;
    });
  };
}
