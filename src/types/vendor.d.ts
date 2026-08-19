/**
 * 타입 선언이 없는 패키지들. 쓰는 만큼만 적는다.
 *
 * scripts/subset-font.ts 전용이라 앱 번들에는 들어가지 않는다.
 * 넓게 `declare module 'x'` 로 두면 any 가 되어 오탈자를 못 잡는다.
 */

declare module 'subset-font' {
  /** 축을 한 값에 고정하거나(number) 범위를 좁힌다. */
  type VariationAxis = number | { min?: number; max?: number; default?: number };

  export default function subsetFont(
    font: Buffer,
    text: string,
    options?: {
      targetFormat?: 'sfnt' | 'truetype' | 'woff' | 'woff2';
      preserveNameIds?: number[];
      variationAxes?: Record<string, VariationAxis>;
    }
  ): Promise<Buffer>;
}

declare module 'fontverter' {
  export function convert(
    font: Buffer,
    toFormat: 'sfnt' | 'truetype' | 'woff' | 'woff2',
    fromFormat?: string
  ): Promise<Buffer>;

  const fontverter: { convert: typeof convert };
  export default fontverter;
}
