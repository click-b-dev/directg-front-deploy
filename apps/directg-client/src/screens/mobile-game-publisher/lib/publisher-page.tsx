import type { Metadata, Viewport } from "next";

import { getGamePublisherList } from "@entities/game-publisher/api/get-game-publisher-list";

import { MobileGamePublisherScreen } from "../ui/mobile-game-publisher-screen";

type ViewType = "thumb" | "list";
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

interface MobilePublisherPageConfig {
  /** legacy 하드코딩 publisher_code (supplier_code 필터). */
  publisherCode: string;
  /** 뷰전환/페이지네이션 base (예: "/game/publisher_capcom"). */
  basePath: string;
  viewType: ViewType;
}

/**
 * 모바일 퍼블리셔 라우트 팩토리 — legacy `publisher_<brand>_{thumb,list}.html` 15 브랜드 × 2뷰의 공통 구현.
 * PC `makePublisherPage` 미러. 각 라우트는 publisher_code·basePath·viewType만 다르므로 팩토리로 생성.
 * legacy head: viewport theme#000, title=getPublisher(publisher_code) 동적.
 */
export function makeMobilePublisherPage({
  publisherCode,
  basePath,
  viewType,
}: MobilePublisherPageConfig) {
  /** legacy mobile: width=device-width, initial/minimum/maximum-scale=1, viewport-fit=cover, theme #000. */
  const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
    themeColor: "#000000",
  };

  /** legacy head: title=getPublisher(publisher_code) 동적, description 빈값, apple-web-app 메타. */
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
      appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
    };
  }

  async function Page({ searchParams }: { searchParams: SearchParams }) {
    const sp = await searchParams;
    const pageParam = firstParam(sp.page);
    const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1
    const filters = collectFilters(sp);

    const data = await getGamePublisherList(publisherCode, page, filters);

    return (
      <MobileGamePublisherScreen
        data={data}
        publisherCode={publisherCode}
        basePath={basePath}
        viewType={viewType}
        filters={filters}
      />
    );
  }

  return { viewport, generateMetadata, Page };
}
