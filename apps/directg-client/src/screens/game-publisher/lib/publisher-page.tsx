import type { Metadata, Viewport } from "next";

import { getGamePublisherList } from "@entities/game-publisher/api/get-game-publisher-list";
import { GamePublisherScreen } from "../ui/game-publisher-screen";

type ViewType = "thumb" | "list" | "grid";
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** page 제외 필터 파라미터 수집 (publisher_code는 route 고정 — sp에 없음). */
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

interface PublisherPageConfig {
  /** legacy 하드코딩 publisher_code (supplier_code 필터). */
  publisherCode: string;
  /** 뷰전환/페이지네이션 base (예: "/game/publisher_capcom"). */
  basePath: string;
  viewType: ViewType;
}

/**
 * 퍼블리셔 라우트 팩토리 — legacy `publisher_{name}_{thumb,list,grid}.html` 12종×3뷰의 공통 구현.
 * 각 라우트는 publisher_code·basePath·viewType만 다르므로 팩토리로 생성.
 * legacy는 `getGoodsList2($page,$add_where,$orderby,$param,60,$q)` + supplier_code 필터 + `getPublisher`.
 */
export function makePublisherPage({ publisherCode, basePath, viewType }: PublisherPageConfig) {
  /** legacy는 `width=device-width, initial-scale=1.0`. */
  const viewport: Viewport = { width: "device-width", initialScale: 1 };

  /** legacy head. title=getPublisher(publisher_code) 동적, description·author 빈, amazonbot noarchive. */
  async function generateMetadata({
    searchParams,
  }: {
    searchParams: SearchParams;
  }): Promise<Metadata> {
    const sp = await searchParams;
    const data = await getGamePublisherList(publisherCode, 1, collectFilters(sp));
    return {
      title: data.publisherName,
      description: "",
      authors: [{ name: "" }],
      other: { amazonbot: "noarchive" },
    };
  }

  async function Page({ searchParams }: { searchParams: SearchParams }) {
    const sp = await searchParams;
    const pageParam = firstParam(sp.page);
    const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1

    const data = await getGamePublisherList(publisherCode, page, collectFilters(sp));

    return <GamePublisherScreen data={data} basePath={basePath} viewType={viewType} />;
  }

  return { viewport, generateMetadata, Page };
}
