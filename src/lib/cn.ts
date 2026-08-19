import clsx, { type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * typography.css 가 만든 크기 유틸리티 이름들.
 *
 * tailwind-merge 는 CSS 를 읽지 않는다. 등록하지 않으면 text-nav · text-meta 를
 * 글자색으로 오해해서 뒤에 온 text-ink 와 충돌한 것으로 보고 지워버린다
 * (좌측 네비 라벨이 14px 이 아니라 16px 로 나왔던 원인). typography.css 에
 * --text-* 를 추가하면 여기에도 같이 넣을 것.
 */
const FONT_SIZES = [
  'display',
  'title-lg',
  'title-md',
  'title-sm',
  'body-lg',
  'body',
  'body-sm',
  'meta',
  'meta-sm',
  'meta-xs',
  'label',
  'nav',
  'code',
];

const twMerge = extendTailwindMerge({
  extend: { classGroups: { 'font-size': [{ text: FONT_SIZES }] } },
});

/** Tailwind 클래스 병합. 조건부 클래스 + 뒤에 온 유틸리티가 앞을 덮도록 정리한다. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
