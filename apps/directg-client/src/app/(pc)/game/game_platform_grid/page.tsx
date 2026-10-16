import type { Metadata, Viewport } from "next";

import { getGameList } from "@entities/game-list/api/get-game-list";
import { GamePlatformScreen, platformName, resolvePlatform } from "@screens/game-platform";

/** legacy는 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** page 제외 필터 파라미터 수집 + platform(기본값) 주입. */
const collectFilters = (sp: Record<string, string | string[] | undefined>, platform: string) => {
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (key === "page") continue;
    const v = firstParam(value);
    if (v) {
      filters[key] = v;
    }
  }
  if (platform) {
    filters.platform = platform; // legacy 기본값 주입(URL에 없을 때)
  }
  return filters;
};

/** legacy `pc/game/game_platform_grid.html` head. title=platform switch(Steam/Epic Games/Rockstar Games), description·author 빈, amazonbot noarchive. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: platformName(resolvePlatform(sp)),
    description: "",
    authors: [{ name: "" }],
    other: { amazonbot: "noarchive" },
  };
}

export default async function GamePlatformGridPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const platform = resolvePlatform(sp);
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1

  const data = await getGameList(page, collectFilters(sp, platform));

  return (
    <GamePlatformScreen
      data={data}
      platform={platform}
      platformName={platformName(platform)}
      viewType="grid"
    />
  );
}
