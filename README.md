# room

개발 · 기획 · 리뷰 · 인스타툰 · 여행 기록을 쌓는 개인 아카이브.
목적 우선순위: **아카이빙 > PR > 포트폴리오**.

## 요구사항

- Node.js >= 20.11
- pnpm 10

## 시작하기

```bash
pnpm install
cp .env.example .env.local   # 값 채우기
pnpm dev                     # http://localhost:3000
```

## 스크립트

| 명령                           | 설명                        |
| ------------------------------ | --------------------------- |
| `pnpm dev`                     | 개발 서버 (Turbopack)       |
| `pnpm build`                   | 프로덕션 빌드               |
| `pnpm start`                   | 빌드 결과 실행              |
| `pnpm lint`                    | ESLint (prettier 규칙 포함) |
| `pnpm lint:fix`                | ESLint 자동 수정            |
| `pnpm typecheck`               | `tsc --noEmit`              |
| `pnpm format` / `format:check` | Prettier                    |

## 구조

```
src/
├─ app/
│  ├─ layout.tsx · not-found.tsx
│  └─ (route)/
│     ├─ page.tsx                 /
│     ├─ [category]/page.tsx      /{category}
│     ├─ [category]/[slug]/page.tsx
│     ├─ tags/page.tsx · tags/[tag]/page.tsx
│     ├─ archive/page.tsx
│     └─ about/page.tsx
├─ components/ lib/ styles/ types/
├─ config/     images.json(★커밋 필수) · tag-alias.ts · id-redirects.json
├─ content/    MDX 정본 (Obsidian vault 겸용). 카테고리 = 폴더
└─ data/       빌드 산출물 (gitignore)

public/        Next 제약으로 루트 고정
scripts/       upload-image.ts · build-index.ts
docs/          상세 명세
```

경로 별칭은 `@/*` → `./src/*` 하나뿐입니다 (`@/lib/cn`, `@/config/tag-alias`).

파일명 `YYYY-MM-DD-slug.mdx` → URL `/{category}/{slug}` (날짜 미포함).

## 규약

- 필수 frontmatter 5개(`title` `date` `summary` `tags` `draft`)를 넘기지 않는다
- 카테고리는 폴더로만 결정한다 (frontmatter에 `category` 없음)
- slug는 영문 소문자 + 하이픈
- 발행 후 `post.id`(`category/slug`)를 바꾸지 않는다
- UI · 아이콘 · 애니메이션 라이브러리를 쓰지 않는다
- R2 이미지를 `next/image`에 물리지 않는다 (`<Img>` 직접 서빙)

파일명 규칙은 ESLint가 강제한다 — `src/components/**`는 PascalCase, `**/hooks/**`는 camelCase.

## 미결정

- 콘텐츠 빌드 도구 (velite vs content-collections) — 아직 설치하지 않음
- 한국어 검색 라이브러리
- 도메인 · 사이트 명칭
- 디자인 토큰 (색 · 폰트 · 간격)
