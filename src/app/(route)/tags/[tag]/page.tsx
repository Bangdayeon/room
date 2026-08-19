// TODO: generateStaticParams — src/data/stats.json 의 tagFreq 키로 전량 정적 생성.

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;

  // TODO: 해당 태그의 글 목록. config/tag-alias.ts 로 정규화된 태그 기준.
  return <main>{decodeURIComponent(tag)}</main>;
}
