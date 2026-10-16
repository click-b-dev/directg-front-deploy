import { permanentRedirect } from "next/navigation";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/**
 * 모바일 game.html ("기존페이지") — legacy `mobile/game/game.html`.
 * `?search_platform` 있으면 → game_platform_list.html로 301(Next 308≈301). 없으면 빈 출력(legacy 동일).
 */
export default async function MobileGamePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const searchPlatform = firstParam(sp.search_platform);
  if (searchPlatform) {
    permanentRedirect(`/game/game_platform_list?platform=${searchPlatform}`);
  }
  return null;
}
