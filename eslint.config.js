import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import checkFile from 'eslint-plugin-check-file';
import prettierPlugin from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

// eslint-config-next 16 부터는 flat config 를 직접 export 한다 (FlatCompat 불필요).
// react · react-hooks · jsx-a11y · import · @typescript-eslint 플러그인은
// 이 config 가 이미 등록하므로 여기서 다시 등록하지 않는다 (중복 등록 시 에러).
const config = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'dist/**',
      'src/data/**', // 빌드 산출물 (index/search/stats.json)
      'next-env.d.ts',
      'node_modules/**',
    ],
  },

  ...nextCoreWebVitals,
  ...nextTypescript,

  {
    // next config 와 동일한 파일 범위로 맞춘다. 범위가 넓으면 next 가 등록한
    // react-hooks · jsx-a11y 플러그인이 없는 파일에서 규칙 참조 에러가 난다.
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    plugins: {
      prettier: prettierPlugin,
      'check-file': checkFile,
      'unused-imports': unusedImports,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'require-jsdoc': 'off',
      'react/display-name': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'prettier/prettier': 'error',
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['Link'],
          specialLink: ['hrefLeft', 'hrefRight'],
          aspects: ['invalidHref', 'preferButton'],
        },
      ],
      // 파일명 규칙. eslint-plugin-validate-filename 은 Windows 경로(역슬래시)를
      // glob 에 그대로 물려서 어떤 target 도 매치되지 않는다 — check-file 로 대체했다.
      'check-file/filename-naming-convention': [
        'error',
        {
          'src/components/**/!(hooks)/*.{ts,tsx}': 'PASCAL_CASE',
          'src/components/*.{ts,tsx}': 'PASCAL_CASE',
          '**/hooks/**/*.{ts,tsx}': 'CAMEL_CASE',
        },
        { ignoreMiddleExtensions: true },
      ],
      'unused-imports/no-unused-imports': 'error',
    },
  },

  prettierConfig,
];

export default config;
