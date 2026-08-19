import { SITE_NAME } from '@/config/site';

import { AppShell } from '@/components/AppShell';

/** 사이트 골격. (dev) 그룹(/tokens)에는 붙지 않는다. */
export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return <AppShell siteName={SITE_NAME}>{children}</AppShell>;
}
