import type { Metadata, Viewport } from "next";

import { getGameGenreList } from "@entities/game-genre/api/get-game-genre-list";
import { MobileGameGenreThumbScreen } from "@screens/mobile-game-genre-thumb";

/** legacy mobile game_genre_thumb.html: width=device-width, initial/minimum/maximum-scale=1, viewport-fit=cover, theme-color #000. */
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

/** legacy mobile은 genre_code 기본 주입 없음(PC의 G0001 기본값과 차이). raw 그대로 전달. */
const resolveGenreCode = (sp: Record<string, string | string[] | undefined>): string =>
  firstParam(sp.genre_code);

/** page/genre_code 제외 필터 파라미터 수집 (백엔드 필터). genre_code는 별도 전달. */
const collectFilters = (sp: Record<string, string | string[] | undefined>) => {
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (key === "page" || key === "genre_code") continue;
    const v = firstParam(value);
    if (v) {
      filters[key] = v;
    }
  }
  return filters;
};

/** legacy mobile game_genre_thumb.html head: title=getPrimaryGenreName(genre_code) 동적, description 빈값, apple-web-app 메타. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const data = await getGameGenreList(resolveGenreCode(sp), 1, collectFilters(sp));
  return {
    title: data.genreName,
    description: "",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
  };
}

export default async function MobileGameGenreThumbPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const genreCode = resolveGenreCode(sp);
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1
  const filters = collectFilters(sp);

  const data = await getGameGenreList(genreCode, page, filters);

  return <MobileGameGenreThumbScreen data={data} genreCode={genreCode} filters={filters} />;
}
