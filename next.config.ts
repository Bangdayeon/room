import type { NextConfig } from 'next';

import path from 'path';

const nextConfig: NextConfig = {
  // 상위 디렉터리의 lockfile 을 workspace root 로 오인하지 않게 고정한다.
  turbopack: {
    root: path.resolve(process.cwd()),
  },

  // 절대 규칙 8: R2 이미지를 next/image에 물리지 않는다.
  // R2 호스트를 images.remotePatterns에 등록하면 /_next/image 최적화 경로를 타게 되고
  // Vercel 이미지 최적화 무료 한도를 소모한다. 이미지는 <Img> 컴포넌트가
  // src/config/images.json의 width/height/blur를 읽어 R2에서 직접 서빙한다.
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
