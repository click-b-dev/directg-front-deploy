import type { Metadata, Viewport } from "next";

import { getGameList } from "@entities/game-list/api/get-game-list";
import {
  MobileGamePlatformThumbScreen,
  platformName,
  resolvePlatform,
} from "@screens/mobile-game-platform-thumb";

/** legacy mobile game_platform_thumb.html: width=device-width, initial/minimum/maximum-scale=1, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** legacy mobile game_platform_thumb.html head: title=getPlatform(platform), description 빈값, apple-web-app 메타. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: platformName(resolvePlatform(sp)),
    description: "",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
  };
}

/** page 제외 필터 파라미터 수집 (PC game_thumb 선례와 동일 — 백엔드 필터). platform 기본 주입 없음(legacy mobile). */
const collectFilters = (sp: Record<string, string | string[] | undefined>) => {
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (key === "page") continue;
    const v = firstParam(value);
    if (v) {
      filters[key] = v;
    }
  }
  return filters;
};

export default async function MobileGamePlatformThumbPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const platform = resolvePlatform(sp);
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1
  const filters = collectFilters(sp);

  const data = await getGameList(page, filters);

  return (
    <MobileGamePlatformThumbScreen
      data={data}
      filters={filters}
      pageTitle={platformName(platform)}
    />
  );
}
