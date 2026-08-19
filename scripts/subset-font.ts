import fs from 'node:fs';
import path from 'node:path';
import subsetFont from 'subset-font';

/**
 * Pretendard Variable 을 이 사이트가 실제로 쓰는 만큼만 남긴다.
 *
 *   pnpm font
 *
 * 원본(public/fonts/PretendardVariable.woff2)은 100~900 전 구간과 한자까지
 * 들어 있어 2MB 가 넘는다. 여기서 두 방향으로 깎는다 —
 *
 *   굵기 400~700  타이포 토큰이 쓰는 네 단계(400 · 500 · 600 · 700)만.
 *                 Thin · ExtraLight · Light · ExtraBold · Black 은 쓰는 곳이 없다.
 *   글자          한글 완성형 + 라틴 + 문장부호. 한자는 넣지 않는다
 *                 (2만 자가 넘어 파일이 도로 커진다. 필요해지면 CJK 범위를 켤 것)
 *
 * 결과는 typography.css 의 @font-face 가 가리키는 이름으로 저장한다.
 */

const FONT_DIR = path.join(process.cwd(), 'public', 'fonts');
const OUTPUT_NAME = 'PretendardVariable.subset.woff2';

/**
 * 원본을 이름으로 딱 집지 않고 찾는다 — 내려받은 파일 이름에 공백이나 버전이
 * 붙어 오는 일이 잦다. 산출물(.subset.)은 후보에서 뺀다.
 */
function findSource() {
  if (!fs.existsSync(FONT_DIR)) return null;

  const found = fs
    .readdirSync(FONT_DIR)
    .filter(name => /pretendard.*variable.*\.woff2$/i.test(name.replace(/\s+/g, '')))
    .filter(name => !name.includes('.subset.'));

  return found[0] ? path.join(FONT_DIR, found[0]) : null;
}

/** 남길 유니코드 구간. 끝값을 포함한다. */
const RANGES: [number, number, string][] = [
  [0x0020, 0x007e, '기본 라틴 · 숫자 · 기호'],
  [0x00a0, 0x00ff, '라틴 보충 (é ü · 등)'],
  [0x1100, 0x11ff, '한글 조합형 자모 (NFD 로 들어온 글자용)'],
  [0x2010, 0x205e, '문장부호 (— " " … •)'],
  [0x20a9, 0x20a9, '원화 기호'],
  [0x2190, 0x21bb, '화살표 (→ 를 본문에서 쓴다)'],
  [0x2600, 0x26ff, '기타 기호 (★ ☆ 등)'],
  [0x3000, 0x303f, 'CJK 문장부호 (「」 『』)'],
  [0x3130, 0x318f, '호환 자모 (ㄱ ㄴ ㅏ)'],
  [0xac00, 0xd7a3, '한글 완성형 11,172자'],
  [0xff01, 0xff60, '전각 영문 · 기호'],
];

function charset() {
  let text = '';
  for (const [start, end] of RANGES) {
    for (let code = start; code <= end; code += 1) text += String.fromCodePoint(code);
  }
  return text;
}

/** sfnt 헤더를 훑어 maxp 의 numGlyphs 를 읽는다 — 글자가 실제로 남았는지 확인용. */
function glyphCount(sfnt: Buffer) {
  const tables = sfnt.readUInt16BE(4);

  for (let index = 0; index < tables; index += 1) {
    const entry = 12 + index * 16;
    if (sfnt.toString('ascii', entry, entry + 4) !== 'maxp') continue;
    return sfnt.readUInt16BE(sfnt.readUInt32BE(entry + 8) + 4);
  }

  return 0;
}

function kb(bytes: number) {
  return `${(bytes / 1024).toFixed(0)}KB`;
}

async function main() {
  const sourcePath = findSource();
  if (!sourcePath) {
    console.error('✖ public/fonts 에 Pretendard 가변 폰트 원본이 없다.');
    console.error('  PretendardVariable.woff2 를 그 폴더에 두고 다시 실행할 것.');
    process.exit(1);
  }

  const source = fs.readFileSync(sourcePath);
  const OUTPUT = path.join(FONT_DIR, OUTPUT_NAME);

  const subset = await subsetFont(source, charset(), {
    targetFormat: 'woff2',
    // 축을 좁히면 typography.css 의 font-weight 선언도 400 700 이어야 한다.
    variationAxes: { wght: { min: 400, max: 700, default: 400 } },
  });

  fs.writeFileSync(OUTPUT, subset);

  const { default: fontverter } = await import('fontverter');
  const asSfnt = await fontverter.convert(subset, 'truetype');

  const total = RANGES.reduce((sum, [start, end]) => sum + (end - start + 1), 0);
  console.log(
    `✓ ${path.basename(OUTPUT)} — ${kb(source.length)} → ${kb(subset.length)}` +
      ` (${((1 - subset.length / source.length) * 100).toFixed(0)}% 감소)`
  );
  console.log(
    `  글자 ${total.toLocaleString()}자 요청 · 글리프 ${glyphCount(asSfnt).toLocaleString()}개 남음`
  );
  console.log('  굵기 400~700 (Regular · Medium · SemiBold · Bold)');
}

await main();
